import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Definisi tipe data
export interface Pemain {
  id: string;
  nama: string;
  nomorPunggung: number;
  posisi: string;
  timId: string;
  golTotal?: number;
  kartuKuning?: number;
  kartuMerah?: number;
}

export interface Tim {
  id: string;
  nama: string;
  logo: string;
  grup: string;
  pemain: Pemain[];
  // Statistik tim untuk klasemen
  main?: number;
  menang?: number;
  seri?: number;
  kalah?: number;
  golMasuk?: number;
  golKemasukan?: number;
  selisihGol?: number;
  poin?: number;
}

export interface PencetakGol {
  pertandinganId: string;
  pemainId: string;
  jumlah: number;
}

export interface KartuPemain {
  pertandinganId: string;
  pemainId: string;
  jenis: 'kuning' | 'merah';
  jumlah: number;
}

export interface HasilPertandingan {
  id: string;
  pertandinganId: string;
  skorTimA: number;
  skorTimB: number;
  pencetakGol: PencetakGol[];
  kartu: KartuPemain[];
  selesai: boolean;
}

export interface Pertandingan {
  id: string;
  timA: string; // ID tim
  timB: string; // ID tim
  tanggal: string;
  waktu: string;
  grup: string;
  hasil?: HasilPertandingan;
}

export type BabakGugurTahap = 'perempat' | 'semifinal' | 'final';

export interface PertandinganBabakGugur {
  id: string;
  timA: string | null; // ID tim or null if not determined yet
  timB: string | null; // ID tim or null if not determined yet
  tahap: BabakGugurTahap;
  nomorPertandingan: number; // 1-4 for quarters, 1-2 for semis, 1 for final
  tanggal: string;
  waktu: string;
  hasil?: HasilPertandingan;
  pertandinganSebelumnyaA?: string; // ID of previous match that determines timA
  pertandinganSebelumnyaB?: string; // ID of previous match that determines timB
}

interface TournamentContextType {
  teams: Tim[];
  addTeam: (team: Omit<Tim, "id" | "pemain">) => void;
  updateTeam: (team: Tim) => void;
  deleteTeam: (id: string) => void;
  getTeam: (id: string) => Tim | undefined;
  addPlayer: (player: Omit<Pemain, "id">) => void;
  updatePlayer: (player: Pemain) => void;
  deletePlayer: (id: string) => void;
  getPlayer: (id: string) => Pemain | undefined;
  getTeamPlayers: (teamId: string) => Pemain[];
  getTeamsByGroup: (group: string) => Tim[];
  
  // Pertandingan
  pertandingan: Pertandingan[];
  generateJadwal: () => { isValid: boolean; messages: string[] };
  validateSchedule: () => { isValid: boolean; messages: string[] };
  optimizeSchedule: () => { isValid: boolean; messages: string[]; optimized: boolean; optimizationCount?: number };
  getPertandinganByGrup: (grup: string) => Pertandingan[];
  getPertandinganByTanggal: (tanggal: string) => Pertandingan[];
  getPertandinganByTim: (timId: string) => Pertandingan[];
  getRestDaysByTeam: () => { [teamId: string]: number };
  clearSchedule: () => void; // Menambahkan fungsi untuk menghapus jadwal
  
  // Hasil Pertandingan
  simpanHasilPertandingan: (hasil: Omit<HasilPertandingan, "id">) => void;
  updateKlasemen: () => void;
  getKlasemenGrup: (grup: string) => Tim[];
  getPencetakGolTerbanyak: (limit?: number) => Pemain[];

  // Babak Gugur
  pertandinganBabakGugur: PertandinganBabakGugur[];
  generateJadwalBabakGugur: () => void;
  getTimLolosPerempat: () => { grup: string, tim: Tim[] }[];
  getPertandinganBabakGugurByTahap: (tahap: BabakGugurTahap) => PertandinganBabakGugur[];
  getPertandinganBabakGugurById: (id: string) => PertandinganBabakGugur | undefined;
  simpanHasilBabakGugur: (hasil: Omit<HasilPertandingan, "id">) => void;
  getJuara: () => Tim | null;
  getRunnerUp: () => Tim | null;

  // Firebase Integration
  loadTeamsFromFirestore: (teamsData: any[], playersData: any[]) => Promise<void>;
  loadMatchesFromFirestore: (matchesData: any[]) => Promise<void>;
  loadKnockoutMatchesFromFirestore: (knockoutData: any[]) => Promise<void>;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

// Data grup yang sudah ditentukan
const grupData = {
  "A": ["REMAJA PUTRA A", "PALAPA A", "TOXNET A", "PERU FC B", "LEMKA B", "PORBA JAYA A"],
  "B": ["DL GUNS", "TOXNET B", "PORBA JAYA B", "PUTRA MANDIRI B", "REMAJA PUTRA B"],
  "C": ["GANESA A", "REMAJA PUTRA C", "PERU FC C", "PERKID FC", "PUTRA MANDIRI A"],
  "D": ["LEMKA A", "BALPAS FC", "ARUMBA FC", "GANESA B", "PERU FC A", "PELANA FC"]
};

// Jam pertandingan tetap
const jamPertandingan = ["13:30", "14:45", "16:00"];

export const TournamentProvider = ({ children }: { children: ReactNode }) => {
  const [teams, setTeams] = useState<Tim[]>(() => {
    const savedTeams = localStorage.getItem('teams');
    if (savedTeams) {
      return JSON.parse(savedTeams);
    }

    // Jika tidak ada data tersimpan, buat data default berdasarkan struktur grup
    const defaultTeams: Tim[] = [];
    Object.entries(grupData).forEach(([grup, timList]) => {
      timList.forEach((nama) => {
        defaultTeams.push({
          id: crypto.randomUUID(),
          nama,
          logo: '',
          grup,
          pemain: [],
          main: 0,
          menang: 0,
          seri: 0,
          kalah: 0,
          golMasuk: 0,
          golKemasukan: 0,
          selisihGol: 0,
          poin: 0
        });
      });
    });
    return defaultTeams;
  });

  const [pertandingan, setPertandingan] = useState<Pertandingan[]>(() => {
    const savedPertandingan = localStorage.getItem('pertandingan');
    return savedPertandingan ? JSON.parse(savedPertandingan) : [];
  });

  const [pertandinganBabakGugur, setPertandinganBabakGugur] = useState<PertandinganBabakGugur[]>(() => {
    const savedPertandingan = localStorage.getItem('pertandinganBabakGugur');
    return savedPertandingan ? JSON.parse(savedPertandingan) : [];
  });

  // Menyimpan data ke localStorage saat ada perubahan
  useEffect(() => {
    localStorage.setItem('teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('pertandingan', JSON.stringify(pertandingan));
  }, [pertandingan]);

  useEffect(() => {
    localStorage.setItem('pertandinganBabakGugur', JSON.stringify(pertandinganBabakGugur));
  }, [pertandinganBabakGugur]);

  // Hitung jumlah hari antara dua tanggal
  const daysBetween = (date1: string, date2: string): number => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.abs(Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
  };

  // Helper function: menghitung jumlah hari istirahat untuk setiap tim
  const getRestDaysByTeam = () => {
    const teamMatches: { [teamId: string]: string[] } = {};
    const restDays: { [teamId: string]: number } = {};
    
    // Inisialisasi map untuk setiap tim
    teams.forEach(team => {
      teamMatches[team.id] = [];
      restDays[team.id] = 0;
    });
    
    // Mengumpulkan tanggal pertandingan untuk setiap tim
    pertandingan.forEach(match => {
      if (!teamMatches[match.timA].includes(match.tanggal)) {
        teamMatches[match.timA].push(match.tanggal);
      }
      if (!teamMatches[match.timB].includes(match.tanggal)) {
        teamMatches[match.timB].push(match.tanggal);
      }
    });
    
    // Sortir tanggal untuk setiap tim
    Object.keys(teamMatches).forEach(teamId => {
      teamMatches[teamId].sort();
    });
    
    // Hitung hari istirahat antara pertandingan untuk setiap tim
    Object.keys(teamMatches).forEach(teamId => {
      const matches = teamMatches[teamId];
      let totalDays = 0;
      
      for (let i = 1; i < matches.length; i++) {
        const prevDate = new Date(matches[i-1]);
        const currDate = new Date(matches[i]);
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        totalDays += diffDays - 1; // Kurangi 1 karena kita menghitung hari di antara pertandingan
      }
      
      // Jika tim bermain lebih dari satu pertandingan, hitung rata-rata hari istirahat
      if (matches.length > 1) {
        restDays[teamId] = totalDays / (matches.length - 1);
      } else {
        restDays[teamId] = 0;
      }
    });
    
    return restDays;
  };

  // Completely redesigned scheduling algorithm
  const findOptimalSchedule = (
    matchesToSchedule: { timA: string; timB: string; grup: string }[],
    startDate: Date
  ): Pertandingan[] => {
    // Result array
    const scheduledMatches: Pertandingan[] = [];
    
    // Keep track of scheduled dates for each team
    const teamSchedules: { [teamId: string]: string[] } = {};
    
    // Initialize empty schedule for each team
    teams.forEach(team => {
      teamSchedules[team.id] = [];
    });
    
    // Generate 45 days to work with (more than needed, but provides flexibility)
    const datePool: string[] = [];
    const maxDays = 45;
    
    for (let i = 0; i < maxDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      datePool.push(date.toISOString().split('T')[0]);
    }
    
    // Sort the matches by team match count to prioritize teams with fewer matches
    const sortedMatches = [...matchesToSchedule].sort((a, b) => {
      const teamAMatchesA = teamSchedules[a.timA].length;
      const teamBMatchesA = teamSchedules[a.timB].length;
      const teamAMatchesB = teamSchedules[b.timA].length;
      const teamBMatchesB = teamSchedules[b.timB].length;
      
      // Calculate average match count for each match
      const avgMatchesA = (teamAMatchesA + teamBMatchesA) / 2;
      const avgMatchesB = (teamAMatchesB + teamBMatchesB) / 2;
      
      return avgMatchesA - avgMatchesB;
    });
    
    // For each match, find the best possible date
    for (const match of sortedMatches) {
      // Get the current schedules for both teams
      const teamASchedule = teamSchedules[match.timA];
      const teamBSchedule = teamSchedules[match.timB];
      
      // Find the best date for this match
      let bestDate: string | null = null;
      let bestDateScore = -Infinity;
      
      for (const date of datePool) {
        // Skip if either team has a match on this date
        if (teamASchedule.includes(date) || teamBSchedule.includes(date)) {
          continue;
        }
        
        // Calculate scheduling score for this date
        // Higher is better
        let dateScore = 0;
        
        // Factor 1: Rest days for each team since last match
        if (teamASchedule.length > 0) {
          const lastMatchA = teamASchedule[teamASchedule.length - 1];
          const daysSinceLastA = daysBetween(lastMatchA, date);
          dateScore += Math.min(daysSinceLastA, 7); // Cap at 7 for scoring purposes
        } else {
          dateScore += 5; // Bonus for first match
        }
        
        if (teamBSchedule.length > 0) {
          const lastMatchB = teamBSchedule[teamBSchedule.length - 1];
          const daysSinceLastB = daysBetween(lastMatchB, date);
          dateScore += Math.min(daysSinceLastB, 7);
        } else {
          dateScore += 5; // Bonus for first match
        }
        
        // Factor 2: Check slot availability for this date
        const matchesOnThisDate = scheduledMatches.filter(m => m.tanggal === date).length;
        if (matchesOnThisDate >= jamPertandingan.length) {
          continue; // No slots available, skip this date
        } else {
          dateScore += (jamPertandingan.length - matchesOnThisDate); // Favor dates with more slots
        }
        
        // Factor 3: Prefer earlier dates (slight bias)
        const dateIndex = datePool.indexOf(date);
        dateScore += (maxDays - dateIndex) * 0.1; // Small weight
        
        // Factor 4: Prefer minimum 2 days rest for both teams
        const minRestDays = 2;
        let hasMinimumRest = true;
        
        if (teamASchedule.length > 0) {
          const lastMatchA = teamASchedule[teamASchedule.length - 1];
          const daysSinceLastA = daysBetween(lastMatchA, date);
          if (daysSinceLastA < minRestDays) hasMinimumRest = false;
        }
        
        if (teamBSchedule.length > 0) {
          const lastMatchB = teamBSchedule[teamBSchedule.length - 1];
          const daysSinceLastB = daysBetween(lastMatchB, date);
          if (daysSinceLastB < minRestDays) hasMinimumRest = false;
        }
        
        if (!hasMinimumRest) {
          continue; // Skip this date if doesn't provide minimum rest
        }
        
        // Factor 5: Consider overall schedule balance
        // Get all dates for Team A and Team B by checking teamSchedules
        const allDatesTeamA = [...teamASchedule];
        const allDatesTeamB = [...teamBSchedule];
        
        // Add the current date being considered
        allDatesTeamA.push(date);
        allDatesTeamB.push(date);
        
        // Sort the dates
        allDatesTeamA.sort();
        allDatesTeamB.sort();
        
        // Calculate rest distribution for Team A
        let balanceScoreA = 0;
        for (let i = 1; i < allDatesTeamA.length; i++) {
          const daysBetweenDates = daysBetween(allDatesTeamA[i-1], allDatesTeamA[i]);
          // Ideal rest period is around 3-5 days
          const idealRest = 4;
          const restDiff = Math.abs(daysBetweenDates - idealRest);
          balanceScoreA -= restDiff; // Penalize deviation from ideal rest
        }
        
        // Calculate rest distribution for Team B
        let balanceScoreB = 0;
        for (let i = 1; i < allDatesTeamB.length; i++) {
          const daysBetweenDates = daysBetween(allDatesTeamB[i-1], allDatesTeamB[i]);
          // Ideal rest period is around 3-5 days
          const idealRest = 4;
          const restDiff = Math.abs(daysBetweenDates - idealRest);
          balanceScoreB -= restDiff; // Penalize deviation from ideal rest
        }
        
        // Add balance scores (with lower weight)
        dateScore += (balanceScoreA + balanceScoreB) * 0.2;
        
        // Update best date if this date has a better score
        if (dateScore > bestDateScore) {
          bestDateScore = dateScore;
          bestDate = date;
        }
      }
      
      // If no valid date was found, try a fallback approach with relaxed constraints
      if (!bestDate) {
        // Relaxed approach: Allow consecutive days but with penalty
        for (const date of datePool) {
          // Skip if either team already has a match on this date (still a hard constraint)
          if (teamASchedule.includes(date) || teamBSchedule.includes(date)) {
            continue;
          }
          
          // Calculate slot availability
          const matchesOnThisDate = scheduledMatches.filter(m => m.tanggal === date).length;
          if (matchesOnThisDate >= jamPertandingan.length) {
            continue; // No slots available, skip this date
          }
          
          // Calculate a relaxed score
          let dateScore = 0;
          
          // Check previous and next day (penalty but not disqualification)
          const prevDay = new Date(date);
          prevDay.setDate(prevDay.getDate() - 1);
          const prevDayStr = prevDay.toISOString().split('T')[0];
          
          const nextDay = new Date(date);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextDayStr = nextDay.toISOString().split('T')[0];
          
          // Heavy penalty for consecutive days, but allow it
          if (teamASchedule.includes(prevDayStr) || teamASchedule.includes(nextDayStr)) {
            dateScore -= 50;
          }
          
          if (teamBSchedule.includes(prevDayStr) || teamBSchedule.includes(nextDayStr)) {
            dateScore -= 50;
          }
          
          // Factor: Prefer earlier dates
          const dateIndex = datePool.indexOf(date);
          dateScore += (maxDays - dateIndex) * 0.1;
          
          // Check slot availability
          dateScore += (jamPertandingan.length - matchesOnThisDate);
          
          // Update best date if this date has a better score
          if (dateScore > bestDateScore) {
            bestDateScore = dateScore;
            bestDate = date;
          }
        }
      }
      
      // If still no date found, just use the earliest date that has an available time slot
      if (!bestDate) {
        for (const date of datePool) {
          const matchesOnThisDate = scheduledMatches.filter(m => m.tanggal === date).length;
          if (matchesOnThisDate < jamPertandingan.length &&
              !teamASchedule.includes(date) && 
              !teamBSchedule.includes(date)) {
            bestDate = date;
            break;
          }
        }
      }
      
      // If somehow still no date found (extremely unlikely), use first date as emergency fallback
      if (!bestDate) {
        bestDate = datePool[0];
        console.warn(`Emergency fallback scheduling for match: ${match.timA} vs ${match.timB}`);
      }
      
      // Determine which time slot to use
      const matchesOnBestDate = scheduledMatches.filter(m => m.tanggal === bestDate).length;
      const timeSlot = matchesOnBestDate < jamPertandingan.length ? 
        matchesOnBestDate : 0; // Use first slot as fallback
      
      // Create the match
      const newMatch: Pertandingan = {
        id: crypto.randomUUID(),
        timA: match.timA,
        timB: match.timB,
        tanggal: bestDate,
        waktu: jamPertandingan[timeSlot],
        grup: match.grup
      };
      
      // Add to scheduled matches
      scheduledMatches.push(newMatch);
      
      // Update team schedules
      teamSchedules[match.timA].push(bestDate);
      teamSchedules[match.timB].push(bestDate);
      
      // Sort the team schedules
      teamSchedules[match.timA].sort();
      teamSchedules[match.timB].sort();
    }
    
    return scheduledMatches;
  };

  // Validasi jadwal untuk memastikan tidak ada pelanggaran aturan
  const validateSchedule = () => {
    const violations: string[] = [];
    
    // Check untuk tim yang bermain 2x dalam sehari
    pertandingan.forEach(match => {
      const sameDay = pertandingan.filter(
        m => m.tanggal === match.tanggal && 
        m.id !== match.id && 
        (m.timA === match.timA || m.timA === match.timB || m.timB === match.timA || m.timB === match.timB)
      );
      
      if (sameDay.length > 0) {
        const teamA = getTeam(match.timA)?.nama || match.timA;
        const teamB = getTeam(match.timB)?.nama || match.timB;
        violations.push(`Tim ${teamA} atau ${teamB} bermain lebih dari satu kali pada tanggal ${match.tanggal}`);
      }
    });
    
    // Check untuk tim yang bermain di hari berturut-turut
    pertandingan.forEach(match => {
      const date = new Date(match.tanggal);
      const prevDate = new Date(date);
      prevDate.setDate(date.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split('T')[0];
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const nextDateStr = nextDate.toISOString().split('T')[0];
      
      const prevDayMatches = pertandingan.filter(
        m => m.tanggal === prevDateStr && 
        (m.timA === match.timA || m.timA === match.timB || m.timB === match.timA || m.timB === match.timB)
      );
      
      const nextDayMatches = pertandingan.filter(
        m => m.tanggal === nextDateStr && 
        (m.timA === match.timA || m.timA === match.timB || m.timB === match.timA || m.timB === match.timB)
      );
      
      if (prevDayMatches.length > 0) {
        const teamA = getTeam(match.timA)?.nama || match.timA;
        const teamB = getTeam(match.timB)?.nama || match.timB;
        violations.push(`Tim ${teamA} atau ${teamB} bermain pada hari berturut-turut (${prevDateStr} dan ${match.tanggal})`);
      }
      
      if (nextDayMatches.length > 0) {
        const teamA = getTeam(match.timA)?.nama || match.timA;
        const teamB = getTeam(match.timB)?.nama || match.timB;
        violations.push(`Tim ${teamA} atau ${teamB} bermain pada hari berturut-turut (${match.tanggal} dan ${nextDateStr})`);
      }
    });
    
    return {
      isValid: violations.length === 0,
      messages: violations
    };
  };

  // Fungsi untuk mengoptimalkan jadwal yang sudah ada
  const optimizeSchedule = () => {
    // Jika tidak ada pertandingan, tidak perlu optimasi
    if (pertandingan.length === 0) {
      return {
        isValid: true,
        messages: [],
        optimized: false
      };
    }

    // Dapatkan semua tanggal yang tersedia dalam jadwal
    const availableDates = [...new Set(pertandingan.map(p => p.tanggal))].sort();
    
    // Tambahkan beberapa tanggal tambahan untuk fleksibilitas
    const lastDate = new Date(availableDates[availableDates.length - 1]);
    for (let i = 1; i <= 7; i++) {
      const newDate = new Date(lastDate);
      newDate.setDate(lastDate.getDate() + i);
      availableDates.push(newDate.toISOString().split('T')[0]);
    }

    // Buat salinan jadwal untuk dioptimalkan
    const optimizedMatches = [...pertandingan];
    
    // Identifikasi pertandingan yang bermasalah (tim bermain di hari berturut-turut)
    const problematicMatches: Pertandingan[] = [];
    
    // Untuk setiap pertandingan, periksa apakah ada tim yang bermain di hari berturut-turut
    optimizedMatches.forEach(match => {
      const date = new Date(match.tanggal);
      
      // Periksa hari sebelumnya
      const prevDate = new Date(date);
      prevDate.setDate(date.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split('T')[0];
      
      // Periksa hari berikutnya
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const nextDateStr = nextDate.toISOString().split('T')[0];
      
      // Cari pertandingan di hari sebelumnya atau berikutnya yang melibatkan tim yang sama
      const conflictingMatches = optimizedMatches.filter(
        m => (m.tanggal === prevDateStr || m.tanggal === nextDateStr) && 
        m.id !== match.id &&
        (m.timA === match.timA || m.timA === match.timB || m.timB === match.timA || m.timB === match.timB)
      );
      
      if (conflictingMatches.length > 0) {
        // Tambahkan ke daftar pertandingan bermasalah jika belum ada
        if (!problematicMatches.some(m => m.id === match.id)) {
          problematicMatches.push(match);
        }
        
        // Tambahkan juga pertandingan yang konflik jika belum ada
        conflictingMatches.forEach(conflictMatch => {
          if (!problematicMatches.some(m => m.id === conflictMatch.id)) {
            problematicMatches.push(conflictMatch);
          }
        });
      }
    });
    
    // Jika tidak ada pertandingan bermasalah, kembalikan jadwal asli
    if (problematicMatches.length === 0) {
      return {
        isValid: true,
        messages: [],
        optimized: false
      };
    }
    
    // Urutkan pertandingan bermasalah berdasarkan tanggal
    problematicMatches.sort((a, b) => {
      // Bandingkan tanggal
      const dateComparison = a.tanggal.localeCompare(b.tanggal);
      if (dateComparison !== 0) return dateComparison;
      
      // Jika tanggal sama, bandingkan waktu
      return a.waktu.localeCompare(b.waktu);
    });
    
    // Coba pindahkan pertandingan bermasalah ke tanggal lain
    let optimizationsMade = 0;
    
    for (const match of problematicMatches) {
      // Dapatkan tim yang terlibat
      const teamsInvolved = [match.timA, match.timB];
      
      // Cari tanggal alternatif yang tidak menyebabkan konflik
      let bestAlternativeDate: string | null = null;
      let bestDateScore = -Infinity;
      
      for (const date of availableDates) {
        // Lewati tanggal yang sama dengan tanggal pertandingan saat ini
        if (date === match.tanggal) continue;
        
        // Periksa apakah ada pertandingan lain pada tanggal ini yang melibatkan tim yang sama
        const conflictsOnThisDate = optimizedMatches.some(
          m => m.id !== match.id && 
          m.tanggal === date && 
          (teamsInvolved.includes(m.timA) || teamsInvolved.includes(m.timB))
        );
        
        if (conflictsOnThisDate) continue;
        
        // Periksa hari sebelumnya
        const prevDate = new Date(date);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateStr = prevDate.toISOString().split('T')[0];
        
        // Periksa hari berikutnya
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        const nextDateStr = nextDate.toISOString().split('T')[0];
        
        // Periksa apakah ada pertandingan di hari sebelumnya atau berikutnya yang melibatkan tim yang sama
        const conflictsOnAdjacentDays = optimizedMatches.some(
          m => m.id !== match.id && 
          (m.tanggal === prevDateStr || m.tanggal === nextDateStr) && 
          (teamsInvolved.includes(m.timA) || teamsInvolved.includes(m.timB))
        );
        
        if (conflictsOnAdjacentDays) continue;
        
        // Hitung jumlah pertandingan pada tanggal ini
        const matchesOnThisDate = optimizedMatches.filter(m => m.tanggal === date).length;
        
        // Periksa apakah masih ada slot waktu yang tersedia
        if (matchesOnThisDate >= jamPertandingan.length) continue;
        
        // Hitung skor untuk tanggal ini (lebih rendah lebih baik)
        let dateScore = 0;
        
        // Faktor 1: Preferensi untuk tanggal yang lebih awal
        const currentDateIndex = availableDates.indexOf(match.tanggal);
        const alternativeDateIndex = availableDates.indexOf(date);
        dateScore -= Math.abs(alternativeDateIndex - currentDateIndex) * 2; // Penalti untuk pindah terlalu jauh
        
        // Faktor 2: Preferensi untuk tanggal dengan lebih sedikit pertandingan
        dateScore -= matchesOnThisDate * 3;
        
        // Update tanggal terbaik jika skor lebih tinggi
        if (dateScore > bestDateScore) {
          bestDateScore = dateScore;
          bestAlternativeDate = date;
        }
      }
      
      // Jika menemukan tanggal alternatif, pindahkan pertandingan
      if (bestAlternativeDate) {
        // Hitung slot waktu yang tersedia
        const matchesOnNewDate = optimizedMatches.filter(m => m.tanggal === bestAlternativeDate).length;
        const newTimeSlot = matchesOnNewDate < jamPertandingan.length ? 
          matchesOnNewDate : 0;
        
        // Update tanggal dan waktu pertandingan
        const matchIndex = optimizedMatches.findIndex(m => m.id === match.id);
        if (matchIndex !== -1) {
          optimizedMatches[matchIndex] = {
            ...optimizedMatches[matchIndex],
            tanggal: bestAlternativeDate,
            waktu: jamPertandingan[newTimeSlot]
          };
          
          optimizationsMade++;
        }
      }
    }
    
    // Jika ada optimasi yang dilakukan, update jadwal
    if (optimizationsMade > 0) {
      setPertandingan(optimizedMatches);
      
      // Validasi jadwal yang baru
      const validationResult = validateSchedule();
      
      return {
        ...validationResult,
        optimized: true,
        optimizationCount: optimizationsMade
      };
    }
    
    // Jika tidak ada optimasi yang dilakukan, kembalikan jadwal asli
    return {
      ...validateSchedule(),
      optimized: false
    };
  };

  // Menghasilkan jadwal pertandingan round-robin dengan algoritma baru
  const generateJadwal = () => {
    // Siapkan daftar pertandingan yang perlu dijadwalkan
    const matchesToSchedule: { timA: string; timB: string; grup: string }[] = [];
    
    // Untuk setiap grup, buat daftar pertandingan round-robin
    Object.entries(grupData).forEach(([grup, _]) => {
      const timDalamGrup = teams.filter(team => team.grup === grup);
      
      // Round-robin algorithm
      for (let i = 0; i < timDalamGrup.length - 1; i++) {
        for (let j = i + 1; j < timDalamGrup.length; j++) {
          matchesToSchedule.push({
            timA: timDalamGrup[i].id,
            timB: timDalamGrup[j].id,
            grup
          });
        }
      }
    });
    
    // Jadwalkan pertandingan dengan algoritma baru
    const startDate = new Date('2025-04-01'); // Tanggal mulai turnamen
    const scheduledMatches = findOptimalSchedule(matchesToSchedule, startDate);
    
    // Update state
    setPertandingan(scheduledMatches);
    
    return validateSchedule();
  };

  // Fungsi untuk menghapus jadwal
  const clearSchedule = () => {
    setPertandingan([]);
  };

  const getTeamsByGroup = (group: string) => {
    return teams.filter(team => team.grup === group);
  };

  const addTeam = (team: Omit<Tim, "id" | "pemain">) => {
    const newTeam: Tim = {
      ...team,
      id: crypto.randomUUID(),
      pemain: [],
      main: 0,
      menang: 0,
      seri: 0,
      kalah: 0,
      golMasuk: 0,
      golKemasukan: 0,
      selisihGol: 0,
      poin: 0
    };
    setTeams([...teams, newTeam]);
  };

  const updateTeam = (updatedTeam: Tim) => {
    setTeams(teams.map(team => team.id === updatedTeam.id ? updatedTeam : team));
  };

  const deleteTeam = (id: string) => {
    setTeams(teams.filter(team => team.id !== id));
    // Juga hapus pertandingan terkait
    setPertandingan(pertandingan.filter(p => p.timA !== id && p.timB !== id));
  };

  const getTeam = (id: string) => {
    return teams.find(team => team.id === id);
  };

  const addPlayer = (player: Omit<Pemain, "id">) => {
    const newPlayer: Pemain = {
      ...player,
      id: crypto.randomUUID(),
      golTotal: 0,
      kartuKuning: 0,
      kartuMerah: 0
    };

    setTeams(teams.map(team => {
      if (team.id === player.timId) {
        return {
          ...team,
          pemain: [...team.pemain, newPlayer]
        };
      }
      return team;
    }));
  };

  const updatePlayer = (updatedPlayer: Pemain) => {
    setTeams(teams.map(team => {
      if (team.id === updatedPlayer.timId) {
        return {
          ...team,
          pemain: team.pemain.map(player => 
            player.id === updatedPlayer.id ? updatedPlayer : player
          )
        };
      }
      return team;
    }));
  };

  const deletePlayer = (id: string) => {
    setTeams(teams.map(team => ({
      ...team,
      pemain: team.pemain.filter(player => player.id !== id)
    })));
  };

  const getPlayer = (id: string) => {
    for (const team of teams) {
      const player = team.pemain.find(player => player.id === id);
      if (player) return player;
    }
    return undefined;
  };

  const getTeamPlayers = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.pemain : [];
  };

  // Fungsi untuk pertandingan
  const getPertandinganByGrup = (grup: string) => {
    return pertandingan.filter(p => p.grup === grup);
  };

  const getPertandinganByTanggal = (tanggal: string) => {
    return pertandingan.filter(p => p.tanggal === tanggal)
      .sort((a, b) => a.waktu.localeCompare(b.waktu));
  };

  const getPertandinganByTim = (timId: string) => {
    return pertandingan.filter(p => p.timA === timId || p.timB === timId);
  };

  // Fungsi untuk hasil pertandingan
  const simpanHasilPertandingan = (hasil: Omit<HasilPertandingan, "id">) => {
    const hasilWithId: HasilPertandingan = {
      ...hasil,
      id: crypto.randomUUID()
    };
    
    setPertandingan(current => 
      current.map(p => {
        if (p.id === hasil.pertandinganId) {
          return { ...p, hasil: hasilWithId };
        }
        return p;
      })
    );
    
    // Update statistik pemain (gol dan kartu)
    updatePemainStatistik(hasil);
    // Update klasemen
    updateKlasemen();
  };

  // Update statistik pemain setelah pertandingan
  const updatePemainStatistik = (hasil: Omit<HasilPertandingan, "id">) => {
    // Buat salinan teams untuk dimodifikasi
    const updatedTeams = [...teams];
    
    // Update gol
    hasil.pencetakGol.forEach(({ pemainId, jumlah }) => {
      for (let i = 0; i < updatedTeams.length; i++) {
        const pemainIndex = updatedTeams[i].pemain.findIndex(p => p.id === pemainId);
        if (pemainIndex !== -1) {
          const currentGoals = updatedTeams[i].pemain[pemainIndex].golTotal || 0;
          updatedTeams[i].pemain[pemainIndex] = {
            ...updatedTeams[i].pemain[pemainIndex],
            golTotal: currentGoals + jumlah
          };
          break;
        }
      }
    });
    
    // Update kartu
    hasil.kartu.forEach(({ pemainId, jenis, jumlah }) => {
      for (let i = 0; i < updatedTeams.length; i++) {
        const pemainIndex = updatedTeams[i].pemain.findIndex(p => p.id === pemainId);
        if (pemainIndex !== -1) {
          if (jenis === 'kuning') {
            const currentYellows = updatedTeams[i].pemain[pemainIndex].kartuKuning || 0;
            updatedTeams[i].pemain[pemainIndex] = {
              ...updatedTeams[i].pemain[pemainIndex],
              kartuKuning: currentYellows + jumlah
            };
          } else {
            const currentReds = updatedTeams[i].pemain[pemainIndex].kartuMerah || 0;
            updatedTeams[i].pemain[pemainIndex] = {
              ...updatedTeams[i].pemain[pemainIndex],
              kartuMerah: currentReds + jumlah
            };
          }
          break;
        }
      }
    });
    
    setTeams(updatedTeams);
  };

  // Update klasemen berdasarkan hasil pertandingan
  const updateKlasemen = () => {
    // Reset klasemen
    const resetTeams = teams.map(team => ({
      ...team,
      main: 0,
      menang: 0,
      seri: 0,
      kalah: 0,
      golMasuk: 0,
      golKemasukan: 0,
      selisihGol: 0,
      poin: 0
    }));
    
    // Hitung statistik dari pertandingan
    const pertandinganSelesai = pertandingan.filter(p => p.hasil && p.hasil.selesai);
    
    const updatedTeams = resetTeams.map(team => {
      let main = 0;
      let menang = 0;
      let seri = 0;
      let kalah = 0;
      let golMasuk = 0;
      let golKemasukan = 0;
      
      pertandinganSelesai.forEach(p => {
        if (!p.hasil) return;
        
        if (p.timA === team.id) {
          main++;
          golMasuk += p.hasil.skorTimA;
          golKemasukan += p.hasil.skorTimB;
          
          if (p.hasil.skorTimA > p.hasil.skorTimB) {
            menang++;
          } else if (p.hasil.skorTimA === p.hasil.skorTimB) {
            seri++;
          } else {
            kalah++;
          }
        } else if (p.timB === team.id) {
          main++;
          golMasuk += p.hasil.skorTimB;
          golKemasukan += p.hasil.skorTimA;
          
          if (p.hasil.skorTimB > p.hasil.skorTimA) {
            menang++;
          } else if (p.hasil.skorTimB === p.hasil.skorTimA) {
            seri++;
          } else {
            kalah++;
          }
        }
      });
      
      // Hitung poin dan selisih gol
      const poin = menang * 3 + seri;
      const selisihGol = golMasuk - golKemasukan;
      
      return {
        ...team,
        main,
        menang,
        seri,
        kalah,
        golMasuk,
        golKemasukan,
        selisihGol,
        poin
      };
    });
    
    setTeams(updatedTeams);
  };

  // Mendapatkan klasemen grup
  const getKlasemenGrup = (grup: string) => {
    return teams
      .filter(team => team.grup === grup)
      .sort((a, b) => {
        // Sortir berdasarkan: 1. Poin, 2. Selisih Gol, 3. Gol Masuk
        if ((b.poin || 0) !== (a.poin || 0)) {
          return (b.poin || 0) - (a.poin || 0);
        }
        if ((b.selisihGol || 0) !== (a.selisihGol || 0)) {
          return (b.selisihGol || 0) - (a.selisihGol || 0);
        }
        return (b.golMasuk || 0) - (a.golMasuk || 0);
      });
  };

  // Mendapatkan daftar pencetak gol terbanyak
  const getPencetakGolTerbanyak = (limit = 10) => {
    const allPlayers: Pemain[] = [];
    teams.forEach(team => {
      allPlayers.push(...team.pemain);
    });
    
    return allPlayers
      .filter(p => (p.golTotal || 0) > 0) // Hanya pemain yang mencetak gol
      .sort((a, b) => (b.golTotal || 0) - (a.golTotal || 0))
      .slice(0, limit);
  };

  // Mendapatkan tim yang lolos ke perempat final (2 teratas dari setiap grup)
  const getTimLolosPerempat = () => {
    const lolos: { grup: string, tim: Tim[] }[] = [];
    
    ['A', 'B', 'C', 'D'].forEach(grup => {
      const klasemenGrup = getKlasemenGrup(grup);
      const timLolos = klasemenGrup.slice(0, 2);
      lolos.push({ grup, tim: timLolos });
    });
    
    return lolos;
  };

  // Generate jadwal babak gugur
  const generateJadwalBabakGugur = () => {
    // Hapus jadwal babak gugur yang mungkin sudah ada
    setPertandinganBabakGugur([]);
    
    const timLolos = getTimLolosPerempat();
    const startDate = new Date('2025-05-01'); // Tanggal mulai babak gugur
    
    // Mengacak pasangan grup di perempat final (A vs B dan C vs D)
    const newMatches: PertandinganBabakGugur[] = [];
    
    // Perempat Final
    // A1 vs B2
    newMatches.push({
      id: crypto.randomUUID(),
      timA: timLolos[0].tim[0]?.id || null,
      timB: timLolos[1].tim[1]?.id || null,
      tahap: 'perempat',
      nomorPertandingan: 1,
      tanggal: new Date(startDate.getTime()).toISOString().split('T')[0],
      waktu: '13:30'
    });
    
    // B1 vs A2
    newMatches.push({
      id: crypto.randomUUID(),
      timA: timLolos[1].tim[0]?.id || null,
      timB: timLolos[0].tim[1]?.id || null,
      tahap: 'perempat',
      nomorPertandingan: 2,
      tanggal: new Date(startDate.getTime()).toISOString().split('T')[0],
      waktu: '16:00'
    });
    
    // C1 vs D2
    const date2 = new Date(startDate.getTime());
    date2.setDate(date2.getDate() + 1);
    newMatches.push({
      id: crypto.randomUUID(),
      timA: timLolos[2].tim[0]?.id || null,
      timB: timLolos[3].tim[1]?.id || null,
      tahap: 'perempat',
      nomorPertandingan: 3,
      tanggal: date2.toISOString().split('T')[0],
      waktu: '13:30'
    });
    
    // D1 vs C2
    newMatches.push({
      id: crypto.randomUUID(),
      timA: timLolos[3].tim[0]?.id || null,
      timB: timLolos[2].tim[1]?.id || null,
      tahap: 'perempat',
      nomorPertandingan: 4,
      tanggal: date2.toISOString().split('T')[0],
      waktu: '16:00'
    });
    
    // Semifinal
    const date3 = new Date(startDate.getTime());
    date3.setDate(date3.getDate() + 3);
    
    // Semifinal 1 (QF1 vs QF3)
    const semi1Id = crypto.randomUUID();
    newMatches.push({
      id: semi1Id,
      timA: null,
      timB: null,
      tahap: 'semifinal',
      nomorPertandingan: 1,
      tanggal: date3.toISOString().split('T')[0],
      waktu: '13:30',
      pertandinganSebelumnyaA: newMatches[0].id,
      pertandinganSebelumnyaB: newMatches[2].id
    });
    
    // Semifinal 2 (QF2 vs QF4)
    const semi2Id = crypto.randomUUID();
    newMatches.push({
      id: semi2Id,
      timA: null,
      timB: null,
      tahap: 'semifinal',
      nomorPertandingan: 2,
      tanggal: date3.toISOString().split('T')[0],
      waktu: '16:00',
      pertandinganSebelumnyaA: newMatches[1].id,
      pertandinganSebelumnyaB: newMatches[3].id
    });
    
    // Final
    const date4 = new Date(startDate.getTime());
    date4.setDate(date4.getDate() + 7); // Final 1 minggu setelah mulai babak gugur
    
    newMatches.push({
      id: crypto.randomUUID(),
      timA: null,
      timB: null,
      tahap: 'final',
      nomorPertandingan: 1,
      tanggal: date4.toISOString().split('T')[0],
      waktu: '15:00',
      pertandinganSebelumnyaA: semi1Id,
      pertandinganSebelumnyaB: semi2Id
    });
    
    setPertandinganBabakGugur(newMatches);
  };

  // Get babak gugur berdasarkan tahap
  const getPertandinganBabakGugurByTahap = (tahap: BabakGugurTahap) => {
    return pertandinganBabakGugur.filter(p => p.tahap === tahap)
      .sort((a, b) => a.nomorPertandingan - b.nomorPertandingan);
  };

  // Get pertandingan babak gugur by ID
  const getPertandinganBabakGugurById = (id: string) => {
    return pertandinganBabakGugur.find(p => p.id === id);
  };

  // Simpan hasil babak gugur
  const simpanHasilBabakGugur = (hasil: Omit<HasilPertandingan, "id">) => {
    const hasilWithId: HasilPertandingan = {
      ...hasil,
      id: crypto.randomUUID()
    };
    
    // Update hasil
    const updatedMatches = pertandinganBabakGugur.map(p => {
      if (p.id === hasil.pertandinganId) {
        return { ...p, hasil: hasilWithId };
      }
      return p;
    });
    
    // Jika ada pertandingan selanjutnya yang bergantung pada hasil ini
    const currentMatch = pertandinganBabakGugur.find(p => p.id === hasil.pertandinganId);
    if (currentMatch && hasilWithId.selesai) {
      // Tentukan pemenang
      const timA = currentMatch.timA;
      const timB = currentMatch.timB;
      
      let pemenang: string | null = null;
      if (hasilWithId.skorTimA > hasilWithId.skorTimB) {
        pemenang = timA;
      } else if (hasilWithId.skorTimB > hasilWithId.skorTimA) {
        pemenang = timB;
      } else {
        // Jika seri, adu penalti atau aturan lain bisa diimplementasikan di sini
        // Default untuk MVP: tim A menang jika seri di babak gugur
        pemenang = timA;
      }
      
      // Update tim di pertandingan berikutnya
      for (let i = 0; i < updatedMatches.length; i++) {
        if (updatedMatches[i].pertandinganSebelumnyaA === currentMatch.id) {
          updatedMatches[i] = { ...updatedMatches[i], timA: pemenang };
        } else if (updatedMatches[i].pertandinganSebelumnyaB === currentMatch.id) {
          updatedMatches[i] = { ...updatedMatches[i], timB: pemenang };
        }
      }
    }
    
    // Update statistik pemain
    updatePemainStatistik(hasil);
    
    // Update state
    setPertandinganBabakGugur(updatedMatches);
  };

  // Get juara (pemenang final)
  const getJuara = () => {
    const final = pertandinganBabakGugur.find(p => p.tahap === 'final');
    if (final?.hasil && final.hasil.selesai) {
      const pemenangId = final.hasil.skorTimA > final.hasil.skorTimB ? final.timA : final.timB;
      if (pemenangId) {
        return getTeam(pemenangId) || null;
      }
    }
    return null;
  };

  // Get runner-up (kalah di final)
  const getRunnerUp = () => {
    const final = pertandinganBabakGugur.find(p => p.tahap === 'final');
    if (final?.hasil && final.hasil.selesai) {
      const kalahId = final.hasil.skorTimA > final.hasil.skorTimB ? final.timB : final.timA;
      if (kalahId) {
        return getTeam(kalahId) || null;
      }
    }
    return null;
  };

  // Load teams and players data from Firestore
  const loadTeamsFromFirestore = async (teamsData: any[], playersData: any[]) => {
    try {
      // Process and organize player data by team
      const playersByTeam: Record<string, Pemain[]> = {};
      
      playersData.forEach(player => {
        if (!playersByTeam[player.timId]) {
          playersByTeam[player.timId] = [];
        }
        playersByTeam[player.timId].push({
          id: player.id,
          nama: player.nama,
          nomorPunggung: player.nomorPunggung,
          posisi: player.posisi,
          timId: player.timId,
          golTotal: player.golTotal || 0,
          kartuKuning: player.kartuKuning || 0,
          kartuMerah: player.kartuMerah || 0
        });
      });
      
      // Create teams with their players
      const processedTeams: Tim[] = teamsData.map(team => ({
        id: team.id,
        nama: team.nama,
        logo: team.logo || '',
        grup: team.grup,
        pemain: playersByTeam[team.id] || [],
        main: team.main || 0,
        menang: team.menang || 0,
        seri: team.seri || 0,
        kalah: team.kalah || 0,
        golMasuk: team.golMasuk || 0,
        golKemasukan: team.golKemasukan || 0,
        selisihGol: team.selisihGol || 0,
        poin: team.poin || 0
      }));
      
      // Update state
      setTeams(processedTeams);
    } catch (error) {
      console.error("Error loading teams and players from Firestore:", error);
      throw error;
    }
  };

  // Load matches data from Firestore
  const loadMatchesFromFirestore = async (matchesData: any[]) => {
    try {
      const processedMatches: Pertandingan[] = matchesData.map(match => ({
        id: match.id,
        timA: match.timA,
        timB: match.timB,
        tanggal: match.tanggal,
        waktu: match.waktu,
        grup: match.grup,
        hasil: match.hasil
      }));
      
      // Update state
      setPertandingan(processedMatches);
      
      // Update klasemen if there are matches with results
      if (processedMatches.some(m => m.hasil)) {
        updateKlasemen();
      }
    } catch (error) {
      console.error("Error loading matches from Firestore:", error);
      throw error;
    }
  };

  // Load knockout matches from Firestore
  const loadKnockoutMatchesFromFirestore = async (knockoutData: any[]) => {
    try {
      const processedKnockout: PertandinganBabakGugur[] = knockoutData.map(match => ({
        id: match.id,
        timA: match.timA,
        timB: match.timB,
        tahap: match.tahap as BabakGugurTahap,
        nomorPertandingan: match.nomorPertandingan,
        tanggal: match.tanggal,
        waktu: match.waktu,
        hasil: match.hasil,
        pertandinganSebelumnyaA: match.pertandinganSebelumnyaA,
        pertandinganSebelumnyaB: match.pertandinganSebelumnyaB
      }));
      
      // Update state
      setPertandinganBabakGugur(processedKnockout);
    } catch (error) {
      console.error("Error loading knockout matches from Firestore:", error);
      throw error;
    }
  };

  return (
    <TournamentContext.Provider value={{
      teams,
      addTeam,
      updateTeam,
      deleteTeam,
      getTeam,
      addPlayer,
      updatePlayer,
      deletePlayer,
      getPlayer,
      getTeamPlayers,
      getTeamsByGroup,
      
      // Pertandingan
      pertandingan,
      generateJadwal,
      validateSchedule,
      optimizeSchedule,
      getPertandinganByGrup,
      getPertandinganByTanggal,
      getPertandinganByTim,
      getRestDaysByTeam,
      clearSchedule, // Menambahkan fungsi untuk menghapus jadwal
      
      // Hasil
      simpanHasilPertandingan,
      updateKlasemen,
      getKlasemenGrup,
      getPencetakGolTerbanyak,

      // Babak Gugur
      pertandinganBabakGugur,
      generateJadwalBabakGugur,
      getTimLolosPerempat,
      getPertandinganBabakGugurByTahap,
      getPertandinganBabakGugurById,
      simpanHasilBabakGugur,
      getJuara,
      getRunnerUp,

      // Firebase Integration
      loadTeamsFromFirestore,
      loadMatchesFromFirestore,
      loadKnockoutMatchesFromFirestore
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};
