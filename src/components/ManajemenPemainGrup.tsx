import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, UserPlus, Users, Pencil, Trash2, SearchIcon } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { Pemain, Tim } from '../context/TournamentContext';
import { savePlayerToFirestore, deletePlayerFromFirestore } from '../services/firebase';

const ManajemenPemainGrup = () => {
  const { teams, getTeamsByGroup, deletePlayer } = useTournament();
  const [activeGrup, setActiveGrup] = useState<string>('A');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  const teamsInGrup = getTeamsByGroup(activeGrup);

  // Function to get all players from teams in the active group
  const getPlayersInGroup = () => {
    const players: Array<Pemain & { teamName: string }> = [];
    
    teamsInGrup.forEach(team => {
      team.pemain.forEach(player => {
        players.push({
          ...player,
          teamName: team.nama
        });
      });
    });
    
    return players;
  };

  // Filter players based on search query
  const filteredPlayers = getPlayersInGroup().filter(player => 
    player.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.teamName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to handle player deletion with Firestore integration
  const handleDeletePlayer = async (player: Pemain) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pemain "${player.nama}"?`)) {
      try {
        setIsLoading(true);
        setStatus({ type: 'info', message: 'Menghapus pemain...' });
        
        // Delete from Firestore first
        await deletePlayerFromFirestore(player.id);
        
        // Then update local state
        deletePlayer(player.id);
        
        setStatus({ 
          type: 'success', 
          message: `Pemain ${player.nama} berhasil dihapus!` 
        });
      } catch (error) {
        console.error("Error saat menghapus pemain:", error);
        setStatus({ 
          type: 'error', 
          message: `Gagal menghapus pemain: ${error instanceof Error ? error.message : String(error)}` 
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Clear status message after 3 seconds
  useEffect(() => {
    if (status.type) {
      const timer = setTimeout(() => {
        setStatus({ type: null, message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Pemain per Grup</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Status message */}
        {status.type && (
          <div className={`mb-6 p-4 rounded-md ${
            status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
            status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {status.message}
          </div>
        )}

        {/* Grup selector */}
        <div className="flex justify-center space-x-2 mb-6 overflow-x-auto">
          {['A', 'B', 'C', 'D'].map((grup) => (
            <button
              key={grup}
              onClick={() => setActiveGrup(grup)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                activeGrup === grup
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Grup {grup} ({getTeamsByGroup(grup).length})
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari pemain atau tim..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <h2 className="text-2xl font-semibold mb-4">
          Daftar Pemain Grup {activeGrup}
        </h2>

        {/* Players list */}
        {filteredPlayers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pemain
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tim
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nomor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posisi
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{player.nama}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{player.teamName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{player.nomorPunggung}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {player.posisi}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          to={`/pemain/edit/${player.id}`}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit Pemain"
                        >
                          <Pencil className="h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => handleDeletePlayer(player)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Hapus Pemain"
                          disabled={isLoading}
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
            {searchQuery ? 'Tidak ada pemain yang sesuai dengan pencarian' : 'Tidak ada pemain dalam grup ini'}
          </div>
        )}

        {/* Team cards with add player buttons */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Tim di Grup {activeGrup}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamsInGrup.map((tim: Tim) => (
              <div key={tim.id} className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {tim.logo ? (
                      <img src={tim.logo} alt={tim.nama} className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{tim.nama}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{tim.pemain.length} Pemain</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-3">
                  <Link 
                    to={`/pemain/tambah/${tim.id}`} 
                    className="text-blue-600 text-sm flex items-center hover:text-blue-800"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Tambah Pemain
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManajemenPemainGrup;