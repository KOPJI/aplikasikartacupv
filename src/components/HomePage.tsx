import { Squircle, Award, Shield } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';

const HomePage = () => {
  const { teams, getPencetakGolTerbanyak, getTeam } = useTournament();
  
  // Dapatkan 5 pencetak gol terbanyak
  const topScorers = getPencetakGolTerbanyak(5);

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
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-800 mb-2">Selamat Datang di Karta Cup V</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Sistem manajemen turnamen sepak bola untuk mengatur tim, pemain, 
          jadwal, dan klasemen grup.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-600">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Struktur Grup</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['A', 'B', 'C', 'D'].map((grup) => (
            <div key={grup} className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xl font-bold text-center mb-2 text-green-700">Grup {grup}</h3>
              <ul className="space-y-2">
                {teams
                  .filter(team => team.grup === grup)
                  .map(team => (
                    <li key={team.id} className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2 overflow-hidden">
                        {team.logo ? (
                          <img src={team.logo} alt={team.nama} className="w-full h-full object-cover" />
                        ) : (
                          <Shield className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <span>{team.nama}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Top Scorers */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Award className="mr-2 h-5 w-5 text-yellow-600" />
          Top Skor
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peringkat
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pemain
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tim
                </th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gol
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topScorers.length > 0 ? (
                topScorers.map((pemain, index) => {
                  // Find team of player
                  const tim = getTeam(pemain.timId);
                  
                  return (
                    <tr key={pemain.id} className={index < 3 ? "bg-yellow-50" : ""}>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {pemain.nama} 
                            <span className="text-gray-500 ml-1">({pemain.nomorPunggung})</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">
                        {tim?.nama || ''}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900">
                        {pemain.golTotal || 0}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-gray-500">
                    Belum ada data pencetak gol
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Players with Cards */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Squircle className="mr-2 h-5 w-5 text-yellow-600" />
          Pemain dengan Kartu
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pemain
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tim
                </th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kartu Kuning
                </th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kartu Merah
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {playersWithCards.length > 0 ? (
                playersWithCards.map((pemain) => (
                  <tr key={pemain.id}>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {pemain.nama} 
                          <span className="text-gray-500 ml-1">({pemain.nomorPunggung})</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">
                      {pemain.teamName}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                      <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                        (pemain.kartuKuning || 0) > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {pemain.kartuKuning || 0}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                      <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                        (pemain.kartuMerah || 0) > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {pemain.kartuMerah || 0}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-gray-500">
                    Belum ada pemain yang mendapatkan kartu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Banned Players */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Squircle className="mr-2 h-5 w-5 text-red-600" />
          Pemain Dilarang Bermain
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pemain
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tim
                </th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alasan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bannedPlayers.length > 0 ? (
                bannedPlayers.map((pemain) => (
                  <tr key={pemain.id} className="bg-red-50">
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {pemain.nama} 
                          <span className="text-gray-500 ml-1">({pemain.nomorPunggung})</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">
                      {pemain.teamName}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                      <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {pemain.banReason}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-gray-500">
                    Tidak ada pemain yang dilarang bermain
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default HomePage;
