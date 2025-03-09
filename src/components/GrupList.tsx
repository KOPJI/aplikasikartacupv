import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Shield, UserPlus, Users } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';

const GrupList = () => {
  const { teams, getTeamsByGroup } = useTournament();
  const [activeGrup, setActiveGrup] = useState<string>('A');

  const teamsInGrup = getTeamsByGroup(activeGrup);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Daftar Grup</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Grup selector */}
        <div className="flex justify-center space-x-2 mb-8 overflow-x-auto">
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

        <h2 className="text-2xl font-semibold mb-4 text-center">
          Grup {activeGrup}
        </h2>

        {/* Team list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamsInGrup.length > 0 ? (
            teamsInGrup.map((tim) => (
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
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              Tidak ada tim dalam grup ini
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrupList;
