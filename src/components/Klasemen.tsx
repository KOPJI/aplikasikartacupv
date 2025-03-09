import { useState } from 'react';
import { Shield, Trophy, ChevronRight } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { Link } from 'react-router-dom';

const Klasemen = () => {
  const { getKlasemenGrup } = useTournament();
  const [activeGrup, setActiveGrup] = useState<string>('A');
  const klasemenGrup = getKlasemenGrup(activeGrup);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Klasemen Sementara</h1>

      {/* Grup selector */}
      <div className="flex flex-wrap justify-center space-x-2 mb-4 overflow-x-auto">
        {['A', 'B', 'C', 'D'].map((grup) => (
          <button
            key={grup}
            onClick={() => setActiveGrup(grup)}
            className={`px-6 py-2 rounded-full font-medium transition-colors mb-2 ${
              activeGrup === grup
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Grup {grup}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 text-white">
          <h2 className="text-xl font-bold flex items-center">
            <Trophy className="mr-2 h-5 w-5" />
            Klasemen Grup {activeGrup}
          </h2>
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
                  GM
                </th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GK
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
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
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
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                    {tim.main || 0}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                    {tim.menang || 0}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                    {tim.seri || 0}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                    {tim.kalah || 0}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                    {tim.golMasuk || 0}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                    {tim.golKemasukan || 0}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                    {tim.selisihGol || 0}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900">
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

      {/* Link ke Statistik Pemain */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 text-white">
          <h2 className="text-xl font-bold">Statistik Pemain</h2>
        </div>
        
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-4">
            Untuk melihat data top skor, kartu, dan larangan bermain, silakan kunjungi halaman Statistik Pemain.
          </p>
          <Link 
            to="/statistik" 
            className="inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors"
          >
            Lihat Statistik Pemain
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Klasemen;
