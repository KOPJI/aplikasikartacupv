import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Shield, Trash2, Users } from 'lucide-react';
import { useTournament, Tim, Pemain } from '../context/TournamentContext';
import { 
  getTeamsFromFirestore, 
  getPlayersFromFirestore,
  savePlayerToFirestore,
  deletePlayerFromFirestore 
} from '../services/firebase';

const DaftarTim = () => {
  const { teams, deleteTeam } = useTournament();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrup, setSelectedGrup] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Tim | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter teams based on search query and selected group
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrup = selectedGrup ? team.grup === selectedGrup : true;
    return matchesSearch && matchesGrup;
  });

  const confirmDelete = (team: Tim) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus tim "${team.nama}"?`)) {
      deleteTeam(team.id);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pemain ini?')) return;

    try {
      setLoading(true);
      await deletePlayerFromFirestore(playerId);
      // Refresh data setelah menghapus
      window.location.reload();
    } catch (error) {
      console.error('Gagal menghapus pemain:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Tim & Pemain</h1>
        <Link 
          to="/tim/tambah" 
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md inline-flex items-center shadow-sm"
        >
          <Plus className="h-5 w-5 mr-1" />
          Tambah Tim Baru
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Search and filter controls */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Cari tim atau pemain..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-shrink-0">
            <select
              className="px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={selectedGrup || ''}
              onChange={(e) => setSelectedGrup(e.target.value || null)}
            >
              <option value="">Semua Grup</option>
              <option value="A">Grup A</option>
              <option value="B">Grup B</option>
              <option value="C">Grup C</option>
              <option value="D">Grup D</option>
            </select>
          </div>
        </div>

        {/* Teams list */}
        {filteredTeams.length > 0 ? (
          <div className="space-y-8">
            {filteredTeams.map((tim) => (
              <div key={tim.id} className="border rounded-lg overflow-hidden">
                {/* Tim Header */}
                <div className="bg-gray-50 p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {tim.logo ? (
                        <img src={tim.logo} alt={tim.nama} className="h-12 w-12 object-cover" />
                      ) : (
                        <Shield className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{tim.nama}</h3>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Grup {tim.grup}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link 
                      to={`/pemain/tambah/${tim.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Tambah Pemain
                    </Link>
                    <Link 
                      to={`/tim/edit/${tim.id}`}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Edit Tim"
                    >
                      <Pencil className="h-5 w-5" />
                    </Link>
                    <button 
                      onClick={() => confirmDelete(tim)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Hapus Tim"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Daftar Pemain */}
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Daftar Pemain ({tim.pemain.length})</h4>
                  {tim.pemain.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No.</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Posisi</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {tim.pemain.map((pemain) => (
                            <tr key={pemain.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-900">{pemain.nomorPunggung}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{pemain.nama}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  pemain.posisi === 'Penyerang' ? 'bg-red-100 text-red-800' :
                                  pemain.posisi === 'Gelandang' ? 'bg-blue-100 text-blue-800' :
                                  pemain.posisi === 'Bertahan' ? 'bg-green-100 text-green-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {pemain.posisi}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-right">
                                <div className="flex justify-end space-x-2">
                                  <Link 
                                    to={`/pemain/edit/${pemain.id}`}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Link>
                                  <button 
                                    onClick={() => handleDeletePlayer(pemain.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Belum ada pemain terdaftar
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Tidak ada tim yang ditemukan
          </div>
        )}
      </div>
    </div>
  );
};

export default DaftarTim;
