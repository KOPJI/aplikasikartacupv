import { useTournament } from '../context/TournamentContext';

const TeamRestStats = () => {
  const { getTeamRestStatistics, getTeam } = useTournament();
  const stats = getTeamRestStatistics();

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Statistik Waktu Istirahat Tim</h2>
      
      {/* Statistik Keseluruhan */}
      <div className="mb-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Statistik Keseluruhan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded shadow">
            <p className="text-sm text-gray-600">Rata-rata Istirahat</p>
            <p className="text-xl font-bold">{stats.overallStats.averageRestDays.toFixed(1)} hari</p>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <p className="text-sm text-gray-600">Minimum Istirahat</p>
            <p className="text-xl font-bold">{stats.overallStats.minRestDays} hari</p>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <p className="text-sm text-gray-600">Maksimum Istirahat</p>
            <p className="text-xl font-bold">{stats.overallStats.maxRestDays} hari</p>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <p className="text-sm text-gray-600">Standar Deviasi</p>
            <p className="text-xl font-bold">{stats.overallStats.stdDeviation.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Statistik per Tim */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Statistik per Tim</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rata-rata Istirahat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Istirahat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Istirahat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hari Istirahat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(stats.teamStats).map(([teamId, teamStat]) => {
                const team = getTeam(teamId);
                return (
                  <tr key={teamId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={team?.logo} alt={team?.nama} className="h-8 w-8 rounded-full" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{team?.nama}</div>
                          <div className="text-sm text-gray-500">Grup {team?.grup}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{teamStat.averageRestDays.toFixed(1)} hari</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{teamStat.minRestDays} hari</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{teamStat.maxRestDays} hari</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{teamStat.totalRestDays} hari</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamRestStats; 