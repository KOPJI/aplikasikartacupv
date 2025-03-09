import { useState, useEffect } from 'react';
import { Award, Squircle, AlertCircle, Shield, Trophy, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { Link } from 'react-router-dom';

const StatistikPemain = () => {
  const { teams, getPencetakGolTerbanyak, getTeam } = useTournament();
  const [activeTab, setActiveTab] = useState<'topskor' | 'kartu' | 'larangan'>('topskor');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [animateCards, setAnimateCards] = useState(false);
  
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

  // Efek animasi saat tab berubah
  useEffect(() => {
    setAnimateCards(true);
    const timer = setTimeout(() => setAnimateCards(false), 500);
    return () => clearTimeout(timer);
  }, [activeTab, filterTeam]);

  // Mendapatkan warna tim untuk latar belakang
  const getTeamColor = (teamId: string) => {
    const teamIndex = teams.findIndex(t => t.id === teamId);
    const colors = [
      'from-blue-500 to-blue-600',
      'from-red-500 to-red-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-yellow-500 to-yellow-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600'
    ];
    return colors[teamIndex % colors.length] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-6 px-4">
      {/* Header dengan latar belakang sepak bola */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-800 via-green-700 to-blue-800 shadow-xl mb-8">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/abstract-soccer-tournament-background_1017-15096.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        </div>
        <div className="relative z-10 px-6 py-8 text-white">
          <h1 className="text-4xl font-bold mb-2 text-center">Statistik Pemain</h1>
          <p className="text-center text-green-100 max-w-2xl mx-auto">
            Lihat data lengkap pencetak gol, kartu, dan larangan bermain dalam turnamen KARTA CUP V
          </p>
          
          {/* Filter Tim */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="relative">
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="w-full bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-full px-5 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all shadow-lg"
              >
                <option value="all" className="text-gray-800">Semua Tim</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id} className="text-gray-800">{team.nama}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Desain bola sepak */}
      <div className="flex flex-wrap justify-center mb-6">
        <div className="bg-white rounded-full shadow-lg p-1 flex space-x-1">
          <button
            onClick={() => setActiveTab('topskor')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center ${
              activeTab === 'topskor'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md transform scale-105'
                : 'bg-transparent text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Trophy className={`h-5 w-5 mr-2 ${activeTab === 'topskor' ? 'text-yellow-200' : 'text-yellow-500'}`} />
            Top Skor
          </button>
          <button
            onClick={() => setActiveTab('kartu')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center ${
              activeTab === 'kartu'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md transform scale-105'
                : 'bg-transparent text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Squircle className={`h-5 w-5 mr-2 ${activeTab === 'kartu' ? 'text-orange-200' : 'text-orange-500'}`} />
            Kartu
          </button>
          <button
            onClick={() => setActiveTab('larangan')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center ${
              activeTab === 'larangan'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md transform scale-105'
                : 'bg-transparent text-gray-700 hover:bg-gray-100'
            }`}
          >
            <AlertCircle className={`h-5 w-5 mr-2 ${activeTab === 'larangan' ? 'text-red-200' : 'text-red-500'}`} />
            Larangan Bermain
          </button>
        </div>
      </div>

      {/* Tab Content dengan animasi */}
      <div className={`transition-all duration-300 ${animateCards ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
        {/* Top Scorers Tab */}
        {activeTab === 'topskor' && (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border-b-4 border-yellow-500">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center">
                  <Award className="mr-3 h-7 w-7 text-yellow-200" />
                  Daftar Pencetak Gol
                </h2>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-bold">
                  Total: {filteredTopScorers.length} Pemain
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {filteredTopScorers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTopScorers.slice(0, 3).map((pemain, index) => {
                    // Find team of player
                    const tim = getTeam(pemain.timId);
                    const teamColor = getTeamColor(pemain.timId);
                    
                    return (
                      <div 
                        key={pemain.id} 
                        className={`relative overflow-hidden rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 ${
                          index === 0 ? "border-l-4 border-yellow-400" : 
                          index === 1 ? "border-l-4 border-gray-400" : 
                          index === 2 ? "border-l-4 border-orange-400" : ""
                        }`}
                      >
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${teamColor}`}></div>
                        <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100">
                          <div className="flex items-center mb-4">
                            <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${
                              index === 0 ? "from-yellow-400 to-yellow-500" : 
                              index === 1 ? "from-gray-400 to-gray-500" : 
                              index === 2 ? "from-orange-400 to-orange-500" : 
                              "from-blue-400 to-blue-500"
                            } shadow-md mr-4 text-xl font-bold text-white`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-800">
                                {pemain.nama}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Shield className="h-3 w-3 mr-1" />
                                {tim?.nama || ''}
                                <span className="ml-2 bg-gray-200 rounded-full px-2 py-0.5 text-xs">
                                  #{pemain.nomorPunggung}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">Posisi: {pemain.posisi}</div>
                            <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-lg">
                              <span className="font-bold text-2xl text-white">{pemain.golTotal || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Trophy className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-xl font-medium">Belum ada data pencetak gol</p>
                  <p className="text-sm mt-2">Data akan muncul setelah pertandingan dimulai</p>
                </div>
              )}

              {/* Daftar pemain lainnya */}
              {filteredTopScorers.length > 3 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Pencetak Gol Lainnya</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTopScorers.slice(3).map((pemain, index) => {
                      // Find team of player
                      const tim = getTeam(pemain.timId);
                      
                      return (
                        <div key={pemain.id} className="flex items-center p-3 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 shadow-sm mr-3 text-sm font-bold text-gray-700">
                            {index + 4}
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
                </div>
              )}
            </div>
          </div>
        )}

        {/* Kartu Tab */}
        {activeTab === 'kartu' && (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border-b-4 border-orange-500">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center">
                  <Squircle className="mr-3 h-7 w-7 text-orange-200" />
                  Pemain dengan Kartu
                </h2>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-bold">
                  Total: {filteredPlayersWithCards.length} Pemain
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {filteredPlayersWithCards.length > 0 ? (
                <div>
                  {/* Statistik Kartu */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 shadow-md">
                      <h3 className="text-lg font-bold text-yellow-800 mb-2 flex items-center">
                        <Squircle className="h-5 w-5 mr-2 text-yellow-600" />
                        Kartu Kuning
                      </h3>
                      <div className="text-4xl font-bold text-yellow-700 mb-2">
                        {filteredPlayersWithCards.reduce((total, player) => total + (player.kartuKuning || 0), 0)}
                      </div>
                      <p className="text-sm text-yellow-700">Total kartu kuning dalam turnamen</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 shadow-md">
                      <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center">
                        <Squircle className="h-5 w-5 mr-2 text-red-600" />
                        Kartu Merah
                      </h3>
                      <div className="text-4xl font-bold text-red-700 mb-2">
                        {filteredPlayersWithCards.reduce((total, player) => total + (player.kartuMerah || 0), 0)}
                      </div>
                      <p className="text-sm text-red-700">Total kartu merah dalam turnamen</p>
                    </div>
                  </div>
                  
                  {/* Daftar Pemain dengan Kartu */}
                  <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Daftar Pemain dengan Kartu</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPlayersWithCards.map((pemain) => {
                      const tim = getTeam(pemain.teamId);
                      const teamColor = getTeamColor(pemain.teamId);
                      
                      return (
                        <div key={pemain.id} className="flex items-center p-4 rounded-lg bg-white border-l-4 border-orange-400 shadow-md hover:shadow-lg transition-shadow">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mr-4 font-bold text-gray-700 text-lg">
                            {pemain.nomorPunggung}
                          </div>
                          <div className="flex-grow">
                            <div className="text-base font-medium text-gray-900">{pemain.nama}</div>
                            <div className="text-sm text-gray-600 flex items-center">
                              <Shield className="h-3 w-3 mr-1" />
                              {pemain.teamName}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {pemain.kartuKuning && pemain.kartuKuning > 0 && (
                              <div className="w-8 h-10 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-md flex items-center justify-center text-sm font-bold text-white shadow-md">
                                {pemain.kartuKuning}
                              </div>
                            )}
                            {pemain.kartuMerah && pemain.kartuMerah > 0 && (
                              <div className="w-8 h-10 bg-gradient-to-b from-red-500 to-red-600 rounded-md flex items-center justify-center text-sm font-bold text-white shadow-md">
                                {pemain.kartuMerah}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Squircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-xl font-medium">Belum ada pemain yang mendapatkan kartu</p>
                  <p className="text-sm mt-2">Data akan muncul setelah pertandingan dimulai</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Larangan Bermain Tab */}
        {activeTab === 'larangan' && (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border-b-4 border-red-500">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center">
                  <AlertCircle className="mr-3 h-7 w-7 text-red-200" />
                  Pemain Dilarang Bermain
                </h2>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-bold">
                  Total: {filteredBannedPlayers.length} Pemain
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {filteredBannedPlayers.length > 0 ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBannedPlayers.map((pemain) => {
                      const tim = getTeam(pemain.teamId);
                      const teamColor = getTeamColor(pemain.teamId);
                      
                      return (
                        <div key={pemain.id} className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl overflow-hidden shadow-lg">
                          <div className={`h-2 bg-gradient-to-r ${teamColor}`}></div>
                          <div className="p-6">
                            <div className="flex items-center mb-4">
                              <div className="flex-shrink-0 w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mr-4 border-2 border-red-300">
                                <span className="text-xl font-bold text-red-800">{pemain.nomorPunggung}</span>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-gray-900">{pemain.nama}</div>
                                <div className="text-sm text-gray-700 flex items-center">
                                  <Shield className="h-3 w-3 mr-1" />
                                  {pemain.teamName}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                                <span className="text-sm font-medium text-red-800">
                                  {pemain.banReason}
                                </span>
                              </div>
                              <div className="flex space-x-1">
                                {pemain.kartuKuning && pemain.kartuKuning > 0 && (
                                  <div className="w-6 h-8 bg-yellow-400 rounded-sm flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                    {pemain.kartuKuning}
                                  </div>
                                )}
                                {pemain.kartuMerah && pemain.kartuMerah > 0 && (
                                  <div className="w-6 h-8 bg-red-600 rounded-sm flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                    {pemain.kartuMerah}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-8 bg-red-50 p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Aturan Larangan Bermain
                    </h3>
                    <ul className="text-sm text-red-700 space-y-3 list-disc pl-5">
                      <li>Pemain yang mendapatkan <strong>3 kartu kuning</strong> dilarang bermain di pertandingan selanjutnya</li>
                      <li>Pemain yang mendapatkan <strong>kartu merah</strong> langsung dilarang bermain di pertandingan selanjutnya</li>
                      <li>Setelah menjalani hukuman, pemain dapat bermain kembali di pertandingan berikutnya</li>
                      <li>Akumulasi kartu kuning akan direset setelah babak penyisihan grup</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-xl font-medium">Tidak ada pemain yang dilarang bermain</p>
                  <p className="text-sm mt-2">Semua pemain dapat bermain di pertandingan selanjutnya</p>
                  
                  <div className="mt-8 bg-red-50 p-6 rounded-xl shadow-md max-w-2xl mx-auto">
                    <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Aturan Larangan Bermain
                    </h3>
                    <ul className="text-sm text-red-700 space-y-3 list-disc pl-5">
                      <li>Pemain yang mendapatkan <strong>3 kartu kuning</strong> dilarang bermain di pertandingan selanjutnya</li>
                      <li>Pemain yang mendapatkan <strong>kartu merah</strong> langsung dilarang bermain di pertandingan selanjutnya</li>
                      <li>Setelah menjalani hukuman, pemain dapat bermain kembali di pertandingan berikutnya</li>
                      <li>Akumulasi kartu kuning akan direset setelah babak penyisihan grup</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatistikPemain; 