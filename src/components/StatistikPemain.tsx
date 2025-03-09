import { useState } from 'react';
import { Award, Squircle, AlertCircle, Shield, Trophy } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { Link } from 'react-router-dom';

const StatistikPemain = () => {
  const { teams, getPencetakGolTerbanyak, getTeam } = useTournament();
  const [activeTab, setActiveTab] = useState<'topskor' | 'kartu' | 'larangan'>('topskor');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  
  // Dapatkan semua pencetak gol
  const topScorers = getPencetakGolTerbanyak(50);

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

  const playersWithCards = getPlayersWithCards();
  const bannedPlayers = getBannedPlayers();

  // Filter data berdasarkan tim yang dipilih
  const filteredTopScorers = filterTeam === 'all' 
    ? topScorers 
    : topScorers.filter(player => player.timId === filterTeam);

  const filteredPlayersWithCards = filterTeam === 'all'
    ? playersWithCards
    : playersWithCards.filter(player => player.teamId === filterTeam);

  const filteredBannedPlayers = filterTeam === 'all'
    ? bannedPlayers
    : bannedPlayers.filter(player => player.teamId === filterTeam);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Statistik Pemain</h1>
        
        {/* Filter Tim */}
        <div className="flex items-center space-x-2">
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Tim</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.nama}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('topskor')}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${
            activeTab === 'topskor'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center">
            <Trophy className="h-4 w-4 mr-2" />
            Top Skor
          </div>
        </button>
        <button
          onClick={() => setActiveTab('kartu')}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${
            activeTab === 'kartu'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center">
            <Squircle className="h-4 w-4 mr-2" />
            Kartu
          </div>
        </button>
        <button
          onClick={() => setActiveTab('larangan')}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${
            activeTab === 'larangan'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Larangan Bermain
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Top Scorers Tab */}
        {activeTab === 'topskor' && (
          <div>
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <Award className="mr-2 h-5 w-5 text-yellow-200" />
                Daftar Pencetak Gol
              </h2>
            </div>
            
            <div className="p-4">
              {filteredTopScorers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTopScorers.map((pemain, index) => {
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
                <div className="text-center py-8 text-gray-500">
                  Belum ada data pencetak gol
                </div>
              )}
            </div>
          </div>
        )}

        {/* Kartu Tab */}
        {activeTab === 'kartu' && (
          <div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <Squircle className="mr-2 h-5 w-5 text-orange-200" />
                Pemain dengan Kartu
              </h2>
            </div>
            
            <div className="p-4">
              {filteredPlayersWithCards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPlayersWithCards.map((pemain) => (
                    <div key={pemain.id} className="flex items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3 font-bold text-gray-700">
                        {pemain.nomorPunggung}
                      </div>
                      <div className="flex-grow">
                        <div className="text-sm font-medium text-gray-900">{pemain.nama}</div>
                        <div className="text-xs text-gray-600">{pemain.teamName}</div>
                      </div>
                      <div className="flex space-x-2">
                        {pemain.kartuKuning && pemain.kartuKuning > 0 && (
                          <div className="w-6 h-8 bg-yellow-400 rounded-sm flex items-center justify-center text-xs font-bold text-white">
                            {pemain.kartuKuning}
                          </div>
                        )}
                        {pemain.kartuMerah && pemain.kartuMerah > 0 && (
                          <div className="w-6 h-8 bg-red-600 rounded-sm flex items-center justify-center text-xs font-bold text-white">
                            {pemain.kartuMerah}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Belum ada pemain yang mendapatkan kartu
                </div>
              )}
            </div>
          </div>
        )}

        {/* Larangan Bermain Tab */}
        {activeTab === 'larangan' && (
          <div>
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-red-200" />
                Pemain Dilarang Bermain
              </h2>
            </div>
            
            <div className="p-4">
              {filteredBannedPlayers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBannedPlayers.map((pemain) => (
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
                <div className="text-center py-8 text-gray-500">
                  Tidak ada pemain yang dilarang bermain
                </div>
              )}
              
              <div className="mt-6 bg-red-50 p-4 rounded-lg">
                <h3 className="text-sm font-bold text-red-800 mb-2">Aturan Larangan Bermain:</h3>
                <ul className="text-sm text-red-700 space-y-2 list-disc pl-4">
                  <li>Pemain yang mendapatkan 3 kartu kuning dilarang bermain di pertandingan selanjutnya</li>
                  <li>Pemain yang mendapatkan kartu merah langsung dilarang bermain di pertandingan selanjutnya</li>
                  <li>Setelah menjalani hukuman, pemain dapat bermain kembali di pertandingan berikutnya</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatistikPemain; 