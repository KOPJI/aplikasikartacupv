import { useState } from 'react';
import { Shield, Trophy, ChevronRight, AlertCircle } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { Link } from 'react-router-dom';

const Klasemen = () => {
  const { getKlasemenGrup } = useTournament();
  const [activeGrup, setActiveGrup] = useState<string>('A');
  const klasemenGrup = getKlasemenGrup(activeGrup);
  const [showInfo, setShowInfo] = useState(false);

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
      
      {/* Informasi Sistem Poin dan Tie-Breaker */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Sistem Poin dan Tie-Breaker:</h3>
              <p className="text-blue-700 text-sm">
                Sistem Poin: 3 poin untuk menang, 1 untuk seri, 0 untuk kalah.
              </p>
              <p className="text-blue-700 text-sm">
                Urutan Tie-Breaker: Selisih Gol (SG) → Gol Masuk (GM) → Head-to-Head.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showInfo ? 'Sembunyikan Detail' : 'Lihat Detail'}
          </button>
        </div>
        
        {showInfo && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2 text-sm">Keterangan Kolom:</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
              <li><span className="font-medium">JM</span>: Jumlah Main</li>
              <li><span className="font-medium">M</span>: Menang</li>
              <li><span className="font-medium">S</span>: Seri</li>
              <li><span className="font-medium">K</span>: Kalah</li>
              <li><span className="font-medium">GM</span>: Gol Masuk</li>
              <li><span className="font-medium">GK</span>: Gol Kebobolan</li>
              <li><span className="font-medium">SG</span>: Selisih Gol (GM - GK)</li>
              <li><span className="font-medium">P</span>: Poin (M×3 + S×1)</li>
            </ul>
            
            <h4 className="font-medium text-blue-800 mt-3 mb-2 text-sm">Aturan Tie-Breaker:</h4>
            <ol className="list-decimal pl-5 text-sm text-blue-700 space-y-1">
              <li>Poin (P): Tim dengan poin lebih tinggi berada di posisi lebih tinggi</li>
              <li>Selisih Gol (SG): Jika poin sama, tim dengan selisih gol lebih tinggi berada di posisi lebih tinggi</li>
              <li>Gol Masuk (GM): Jika poin dan selisih gol sama, tim dengan gol masuk lebih banyak berada di posisi lebih tinggi</li>
              <li>Head-to-Head: Jika semua kriteria di atas sama, hasil pertandingan langsung antar tim menentukan posisi</li>
            </ol>
          </div>
        )}
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
