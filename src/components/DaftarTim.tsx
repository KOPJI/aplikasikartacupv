import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Shield, Trash2, UserPlus, Users } from 'lucide-react';
import { useTournament, Tim } from '../context/TournamentContext';

const DaftarTim = () => {
  const { teams, deleteTeam } = useTournament();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrup, setSelectedGrup] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Daftar Tim</h1>
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
              placeholder="Cari tim..."
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tim
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grup
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah Pemain
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeams.map((tim) => (
                  <tr key={tim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {tim.logo ? (
                            <img src={tim.logo} alt={tim.nama} className="h-10 w-10 object-cover" />
                          ) : (
                            <Shield className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{tim.nama}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Grup {tim.grup}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        {tim.pemain.length} Pemain
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          to={`/pemain/tambah/${tim.id}`}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Tambah Pemain"
                        >
                          <UserPlus className="h-5 w-5" />
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
