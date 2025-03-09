import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChartBar, Calendar, ChevronLeft, ChevronRight, Loader, Shield, Trash2 } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { initializeMatchesToFirestore, deleteCollectionData } from '../services/firebase';
import TeamScheduleStats from './TeamScheduleStats';

const JadwalPertandingan = () => {
  const { 
    pertandingan, 
    generateJadwal, 
    getPertandinganByTanggal,
    getTeam,
    validateSchedule,
    clearSchedule
  } = useTournament();
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedGrup, setSelectedGrup] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | 'warning' | null;
    message: string;
  }>({ type: null, message: '' });
  const [activeTab, setActiveTab] = useState<'schedule' | 'stats'>('schedule');

  // Dapatkan semua tanggal yang tersedia dalam jadwal
  useEffect(() => {
    const dates = [...new Set(pertandingan.map(p => p.tanggal))].sort();
    setAvailableDates(dates);
    
    // Set tanggal pertama sebagai default jika ada
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
    }
  }, [pertandingan, selectedDate]);

  // Filter pertandingan berdasarkan tanggal dan grup
  const pertandinganHariIni = selectedDate 
    ? getPertandinganByTanggal(selectedDate)
        .filter(p => selectedGrup === 'all' || p.grup === selectedGrup)
    : [];

  // Fungsi untuk membuat jadwal
  const handleGenerateJadwal = () => {
    try {
      setIsLoading(true);
      setStatus({ type: 'info', message: 'Sedang membuat jadwal pertandingan...' });
      
      // Buat jadwal
      const validationResult = generateJadwal();
      
      if (validationResult.isValid) {
        setStatus({ 
          type: 'success', 
          message: 'Jadwal pertandingan berhasil dibuat!' 
        });
        setValidationMessages([]);
      } else {
        setStatus({ 
          type: 'warning', 
          message: 'Jadwal dibuat dengan beberapa peringatan' 
        });
        setValidationMessages(validationResult.messages);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        if (status.type === 'success') {
          setStatus({ type: null, message: '' });
        }
      }, 3000);
    } catch (error) {
      console.error("Error saat membuat jadwal:", error);
      setStatus({ 
        type: 'error', 
        message: `Gagal membuat jadwal: ${error instanceof Error ? error.message : String(error)}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Navigasi antar tanggal
  const navigateDate = (direction: 'prev' | 'next') => {
    const currentIndex = availableDates.indexOf(selectedDate);
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedDate(availableDates[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < availableDates.length - 1) {
      setSelectedDate(availableDates[currentIndex + 1]);
    }
  };

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

  // Mendapatkan detail tim
  const getTeamDetails = (timId: string) => {
    return getTeam(timId);
  };

  // Format waktu pertandingan dengan durasi
  const formatWaktuDenganDurasi = (waktu: string) => {
    switch (waktu) {
      case "13:30":
        return "13:30 - 14:35";
      case "14:45":
        return "14:45 - 15:50";
      case "16:00":
        return "16:00 - 17:05";
      default:
        const [jam, menit] = waktu.split(':');
        return `${jam}:${menit}`;
    }
  };

  // Simpan jadwal ke Firestore
  const handleSaveToFirestore = async () => {
    try {
      setIsLoading(true);
      setStatus({ type: 'info', message: 'Menyimpan jadwal ke Firestore...' });

      await initializeMatchesToFirestore(pertandingan);
      
      setStatus({ 
        type: 'success', 
        message: 'Jadwal pertandingan berhasil disimpan ke Firestore!' 
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        if (status.type === 'success') {
          setStatus({ type: null, message: '' });
        }
      }, 3000);
    } catch (error) {
      console.error("Error saat menyimpan jadwal:", error);
      setStatus({ 
        type: 'error', 
        message: `Gagal menyimpan jadwal: ${error instanceof Error ? error.message : String(error)}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Hapus jadwal dari Firestore dan aplikasi
  const handleDeleteSchedule = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus semua jadwal pertandingan? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      setStatus({ type: 'info', message: 'Menghapus jadwal...' });

      // Hapus dari Firestore jika diperlukan
      if (window.confirm('Apakah Anda juga ingin menghapus jadwal dari Firebase?')) {
        await deleteCollectionData('matches');
      }
      
      // Hapus dari state aplikasi
      clearSchedule();
      
      setSelectedDate('');
      setAvailableDates([]);
      
      setStatus({ 
        type: 'success', 
        message: 'Jadwal pertandingan berhasil dihapus!' 
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        if (status.type === 'success') {
          setStatus({ type: null, message: '' });
        }
      }, 3000);
    } catch (error) {
      console.error("Error saat menghapus jadwal:", error);
      setStatus({ 
        type: 'error', 
        message: `Gagal menghapus jadwal: ${error instanceof Error ? error.message : String(error)}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Validasi jadwal yang sudah dibuat
  const handleValidateSchedule = () => {
    const validationResult = validateSchedule();
    
    if (validationResult.isValid) {
      setStatus({
        type: 'success',
        message: 'Jadwal sudah valid dan memenuhi semua kriteria!'
      });
      setValidationMessages([]);
    } else {
      setStatus({
        type: 'warning',
        message: 'Terdapat beberapa masalah pada jadwal:'
      });
      setValidationMessages(validationResult.messages);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Jadwal Pertandingan</h1>
        
        <div className="flex gap-2">
          <button
            onClick={handleGenerateJadwal}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md inline-flex items-center shadow-sm"
          >
            {isLoading ? (
              <Loader className="h-5 w-5 mr-1 animate-spin" />
            ) : (
              <Calendar className="h-5 w-5 mr-1" />
            )}
            Buat Jadwal
          </button>
          
          {pertandingan.length > 0 && (
            <>
              <button
                onClick={handleSaveToFirestore}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-md inline-flex items-center shadow-sm"
              >
                {isLoading ? (
                  <Loader className="h-5 w-5 mr-1 animate-spin" />
                ) : (
                  <Calendar className="h-5 w-5 mr-1" />
                )}
                Simpan ke Firestore
              </button>
              <button
                onClick={handleDeleteSchedule}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-md inline-flex items-center shadow-sm"
              >
                {isLoading ? (
                  <Loader className="h-5 w-5 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5 mr-1" />
                )}
                Hapus Jadwal
              </button>
            </>
          )}
        </div>
      </div>

      {status.type && (
        <div className={`p-4 rounded-md ${
          status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
          status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 
          status.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {status.message}
        </div>
      )}

      {validationMessages.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
          <h3 className="font-medium text-yellow-800 mb-2">Peringatan jadwal:</h3>
          <div className="max-h-60 overflow-y-auto">
            <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-700">
              {validationMessages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {pertandingan.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Jadwal Pertandingan
              </div>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center">
                <ChartBar className="mr-2 h-4 w-4" />
                Statistik Jadwal
              </div>
            </button>
          </div>

          {activeTab === 'schedule' ? (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div className="mb-3 sm:mb-0">
                  <button
                    onClick={handleValidateSchedule}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Validasi Jadwal
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 mb-1 sm:mb-0 sm:mr-2">
                    Filter Grup:
                  </label>
                  <select
                    value={selectedGrup}
                    onChange={(e) => setSelectedGrup(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">Semua Grup</option>
                    <option value="A">Grup A</option>
                    <option value="B">Grup B</option>
                    <option value="C">Grup C</option>
                    <option value="D">Grup D</option>
                  </select>
                </div>
              </div>

              {/* Date Navigator */}
              <div className="flex items-center justify-between mb-6 bg-gray-50 p-3 rounded-md">
                <button
                  onClick={() => navigateDate('prev')}
                  disabled={availableDates.indexOf(selectedDate) === 0}
                  className={`p-2 rounded-full ${
                    availableDates.indexOf(selectedDate) === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <div className="text-center">
                  <span className="text-lg font-semibold text-gray-800">
                    {selectedDate ? formatDate(selectedDate) : 'Pilih Tanggal'}
                  </span>
                </div>
                
                <button
                  onClick={() => navigateDate('next')}
                  disabled={availableDates.indexOf(selectedDate) === availableDates.length - 1}
                  className={`p-2 rounded-full ${
                    availableDates.indexOf(selectedDate) === availableDates.length - 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Matches List */}
              {pertandinganHariIni.length > 0 ? (
                <div className="space-y-4">
                  {pertandinganHariIni.map((match) => {
                    const timA = getTeamDetails(match.timA);
                    const timB = getTeamDetails(match.timB);
                    const hasResult = match.hasil && match.hasil.selesai;
                    
                    return (
                      <div 
                        key={match.id} 
                        className={`border ${hasResult ? 'border-green-200 bg-green-50' : 'border-gray-200'} rounded-lg p-4 hover:shadow-md transition-shadow`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Grup {match.grup}
                          </span>
                          <span className="text-gray-600 text-sm">
                            {formatWaktuDenganDurasi(match.waktu)} WIB
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex-1 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mb-2">
                              {timA?.logo ? (
                                <img src={timA.logo} alt={timA.nama} className="w-full h-full object-cover" />
                              ) : (
                                <Shield className="w-6 h-6 text-gray-500" />
                              )}
                            </div>
                            <span className="font-semibold">{timA?.nama || 'Tim A'}</span>
                          </div>
                          
                          <div className="mx-4 text-center">
                            {hasResult ? (
                              <div className="bg-white rounded-lg shadow px-4 py-2 font-bold text-xl text-gray-800">
                                {match.hasil?.skorTimA} - {match.hasil?.skorTimB}
                              </div>
                            ) : (
                              <div className="text-gray-500 text-sm font-medium">
                                VS
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mb-2">
                              {timB?.logo ? (
                                <img src={timB.logo} alt={timB.nama} className="w-full h-full object-cover" />
                              ) : (
                                <Shield className="w-6 h-6 text-gray-500" />
                              )}
                            </div>
                            <span className="font-semibold">{timB?.nama || 'Tim B'}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-center">
                          {!hasResult && (
                            <Link
                              to={`/hasil/${match.id}`}
                              className="inline-block text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Input Hasil
                            </Link>
                          )}
                          {hasResult && (
                            <Link
                              to={`/hasil/${match.id}`}
                              className="inline-block text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Lihat Detail
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada pertandingan untuk {selectedDate ? `tanggal ${formatDate(selectedDate)}` : 'tanggal yang dipilih'}
                  {selectedGrup !== 'all' && ` di Grup ${selectedGrup}`}
                </div>
              )}
            </>
          ) : (
            <TeamScheduleStats />
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">Belum ada jadwal pertandingan yang dibuat.</p>
          <button
            onClick={handleGenerateJadwal}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md inline-flex items-center shadow-sm"
          >
            {isLoading ? (
              <Loader className="h-5 w-5 mr-1 animate-spin" />
            ) : (
              <Calendar className="h-5 w-5 mr-1" />
            )}
            Buat Jadwal
          </button>
        </div>
      )}

      {pertandingan.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Informasi Jadwal:</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Jadwal pertandingan diatur dengan memperhatikan waktu istirahat tim.</p>
            <p>• Setiap hari ada maksimal 3 pertandingan dengan jadwal tetap:</p>
            <ul className="list-disc pl-8 space-y-1">
              <li>Pertandingan 1: 13:30 - 14:35 WIB</li>
              <li>Pertandingan 2: 14:45 - 15:50 WIB</li>
              <li>Pertandingan 3: 16:00 - 17:05 WIB</li>
            </ul>
            <p>• Tidak ada tim yang bermain dua kali dalam sehari.</p>
            <p>• Tidak ada tim yang bermain di hari berturut-turut.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JadwalPertandingan;
