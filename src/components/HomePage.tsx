import { Squircle, Award, Shield, Trophy, Calendar, ChartLine, Users, AlertCircle } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { teams, getPencetakGolTerbanyak, getTeam, getKlasemenGrup, pertandingan } = useTournament();
  const [activeGrup, setActiveGrup] = useState<string>('A');
  const [nextMatches, setNextMatches] = useState<any[]>([]);
  
  // Dapatkan 5 pencetak gol terbanyak
  const topScorers = getPencetakGolTerbanyak(5);
  const klasemenGrup = getKlasemenGrup(activeGrup);

  // Fungsi untuk mendapatkan semua pemain dengan kartu dan menghitung total
  const getPlayersWithCards = () => {
    const allPlayers: any[] = [];
    teams.forEach(team => {
      team.pemain.forEach(player => {
        if ((player.kartuKuning && player.kartuKuning > 0) || (player.kartuMerah && player.kartuMerah > 0)) {
          allPlayers.push({
            ...player,
            teamName: team.nama,
            teamId: team.id,
            totalCards: (player.kartuKuning || 0) + (player.kartuMerah || 0)
          });
        }
      });
    });
    
    return allPlayers.sort((a, b) => b.totalCards - a.totalCards);
  };

  // Fungsi untuk mendapatkan pemain yang dilarang bermain karena akumulasi kartu
  const getBannedPlayers = () => {
    const allPlayers: any[] = [];
    teams.forEach(team => {
      team.pemain.forEach(player => {
        const yellowCards = player.kartuKuning || 0;
        const redCards = player.kartuMerah || 0;
        
        // Aturan: 3 kartu kuning atau 1 kartu merah = larangan bermain
        const isBanned = yellowCards >= 3 || redCards >= 1;
        
        if (isBanned) {
          allPlayers.push({
            ...player,
            teamName: team.nama,
            teamId: team.id,
            banReason: redCards >= 1 ? 'Kartu Merah' : 'Akumulasi 3 Kartu Kuning'
          });
        }
      });
    });
    
    return allPlayers;
  };

  // Fungsi untuk mendapatkan pertandingan mendatang
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Dapatkan semua pertandingan yang belum dimainkan
    const upcomingMatches = pertandingan
      .filter(match => !match.hasil && match.tanggal >= todayStr)
      .sort((a, b) => {
        // Urutkan berdasarkan tanggal dan waktu
        if (a.tanggal !== b.tanggal) {
          return a.tanggal.localeCompare(b.tanggal);
        }
        return a.waktu.localeCompare(b.waktu);
      })
      .slice(0, 3); // Ambil 3 pertandingan terdekat
    
    setNextMatches(upcomingMatches);
  }, [pertandingan]);

  const playersWithCards = getPlayersWithCards();
  const bannedPlayers = getBannedPlayers();
  
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-800 via-green-700 to-blue-800 shadow-xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/abstract-soccer-tournament-background_1017-15096.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        </div>
        <div className="relative z-10 px-6 py-12 text-center text-white">
          <div className="flex justify-center mb-4">
            <Trophy className="h-12 w-12 text-yellow-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-shadow">Karta Cup V</h1>
          <p className="text-xl max-w-2xl mx-auto mb-6 text-green-100">
            Turnamen sepak bola bergengsi dengan persaingan sengit antar tim terbaik
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Link to="/jadwal" className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-full font-medium transition-colors flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Jadwal Pertandingan
            </Link>
            <Link to="/klasemen" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-medium transition-colors flex items-center">
              <ChartLine className="h-5 w-5 mr-2" />
              Lihat Klasemen
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Pertandingan Mendatang */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-blue-600">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-yellow-300" />
                Pertandingan Mendatang
              </h2>
            </div>
            <div className="p-4">
              {nextMatches.length > 0 ? (
                <div className="space-y-4">
                  {nextMatches.map(match => {
                    const teamA = getTeam(match.timA);
                    const teamB = getTeam(match.timB);
                    
                    // Format tanggal
                    const matchDate = new Date(match.tanggal);
                    const formattedDate = matchDate.toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    });
                    
                    return (
                      <div key={match.id} className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-2 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formattedDate} • {match.waktu} WIB • Grup {match.grup}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                              {teamA?.logo ? (
                                <img src={teamA.logo} alt={teamA.nama} className="w-10 h-10 object-contain" />
                              ) : (
                                <Shield className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div className="font-medium">{teamA?.nama || 'TBD'}</div>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <div className="text-sm font-bold text-gray-500">VS</div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="font-medium text-right">{teamB?.nama || 'TBD'}</div>
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                              {teamB?.logo ? (
                                <img src={teamB.logo} alt={teamB.nama} className="w-10 h-10 object-contain" />
                              ) : (
                                <Shield className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Belum ada pertandingan mendatang
                </div>
              )}
              
              <div className="mt-4 text-center">
                <Link to="/jadwal" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
                  Lihat semua jadwal
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Klasemen */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-green-600">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-yellow-300" />
                Klasemen Grup {activeGrup}
              </h2>
              
              {/* Grup selector */}
              <div className="flex flex-wrap mt-2 space-x-2">
                {['A', 'B', 'C', 'D'].map((grup) => (
                  <button
                    key={grup}
                    onClick={() => setActiveGrup(grup)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeGrup === grup
                        ? 'bg-white text-green-700'
                        : 'bg-green-700 bg-opacity-30 text-white hover:bg-opacity-50'
                    }`}
                  >
                    Grup {grup}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pos
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tim
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      M
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      M
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      S
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      K
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SG
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider font-bold">
                      P
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {klasemenGrup.map((tim, index) => (
                    <tr key={tim.id} className={index < 2 ? "bg-green-50" : ""}>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                            {tim.logo ? (
                              <img src={tim.logo} alt={tim.nama} className="h-8 w-8 object-cover" />
                            ) : (
                              <Shield className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-3">
                            <div className={`text-sm font-medium ${index < 2 ? "text-green-800" : "text-gray-900"}`}>
                              {tim.nama}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-700">
                        {tim.main || 0}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-700">
                        {tim.menang || 0}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-700">
                        {tim.seri || 0}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-700">
                        {tim.kalah || 0}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-700">
                        {tim.selisihGol || 0}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-bold text-gray-900">
                        {tim.poin || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {klasemenGrup.length < 1 && (
              <div className="text-center py-8 text-gray-500">
                Belum ada data klasemen untuk Grup {activeGrup}
              </div>
            )}
            
            <div className="bg-green-50 p-3 text-sm text-green-800">
              <div className="flex items-center justify-center">
                <Trophy className="h-4 w-4 mr-1" />
                <span>Dua tim teratas dari setiap grup akan lolos ke babak gugur</span>
              </div>
            </div>
          </div>

          {/* Pemain dengan Kartu */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-yellow-600">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-4 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <Squircle className="mr-2 h-5 w-5 text-yellow-300" />
                Pemain dengan Kartu
              </h2>
            </div>
            
            <div className="p-4">
              {playersWithCards.length > 0 ? (
                <div className="space-y-3">
                  {playersWithCards.map((pemain) => (
                    <div key={pemain.id} className="flex items-center p-3 rounded-lg bg-gray-50">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-gray-800 font-bold">{pemain.nomorPunggung}</span>
                      </div>
                      <div className="flex-grow">
                        <div className="text-sm font-medium text-gray-900">{pemain.nama}</div>
                        <div className="text-xs text-gray-600">{pemain.teamName}</div>
                      </div>
                      <div className="flex-shrink-0 flex space-x-2">
                        {pemain.kartuKuning && pemain.kartuKuning > 0 && (
                          <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full flex items-center">
                            <div className="w-3 h-4 bg-yellow-400 mr-1 rounded-sm"></div>
                            <span className="text-xs font-medium">{pemain.kartuKuning}</span>
                          </div>
                        )}
                        {pemain.kartuMerah && pemain.kartuMerah > 0 && (
                          <div className="px-2 py-1 bg-red-100 text-red-800 rounded-full flex items-center">
                            <div className="w-3 h-4 bg-red-600 mr-1 rounded-sm"></div>
                            <span className="text-xs font-medium">{pemain.kartuMerah}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  Belum ada pemain yang mendapatkan kartu
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Struktur Grup */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-purple-600">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <Users className="mr-2 h-5 w-5 text-purple-200" />
                Struktur Grup
              </h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {['A', 'B', 'C', 'D'].map((grup) => (
                <div key={grup} className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg p-3">
                  <h3 className="text-lg font-bold text-center mb-2 text-purple-700 flex items-center justify-center">
                    <Shield className="mr-1 h-4 w-4" />
                    Grup {grup}
                  </h3>
                  <ul className="space-y-2">
                    {teams
                      .filter(team => team.grup === grup)
                      .map(team => (
                        <li key={team.id} className="flex items-center bg-white p-2 rounded-lg shadow-sm">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-2 overflow-hidden">
                            {team.logo ? (
                              <img src={team.logo} alt={team.nama} className="w-full h-full object-cover" />
                            ) : (
                              <Shield className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                          <span className="text-sm font-medium">{team.nama}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Top Scorers */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-yellow-500">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <Award className="mr-2 h-5 w-5 text-red-300" />
                Top Skor
              </h2>
            </div>
            
            <div className="p-4">
              {topScorers.length > 0 ? (
                <div className="space-y-3">
                  {topScorers.map((pemain, index) => {
                    // Find team of player
                    const tim = getTeam(pemain.timId);
                    
                    return (
                      <div key={pemain.id} className={`flex items-center p-3 rounded-lg ${
                        index === 0 ? "bg-gradient-to-r from-yellow-50 to-yellow-100" : 
                        index === 1 ? "bg-gradient-to-r from-gray-50 to-gray-100" : 
                        index === 2 ? "bg-gradient-to-r from-orange-50 to-orange-100" : 
                        "bg-gray-50"
                      }`}>
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm mr-3 text-lg font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {pemain.nama} 
                              <span className="text-gray-500 ml-1">({pemain.nomorPunggung})</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600">{tim?.nama || ''}</div>
                        </div>
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-yellow-100 rounded-full">
                          <span className="font-bold text-yellow-800">{pemain.golTotal || 0}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  Belum ada data pencetak gol
                </div>
              )}
            </div>
          </div>

          {/* Banned Players */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-red-600">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-red-200" />
                Pemain Dilarang Bermain
              </h2>
            </div>
            
            <div className="p-4">
              {bannedPlayers.length > 0 ? (
                <div className="space-y-3">
                  {bannedPlayers.map((pemain) => (
                    <div key={pemain.id} className="flex items-center p-3 rounded-lg bg-red-50">
                      <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-red-800 font-bold">{pemain.nomorPunggung}</span>
                      </div>
                      <div className="flex-grow">
                        <div className="text-sm font-medium text-gray-900">{pemain.nama}</div>
                        <div className="text-xs text-gray-600">{pemain.teamName}</div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          {pemain.banReason}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  Tidak ada pemain yang dilarang bermain
                </div>
              )}
              
              <div className="mt-4 bg-red-50 p-3 rounded-lg">
                <h3 className="text-sm font-bold text-red-800 mb-2">Aturan Larangan Bermain:</h3>
                <ul className="text-xs text-red-700 space-y-1 list-disc pl-4">
                  <li>Pemain yang mendapatkan 3 kartu kuning akan dilarang bermain di pertandingan selanjutnya</li>
                  <li>Pemain yang mendapatkan kartu merah langsung akan dilarang bermain di pertandingan selanjutnya</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
