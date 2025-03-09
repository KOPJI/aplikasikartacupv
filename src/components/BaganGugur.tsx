import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Calendar, ChevronRight, Shield, Trophy } from 'lucide-react';
import { useTournament, PertandinganBabakGugur, BabakGugurTahap } from '../context/TournamentContext';

const BaganGugur = () => {
  const { 
    pertandinganBabakGugur, 
    generateJadwalBabakGugur, 
    getTimLolosPerempat,
    getPertandinganBabakGugurByTahap,
    getTeam,
    getJuara,
    getRunnerUp
  } = useTournament();
  
  const [activeTab, setActiveTab] = useState<BabakGugurTahap>('perempat');
  const teamsQualified = getTimLolosPerempat();
  const juara = getJuara();
  const runnerUp = getRunnerUp();

  // Generate jadwal babak gugur jika belum ada
  useEffect(() => {
    if (pertandinganBabakGugur.length === 0) {
      const timCount = teamsQualified.reduce((count, group) => count + group.tim.length, 0);
      if (timCount >= 8) {
        generateJadwalBabakGugur();
      }
    }
  }, [pertandinganBabakGugur.length, teamsQualified, generateJadwalBabakGugur]);

  // Format tanggal
  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
  };

  // Fungsi untuk mendapatkan label tahap
  const getTahapLabel = (tahap: BabakGugurTahap) => {
    switch (tahap) {
      case 'perempat': return 'Perempat Final';
      case 'semifinal': return 'Semifinal';
      case 'final': return 'Final';
      default: return '';
    }
  };

  // Render pertandingan
  const renderPertandingan = (pertandingan: PertandinganBabakGugur) => {
    const timA = pertandingan.timA ? getTeam(pertandingan.timA) : null;
    const timB = pertandingan.timB ? getTeam(pertandingan.timB) : null;
    const hasResult = pertandingan.hasil && pertandingan.hasil.selesai;
    
    return (
      <div 
        key={pertandingan.id} 
        className={`border ${hasResult ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'} rounded-lg p-4 mb-4 hover:shadow-md transition-shadow`}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {getTahapLabel(pertandingan.tahap)} #{pertandingan.nomorPertandingan}
          </span>
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(pertandingan.tanggal)}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex-1 flex flex-col items-center text-center">
            {timA ? (
              <>
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mb-2">
                  {timA.logo ? (
                    <img src={timA.logo} alt={timA.nama} className="w-full h-full object-cover" />
                  ) : (
                    <Shield className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <span className="font-semibold">{timA.nama}</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-gray-300" />
                </div>
                <span className="text-gray-400">Menunggu</span>
              </>
            )}
          </div>
          
          <div className="mx-4 text-center">
            {hasResult ? (
              <div className="bg-white rounded-lg shadow px-4 py-2 font-bold text-xl text-gray-800">
                {pertandingan.hasil?.skorTimA} - {pertandingan.hasil?.skorTimB}
              </div>
            ) : (
              <div className="text-gray-500 text-sm font-medium">
                VS
              </div>
            )}
          </div>
          
          <div className="flex-1 flex flex-col items-center text-center">
            {timB ? (
              <>
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mb-2">
                  {timB.logo ? (
                    <img src={timB.logo} alt={timB.nama} className="w-full h-full object-cover" />
                  ) : (
                    <Shield className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <span className="font-semibold">{timB.nama}</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-gray-300" />
                </div>
                <span className="text-gray-400">Menunggu</span>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-3 text-center">
          {(timA && timB) ? (
            <Link
              to={`/babak-gugur/hasil/${pertandingan.id}`}
              className={`inline-block ${hasResult ? 'text-green-600 hover:text-green-800' : 'text-blue-600 hover:text-blue-800'} text-sm font-medium`}
            >
              {hasResult ? 'Lihat Detail' : 'Input Hasil'}
            </Link>
          ) : (
            <span className="text-sm text-gray-400">Menunggu tim yang lolos</span>
          )}
        </div>
      </div>
    );
  };

  const renderBracket = () => {
    if (pertandinganBabakGugur.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Jadwal babak gugur belum dibuat.</p>
          {teamsQualified.reduce((count, group) => count + group.tim.length, 0) >= 8 ? (
            <button
              onClick={generateJadwalBabakGugur}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm"
            >
              Generate Jadwal Babak Gugur
            </button>
          ) : (
            <p className="text-yellow-600">
              Semua pertandingan grup harus selesai untuk membuat jadwal babak gugur.
            </p>
          )}
        </div>
      );
    }

    // Get matches for current tab
    const matches = getPertandinganBabakGugurByTahap(activeTab);

    return (
      <div>
        {/* Tab navigation */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('perempat')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'perempat'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Perempat Final
          </button>
          <button
            onClick={() => setActiveTab('semifinal')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'semifinal'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semifinal
          </button>
          <button
            onClick={() => setActiveTab('final')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'final'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Final
          </button>
        </div>

        {/* Matches list */}
        <div>
          {matches.length > 0 ? (
            matches.map(renderPertandingan)
          ) : (
            <div className="text-center py-8 text-gray-500">
              Tidak ada pertandingan untuk tahap ini
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render juara section
  const renderJuara = () => {
    if (!juara) return null;

    return (
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-300 p-6 rounded-lg text-center mb-8 shadow-md">
        <h2 className="text-2xl font-bold text-yellow-900 mb-4 flex items-center justify-center">
          <Trophy className="h-6 w-6 mr-2" />
          Juara Karta Cup V
        </h2>
        
        <div className="flex justify-center">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center overflow-hidden mb-3 border-4 border-yellow-200 shadow-inner">
              {juara.logo ? (
                <img src={juara.logo} alt={juara.nama} className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-10 h-10 text-yellow-500" />
              )}
            </div>
            <h3 className="text-xl font-bold text-yellow-900">{juara.nama}</h3>
            <span className="bg-white text-yellow-800 px-3 py-1 rounded-full text-sm font-bold mt-2">
              Juara 1
            </span>
          </div>

          {runnerUp && (
            <div className="flex flex-col items-center ml-16">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden mb-3 border-4 border-yellow-100 shadow-inner">
                {runnerUp.logo ? (
                  <img src={runnerUp.logo} alt={runnerUp.nama} className="w-full h-full object-cover" />
                ) : (
                  <Shield className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-bold text-yellow-900">{runnerUp.nama}</h3>
              <span className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm font-bold mt-2">
                Juara 2
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Babak Gugur</h1>
      </div>

      {/* Juara section */}
      {juara && renderJuara()}

      {/* Qualified teams */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Award className="mr-2 h-5 w-5 text-blue-600" />
          Tim Lolos ke Babak Gugur
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {teamsQualified.map(({ grup, tim }) => (
            <div key={grup} className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-center">Grup {grup}</h3>
              
              {tim.length > 0 ? (
                <div className="space-y-3">
                  {tim.map((team, index) => (
                    <div key={team.id} className="flex items-center bg-white p-2 rounded border border-gray-200">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-2">
                        {team.logo ? (
                          <img src={team.logo} alt={team.nama} className="w-full h-full object-cover" />
                        ) : (
                          <Shield className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <span className="font-medium">{team.nama}</span>
                        <div className="text-xs text-gray-500">Peringkat {index + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Menunggu hasil grup
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bracket */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <ChevronRight className="mr-2 h-5 w-5 text-blue-600" />
          Bagan Babak Gugur
        </h2>
        
        {renderBracket()}
      </div>
    </div>
  );
};

export default BaganGugur;
