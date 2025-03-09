import { useState, useEffect } from 'react';
import { Award, Shield, Trophy, ChevronDown, ChevronUp, Users, Trash2 } from 'lucide-react';
import { useTournament, Pemain } from '../context/TournamentContext';
import { Link } from 'react-router-dom';

// Interface untuk memperluas tipe Pemain dengan properti tambahan
interface PemainStatistik extends Pemain {
  teamName?: string;
  totalCards?: number;
  banReason?: string;
  alasanLarangan?: string;
  assists?: number;
}

const StatistikPemain = () => {
  const { teams, getPencetakGolTerbanyak, getTeam, resetPencetakGol, resetKartuPemain, resetLaranganBermain } = useTournament();
  const [activeTab, setActiveTab] = useState<'topskor' | 'kartu' | 'larangan'>('topskor');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [animateCards, setAnimateCards] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'topskor' | 'kartu' | 'larangan' | null>(null);
  
  // Dapatkan semua pencetak gol
  const topScorers = getPencetakGolTerbanyak(50) as PemainStatistik[];

  // Fungsi untuk mendapatkan semua pemain dengan kartu dan menghitung total
  const getPlayersWithCards = () => {
    const allPlayers: PemainStatistik[] = [];
    teams.forEach(team => {
      team.pemain.forEach(player => {
        if ((player.kartuKuning && player.kartuKuning > 0) || (player.kartuMerah && player.kartuMerah > 0)) {
          allPlayers.push({
            ...player,
            teamName: team.nama,
            totalCards: (player.kartuKuning || 0) + (player.kartuMerah || 0)
          });
        }
      });
    });
    
    return allPlayers.sort((a, b) => (b.totalCards || 0) - (a.totalCards || 0));
  };

  // Fungsi untuk mendapatkan pemain yang dilarang bermain karena akumulasi kartu
  const getBannedPlayers = () => {
    const allPlayers: PemainStatistik[] = [];
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
            banReason: redCards >= 1 
              ? 'Kartu Merah' 
              : 'Akumulasi 3 Kartu Kuning',
            alasanLarangan: redCards >= 1 
              ? 'Kartu Merah' 
              : 'Akumulasi 3 Kartu Kuning'
          });
        }
      });
    });
    
    return allPlayers;
  };

  // Mendapatkan warna tim
  const getTeamColor = (timId: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-red-100 text-red-800',
      'bg-orange-100 text-orange-800'
    ];
    
    // Gunakan ID tim untuk mendapatkan warna yang konsisten
    const colorIndex = timId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[colorIndex];
  };

  // Menampilkan dialog konfirmasi
  const handleShowConfirmDialog = (action: 'topskor' | 'kartu' | 'larangan') => {
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  // Menangani konfirmasi reset data
  const handleConfirmDelete = () => {
    if (confirmAction === 'topskor') {
      resetPencetakGol();
    } else if (confirmAction === 'kartu') {
      resetKartuPemain();
    } else if (confirmAction === 'larangan') {
      resetLaranganBermain();
    }
    
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  // Filter pemain berdasarkan tim
  const filteredTopScorers = filterTeam === 'all' 
    ? topScorers 
    : topScorers.filter(scorer => scorer.timId === filterTeam);

  const filteredPlayersWithCards = filterTeam === 'all'
    ? getPlayersWithCards()
    : getPlayersWithCards().filter(player => player.timId === filterTeam);

  const filteredBannedPlayers = filterTeam === 'all'
    ? getBannedPlayers()
    : getBannedPlayers().filter(player => player.timId === filterTeam);

  // Efek animasi saat tab berubah
  useEffect(() => {
    setAnimateCards(true);
    const timer = setTimeout(() => {
      setAnimateCards(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Fungsi untuk mendapatkan warna latar belakang dropdown berdasarkan tim yang dipilih
  const getDropdownStyle = () => {
    if (filterTeam === 'all') return {};
    
    const selectedTeam = teams.find(team => team.id === filterTeam);
    if (!selectedTeam) return {};
    
    const teamColor = getTeamColor(filterTeam);
    return {
      borderColor: teamColor,
      borderWidth: '2px'
    };
  };

  return (
    <div className="animate-slide-in">
      <div className="card mb-6">
        <div className="card-header flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <Trophy className="mr-2 h-6 w-6" />
            Statistik Pemain
          </h1>
          <div className="flex items-center space-x-2">
            <label htmlFor="team-filter" className="font-medium text-gray-700 flex items-center">
              <Shield className="h-5 w-5 mr-1 text-primary" />
              Tim:
            </label>
            <select 
              id="team-filter"
              className="form-select px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              style={getDropdownStyle()}
            >
              <option value="all" className="py-2">Semua Tim</option>
              {teams.map(team => (
                <option key={team.id} value={team.id} className="py-2">{team.nama}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="card-body">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6 bg-gray-50 p-2 rounded-lg">
            <button
              onClick={() => setActiveTab('topskor')}
              className={`btn ${
                activeTab === 'topskor'
                  ? 'btn-primary'
                  : 'btn-outline'
              }`}
            >
              <Trophy className={`h-5 w-5 mr-2 ${activeTab === 'topskor' ? 'text-white' : 'text-green-700'}`} />
              Pencetak Gol
            </button>
            <button
              onClick={() => setActiveTab('kartu')}
              className={`btn ${
                activeTab === 'kartu'
                  ? 'btn-secondary'
                  : 'btn-outline'
              }`}
            >
              <Shield className={`h-5 w-5 mr-2 ${activeTab === 'kartu' ? 'text-white' : 'text-yellow-600'}`} />
              Kartu
            </button>
            <button
              onClick={() => setActiveTab('larangan')}
              className={`btn ${
                activeTab === 'larangan'
                  ? 'btn-danger'
                  : 'btn-outline'
              }`}
            >
              <Shield className={`h-5 w-5 mr-2 ${activeTab === 'larangan' ? 'text-white' : 'text-red-600'}`} />
              Larangan Bermain
            </button>
          </div>

          {/* Tab Content */}
          <div className={`transition-all duration-300 ${animateCards ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
            {/* Top Scorer Tab */}
            {activeTab === 'topskor' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Trophy className="h-7 w-7 text-yellow-400 mr-3" />
                    <h2 className="text-xl font-bold">Daftar Pencetak Gol</h2>
                  </div>
                  <button 
                    onClick={() => handleShowConfirmDialog('topskor')}
                    className="btn btn-outline text-red-600 hover:bg-red-50 hover:text-red-700 text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Reset Data
                  </button>
                </div>

                {filteredTopScorers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTopScorers.map((scorer, index) => (
                      <div 
                        key={scorer.id} 
                        className={`bg-white rounded-lg shadow-md overflow-hidden hover-lift ${
                          index < 3 ? 'border-l-4 border-yellow-400' : ''
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {index < 3 && (
                                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold mr-3">
                                  {index + 1}
                                </div>
                              )}
                              <div>
                                <h3 className="font-bold text-gray-800">{scorer.nama}</h3>
                                <div className="flex items-center mt-1">
                                  <Shield className="h-4 w-4 mr-1 text-green-600" />
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${getTeamColor(scorer.timId)}`}>
                                    {getTeam(scorer.timId)?.nama || 'Tim tidak ditemukan'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-green-600">{scorer.golTotal}</div>
                              <div className="text-xs text-gray-500">Gol</div>
                            </div>
                          </div>
                          
                          {scorer.assists && scorer.assists > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                              <span className="text-sm text-gray-600">Assist</span>
                              <span className="font-semibold text-blue-600">{scorer.assists}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Trophy className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-500">Belum ada data pencetak gol</h3>
                    <p className="text-gray-400 mt-2">
                      Data akan muncul setelah pertandingan dimulai dan hasil diinput
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Kartu Tab */}
            {activeTab === 'kartu' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Shield className="h-7 w-7 text-yellow-500 mr-3" />
                    <h2 className="text-xl font-bold">Statistik Kartu</h2>
                  </div>
                  <button 
                    onClick={() => handleShowConfirmDialog('kartu')}
                    className="btn btn-outline text-red-600 hover:bg-red-50 hover:text-red-700 text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Reset Data
                  </button>
                </div>

                {filteredPlayersWithCards.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="card">
                        <div className="card-header bg-yellow-500 text-white">
                          <h3 className="text-lg font-bold flex items-center">
                            <Shield className="h-5 w-5 mr-2" />
                            Kartu Kuning
                          </h3>
                        </div>
                        <div className="card-body">
                          <div className="text-4xl font-bold text-yellow-500 mb-2">
                            {filteredPlayersWithCards.reduce((total, player) => total + (player.kartuKuning || 0), 0)}
                          </div>
                          <p className="text-sm text-gray-600">
                            Total kartu kuning yang diterima oleh semua pemain
                          </p>
                        </div>
                      </div>
                      
                      <div className="card">
                        <div className="card-header bg-red-500 text-white">
                          <h3 className="text-lg font-bold flex items-center">
                            <Shield className="h-5 w-5 mr-2" />
                            Kartu Merah
                          </h3>
                        </div>
                        <div className="card-body">
                          <div className="text-4xl font-bold text-red-500 mb-2">
                            {filteredPlayersWithCards.reduce((total, player) => total + (player.kartuMerah || 0), 0)}
                          </div>
                          <p className="text-sm text-gray-600">
                            Total kartu merah yang diterima oleh semua pemain
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="table-container">
                      <table className="table">
                        <thead className="table-header">
                          <tr>
                            <th className="text-left">Pemain</th>
                            <th>Tim</th>
                            <th className="text-center">
                              <span className="inline-flex items-center">
                                <Shield className="h-4 w-4 mr-1 text-yellow-500" />
                                Kuning
                              </span>
                            </th>
                            <th className="text-center">
                              <span className="inline-flex items-center">
                                <Shield className="h-4 w-4 mr-1 text-red-500" />
                                Merah
                              </span>
                            </th>
                            <th className="text-center">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPlayersWithCards.map(player => (
                            <tr key={player.id} className="table-row">
                              <td className="font-medium">{player.nama}</td>
                              <td>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs ${getTeamColor(player.timId)}`}>
                                  {player.teamName}
                                </span>
                              </td>
                              <td className="text-center">
                                <span className="font-semibold text-yellow-500">{player.kartuKuning || 0}</span>
                              </td>
                              <td className="text-center">
                                <span className="font-semibold text-red-500">{player.kartuMerah || 0}</span>
                              </td>
                              <td className="text-center font-bold">{player.totalCards}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Shield className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-500">Belum ada data kartu</h3>
                    <p className="text-gray-400 mt-2">
                      Belum ada pemain yang menerima kartu kuning atau merah
                    </p>
                  </div>
                )}

                <div className="mt-8 card">
                  <div className="card-header bg-blue-600 text-white">
                    <h3 className="text-lg font-bold flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Aturan Kartu
                    </h3>
                  </div>
                  <div className="card-body">
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Pemain yang menerima 3 kartu kuning akan dilarang bermain pada pertandingan berikutnya</li>
                      <li>Pemain yang menerima kartu merah akan dilarang bermain pada pertandingan berikutnya</li>
                      <li>Setelah menjalani hukuman, akumulasi kartu kuning akan direset</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Larangan Bermain Tab */}
            {activeTab === 'larangan' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Shield className="h-7 w-7 text-red-500 mr-3" />
                    <h2 className="text-xl font-bold">Pemain Dilarang Bermain</h2>
                  </div>
                  <button 
                    onClick={() => handleShowConfirmDialog('larangan')}
                    className="btn btn-outline text-red-600 hover:bg-red-50 hover:text-red-700 text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Reset Data
                  </button>
                </div>

                {filteredBannedPlayers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBannedPlayers.map(pemain => (
                      <div key={pemain.id} className="card hover-lift">
                        <div className="card-header bg-red-600 text-white">
                          <div className="flex justify-between items-center">
                            <h3 className="font-bold">{pemain.nama}</h3>
                            <span className="badge badge-red">
                              {pemain.banReason}
                            </span>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="flex items-center mb-2">
                            <Shield className="h-4 w-4 mr-2 text-green-600" />
                            <span className={`text-xs px-2 py-1 rounded-full ${getTeamColor(pemain.timId)}`}>
                              {pemain.teamName}
                            </span>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Kartu Kuning</span>
                              <span className="font-semibold text-yellow-500">{pemain.kartuKuning || 0}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-sm text-gray-600">Kartu Merah</span>
                              <span className="font-semibold text-red-500">{pemain.kartuMerah || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Shield className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-500">Tidak ada pemain yang dilarang bermain</h3>
                    <p className="text-gray-400 mt-2">Semua pemain dapat bermain di pertandingan selanjutnya</p>
                  </div>
                )}
                
                <div className="mt-8 card">
                  <div className="card-header bg-red-600 text-white">
                    <h3 className="text-lg font-bold flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Aturan Larangan Bermain
                    </h3>
                  </div>
                  <div className="card-body">
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Pemain yang menerima 3 kartu kuning akan dilarang bermain pada pertandingan berikutnya</li>
                      <li>Pemain yang menerima kartu merah akan dilarang bermain pada pertandingan berikutnya</li>
                      <li>Setelah menjalani hukuman, akumulasi kartu kuning akan direset</li>
                      <li>Larangan bermain akan otomatis dihapus setelah pemain menjalani hukuman</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center text-red-600 mb-4">
              <Shield className="h-6 w-6 mr-2" />
              <h3 className="text-xl font-bold">Konfirmasi Reset Data</h3>
            </div>
            <p className="text-gray-700 mb-6">
              {confirmAction === 'topskor' && 'Apakah Anda yakin ingin mereset semua data pencetak gol? Tindakan ini tidak dapat dibatalkan.'}
              {confirmAction === 'kartu' && 'Apakah Anda yakin ingin mereset semua data kartu pemain? Tindakan ini tidak dapat dibatalkan.'}
              {confirmAction === 'larangan' && 'Apakah Anda yakin ingin mereset semua data larangan bermain? Tindakan ini tidak dapat dibatalkan.'}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirmDialog(false)}
                className="btn btn-outline"
              >
                Batal
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="btn btn-danger"
              >
                Ya, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatistikPemain; 