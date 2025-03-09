import { useState, useEffect } from 'react';
import { ChartBar, ChevronDown, ChevronUp, CircleAlert, CircleCheck, Shield } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';

type SortField = 'name' | 'group' | 'matches' | 'restDays' | 'avgRest';
type SortDirection = 'asc' | 'desc';

interface TeamScheduleStat {
  id: string;
  name: string;
  logo: string;
  group: string;
  matchesCount: number;
  restDays: number;
  avgRestBetweenMatches: number;
  firstMatchDate: string | null;
  lastMatchDate: string | null;
  consecutiveDays: boolean;
  multipleMatchesDay: boolean;
  matchDates: string[];
}

const TeamScheduleStats = () => {
  const { teams, pertandingan, getPertandinganByTim } = useTournament();
  const [teamStats, setTeamStats] = useState<TeamScheduleStat[]>([]);
  const [sortBy, setSortBy] = useState<SortField>('group');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);

  // Calculate schedule statistics
  useEffect(() => {
    if (!teams.length || !pertandingan.length) return;

    const stats: TeamScheduleStat[] = teams.map(team => {
      // Get all matches for this team
      const teamMatches = getPertandinganByTim(team.id);
      
      // Sort matches by date
      const sortedMatches = [...teamMatches].sort((a, b) => 
        new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
      );
      
      // Extract match dates
      const matchDates = sortedMatches.map(match => match.tanggal);
      const uniqueDates = [...new Set(matchDates)];
      
      // Calculate rest days between matches
      let totalRestDays = 0;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i-1]);
        const currDate = new Date(uniqueDates[i]);
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        totalRestDays += diffDays - 1; // Days between matches (not counting match days)
      }
      
      // Check for schedule issues
      const hasConsecutiveDays = checkConsecutiveDays(uniqueDates);
      const hasMultipleMatchesDay = matchDates.length !== uniqueDates.length;
      
      return {
        id: team.id,
        name: team.nama,
        logo: team.logo,
        group: team.grup,
        matchesCount: teamMatches.length,
        restDays: totalRestDays,
        avgRestBetweenMatches: uniqueDates.length > 1 ? totalRestDays / (uniqueDates.length - 1) : 0,
        firstMatchDate: uniqueDates.length ? uniqueDates[0] : null,
        lastMatchDate: uniqueDates.length ? uniqueDates[uniqueDates.length - 1] : null,
        consecutiveDays: hasConsecutiveDays,
        multipleMatchesDay: hasMultipleMatchesDay,
        matchDates: uniqueDates
      };
    });

    setTeamStats(stats);
  }, [teams, pertandingan, getPertandinganByTim]);

  // Helper function to check for consecutive days
  const checkConsecutiveDays = (dates: string[]): boolean => {
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i-1]);
      const currDate = new Date(dates[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) return true;
    }
    return false;
  };

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Sort teams
  const sortedTeams = [...teamStats]
    .filter(team => selectedGroup === 'all' || team.group === selectedGroup)
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'group':
          comparison = a.group.localeCompare(b.group);
          break;
        case 'matches':
          comparison = a.matchesCount - b.matchesCount;
          break;
        case 'restDays':
          comparison = a.restDays - b.restDays;
          break;
        case 'avgRest':
          comparison = a.avgRestBetweenMatches - b.avgRestBetweenMatches;
          break;
        default:
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Toggle expanded state for a team
  const toggleExpanded = (teamId: string) => {
    setExpandedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId) 
        : [...prev, teamId]
    );
  };

  // Calculate overall statistics
  const calculateOverallStats = () => {
    if (!teamStats.length) return { avg: 0, min: 0, max: 0 };
    
    const avgRests = teamStats.map(team => team.avgRestBetweenMatches).filter(avg => !isNaN(avg) && isFinite(avg));
    if (!avgRests.length) return { avg: 0, min: 0, max: 0 };
    
    const avgRest = avgRests.reduce((sum, curr) => sum + curr, 0) / avgRests.length;
    const minRest = Math.min(...avgRests);
    const maxRest = Math.max(...avgRests);
    
    return { avg: avgRest, min: minRest, max: maxRest };
  };

  const overallStats = calculateOverallStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <ChartBar className="mr-2 h-5 w-5 text-blue-600" />
          Statistik Jadwal Tim
        </h2>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">Semua Grup</option>
            <option value="A">Grup A</option>
            <option value="B">Grup B</option>
            <option value="C">Grup C</option>
            <option value="D">Grup D</option>
          </select>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <h3 className="font-medium text-blue-800 mb-2">Ringkasan Statistik Jadwal:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Rata-rata Hari Istirahat:</div>
            <div className="text-xl font-bold text-blue-700">{overallStats.avg.toFixed(1)} hari</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Istirahat Minimum:</div>
            <div className="text-xl font-bold text-blue-700">{overallStats.min.toFixed(1)} hari</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Istirahat Maksimum:</div>
            <div className="text-xl font-bold text-blue-700">{overallStats.max.toFixed(1)} hari</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Tim
                    {sortBy === 'name' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('group')}
                >
                  <div className="flex items-center">
                    Grup
                    {sortBy === 'group' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('matches')}
                >
                  <div className="flex items-center justify-center">
                    Total Pertandingan
                    {sortBy === 'matches' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('restDays')}
                >
                  <div className="flex items-center justify-center">
                    Total Hari Istirahat
                    {sortBy === 'restDays' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('avgRest')}
                >
                  <div className="flex items-center justify-center">
                    Rata-rata Istirahat
                    {sortBy === 'avgRest' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Detail
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTeams.length > 0 ? (
                sortedTeams.map((team) => (
                  <>
                    <tr key={team.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            {team.logo ? (
                              <img src={team.logo} alt={team.name} className="h-10 w-10 object-cover" />
                            ) : (
                              <Shield className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{team.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Grup {team.group}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                        <span className="font-semibold">{team.matchesCount}</span> pertandingan
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                        <span className="font-semibold">{team.restDays}</span> hari
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                        <span className={`font-semibold ${
                          team.avgRestBetweenMatches < 1 ? 'text-red-600' : 
                          team.avgRestBetweenMatches < 2 ? 'text-orange-600' : 
                          'text-green-600'
                        }`}>
                          {team.avgRestBetweenMatches.toFixed(1)}
                        </span> hari
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                        {team.consecutiveDays || team.multipleMatchesDay ? (
                          <div className="flex items-center justify-center text-red-600">
                            <CircleAlert className="h-4 w-4 mr-1" />
                            <span>Masalah</span>
                          </div>
                        ) : team.matchesCount > 0 ? (
                          <div className="flex items-center justify-center text-green-600">
                            <CircleCheck className="h-4 w-4 mr-1" />
                            <span>Baik</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => toggleExpanded(team.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {expandedTeams.includes(team.id) ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedTeams.includes(team.id) && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="text-sm">
                            <h4 className="font-medium mb-2">Detail Jadwal {team.name}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="mb-1"><span className="font-medium">Pertandingan pertama:</span> {formatDate(team.firstMatchDate)}</p>
                                <p className="mb-1"><span className="font-medium">Pertandingan terakhir:</span> {formatDate(team.lastMatchDate)}</p>
                                <p className="mb-1"><span className="font-medium">Jarak antar pertandingan:</span> {team.avgRestBetweenMatches.toFixed(1)} hari</p>
                              </div>
                              <div>
                                <p className="font-medium mb-1">Tanggal pertandingan:</p>
                                <div className="flex flex-wrap gap-1">
                                  {team.matchDates.map((date, idx) => (
                                    <span 
                                      key={idx}
                                      className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md"
                                    >
                                      {formatDate(date)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {(team.consecutiveDays || team.multipleMatchesDay) && (
                              <div className="mt-2 bg-red-50 p-2 rounded text-red-700">
                                <p className="font-medium">Peringatan:</p>
                                <ul className="list-disc list-inside">
                                  {team.consecutiveDays && (
                                    <li>Tim ini memiliki pertandingan di hari berturut-turut</li>
                                  )}
                                  {team.multipleMatchesDay && (
                                    <li>Tim ini memiliki lebih dari satu pertandingan dalam sehari</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Tidak ada jadwal pertandingan yang tersedia.
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

export default TeamScheduleStats;
