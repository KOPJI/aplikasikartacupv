import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  saveHeadToHeadToFirestore, 
  getHeadToHeadFromFirestore, 
  saveGoalToFirestore, 
  saveCardToFirestore 
} from '../services/firebase';

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
  generateJadwal: (startDate?: Date) => { isValid: boolean; messages: string[] };
  validateSchedule: () => { isValid: boolean; messages: string[] };
  optimizeSchedule: () => { isValid: boolean; messages: string[]; optimized: boolean; optimizationCount?: number };
  fixExistingSchedule: () => { isValid: boolean; messages: string[]; fixed: boolean; recreated?: boolean; manualFix?: boolean; error?: boolean };
  getPertandinganByGrup: (grup: string) => Pertandingan[];
  getPertandinganByTanggal: (tanggal: string) => Pertandingan[];
  getPertandinganByTim: (timId: string) => Pertandingan[];
  getRestDaysByTeam: () => { [teamId: string]: number };
  clearSchedule: () => void; // Menambahkan fungsi untuk menghapus jadwal
  
  // Hasil Pertandingan
  simpanHasilPertandingan: (hasil: Omit<HasilPertandingan, "id">) => Promise<void>;
  updateKlasemen: () => Promise<void>;
  getKlasemenGrup: (grup: string) => Tim[];
  getPencetakGolTerbanyak: (limit?: number) => Pemain[];
  
  // Fungsi untuk menghapus data statistik
  resetPencetakGol: () => void;
  resetKartuPemain: () => void;
  resetLaranganBermain: () => void;

  // Babak Gugur
  pertandinganBabakGugur: PertandinganBabakGugur[];
  generateJadwalBabakGugur: () => void;
  getTimLolosPerempat: () => { grup: string, tim: Tim[] }[];
  getPertandinganBabakGugurByTahap: (tahap: BabakGugurTahap) => PertandinganBabakGugur[];
  getPertandinganBabakGugurById: (id: string) => PertandinganBabakGugur | undefined;
  simpanHasilBabakGugur: (hasil: Omit<HasilPertandingan, "id">) => Promise<void>;
  getJuara: () => Tim | null;
  getRunnerUp: () => Tim | null;

  // Firebase Integration
  loadTeamsFromFirestore: (teamsData: any[], playersData: any[]) => Promise<void>;
  loadMatchesFromFirestore: (matchesData: any[]) => Promise<void>;
  loadKnockoutMatchesFromFirestore: (knockoutData: any[]) => Promise<void>;

  // Fungsi untuk menghitung statistik waktu istirahat tim
  calculateTeamRestStats: (schedule: Pertandingan[]) => { 
    teamStats: { 
      [teamId: string]: {
        totalRestDays: number;
        averageRestDays: number;
        minRestDays: number;
        maxRestDays: number;
        restPeriods: number[];
      }
    };
    overallStats: {
      averageRestDays: number;
      minRestDays: number;
      maxRestDays: number;
      stdDeviation: number;
    }
  };

  // Tambahkan fungsi untuk mendapatkan statistik istirahat tim
  getTeamRestStatistics: () => {
    teamStats: {
      [teamId: string]: {
        totalRestDays: number;
        averageRestDays: number;
        minRestDays: number;
        maxRestDays: number;
        restPeriods: number[];
      }
    };
    overallStats: {
      averageRestDays: number;
      minRestDays: number;
      maxRestDays: number;
      stdDeviation: number;
    }
  };
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

// Data grup yang sudah ditentukan
const grupData = {
  "A": ["REMAJA PUTRA A", "PALAPA A", "TOXNET A", "PERU FC B", "LEMKA B", "PORBA JAYA A"],
  "B": ["DL GUNS", "TOXNET B", "PORBA JAYA B", "PUTRA MANDIRI B", "REMAJA PUTRA B"],
  "C": ["GANESA A", "REMAJA PUTRA C", "PERU FC C", "PERKID FC", "PUTRA MANDIRI A"],
  "D": ["LEMKA A", "BALPAS FC", "ARUMBA FC", "GANESA B", "PERU FC A", "PELANA FC"]
};

// Jam pertandingan standar
const jamPertandingan = ["13:30", "14:45", "16:00"];

// Jam pertandingan khusus untuk hari pertama
const jamPertandinganHariPertama = ["14:45", "16:00"];

// Durasi pertandingan (dalam menit)
const durasiPertandingan = 65; // 65 menit (1 jam 5 menit)

// Waktu selesai pertandingan (untuk dokumentasi)
const waktuSelesaiPertandingan = {
  "13:30": "14:35", // 13:30 + 65 menit
  "14:45": "15:50", // 14:45 + 65 menit
  "16:00": "17:05"  // 16:00 + 65 menit
};

// ATURAN JADWAL YANG SEDERHANA:
// 1. Hari pertama: 2 pertandingan (14:45 dan 16:00)
// 2. Hari-hari lainnya: 3 pertandingan (13:30, 14:45, dan 16:00)
// 3. Hari terakhir: Boleh kurang dari 3 pertandingan jika diperlukan

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

  // State untuk menyimpan data head-to-head
  const [headToHeadData, setHeadToHeadData] = useState<Record<string, Record<string, { menang: number, seri: number, kalah: number }>>>({});
  
  // Ambil data head-to-head dari Firestore saat komponen dimuat
  useEffect(() => {
    const fetchHeadToHead = async () => {
      try {
        const data = await getHeadToHeadFromFirestore();
        if (data) {
          setHeadToHeadData(data);
          console.log("Data head-to-head berhasil diambil dari Firestore");
        } else {
          // Fallback ke localStorage jika data tidak ada di Firestore
          const savedHeadToHead = localStorage.getItem('headToHead');
          if (savedHeadToHead) {
            setHeadToHeadData(JSON.parse(savedHeadToHead));
            console.log("Data head-to-head diambil dari localStorage");
          }
        }
      } catch (error) {
        console.error("Error mengambil data head-to-head:", error);
        // Fallback ke localStorage jika Firestore gagal
        const savedHeadToHead = localStorage.getItem('headToHead');
        if (savedHeadToHead) {
          setHeadToHeadData(JSON.parse(savedHeadToHead));
          console.log("Data head-to-head diambil dari localStorage (fallback)");
        }
      }
    };
    
    fetchHeadToHead();
  }, []);

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
    
    // Keep track of match count per day to ensure exactly 3 matches per day (or 2 for first day)
    const matchesPerDay: { [date: string]: number } = {};
    
    // Tanggal pertama turnamen dalam format string
    const firstDayStr = startDate.toISOString().split('T')[0];
    
    // ATURAN JADWAL:
    // 1. Hari pertama turnamen hanya ada 2 pertandingan (14:45 dan 16:00)
    // 2. Hari-hari selanjutnya memiliki 3 pertandingan (13:30, 14:45, dan 16:00)
    // 3. Hari terakhir diperbolehkan memiliki jumlah pertandingan tidak tepat 3 jika tidak ada pilihan lain
    // 4. Durasi setiap pertandingan adalah 65 menit (1 jam 5 menit)
    
    // Initialize empty schedule for each team
    teams.forEach(team => {
      teamSchedules[team.id] = [];
    });
    
    // Generate 60 days to work with (more than needed, but provides flexibility)
    const datePool: string[] = [];
    const maxDays = 60; // Meningkatkan jumlah hari untuk fleksibilitas lebih
    
    for (let i = 0; i < maxDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      datePool.push(dateStr);
      matchesPerDay[dateStr] = 0; // Initialize match count for this day
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
        // PERSYARATAN KETAT 1: Skip jika salah satu tim sudah bermain pada tanggal ini
        if (teamASchedule.includes(date) || teamBSchedule.includes(date)) {
          continue;
        }
        
        // PERSYARATAN KETAT 2: Skip jika salah satu tim bermain di hari sebelumnya atau berikutnya
        const prevDate = new Date(date);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateStr = prevDate.toISOString().split('T')[0];
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        const nextDateStr = nextDate.toISOString().split('T')[0];
        
        // Periksa apakah tim bermain di hari sebelumnya atau berikutnya
        if (teamASchedule.includes(prevDateStr) || teamASchedule.includes(nextDateStr) ||
            teamBSchedule.includes(prevDateStr) || teamBSchedule.includes(nextDateStr)) {
          continue; // Skip tanggal ini jika ada tim yang bermain di hari berturut-turut
        }
        
        // PERSYARATAN KETAT 8: Periksa jumlah pertandingan pada hari ini
        // Harus tepat 3 pertandingan per hari (atau 2 untuk hari pertama), tidak lebih
        const matchesOnThisDate = matchesPerDay[date];
        const maxMatchesForThisDate = date === firstDayStr ? jamPertandinganHariPertama.length : jamPertandingan.length;
        
        if (matchesOnThisDate >= maxMatchesForThisDate) {
          continue; // Skip jika hari ini sudah memiliki jumlah pertandingan maksimal
        }
        
        // Calculate scheduling score for this date
        // Higher is better
        let dateScore = 0;
        
        // Factor 1: Rest days for each team since last match
        if (teamASchedule.length > 0) {
          const lastMatchA = teamASchedule[teamASchedule.length - 1];
          const daysSinceLastA = daysBetween(lastMatchA, date);
          // PERSYARATAN KETAT 3: Meningkatkan nilai istirahat minimal
          dateScore += Math.min(daysSinceLastA, 10); // Cap at 10 for scoring purposes
        } else {
          dateScore += 5; // Bonus for first match
        }
        
        if (teamBSchedule.length > 0) {
          const lastMatchB = teamBSchedule[teamBSchedule.length - 1];
          const daysSinceLastB = daysBetween(lastMatchB, date);
          // PERSYARATAN KETAT 3: Meningkatkan nilai istirahat minimal
          dateScore += Math.min(daysSinceLastB, 10);
        } else {
          dateScore += 5; // Bonus for first match
        }
        
        // PERSYARATAN KETAT 9: Preferensi untuk hari yang sudah memiliki pertandingan
        // Kita ingin mengisi hari yang sudah memiliki pertandingan terlebih dahulu
        // sampai mencapai 3 pertandingan per hari
        if (matchesOnThisDate > 0) {
          dateScore += 30; // Meningkatkan bonus untuk hari yang sudah memiliki pertandingan
        }
        
        // Factor 3: Prefer earlier dates (slight bias)
        const dateIndex = datePool.indexOf(date);
        dateScore += (maxDays - dateIndex) * 0.1; // Small weight
        
        // PERSYARATAN KETAT 4: Memastikan istirahat minimal 3 hari
        const minRestDays = 3; // Meningkatkan dari 2 menjadi 3
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
        
        // PERSYARATAN KETAT 5: Meningkatkan penalti untuk distribusi istirahat yang tidak merata
        // Calculate rest distribution for Team A
        let balanceScoreA = 0;
        for (let i = 1; i < allDatesTeamA.length; i++) {
          const daysBetweenDates = daysBetween(allDatesTeamA[i-1], allDatesTeamA[i]);
          // Ideal rest period is around 4-6 days (meningkatkan dari 3-5)
          const idealRest = 5;
          const restDiff = Math.abs(daysBetweenDates - idealRest);
          balanceScoreA -= restDiff * 2; // Meningkatkan penalti
        }
        
        // Calculate rest distribution for Team B
        let balanceScoreB = 0;
        for (let i = 1; i < allDatesTeamB.length; i++) {
          const daysBetweenDates = daysBetween(allDatesTeamB[i-1], allDatesTeamB[i]);
          // Ideal rest period is around 4-6 days
          const idealRest = 5;
          const restDiff = Math.abs(daysBetweenDates - idealRest);
          balanceScoreB -= restDiff * 2; // Meningkatkan penalti
        }
        
        // Add balance scores (with higher weight)
        dateScore += (balanceScoreA + balanceScoreB) * 0.5; // Meningkatkan bobot dari 0.2 menjadi 0.5
        
        // Update best date if this date has a better score
        if (dateScore > bestDateScore) {
          bestDateScore = dateScore;
          bestDate = date;
        }
      }
      
      // PERSYARATAN KETAT 6: Tidak menggunakan fallback approach dengan relaxed constraints
      // Jika tidak ada tanggal yang memenuhi persyaratan ketat, coba tanggal yang lebih jauh
      if (!bestDate) {
        // Tambahkan 10 hari lagi ke datePool
        const lastDate = new Date(datePool[datePool.length - 1]);
        for (let i = 1; i <= 10; i++) {
          const newDate = new Date(lastDate);
          newDate.setDate(lastDate.getDate() + i);
          const newDateStr = newDate.toISOString().split('T')[0];
          datePool.push(newDateStr);
          matchesPerDay[newDateStr] = 0; // Initialize match count for new dates
        }
        
        // Coba lagi dengan datePool yang diperluas
        for (const date of datePool) {
          // Skip jika salah satu tim sudah bermain pada tanggal ini
          if (teamASchedule.includes(date) || teamBSchedule.includes(date)) {
            continue;
          }
          
          // Skip jika salah satu tim bermain di hari sebelumnya atau berikutnya
          const prevDate = new Date(date);
          prevDate.setDate(prevDate.getDate() - 1);
          const prevDateStr = prevDate.toISOString().split('T')[0];
          
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);
          const nextDateStr = nextDate.toISOString().split('T')[0];
          
          // Periksa apakah tim bermain di hari sebelumnya atau berikutnya
          if (teamASchedule.includes(prevDateStr) || teamASchedule.includes(nextDateStr) ||
              teamBSchedule.includes(prevDateStr) || teamBSchedule.includes(nextDateStr)) {
            continue;
          }
          
          // Periksa jumlah pertandingan pada hari ini
          const matchesOnThisDate = matchesPerDay[date];
          if (matchesOnThisDate < jamPertandingan.length) {
            bestDate = date;
            break;
          }
        }
      }
      
      // Jika masih tidak ada tanggal yang cocok, gunakan tanggal terakhir di datePool
      if (!bestDate) {
        bestDate = datePool[datePool.length - 1];
        console.warn(`Tidak dapat menemukan tanggal yang cocok untuk pertandingan: ${getTeam(match.timA)?.nama} vs ${getTeam(match.timB)?.nama}. Menggunakan tanggal terakhir.`);
      }
      
      // Determine which time slot to use
      const timeSlot = matchesPerDay[bestDate];
      
      // Determine which time array to use
      const timeArray = bestDate === firstDayStr ? jamPertandinganHariPertama : jamPertandingan;
      
      // Create the match
      const newMatch: Pertandingan = {
        id: crypto.randomUUID(),
        timA: match.timA,
        timB: match.timB,
        tanggal: bestDate,
        waktu: timeArray[timeSlot % timeArray.length],
        grup: match.grup
      };
      
      // Add to scheduled matches
      scheduledMatches.push(newMatch);
      
      // Update team schedules
      teamSchedules[match.timA].push(bestDate);
      teamSchedules[match.timB].push(bestDate);
      
      // Update match count for this day
      matchesPerDay[bestDate]++;
      
      // Sort the team schedules
      teamSchedules[match.timA].sort();
      teamSchedules[match.timB].sort();
    }
    
    // PERSYARATAN KETAT 10: Pastikan setiap hari memiliki tepat jumlah pertandingan yang sesuai
    // Identifikasi hari dengan pertandingan kurang dari yang seharusnya
    const daysWithIncompleteMatches = Object.entries(matchesPerDay)
      .filter(([date, count]) => {
        const maxMatchesForThisDate = date === firstDayStr ? jamPertandinganHariPertama.length : jamPertandingan.length;
        return count > 0 && count < maxMatchesForThisDate;
      })
      .map(([date]) => date)
      .sort();
    
    // Jika ada hari dengan pertandingan kurang dari yang seharusnya, coba pindahkan pertandingan dari hari lain
    if (daysWithIncompleteMatches.length > 0) {
      console.log(`Ada ${daysWithIncompleteMatches.length} hari dengan pertandingan kurang dari yang seharusnya:`, daysWithIncompleteMatches);
      
      // Untuk setiap hari dengan pertandingan kurang dari yang seharusnya
      for (const dateWithTooFew of daysWithIncompleteMatches) {
        // Hitung berapa pertandingan yang perlu ditambahkan
        const maxMatchesForThisDate = dateWithTooFew === firstDayStr ? jamPertandinganHariPertama.length : jamPertandingan.length;
        const neededMatches = maxMatchesForThisDate - matchesPerDay[dateWithTooFew];
        console.log(`Hari ${dateWithTooFew} membutuhkan ${neededMatches} pertandingan lagi`);
        
        // Cari hari dengan pertandingan yang bisa dipindahkan
        // Prioritaskan hari dengan pertandingan lebih dari 3 (jika ada)
        const daysWithExtraMatches = Object.entries(matchesPerDay)
          .filter(([date, count]) => {
            const maxMatchesForThisDate = date === firstDayStr ? jamPertandinganHariPertama.length : jamPertandingan.length;
            return count > maxMatchesForThisDate;
          })
          .map(([date]) => date)
          .sort();
        
        // Jika ada hari dengan pertandingan lebih dari 3, pindahkan dari sana terlebih dahulu
        if (daysWithExtraMatches.length > 0) {
          for (const dateWithTooMany of daysWithExtraMatches) {
            // Dapatkan pertandingan pada hari tersebut
            const matchesOnThisDay = scheduledMatches.filter(m => m.tanggal === dateWithTooMany);
            
            // Urutkan pertandingan berdasarkan waktu
            matchesOnThisDay.sort((a, b) => a.waktu.localeCompare(b.waktu));
            
            // Ambil pertandingan terakhir untuk dipindahkan
            const excessMatches = matchesOnThisDay.length - (dateWithTooMany === firstDayStr ? jamPertandinganHariPertama.length : jamPertandingan.length);
            const matchesToMove = matchesOnThisDay.slice(-excessMatches);
            
            for (const match of matchesToMove) {
              // Dapatkan tim yang terlibat
              const teamA = match.timA;
              const teamB = match.timB;
              
              // Periksa apakah tim bermain pada hari tersebut
              const teamAPlaysOnNewDate = scheduledMatches.some(m => 
                m.id !== match.id && m.tanggal === dateWithTooFew && (m.timA === teamA || m.timB === teamA)
              );
              
              const teamBPlaysOnNewDate = scheduledMatches.some(m => 
                m.id !== match.id && m.tanggal === dateWithTooFew && (m.timA === teamB || m.timB === teamB)
              );
              
              // Periksa apakah tim bermain di hari sebelumnya atau berikutnya
              const prevDate = new Date(dateWithTooFew);
              prevDate.setDate(prevDate.getDate() - 1);
              const prevDateStr = prevDate.toISOString().split('T')[0];
              
              const nextDate = new Date(dateWithTooFew);
              nextDate.setDate(nextDate.getDate() + 1);
              const nextDateStr = nextDate.toISOString().split('T')[0];
              
              const teamAPlaysOnAdjacentDays = scheduledMatches.some(m => 
                m.id !== match.id && (m.tanggal === prevDateStr || m.tanggal === nextDateStr) && 
                (m.timA === teamA || m.timB === teamA)
              );
              
              const teamBPlaysOnAdjacentDays = scheduledMatches.some(m => 
                m.id !== match.id && (m.tanggal === prevDateStr || m.tanggal === nextDateStr) && 
                (m.timA === teamB || m.timB === teamB)
              );
              
              // Jika tim tidak bermain pada hari tersebut dan tidak bermain di hari berturut-turut
              if (!teamAPlaysOnNewDate && !teamBPlaysOnNewDate && 
                  !teamAPlaysOnAdjacentDays && !teamBPlaysOnAdjacentDays) {
                // Hitung jumlah pertandingan pada hari baru
                const matchesOnNewDate = scheduledMatches.filter(m => m.tanggal === dateWithTooFew && m.id !== match.id).length;
                
                // Pindahkan pertandingan ke hari baru
                match.tanggal = dateWithTooFew;
                match.waktu = jamPertandingan[matchesOnNewDate];
                
                // Update match count
                matchesPerDay[dateWithTooMany]--;
                matchesPerDay[dateWithTooFew]++;
                
                console.log(`Memindahkan pertandingan ${getTeam(match.timA)?.nama} vs ${getTeam(match.timB)?.nama} dari ${dateWithTooMany} ke ${dateWithTooFew}`);
                
                // Jika hari ini sudah memiliki 3 pertandingan, keluar dari loop
                if (matchesPerDay[dateWithTooFew] === jamPertandingan.length) {
                  break;
                }
              }
            }
            
            // Jika hari ini sudah memiliki 3 pertandingan, keluar dari loop
            if (matchesPerDay[dateWithTooFew] === jamPertandingan.length) {
              break;
            }
          }
        }
        
        // Jika masih membutuhkan pertandingan, coba pindahkan dari hari lain
        if (matchesPerDay[dateWithTooFew] < jamPertandingan.length) {
          // Dapatkan semua hari dengan pertandingan
          const allDaysWithMatches = Object.entries(matchesPerDay)
            .filter(([date, count]) => count > 0 && count <= jamPertandingan.length && date !== dateWithTooFew)
            .map(([date]) => date)
            .sort();
          
          // Prioritaskan hari dengan 3 pertandingan yang bisa dipindahkan
          for (const dateWithMatches of allDaysWithMatches) {
            // Dapatkan pertandingan pada hari tersebut
            const matchesOnThisDay = scheduledMatches.filter(m => m.tanggal === dateWithMatches);
            
            // Urutkan pertandingan berdasarkan waktu
            matchesOnThisDay.sort((a, b) => a.waktu.localeCompare(b.waktu));
            
            // Coba pindahkan satu pertandingan
            for (const match of matchesOnThisDay) {
              // Dapatkan tim yang terlibat
              const teamA = match.timA;
              const teamB = match.timB;
              
              // Periksa apakah tim bermain pada hari tersebut
              const teamAPlaysOnNewDate = scheduledMatches.some(m => 
                m.id !== match.id && m.tanggal === dateWithTooFew && (m.timA === teamA || m.timB === teamA)
              );
              
              const teamBPlaysOnNewDate = scheduledMatches.some(m => 
                m.id !== match.id && m.tanggal === dateWithTooFew && (m.timA === teamB || m.timB === teamB)
              );
              
              // Periksa apakah tim bermain di hari sebelumnya atau berikutnya
              const prevDate = new Date(dateWithTooFew);
              prevDate.setDate(prevDate.getDate() - 1);
              const prevDateStr = prevDate.toISOString().split('T')[0];
              
              const nextDate = new Date(dateWithTooFew);
              nextDate.setDate(nextDate.getDate() + 1);
              const nextDateStr = nextDate.toISOString().split('T')[0];
              
              const teamAPlaysOnAdjacentDays = scheduledMatches.some(m => 
                m.id !== match.id && (m.tanggal === prevDateStr || m.tanggal === nextDateStr) && 
                (m.timA === teamA || m.timB === teamA)
              );
              
              const teamBPlaysOnAdjacentDays = scheduledMatches.some(m => 
                m.id !== match.id && (m.tanggal === prevDateStr || m.tanggal === nextDateStr) && 
                (m.timA === teamB || m.timB === teamB)
              );
              
              // Jika tim tidak bermain pada hari tersebut dan tidak bermain di hari berturut-turut
              if (!teamAPlaysOnNewDate && !teamBPlaysOnNewDate && 
                  !teamAPlaysOnAdjacentDays && !teamBPlaysOnAdjacentDays) {
                // Hitung jumlah pertandingan pada hari baru
                const matchesOnNewDate = scheduledMatches.filter(m => m.tanggal === dateWithTooFew && m.id !== match.id).length;
                
                // Pindahkan pertandingan ke hari baru
                match.tanggal = dateWithTooFew;
                match.waktu = jamPertandingan[matchesOnNewDate];
                
                // Update match count
                matchesPerDay[dateWithMatches]--;
                matchesPerDay[dateWithTooFew]++;
                
                console.log(`Memindahkan pertandingan ${getTeam(match.timA)?.nama} vs ${getTeam(match.timB)?.nama} dari ${dateWithMatches} ke ${dateWithTooFew}`);
                
                // Jika hari ini sudah memiliki 3 pertandingan, keluar dari loop
                if (matchesPerDay[dateWithTooFew] === jamPertandingan.length) {
                  break;
                }
              }
            }
            
            // Jika hari ini sudah memiliki 3 pertandingan, keluar dari loop
            if (matchesPerDay[dateWithTooFew] === jamPertandingan.length) {
              break;
            }
          }
        }
      }
    }
    
    // Jika masih ada hari dengan pertandingan kurang dari yang seharusnya, coba tambahkan pertandingan dari hari lain
    const remainingIncompleteMatches = Object.entries(matchesPerDay)
      .filter(([date, count]) => {
        // Hari pertama diperbolehkan memiliki 2 pertandingan
        if (date === firstDayStr) {
          return count !== jamPertandinganHariPertama.length;
        }
        
        // Cek apakah ini hari terakhir
        const sortedDates = Object.keys(matchesPerDay).sort();
        const lastDate = sortedDates[sortedDates.length - 1];
        
        // Hari terakhir diperbolehkan memiliki jumlah pertandingan tidak tepat 3
        if (date === lastDate) {
          return false;
        }
        
        // Hari lainnya harus memiliki tepat 3 pertandingan
        return count > 0 && count < jamPertandingan.length;
      });
    
    if (remainingIncompleteMatches.length > 0) {
      console.warn(`Masih ada ${remainingIncompleteMatches.length} hari dengan pertandingan tidak lengkap setelah optimasi.`);
      console.warn("Hari-hari tersebut:", remainingIncompleteMatches.map(([date, count]) => `${date}: ${count} pertandingan`).join(", "));
    }
    
    return scheduledMatches;
  };

  // Validasi jadwal untuk memastikan tidak ada pelanggaran aturan
  const validateSchedule = () => {
    const violations: string[] = [];
    
    // Dapatkan tanggal pertama turnamen
    const availableDates = [...new Set(pertandingan.map(p => p.tanggal))].sort();
    const firstDayStr = availableDates.length > 0 ? availableDates[0] : '';
    const lastDayStr = availableDates.length > 0 ? availableDates[availableDates.length - 1] : '';
    
    // ATURAN JADWAL YANG SEDERHANA:
    // 1. Hari pertama: 2 pertandingan (14:45 dan 16:00)
    // 2. Hari-hari lainnya: 3 pertandingan (13:30, 14:45, dan 16:00)
    // 3. Hari terakhir: Boleh kurang dari 3 pertandingan jika diperlukan
    
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
    
    // Check untuk jumlah pertandingan per hari
    const matchesPerDay: { [date: string]: Pertandingan[] } = {};
    availableDates.forEach(date => {
      matchesPerDay[date] = pertandingan.filter(match => match.tanggal === date);
    });
    
    // Validasi jumlah pertandingan per hari
    Object.entries(matchesPerDay).forEach(([date, matches]) => {
      // Hari pertama harus memiliki 2 pertandingan
      if (date === firstDayStr && matches.length !== jamPertandinganHariPertama.length) {
        violations.push(`Hari pertama (${date}) memiliki ${matches.length} pertandingan, seharusnya ${jamPertandinganHariPertama.length} pertandingan`);
      }
      // Hari-hari lainnya (kecuali hari terakhir) harus memiliki 3 pertandingan
      else if (date !== firstDayStr && date !== lastDayStr && matches.length !== jamPertandingan.length) {
        violations.push(`Tanggal ${date} memiliki ${matches.length} pertandingan, seharusnya ${jamPertandingan.length} pertandingan`);
      }
    });
    
    // Validasi waktu pertandingan di hari pertama
    if (firstDayStr) {
      const firstDayMatches = pertandingan.filter(match => match.tanggal === firstDayStr);
      
      firstDayMatches.forEach(match => {
        if (!jamPertandinganHariPertama.includes(match.waktu)) {
          violations.push(`Pertandingan di hari pertama (${firstDayStr}) memiliki waktu ${match.waktu}, seharusnya salah satu dari: ${jamPertandinganHariPertama.join(' atau ')}`);
        }
      });
    }
    
    // Validasi waktu pertandingan di hari-hari lainnya
    availableDates.forEach(date => {
      if (date !== firstDayStr) {
        const dateMatches = pertandingan.filter(match => match.tanggal === date);
        
        dateMatches.forEach(match => {
          if (!jamPertandingan.includes(match.waktu)) {
            violations.push(`Pertandingan pada tanggal ${date} memiliki waktu ${match.waktu}, seharusnya salah satu dari: ${jamPertandingan.join(', ')}`);
          }
        });
      }
    });
    
    // Tambahkan validasi distribusi istirahat
    const restDistributionResult = validateRestDistribution(pertandingan);
    if (!restDistributionResult.isValid) {
      violations.push(...restDistributionResult.messages);
    }
    
    // Tambahkan validasi jadwal berturut-turut
    const consecutiveMatchesResult = validateConsecutiveMatches(pertandingan);
    if (!consecutiveMatchesResult.isValid) {
      violations.push(...consecutiveMatchesResult.messages);
    }
    
    // Tambahkan validasi pertandingan ganda dalam sehari
    const sameDayMatchesResult = validateSameDayMatches(pertandingan);
    if (!sameDayMatchesResult.isValid) {
      violations.push(...sameDayMatchesResult.messages);
    }
    
    return {
      isValid: violations.length === 0,
      messages: violations
    };
  };

  // Fungsi untuk memvalidasi distribusi istirahat tim
  const validateRestDistribution = (schedule: Pertandingan[]): { isValid: boolean; messages: string[] } => {
    const violations: string[] = [];
    const teamRestDays: { [teamId: string]: number } = {};
    const teamLastMatch: { [teamId: string]: string } = {};
    
    // Inisialisasi data tim
    teams.forEach(team => {
      teamRestDays[team.id] = 0;
      teamLastMatch[team.id] = '';
    });
    
    // Urutkan pertandingan berdasarkan tanggal
    const sortedMatches = [...schedule].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    
    // Hitung hari istirahat untuk setiap tim
    sortedMatches.forEach(match => {
      const teamsInMatch = [match.timA, match.timB];
      
      teamsInMatch.forEach(teamId => {
        if (teamLastMatch[teamId]) {
          const lastMatchDate = new Date(teamLastMatch[teamId]);
          const currentMatchDate = new Date(match.tanggal);
          const restDays = Math.floor((currentMatchDate.getTime() - lastMatchDate.getTime()) / (1000 * 60 * 60 * 24));
          
          teamRestDays[teamId] += restDays;
        }
        teamLastMatch[teamId] = match.tanggal;
      });
    });
    
    // Hitung rata-rata dan standar deviasi hari istirahat
    const restDaysValues = Object.values(teamRestDays);
    const avgRestDays = restDaysValues.reduce((a, b) => a + b, 0) / restDaysValues.length;
    const stdDevRestDays = Math.sqrt(
      restDaysValues.reduce((a, b) => a + Math.pow(b - avgRestDays, 2), 0) / restDaysValues.length
    );
    
    // Validasi distribusi istirahat
    Object.entries(teamRestDays).forEach(([teamId, restDays]) => {
      const team = getTeam(teamId);
      if (Math.abs(restDays - avgRestDays) > stdDevRestDays * 1.5) {
        violations.push(
          `Tim ${team?.nama || teamId} memiliki distribusi istirahat yang tidak proporsional ` +
          `(${restDays} hari vs rata-rata ${avgRestDays.toFixed(1)} hari)`
        );
      }
    });
    
    return {
      isValid: violations.length === 0,
      messages: violations
    };
  };

  // Fungsi untuk memvalidasi jadwal berturut-turut secara ketat
  const validateConsecutiveMatches = (schedule: Pertandingan[]): { isValid: boolean; messages: string[] } => {
    const violations: string[] = [];
    const teamSchedules: { [teamId: string]: string[] } = {};
    
    // Inisialisasi jadwal tim
    teams.forEach(team => {
      teamSchedules[team.id] = [];
    });
    
    // Kumpulkan semua tanggal pertandingan untuk setiap tim
    schedule.forEach(match => {
      teamSchedules[match.timA].push(match.tanggal);
      teamSchedules[match.timB].push(match.tanggal);
    });
    
    // Periksa setiap tim untuk jadwal berturut-turut
    Object.entries(teamSchedules).forEach(([teamId, dates]) => {
      const sortedDates = [...new Set(dates)].sort();
      
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const currentDate = new Date(sortedDates[i]);
        const nextDate = new Date(sortedDates[i + 1]);
        const daysDiff = Math.floor((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 1) {
          const team = getTeam(teamId);
          violations.push(
            `Tim ${team?.nama || teamId} memiliki pertandingan berturut-turut pada tanggal ` +
            `${sortedDates[i]} dan ${sortedDates[i + 1]}`
          );
        }
      }
    });
    
    return {
      isValid: violations.length === 0,
      messages: violations
    };
  };

  // Fungsi untuk memvalidasi pertandingan ganda dalam sehari
  const validateSameDayMatches = (schedule: Pertandingan[]): { isValid: boolean; messages: string[] } => {
    const violations: string[] = [];
    const matchesByDate: { [date: string]: Pertandingan[] } = {};
    
    // Kelompokkan pertandingan berdasarkan tanggal
    schedule.forEach(match => {
      if (!matchesByDate[match.tanggal]) {
        matchesByDate[match.tanggal] = [];
      }
      matchesByDate[match.tanggal].push(match);
    });
    
    // Periksa setiap tanggal
    Object.entries(matchesByDate).forEach(([date, matches]) => {
      const teamsPlayingToday: { [teamId: string]: number } = {};
      
      // Hitung berapa kali setiap tim bermain pada tanggal ini
      matches.forEach(match => {
        teamsPlayingToday[match.timA] = (teamsPlayingToday[match.timA] || 0) + 1;
        teamsPlayingToday[match.timB] = (teamsPlayingToday[match.timB] || 0) + 1;
      });
      
      // Periksa tim yang bermain lebih dari satu kali
      Object.entries(teamsPlayingToday).forEach(([teamId, count]) => {
        if (count > 1) {
          const team = getTeam(teamId);
          violations.push(
            `Tim ${team?.nama || teamId} dijadwalkan bermain ${count} kali pada tanggal ${date}`
          );
        }
      });
    });
    
    return {
      isValid: violations.length === 0,
      messages: violations
    };
  };

  // Menghasilkan jadwal pertandingan round-robin dengan algoritma baru
  const generateJadwal = (startDate: Date = new Date('2025-04-01')) => {
    console.log("Membuat jadwal baru dengan pendekatan sederhana");
    
    // Hapus jadwal yang ada
    clearSchedule();
    
    // Siapkan daftar pertandingan yang perlu dijadwalkan
    const matchesToSchedule: { timA: string; timB: string; grup: string }[] = [];
    
    // Untuk setiap grup, buat daftar pertandingan round-robin
    Object.entries(grupData).forEach(([grup, _]) => {
      const timDalamGrup = teams.filter(team => team.grup === grup);
      console.log(`Grup ${grup}: ${timDalamGrup.length} tim`);
      
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
    
    console.log(`Total pertandingan yang perlu dijadwalkan: ${matchesToSchedule.length}`);
    
    // Jadwalkan pertandingan dengan algoritma sederhana
    const scheduledMatches: Pertandingan[] = [];
    
    // Tanggal pertama turnamen
    const currentDate = new Date(startDate);
    const firstDayStr = currentDate.toISOString().split('T')[0];
    
    // Jadwalkan pertandingan hari pertama (2 pertandingan)
    const firstDayMatches = matchesToSchedule.splice(0, jamPertandinganHariPertama.length);
    
    for (let i = 0; i < firstDayMatches.length; i++) {
      const match = firstDayMatches[i];
      scheduledMatches.push({
        id: crypto.randomUUID(),
        timA: match.timA,
        timB: match.timB,
        tanggal: firstDayStr,
        waktu: jamPertandinganHariPertama[i],
        grup: match.grup
      });
    }
    
    console.log(`Hari pertama (${firstDayStr}): ${firstDayMatches.length} pertandingan`);
    
    // Jadwalkan pertandingan hari-hari berikutnya (3 pertandingan per hari)
    while (matchesToSchedule.length > 0) {
      // Pindah ke hari berikutnya
      currentDate.setDate(currentDate.getDate() + 1);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Ambil 3 pertandingan untuk hari ini (atau semua yang tersisa jika kurang dari 3)
      const matchesForToday = matchesToSchedule.splice(0, Math.min(jamPertandingan.length, matchesToSchedule.length));
      
      for (let i = 0; i < matchesForToday.length; i++) {
        const match = matchesForToday[i];
        scheduledMatches.push({
          id: crypto.randomUUID(),
          timA: match.timA,
          timB: match.timB,
          tanggal: dateStr,
          waktu: jamPertandingan[i],
          grup: match.grup
        });
      }
      
      console.log(`Hari ${dateStr}: ${matchesForToday.length} pertandingan`);
    }
    
    // Update state
    setPertandingan(scheduledMatches);
    
    // Validasi jadwal
    const validationResult = validateSchedule();
    
    return validationResult;
  };
  
  // Fungsi untuk memaksa perbaikan jadwal
  const forceFixSchedule = (): Pertandingan[] => {
    console.log("MEMAKSA PERBAIKAN JADWAL UNTUK MEMATUHI ATURAN YANG KETAT");
    
    // ATURAN JADWAL YANG KETAT:
    // 1. Hari pertama turnamen HARUS memiliki TEPAT 2 pertandingan:
    //    - Pertandingan 1: 14:45 - 15:50 WIB
    //    - Pertandingan 2: 16:00 - 17:05 WIB
    // 2. Hari-hari selanjutnya HARUS memiliki TEPAT 3 pertandingan:
    //    - Pertandingan 1: 13:30 - 14:35 WIB
    //    - Pertandingan 2: 14:45 - 15:50 WIB
    //    - Pertandingan 3: 16:00 - 17:05 WIB
    // 3. HANYA hari terakhir yang diperbolehkan memiliki jumlah pertandingan tidak tepat 3,
    //    dan itu pun HANYA jika tidak ada pilihan lain (jumlah pertandingan tidak habis dibagi 3)
    
    // Dapatkan semua tanggal yang ada dalam jadwal
    const availableDates = [...new Set(pertandingan.map(p => p.tanggal))].sort();
    const firstDayStr = availableDates[0];
    const lastDayStr = availableDates[availableDates.length - 1];
    
    // Hitung jumlah pertandingan per hari
    const matchesPerDay: { [date: string]: Pertandingan[] } = {};
    availableDates.forEach(date => {
      matchesPerDay[date] = pertandingan.filter(match => match.tanggal === date);
    });
    
    // Identifikasi hari-hari dengan jumlah pertandingan tidak tepat
    const daysWithTooFewMatches = Object.entries(matchesPerDay)
      .filter(([date, matches]) => {
        // Hari pertama harus memiliki TEPAT 2 pertandingan
        if (date === firstDayStr) {
          return matches.length < jamPertandinganHariPertama.length;
        }
        
        // Hari lainnya (kecuali hari terakhir) harus memiliki TEPAT 3 pertandingan
        if (date !== lastDayStr) {
          return matches.length < jamPertandingan.length;
        }
        
        return false;
      })
      .map(([date, matches]) => ({ date, matches }));
    
    const daysWithTooManyMatches = Object.entries(matchesPerDay)
      .filter(([date, matches]) => {
        // Hari pertama harus memiliki TEPAT 2 pertandingan
        if (date === firstDayStr) {
          return matches.length > jamPertandinganHariPertama.length;
        }
        
        // Hari lainnya harus memiliki TEPAT 3 pertandingan
        return matches.length > jamPertandingan.length;
      })
      .map(([date, matches]) => ({ date, matches }));
    
    // Buat salinan jadwal untuk dimodifikasi
    let fixedSchedule = [...pertandingan];
    
    // LANGKAH 1: Perbaiki hari pertama - HARUS memiliki TEPAT 2 pertandingan
    const firstDayMatches = matchesPerDay[firstDayStr] || [];
    
    // Jika hari pertama memiliki terlalu banyak pertandingan, pindahkan kelebihannya
    if (firstDayMatches.length > jamPertandinganHariPertama.length) {
      console.log(`PERBAIKAN: Hari pertama (${firstDayStr}) memiliki ${firstDayMatches.length} pertandingan, seharusnya TEPAT ${jamPertandinganHariPertama.length}`);
      
      // Ambil pertandingan yang akan dipindahkan
      const excessMatches = firstDayMatches.slice(jamPertandinganHariPertama.length);
      
      // Cari hari berikutnya yang bisa menampung pertandingan tambahan
      const nextDay = new Date(firstDayStr);
      nextDay.setDate(nextDay.getDate() + 1);
      let nextDayStr = nextDay.toISOString().split('T')[0];
      
      // Pastikan hari berikutnya ada dalam jadwal, jika tidak, buat hari baru
      if (!availableDates.includes(nextDayStr)) {
        // Tambahkan hari baru ke availableDates
        availableDates.push(nextDayStr);
        matchesPerDay[nextDayStr] = [];
      }
      
      // Pindahkan pertandingan ke hari berikutnya
      for (const match of excessMatches) {
        const matchIndex = fixedSchedule.findIndex(m => m.id === match.id);
        if (matchIndex !== -1) {
          // Tentukan waktu pertandingan berdasarkan jumlah pertandingan yang sudah ada
          const currentMatches = matchesPerDay[nextDayStr] || [];
          const timeSlot = currentMatches.length % jamPertandingan.length;
          
          fixedSchedule[matchIndex] = {
            ...fixedSchedule[matchIndex],
            tanggal: nextDayStr,
            waktu: jamPertandingan[timeSlot]
          };
          
          // Update jumlah pertandingan
          if (!matchesPerDay[nextDayStr]) matchesPerDay[nextDayStr] = [];
          matchesPerDay[nextDayStr].push(match);
          
          console.log(`PERBAIKAN: Memindahkan pertandingan dari hari pertama (${firstDayStr}) ke ${nextDayStr}`);
        }
      }
      
      // Update firstDayMatches
      matchesPerDay[firstDayStr] = firstDayMatches.slice(0, jamPertandinganHariPertama.length);
    }
    
    // Jika hari pertama memiliki terlalu sedikit pertandingan, tambahkan dari hari lain
    if (firstDayMatches.length < jamPertandinganHariPertama.length) {
      console.log(`PERBAIKAN: Hari pertama (${firstDayStr}) memiliki ${firstDayMatches.length} pertandingan, seharusnya TEPAT ${jamPertandinganHariPertama.length}`);
      
      // Cari hari dengan terlalu banyak pertandingan
      for (const { date: dateWithTooMany, matches } of daysWithTooManyMatches) {
        // Skip hari pertama
        if (dateWithTooMany === firstDayStr) continue;
        
        // Hitung berapa pertandingan yang bisa dipindahkan
        const neededMatches = jamPertandinganHariPertama.length - firstDayMatches.length;
        const availableMatches = Math.min(neededMatches, matches.length - jamPertandingan.length);
        
        if (availableMatches <= 0) continue;
        
        // Ambil pertandingan yang akan dipindahkan
        const matchesToMove = matches.slice(0, availableMatches);
        
        for (const match of matchesToMove) {
          const matchIndex = fixedSchedule.findIndex(m => m.id === match.id);
          if (matchIndex !== -1) {
            // Tentukan waktu pertandingan berdasarkan jumlah pertandingan yang sudah ada
            const timeSlot = firstDayMatches.length;
            
            fixedSchedule[matchIndex] = {
              ...fixedSchedule[matchIndex],
              tanggal: firstDayStr,
              waktu: jamPertandinganHariPertama[timeSlot]
            };
            
            // Update jumlah pertandingan
            firstDayMatches.push(match);
            matchesPerDay[firstDayStr] = firstDayMatches;
            matchesPerDay[dateWithTooMany] = matches.filter(m => m.id !== match.id);
            
            console.log(`PERBAIKAN: Memindahkan pertandingan dari ${dateWithTooMany} ke hari pertama (${firstDayStr})`);
            
            // Jika hari pertama sudah memiliki cukup pertandingan, keluar dari loop
            if (firstDayMatches.length >= jamPertandinganHariPertama.length) {
              break;
            }
          }
        }
        
        // Jika hari pertama sudah memiliki cukup pertandingan, keluar dari loop
        if (firstDayMatches.length >= jamPertandinganHariPertama.length) {
          break;
        }
      }
    }
    
    // LANGKAH 2: Pastikan waktu pertandingan di hari pertama sesuai
    const updatedFirstDayMatches = fixedSchedule.filter(match => match.tanggal === firstDayStr);
    
    // Pastikan waktu pertandingan di hari pertama sesuai dengan yang ditentukan
    if (updatedFirstDayMatches.length === jamPertandinganHariPertama.length) {
      // Urutkan pertandingan berdasarkan waktu
      updatedFirstDayMatches.sort((a, b) => {
        const timeA = jamPertandinganHariPertama.indexOf(a.waktu);
        const timeB = jamPertandinganHariPertama.indexOf(b.waktu);
        return timeA - timeB;
      });
      
      // Pastikan waktu pertandingan sesuai
      for (let i = 0; i < updatedFirstDayMatches.length; i++) {
        const match = updatedFirstDayMatches[i];
        const expectedTime = jamPertandinganHariPertama[i];
        
        if (match.waktu !== expectedTime) {
          const matchIndex = fixedSchedule.findIndex(m => m.id === match.id);
          if (matchIndex !== -1) {
            fixedSchedule[matchIndex] = {
              ...fixedSchedule[matchIndex],
              waktu: expectedTime
            };
            
            console.log(`PERBAIKAN: Mengubah waktu pertandingan di hari pertama (${firstDayStr}) dari ${match.waktu} menjadi ${expectedTime}`);
          }
        }
      }
    }
    
    // LANGKAH 3: Perbaiki hari-hari lainnya - HARUS memiliki TEPAT 3 pertandingan (kecuali hari terakhir)
    // Jika ada hari dengan terlalu banyak pertandingan, pindahkan ke hari dengan terlalu sedikit
    if (daysWithTooManyMatches.length > 0 && daysWithTooFewMatches.length > 0) {
      for (const { date: dateWithTooMany, matches } of daysWithTooManyMatches) {
        // Skip hari pertama (sudah ditangani di langkah 1)
        if (dateWithTooMany === firstDayStr) continue;
        
        // Hitung berapa pertandingan yang perlu dipindahkan
        const maxMatches = dateWithTooMany === firstDayStr ? 
          jamPertandinganHariPertama.length : jamPertandingan.length;
        const excessMatches = matches.length - maxMatches;
        
        if (excessMatches <= 0) continue;
        
        // Ambil pertandingan yang akan dipindahkan
        const matchesToMove = matches.slice(-excessMatches);
        
        for (const match of matchesToMove) {
          // Cari hari dengan terlalu sedikit pertandingan
          for (const { date: dateWithTooFew, matches: targetMatches } of daysWithTooFewMatches) {
            // Skip hari pertama (sudah ditangani di langkah 1)
            if (dateWithTooFew === firstDayStr) continue;
            
            const maxMatchesForTarget = dateWithTooFew === firstDayStr ? 
              jamPertandinganHariPertama.length : jamPertandingan.length;
            
            // Jika hari ini masih bisa menampung pertandingan lagi
            if (targetMatches.length < maxMatchesForTarget) {
              // Pindahkan pertandingan ke hari ini
              const matchIndex = fixedSchedule.findIndex(m => m.id === match.id);
              if (matchIndex !== -1) {
                // Tentukan waktu pertandingan berdasarkan jumlah pertandingan yang sudah ada
                const timeArray = dateWithTooFew === firstDayStr ? 
                  jamPertandinganHariPertama : jamPertandingan;
                const timeSlot = targetMatches.length;
                
                fixedSchedule[matchIndex] = {
                  ...fixedSchedule[matchIndex],
                  tanggal: dateWithTooFew,
                  waktu: timeArray[timeSlot]
                };
                
                // Update jumlah pertandingan
                targetMatches.push(match);
                matchesPerDay[dateWithTooFew] = targetMatches;
                matchesPerDay[dateWithTooMany] = matches.filter(m => m.id !== match.id);
                
                console.log(`PERBAIKAN: Memindahkan pertandingan dari ${dateWithTooMany} ke ${dateWithTooFew}`);
                
                // Jika hari ini sudah penuh, pindah ke hari berikutnya
                if (targetMatches.length >= maxMatchesForTarget) {
                  break;
                }
              }
            }
          }
        }
      }
    }
    
    // LANGKAH 4: Jika masih ada hari dengan terlalu sedikit pertandingan, tambahkan hari baru
    // Hitung ulang hari-hari dengan terlalu sedikit pertandingan
    const updatedDaysWithTooFewMatches = Object.entries(
      fixedSchedule.reduce((acc, match) => {
        if (!acc[match.tanggal]) acc[match.tanggal] = [];
        acc[match.tanggal].push(match);
        return acc;
      }, {} as { [date: string]: Pertandingan[] })
    )
    .filter(([date, matches]) => {
      // Hari pertama harus memiliki TEPAT 2 pertandingan
      if (date === firstDayStr) {
        return matches.length < jamPertandinganHariPertama.length;
      }
      
      // Hari lainnya (kecuali hari terakhir) harus memiliki TEPAT 3 pertandingan
      if (date !== lastDayStr) {
        return matches.length < jamPertandingan.length;
      }
      
      return false;
    })
    .map(([date, matches]) => ({ date, matches }));
    
    if (updatedDaysWithTooFewMatches.length > 0) {
      console.log("PERBAIKAN: Masih ada hari dengan terlalu sedikit pertandingan, menambahkan hari baru...");
      
      // Tambahkan hari baru setelah hari terakhir
      const lastDate = new Date(lastDayStr);
      const newDate = new Date(lastDate);
      newDate.setDate(lastDate.getDate() + 1);
      const newDateStr = newDate.toISOString().split('T')[0];
      
      // Pindahkan beberapa pertandingan dari hari terakhir ke hari baru
      const lastDayMatches = fixedSchedule.filter(match => match.tanggal === lastDayStr);
      
      // Jika hari terakhir memiliki lebih dari 3 pertandingan, pindahkan kelebihannya
      if (lastDayMatches.length > jamPertandingan.length) {
        const matchesToMove = lastDayMatches.slice(-Math.min(3, lastDayMatches.length - jamPertandingan.length));
        
        for (let i = 0; i < matchesToMove.length; i++) {
          const match = matchesToMove[i];
          const matchIndex = fixedSchedule.findIndex(m => m.id === match.id);
          
          if (matchIndex !== -1) {
            fixedSchedule[matchIndex] = {
              ...fixedSchedule[matchIndex],
              tanggal: newDateStr,
              waktu: jamPertandingan[i]
            };
            
            console.log(`PERBAIKAN: Memindahkan pertandingan dari ${lastDayStr} ke hari baru ${newDateStr}`);
          }
        }
      }
    }
    
    // LANGKAH 5: Pastikan waktu pertandingan di semua hari sesuai
    const updatedScheduleByDay = fixedSchedule.reduce((acc, match) => {
      if (!acc[match.tanggal]) acc[match.tanggal] = [];
      acc[match.tanggal].push(match);
      return acc;
    }, {} as { [date: string]: Pertandingan[] });
    
    Object.entries(updatedScheduleByDay).forEach(([date, matches]) => {
      // Skip hari terakhir jika jumlah pertandingan tidak tepat 3
      if (date === lastDayStr && matches.length !== jamPertandingan.length) {
        return;
      }
      
      const timeArray = date === firstDayStr ? jamPertandinganHariPertama : jamPertandingan;
      
      // Jika jumlah pertandingan sesuai dengan jumlah slot waktu, pastikan waktunya juga sesuai
      if (matches.length === timeArray.length) {
        // Urutkan pertandingan berdasarkan waktu
        matches.sort((a, b) => {
          const timeA = timeArray.indexOf(a.waktu);
          const timeB = timeArray.indexOf(b.waktu);
          return timeA - timeB;
        });
        
        // Pastikan waktu pertandingan sesuai
        for (let i = 0; i < matches.length; i++) {
          const match = matches[i];
          const expectedTime = timeArray[i];
          
          if (match.waktu !== expectedTime) {
            const matchIndex = fixedSchedule.findIndex(m => m.id === match.id);
            if (matchIndex !== -1) {
              fixedSchedule[matchIndex] = {
                ...fixedSchedule[matchIndex],
                waktu: expectedTime
              };
              
              console.log(`PERBAIKAN: Mengubah waktu pertandingan pada tanggal ${date} dari ${match.waktu} menjadi ${expectedTime}`);
            }
          }
        }
      }
    });
    
    console.log("PERBAIKAN JADWAL SELESAI");
    return fixedSchedule;
  };

  // Fungsi untuk menghapus jadwal
  const clearSchedule = () => {
    // Hapus semua pertandingan
    setPertandingan([]);
    
    // Hapus semua pertandingan babak gugur
    setPertandinganBabakGugur([]);
    
    // Reset statistik pemain (gol, kartu kuning, kartu merah) dan klasemen tim
    const resetTeams = teams.map(team => {
      // Reset statistik tim (klasemen)
      const resetedTeam = {
        ...team,
        main: 0,
        menang: 0,
        seri: 0,
        kalah: 0,
        golMasuk: 0,
        golKemasukan: 0,
        selisihGol: 0,
        poin: 0
      };
      
      // Reset statistik pemain (topskor, kartu, larangan bermain)
      const resetedPlayers = team.pemain.map(player => ({
        ...player,
        golTotal: 0,
        kartuKuning: 0,
        kartuMerah: 0
      }));
      
      return {
        ...resetedTeam,
        pemain: resetedPlayers
      };
    });
    
    // Update teams dengan statistik yang sudah direset
    setTeams(resetTeams);
    
    // Panggil updateKlasemen untuk memastikan klasemen benar-benar direset
    // Ini memastikan bahwa semua perhitungan klasemen dijalankan ulang
    setTimeout(() => {
      updateKlasemen();
    }, 100);
    
    console.log("Jadwal, pertandingan babak gugur, statistik pemain, dan klasemen telah direset");
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
  const simpanHasilPertandingan = async (hasil: Omit<HasilPertandingan, "id">) => {
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
    try {
      await updatePemainStatistik(hasil);
    } catch (error) {
      console.error("Error saat memperbarui statistik pemain:", error);
    }
    
    // Update klasemen (async)
    try {
      await updateKlasemen();
    } catch (error) {
      console.error("Error saat memperbarui klasemen:", error);
    }
  };

  // Update statistik pemain setelah pertandingan
  const updatePemainStatistik = async (hasil: Omit<HasilPertandingan, "id">) => {
    // Buat salinan teams untuk dimodifikasi
    const updatedTeams = [...teams];
    
    // Update gol dan simpan ke Firestore
    for (const goalData of hasil.pencetakGol) {
      const { pemainId, jumlah } = goalData;
      
      // Cari pemain di teams
      let pemainFound = false;
      for (let i = 0; i < updatedTeams.length; i++) {
        const pemainIndex = updatedTeams[i].pemain.findIndex(p => p.id === pemainId);
        if (pemainIndex !== -1) {
          // Pastikan nilai awal adalah 0 jika belum ada
          const currentGoals = updatedTeams[i].pemain[pemainIndex].golTotal || 0;
          updatedTeams[i].pemain[pemainIndex] = {
            ...updatedTeams[i].pemain[pemainIndex],
            golTotal: currentGoals + jumlah
          };
          
          const pemain = updatedTeams[i].pemain[pemainIndex];
          console.log(`Pemain ${pemain.nama} mencetak ${jumlah} gol, total: ${currentGoals + jumlah}`);
          
          // Simpan data gol ke Firestore
          try {
            await saveGoalToFirestore({
              id: crypto.randomUUID(),
              pemainId,
              pertandinganId: hasil.pertandinganId,
              jumlah,
              timId: updatedTeams[i].id,
              tanggal: new Date().toISOString(),
              namaTimA: getTeam(pertandingan.find(p => p.id === hasil.pertandinganId)?.timA || '')?.nama || '',
              namaTimB: getTeam(pertandingan.find(p => p.id === hasil.pertandinganId)?.timB || '')?.nama || '',
              namaPemain: pemain.nama,
              nomorPunggung: pemain.nomorPunggung,
              totalGol: currentGoals + jumlah
            });
            console.log(`Data gol untuk pemain ${pemain.nama} berhasil disimpan ke Firestore`);
          } catch (error) {
            console.error(`Error menyimpan data gol untuk pemain ${pemain.nama}:`, error);
          }
          
          pemainFound = true;
          break;
        }
      }
      
      if (!pemainFound) {
        console.warn(`Pemain dengan ID ${pemainId} tidak ditemukan`);
      }
    }
    
    // Update kartu dan simpan ke Firestore
    for (const cardData of hasil.kartu) {
      const { pemainId, jenis, jumlah } = cardData;
      
      // Cari pemain di teams
      let pemainFound = false;
      for (let i = 0; i < updatedTeams.length; i++) {
        const pemainIndex = updatedTeams[i].pemain.findIndex(p => p.id === pemainId);
        if (pemainIndex !== -1) {
          const pemain = updatedTeams[i].pemain[pemainIndex];
          
          if (jenis === 'kuning') {
            // Pastikan nilai awal adalah 0 jika belum ada
            const currentYellows = pemain.kartuKuning || 0;
            updatedTeams[i].pemain[pemainIndex] = {
              ...pemain,
              kartuKuning: currentYellows + jumlah
            };
            
            console.log(`Pemain ${pemain.nama} mendapat ${jumlah} kartu kuning, total: ${currentYellows + jumlah}`);
            
            // Simpan data kartu kuning ke Firestore
            try {
              await saveCardToFirestore({
                id: crypto.randomUUID(),
                pemainId,
                pertandinganId: hasil.pertandinganId,
                jenis: 'kuning',
                jumlah,
                timId: updatedTeams[i].id,
                tanggal: new Date().toISOString(),
                namaTimA: getTeam(pertandingan.find(p => p.id === hasil.pertandinganId)?.timA || '')?.nama || '',
                namaTimB: getTeam(pertandingan.find(p => p.id === hasil.pertandinganId)?.timB || '')?.nama || '',
                namaPemain: pemain.nama,
                nomorPunggung: pemain.nomorPunggung,
                totalKartu: currentYellows + jumlah
              });
              console.log(`Data kartu kuning untuk pemain ${pemain.nama} berhasil disimpan ke Firestore`);
              
              // Cek apakah pemain terkena larangan bermain (3 kartu kuning)
              const newTotalYellows = currentYellows + jumlah;
              if (newTotalYellows >= 3) {
                console.log(`Pemain ${pemain.nama} terkena larangan bermain karena akumulasi ${newTotalYellows} kartu kuning`);
                
                // Simpan data larangan bermain ke Firestore
                try {
                  await saveCardToFirestore({
                    id: crypto.randomUUID(),
                    pemainId,
                    pertandinganId: hasil.pertandinganId,
                    jenis: 'larangan',
                    jumlah: 1,
                    timId: updatedTeams[i].id,
                    tanggal: new Date().toISOString(),
                    namaTimA: getTeam(pertandingan.find(p => p.id === hasil.pertandinganId)?.timA || '')?.nama || '',
                    namaTimB: getTeam(pertandingan.find(p => p.id === hasil.pertandinganId)?.timB || '')?.nama || '',
                    namaPemain: pemain.nama,
                    nomorPunggung: pemain.nomorPunggung,
                    alasan: 'Akumulasi 3 Kartu Kuning'
                  });
                  console.log(`Data larangan bermain untuk pemain ${pemain.nama} berhasil disimpan ke Firestore`);
                } catch (error) {
                  console.error(`Error menyimpan data larangan bermain untuk pemain ${pemain.nama}:`, error);
                }
              }
            } catch (error) {
              console.error(`Error menyimpan data kartu kuning untuk pemain ${pemain.nama}:`, error);
            }
          } else if (jenis === 'merah') {
            // Pastikan nilai awal adalah 0 jika belum ada
            const currentReds = pemain.kartuMerah || 0;
            updatedTeams[i].pemain[pemainIndex] = {
              ...pemain,
              kartuMerah: currentReds + jumlah
            };
            
            console.log(`Pemain ${pemain.nama} mendapat ${jumlah} kartu merah, total: ${currentReds + jumlah}`);
            
            // Simpan data kartu merah ke Firestore
            try {
              await saveCardToFirestore({
                id: crypto.randomUUID(),
                pemainId,
                pertandinganId: hasil.pertandinganId,
                jenis: 'merah',
                jumlah,
                timId: updatedTeams[i].id,
                tanggal: new Date().toISOString(),
                namaTimA: getTeam(pertandingan.find(p => p.id === hasil.pertandinganId)?.timA || '')?.nama || '',
                namaTimB: getTeam(pertandingan.find(p => p.id === hasil.pertandinganId)?.timB || '')?.nama || '',
                namaPemain: pemain.nama,
                nomorPunggung: pemain.nomorPunggung,
                totalKartu: currentReds + jumlah
              });
              console.log(`Data kartu merah untuk pemain ${pemain.nama} berhasil disimpan ke Firestore`);
              
              // Pemain terkena larangan bermain karena kartu merah
              console.log(`Pemain ${pemain.nama} terkena larangan bermain karena kartu merah`);
              
              // Simpan data larangan bermain ke Firestore
              try {
                await saveCardToFirestore({
                  id: crypto.randomUUID(),
                  pemainId,
                  pertandinganId: hasil.pertandinganId,
                  jenis: 'larangan',
                  jumlah: 1,
                  timId: updatedTeams[i].id,
                  tanggal: new Date().toISOString(),
                  namaTimA: getTeam(pertandingan.find(p => p.id === hasil.pertandinganId)?.timA || '')?.nama || '',
                  namaTimB: getTeam(pertandingan.find(p => p.id === hasil.pertandinganId)?.timB || '')?.nama || '',
                  namaPemain: pemain.nama,
                  nomorPunggung: pemain.nomorPunggung,
                  alasan: 'Kartu Merah'
                });
                console.log(`Data larangan bermain untuk pemain ${pemain.nama} berhasil disimpan ke Firestore`);
              } catch (error) {
                console.error(`Error menyimpan data larangan bermain untuk pemain ${pemain.nama}:`, error);
              }
            } catch (error) {
              console.error(`Error menyimpan data kartu merah untuk pemain ${pemain.nama}:`, error);
            }
          }
          
          pemainFound = true;
          break;
        }
      }
      
      if (!pemainFound) {
        console.warn(`Pemain dengan ID ${pemainId} tidak ditemukan`);
      }
    }
    
    // Simpan perubahan ke state
    setTeams(updatedTeams);
  };

  // Update klasemen berdasarkan hasil pertandingan
  const updateKlasemen = async () => {
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
    
    // Simpan hasil head-to-head untuk tie-breaker
    const headToHead: Record<string, Record<string, { menang: number, seri: number, kalah: number }>> = {};
    
    // Inisialisasi head-to-head record untuk semua tim
    resetTeams.forEach(team => {
      headToHead[team.id] = {};
      resetTeams.forEach(opponent => {
        if (team.id !== opponent.id) {
          headToHead[team.id][opponent.id] = { menang: 0, seri: 0, kalah: 0 };
        }
      });
    });
    
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
          
          // Update head-to-head record
          const opponentId = p.timB;
          
          if (p.hasil.skorTimA > p.hasil.skorTimB) {
            menang++;
            if (headToHead[team.id] && headToHead[team.id][opponentId]) {
              headToHead[team.id][opponentId].menang += 1;
            }
          } else if (p.hasil.skorTimA === p.hasil.skorTimB) {
            seri++;
            if (headToHead[team.id] && headToHead[team.id][opponentId]) {
              headToHead[team.id][opponentId].seri += 1;
            }
          } else {
            kalah++;
            if (headToHead[team.id] && headToHead[team.id][opponentId]) {
              headToHead[team.id][opponentId].kalah += 1;
            }
          }
        } else if (p.timB === team.id) {
          main++;
          golMasuk += p.hasil.skorTimB;
          golKemasukan += p.hasil.skorTimA;
          
          // Update head-to-head record
          const opponentId = p.timA;
          
          if (p.hasil.skorTimB > p.hasil.skorTimA) {
            menang++;
            if (headToHead[team.id] && headToHead[team.id][opponentId]) {
              headToHead[team.id][opponentId].menang += 1;
            }
          } else if (p.hasil.skorTimB === p.hasil.skorTimA) {
            seri++;
            if (headToHead[team.id] && headToHead[team.id][opponentId]) {
              headToHead[team.id][opponentId].seri += 1;
            }
          } else {
            kalah++;
            if (headToHead[team.id] && headToHead[team.id][opponentId]) {
              headToHead[team.id][opponentId].kalah += 1;
            }
          }
        }
      });
      
      // Hitung poin dan selisih gol
      // Sistem Poin: 3 poin untuk menang, 1 untuk seri, 0 untuk kalah
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
    
    // Simpan head-to-head record ke Firestore dan update state
    try {
      await saveHeadToHeadToFirestore(headToHead);
      setHeadToHeadData(headToHead);
      console.log("Data head-to-head berhasil disimpan ke Firestore");
    } catch (error) {
      console.error("Gagal menyimpan data head-to-head ke Firestore:", error);
      // Fallback ke localStorage jika Firestore gagal
      localStorage.setItem('headToHead', JSON.stringify(headToHead));
      setHeadToHeadData(headToHead);
    }
    
    setTeams(updatedTeams);
  };

  // Mendapatkan klasemen grup
  const getKlasemenGrup = (grup: string) => {
    // Filter tim berdasarkan grup
    const teamsInGroup = teams.filter(team => team.grup === grup);
    
    // Sortir tim berdasarkan kriteria
    return teamsInGroup.sort((a, b) => {
      // 1. Poin
      const pointsA = a.poin || 0;
      const pointsB = b.poin || 0;
      if (pointsA !== pointsB) {
        return pointsB - pointsA;
      }
      
      // 2. Selisih Gol (SG)
      const goalDiffA = a.selisihGol || 0;
      const goalDiffB = b.selisihGol || 0;
      if (goalDiffA !== goalDiffB) {
        return goalDiffB - goalDiffA;
      }
      
      // 3. Gol Masuk (GM)
      const goalsForA = a.golMasuk || 0;
      const goalsForB = b.golMasuk || 0;
      if (goalsForA !== goalsForB) {
        return goalsForB - goalsForA;
      }
      
      // 4. Head-to-Head
      // Jika kedua tim memiliki poin, selisih gol, dan gol masuk yang sama,
      // periksa hasil pertandingan langsung antara kedua tim
      if (headToHeadData && headToHeadData[a.id] && headToHeadData[a.id][b.id]) {
        const h2h = headToHeadData[a.id][b.id];
        
        if (h2h.menang > h2h.kalah) {
          return -1; // Tim A menang dalam head-to-head
        } else if (h2h.menang < h2h.kalah) {
          return 1; // Tim B menang dalam head-to-head
        }
      }
      
      // Jika masih sama, urutkan berdasarkan nama tim (untuk konsistensi)
      return a.nama.localeCompare(b.nama);
    });
  };

  // Mendapatkan daftar pencetak gol terbanyak
  const getPencetakGolTerbanyak = (limit = 10) => {
    const allPlayers: Pemain[] = [];
    
    // Kumpulkan semua pemain dari semua tim
    teams.forEach(team => {
      // Tambahkan informasi tim ke setiap pemain
      const playersWithTeam = team.pemain.map(player => ({
        ...player,
        timId: team.id,
        timNama: team.nama
      }));
      allPlayers.push(...playersWithTeam);
    });
    
    // Filter pemain yang mencetak gol dan urutkan berdasarkan jumlah gol
    const scorers = allPlayers
      .filter(p => (p.golTotal || 0) > 0) // Hanya pemain yang mencetak gol
      .sort((a, b) => (b.golTotal || 0) - (a.golTotal || 0))
      .slice(0, limit);
    
    console.log("Daftar pencetak gol:", scorers.map(p => `${p.nama}: ${p.golTotal} gol`));
    
    return scorers;
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

  // Fungsi untuk menyimpan hasil pertandingan babak gugur
  const simpanHasilBabakGugur = async (hasil: Omit<HasilPertandingan, "id">) => {
    const hasilWithId: HasilPertandingan = {
      ...hasil,
      id: crypto.randomUUID()
    };
    
    // Buat salinan pertandingan babak gugur untuk dimodifikasi
    const updatedMatches = [...pertandinganBabakGugur];
    
    // Update hasil pertandingan
    for (let i = 0; i < updatedMatches.length; i++) {
      if (updatedMatches[i].id === hasil.pertandinganId) {
        updatedMatches[i] = { ...updatedMatches[i], hasil: hasilWithId };
        break;
      }
    }
    
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
    
    // Update state
    setPertandinganBabakGugur(updatedMatches);
    
    // Update statistik pemain (gol dan kartu)
    try {
      await updatePemainStatistik(hasil);
    } catch (error) {
      console.error("Error saat memperbarui statistik pemain:", error);
    }
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

  // Fungsi untuk menghapus data pencetak gol
  const resetPencetakGol = () => {
    // Buat salinan array tim
    const updatedTeams = [...teams];
    
    // Reset golTotal untuk semua pemain di semua tim
    updatedTeams.forEach(team => {
      team.pemain.forEach(player => {
        player.golTotal = 0;
      });
    });
    
    // Update state dan localStorage
    setTeams(updatedTeams);
    localStorage.setItem('teams', JSON.stringify(updatedTeams));
    
    // Reset data gol di hasil pertandingan
    const updatedMatches = [...pertandingan];
    updatedMatches.forEach(match => {
      if (match.hasil) {
        match.hasil.pencetakGol = [];
      }
    });
    
    // Update state dan localStorage
    setPertandingan(updatedMatches);
    localStorage.setItem('pertandingan', JSON.stringify(updatedMatches));
    
    // Reset data gol di babak gugur
    const updatedKnockout = [...pertandinganBabakGugur];
    updatedKnockout.forEach(match => {
      if (match.hasil) {
        match.hasil.pencetakGol = [];
      }
    });
    
    // Update state dan localStorage
    setPertandinganBabakGugur(updatedKnockout);
    localStorage.setItem('pertandinganBabakGugur', JSON.stringify(updatedKnockout));
  };
  
  // Fungsi untuk menghapus data kartu pemain
  const resetKartuPemain = () => {
    // Buat salinan array tim
    const updatedTeams = [...teams];
    
    // Reset kartuKuning dan kartuMerah untuk semua pemain di semua tim
    updatedTeams.forEach(team => {
      team.pemain.forEach(player => {
        player.kartuKuning = 0;
        player.kartuMerah = 0;
      });
    });
    
    // Update state dan localStorage
    setTeams(updatedTeams);
    localStorage.setItem('teams', JSON.stringify(updatedTeams));
    
    // Reset data kartu di hasil pertandingan
    const updatedMatches = [...pertandingan];
    updatedMatches.forEach(match => {
      if (match.hasil) {
        match.hasil.kartu = [];
      }
    });
    
    // Update state dan localStorage
    setPertandingan(updatedMatches);
    localStorage.setItem('pertandingan', JSON.stringify(updatedMatches));
    
    // Reset data kartu di babak gugur
    const updatedKnockout = [...pertandinganBabakGugur];
    updatedKnockout.forEach(match => {
      if (match.hasil) {
        match.hasil.kartu = [];
      }
    });
    
    // Update state dan localStorage
    setPertandinganBabakGugur(updatedKnockout);
    localStorage.setItem('pertandinganBabakGugur', JSON.stringify(updatedKnockout));
  };
  
  // Fungsi untuk menghapus data larangan bermain (sama dengan resetKartuPemain karena larangan bermain berdasarkan kartu)
  const resetLaranganBermain = () => {
    resetKartuPemain();
  };

  // Fungsi untuk mengoptimalkan jadwal yang sudah ada
  const optimizeSchedule = () => {
    // Jika tidak ada pertandingan, tidak ada yang perlu dioptimalkan
    if (pertandingan.length === 0) {
      return {
        isValid: true,
        messages: ["Tidak ada pertandingan untuk dioptimalkan"],
        optimized: false
      };
    }
    
    // Dapatkan tanggal pertama turnamen
    const availableDates = [...new Set(pertandingan.map(p => p.tanggal))].sort();
    const firstDayStr = availableDates[0];
    const lastDayStr = availableDates[availableDates.length - 1];
    
    // ATURAN JADWAL:
    // 1. Hari pertama turnamen hanya ada 2 pertandingan (14:45 dan 16:00)
    // 2. Hari-hari selanjutnya memiliki 3 pertandingan (13:30, 14:45, dan 16:00)
    // 3. Hari terakhir diperbolehkan memiliki jumlah pertandingan tidak tepat 3 jika tidak ada pilihan lain
    // 4. Durasi setiap pertandingan adalah 65 menit (1 jam 5 menit)
    
    // Hitung jumlah pertandingan per hari
    const matchesPerDay: { [date: string]: Pertandingan[] } = {};
    availableDates.forEach(date => {
      matchesPerDay[date] = pertandingan.filter(match => match.tanggal === date);
    });
    
    // Buat salinan jadwal untuk dioptimalkan
    let optimizedMatches = [...pertandingan];
    let optimizationsMade = 0;
    
    // Identifikasi hari dengan jumlah pertandingan tidak tepat
    const daysWithWrongMatchCount = Object.entries(matchesPerDay)
      .filter(([date, matches]) => {
        // Hari pertama harus memiliki tepat 2 pertandingan
        if (date === firstDayStr) {
          return matches.length !== jamPertandinganHariPertama.length;
        }
        
        // Hari terakhir diperbolehkan memiliki jumlah pertandingan tidak tepat 3
        if (date === lastDayStr && date !== firstDayStr) {
          return false;
        }
        
        // Hari lainnya harus memiliki tepat 3 pertandingan
        return matches.length !== jamPertandingan.length;
      })
      .map(([date, matches]) => ({ date, matches }));
    
    // Jika ada hari dengan jumlah pertandingan tidak tepat, coba perbaiki
    if (daysWithWrongMatchCount.length > 0) {
      console.log(`Ada ${daysWithWrongMatchCount.length} hari dengan jumlah pertandingan tidak tepat`);
      
      // Identifikasi hari dengan terlalu banyak pertandingan
      const daysWithTooManyMatches = daysWithWrongMatchCount.filter(({ date, matches }) => {
        const maxMatches = date === firstDayStr ? jamPertandinganHariPertama.length : jamPertandingan.length;
        return matches.length > maxMatches;
      });
      
      // Identifikasi hari dengan terlalu sedikit pertandingan
      const daysWithTooFewMatches = daysWithWrongMatchCount.filter(({ date, matches }) => {
        const maxMatches = date === firstDayStr ? jamPertandinganHariPertama.length : jamPertandingan.length;
        return matches.length < maxMatches;
      });
      
      // Jika ada hari dengan terlalu banyak pertandingan dan hari dengan terlalu sedikit pertandingan,
      // pindahkan pertandingan dari hari dengan terlalu banyak ke hari dengan terlalu sedikit
      if (daysWithTooManyMatches.length > 0 && daysWithTooFewMatches.length > 0) {
        for (const { date: dateWithTooMany, matches } of daysWithTooManyMatches) {
          // Hitung berapa pertandingan yang perlu dipindahkan
          const maxMatches = dateWithTooMany === firstDayStr ? 
            jamPertandinganHariPertama.length : jamPertandingan.length;
          const excessMatches = matches.length - maxMatches;
          
          if (excessMatches <= 0) continue;
          
          // Ambil pertandingan yang akan dipindahkan
          const matchesToMove = matches.slice(-excessMatches);
          
          for (const match of matchesToMove) {
            // Cari hari dengan terlalu sedikit pertandingan
            for (const { date: dateWithTooFew, matches: targetMatches } of daysWithTooFewMatches) {
              const maxMatchesForTarget = dateWithTooFew === firstDayStr ? 
                jamPertandinganHariPertama.length : jamPertandingan.length;
              
              // Jika hari ini masih bisa menampung pertandingan lagi
              if (targetMatches.length < maxMatchesForTarget) {
                // Pindahkan pertandingan ke hari ini
                const matchIndex = optimizedMatches.findIndex(m => m.id === match.id);
                if (matchIndex !== -1) {
                  // Tentukan waktu pertandingan berdasarkan jumlah pertandingan yang sudah ada
                  const timeArray = dateWithTooFew === firstDayStr ? 
                    jamPertandinganHariPertama : jamPertandingan;
                  const timeSlot = targetMatches.length;
                  
                  optimizedMatches[matchIndex] = {
                    ...optimizedMatches[matchIndex],
                    tanggal: dateWithTooFew,
                    waktu: timeArray[timeSlot]
                  };
                  
                  // Update jumlah pertandingan
                  targetMatches.push(match);
                  optimizationsMade++;
                  
                  console.log(`Memindahkan pertandingan dari ${dateWithTooMany} ke ${dateWithTooFew}`);
                  
                  // Jika hari ini sudah penuh, pindah ke hari berikutnya
                  if (targetMatches.length >= maxMatchesForTarget) {
                    break;
                  }
                }
              }
            }
          }
        }
      }
      
      // Jika masih ada hari dengan jumlah pertandingan tidak tepat, gunakan pendekatan yang lebih agresif
      if (optimizationsMade > 0) {
        // Update state dengan jadwal yang dioptimalkan
        setPertandingan(optimizedMatches);
        
        return {
          isValid: true,
          messages: [`Berhasil mengoptimalkan jadwal dengan ${optimizationsMade} perubahan`],
          optimized: true,
          optimizationCount: optimizationsMade
        };
      } else {
        // Jika tidak ada optimasi yang dilakukan, gunakan pendekatan yang lebih agresif
        return {
          isValid: false,
          messages: daysWithWrongMatchCount.map(({ date, matches }) => {
            const expectedCount = date === firstDayStr ? jamPertandinganHariPertama.length : jamPertandingan.length;
            return `Tanggal ${date} memiliki ${matches.length} pertandingan, seharusnya tepat ${expectedCount} pertandingan`;
          }),
          optimized: false
        };
      }
    }
    
    // Jika tidak ada hari dengan jumlah pertandingan tidak tepat, jadwal sudah optimal
    return {
      isValid: true,
      messages: ["Jadwal sudah optimal"],
      optimized: false
    };
  };

  // Fungsi untuk memperbaiki jadwal yang sudah ada
  const fixExistingSchedule = () => {
    console.log("Memperbaiki jadwal yang sudah ada dengan pendekatan sederhana");
    
    // Jika tidak ada pertandingan, tidak ada yang perlu diperbaiki
    if (pertandingan.length === 0) {
      console.log("Tidak ada pertandingan untuk diperbaiki");
      return {
        isValid: true,
        messages: ["Tidak ada pertandingan untuk diperbaiki"],
        fixed: false
      };
    }
    
    // Validasi jadwal saat ini
    const validationResult = validateSchedule();
    
    // Jika jadwal sudah valid, tidak perlu diperbaiki
    if (validationResult.isValid) {
      console.log("Jadwal sudah valid, tidak perlu diperbaiki");
      return {
        isValid: true,
        messages: ["Jadwal sudah valid, tidak perlu diperbaiki"],
        fixed: false
      };
    }
    
    console.log("Jadwal tidak valid, mulai memperbaiki...");
    console.log("Pelanggaran:", validationResult.messages);
    
    // Pendekatan sederhana: Buat jadwal baru
    console.log("Membuat jadwal baru dari awal");
    
    // Simpan tanggal mulai dari jadwal yang ada
    const startDate = new Date(pertandingan.sort((a, b) => a.tanggal.localeCompare(b.tanggal))[0].tanggal);
    
    // Buat jadwal baru
    const result = generateJadwal(startDate);
    
    if (result.isValid) {
      console.log("Jadwal berhasil dibuat ulang dan valid!");
      return {
        isValid: true,
        messages: ["Jadwal berhasil dibuat ulang dan valid!"],
        fixed: true,
        recreated: true
      };
    } else {
      console.log("Jadwal masih tidak valid setelah dibuat ulang. Pelanggaran:", result.messages);
      return {
        isValid: false,
        messages: [
          "Gagal memperbaiki jadwal. Silakan hubungi administrator.",
          "Detail error: " + result.messages.join(", ")
        ],
        fixed: false,
        recreated: true,
        error: true
      };
    }
  };

  // Fungsi untuk menghitung statistik waktu istirahat tim
  const calculateTeamRestStats = (schedule: Pertandingan[]): { 
    teamStats: { 
      [teamId: string]: {
        totalRestDays: number;
        averageRestDays: number;
        minRestDays: number;
        maxRestDays: number;
        restPeriods: number[];
      }
    };
    overallStats: {
      averageRestDays: number;
      minRestDays: number;
      maxRestDays: number;
      stdDeviation: number;
    }
  } => {
    const teamStats: {
      [teamId: string]: {
        totalRestDays: number;
        averageRestDays: number;
        minRestDays: number;
        maxRestDays: number;
        restPeriods: number[];
      }
    } = {};

    // Inisialisasi statistik untuk setiap tim
    teams.forEach(team => {
      teamStats[team.id] = {
        totalRestDays: 0,
        averageRestDays: 0,
        minRestDays: Infinity,
        maxRestDays: -Infinity,
        restPeriods: []
      };
    });

    // Kelompokkan pertandingan berdasarkan tim
    const teamMatches: { [teamId: string]: Pertandingan[] } = {};
    schedule.forEach(match => {
      if (!teamMatches[match.timA]) teamMatches[match.timA] = [];
      if (!teamMatches[match.timB]) teamMatches[match.timB] = [];
      teamMatches[match.timA].push(match);
      teamMatches[match.timB].push(match);
    });

    // Hitung statistik untuk setiap tim
    Object.entries(teamMatches).forEach(([teamId, matches]) => {
      // Urutkan pertandingan berdasarkan tanggal
      const sortedMatches = matches.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
      
      // Hitung periode istirahat
      for (let i = 1; i < sortedMatches.length; i++) {
        const prevMatch = sortedMatches[i - 1];
        const currentMatch = sortedMatches[i];
        const restDays = daysBetween(prevMatch.tanggal, currentMatch.tanggal);
        
        teamStats[teamId].restPeriods.push(restDays);
        teamStats[teamId].totalRestDays += restDays;
        teamStats[teamId].minRestDays = Math.min(teamStats[teamId].minRestDays, restDays);
        teamStats[teamId].maxRestDays = Math.max(teamStats[teamId].maxRestDays, restDays);
      }

      // Hitung rata-rata
      if (teamStats[teamId].restPeriods.length > 0) {
        teamStats[teamId].averageRestDays = teamStats[teamId].totalRestDays / teamStats[teamId].restPeriods.length;
      }

      // Jika tidak ada periode istirahat, setel nilai default
      if (teamStats[teamId].minRestDays === Infinity) teamStats[teamId].minRestDays = 0;
      if (teamStats[teamId].maxRestDays === -Infinity) teamStats[teamId].maxRestDays = 0;
    });

    // Hitung statistik keseluruhan
    const allRestPeriods = Object.values(teamStats).flatMap(stat => stat.restPeriods);
    const overallAverage = allRestPeriods.length > 0 
      ? allRestPeriods.reduce((a, b) => a + b, 0) / allRestPeriods.length 
      : 0;
    
    const overallMin = Math.min(...Object.values(teamStats).map(stat => stat.minRestDays));
    const overallMax = Math.max(...Object.values(teamStats).map(stat => stat.maxRestDays));
    
    // Hitung standar deviasi
    const variance = allRestPeriods.length > 0
      ? allRestPeriods.reduce((acc, val) => acc + Math.pow(val - overallAverage, 2), 0) / allRestPeriods.length
      : 0;
    const stdDeviation = Math.sqrt(variance);

    return {
      teamStats,
      overallStats: {
        averageRestDays: overallAverage,
        minRestDays: overallMin,
        maxRestDays: overallMax,
        stdDeviation
      }
    };
  };

  // Tambahkan fungsi untuk mendapatkan statistik istirahat tim
  const getTeamRestStatistics = () => {
    return calculateTeamRestStats(pertandingan);
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
      fixExistingSchedule,
      getPertandinganByGrup,
      getPertandinganByTanggal,
      getPertandinganByTim,
      getRestDaysByTeam,
      clearSchedule,
      
      // Hasil Pertandingan
      simpanHasilPertandingan,
      updateKlasemen,
      getKlasemenGrup,
      getPencetakGolTerbanyak,
      
      // Fungsi untuk menghapus data statistik
      resetPencetakGol,
      resetKartuPemain,
      resetLaranganBermain,

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
      loadKnockoutMatchesFromFirestore,

      // Fungsi untuk menghitung statistik waktu istirahat tim
      calculateTeamRestStats,

      // Tambahkan fungsi untuk mendapatkan statistik istirahat tim
      getTeamRestStatistics
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
