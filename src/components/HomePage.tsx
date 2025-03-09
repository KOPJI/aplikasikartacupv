import { Shield, Trophy, Users } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { teams, getTeam, getKlasemenGrup } = useTournament();
  const [activeGrup, setActiveGrup] = useState<string>('A');
  
  const klasemenGrup = getKlasemenGrup(activeGrup);

  // Fungsi untuk memeriksa apakah ada data statistik
  const hasStatisticsData = () => {
    // Periksa apakah ada pemain dengan gol
    const playersWithGoals = teams.some(team => 
      team.pemain.some(player => (player.golTotal || 0) > 0)
    );
    
    // Periksa apakah ada pemain dengan kartu
    const playersWithCards = teams.some(team => 
      team.pemain.some(player => 
        (player.kartuKuning || 0) > 0 || (player.kartuMerah || 0) > 0
      )
    );
    
    return playersWithGoals || playersWithCards;
  };
  
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
            <Link to="/klasemen" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-medium transition-colors flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-white" />
              Lihat Klasemen
            </Link>
            <Link to="/statistik" className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-full font-medium transition-colors flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Statistik Pemain
            </Link>
          </div>
        </div>
      </div>

      {/* Pesan Informasi ketika tidak ada data statistik */}
      {!hasStatisticsData() && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Trophy className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Belum ada data statistik</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Belum ada data statistik pemain (gol, kartu) dan klasemen. Data akan muncul setelah Anda menginput hasil pertandingan.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
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
                      JM
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
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Poin
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {klasemenGrup.map((tim, index) => (
                    <tr key={tim.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                            {tim.logo ? (
                              <img src={tim.logo} alt={tim.nama} className="h-8 w-8 object-cover" />
                            ) : (
                              <Shield className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{tim.nama}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {tim.main || 0}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {tim.menang || 0}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {tim.seri || 0}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {tim.kalah || 0}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {tim.selisihGol || 0}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900">
                        {tim.poin || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Tim Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-purple-600">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <Users className="mr-2 h-5 w-5 text-yellow-300" />
                Statistik Tim
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-purple-800 font-medium">Total Tim</span>
                  <span className="text-purple-900 font-bold">{teams.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map((grup) => {
                    const timDalamGrup = teams.filter(t => t.grup === grup).length;
                    return (
                      <div key={grup} className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Grup {grup}</div>
                        <div className="text-lg font-bold text-gray-900">{timDalamGrup}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
