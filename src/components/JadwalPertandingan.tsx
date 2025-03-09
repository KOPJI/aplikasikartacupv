import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, ChevronLeft, ChevronRight, Loader, Shield, Trash2, RefreshCcw } from 'lucide-react';
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
    optimizeSchedule,
    fixExistingSchedule,
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
  
  // State untuk tanggal mulai turnamen
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  
  // Mendapatkan tanggal hari ini dalam format YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  // Mendapatkan tanggal 30 hari dari sekarang dalam format YYYY-MM-DD
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90); // Maksimal 90 hari dari sekarang
    return maxDate.toISOString().split('T')[0];
  };

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
    
  // Hitung total pertandingan berdasarkan filter grup
  const totalPertandingan = pertandingan.filter(p => selectedGrup === 'all' || p.grup === selectedGrup).length;
  
  // Hitung jumlah hari pertandingan berdasarkan filter grup
  const hariPertandingan = [...new Set(
    pertandingan
      .filter(p => selectedGrup === 'all' || p.grup === selectedGrup)
      .map(p => p.tanggal)
  )].length;
  
  // Hitung jumlah pertandingan yang sudah selesai
  const pertandinganSelesai = pertandingan
    .filter(p => selectedGrup === 'all' || p.grup === selectedGrup)
    .filter(p => p.hasil && p.hasil.selesai).length;
    
  // Hitung hari dengan jumlah pertandingan tidak tepat 3
  const hariDenganPertandinganTidakTepat3 = Object.entries(
    availableDates.reduce((acc, date) => {
      const matchesOnDate = pertandingan.filter(m => m.tanggal === date).length;
      acc[date] = matchesOnDate;
      return acc;
    }, {} as Record<string, number>)
  ).filter(([_, count]) => count !== 3);
  
  // Fungsi untuk membuat jadwal
  const handleGenerateJadwal = () => {
    // Jika tanggal mulai belum dipilih, tampilkan pemilih tanggal
    if (!startDate) {
      setShowStartDatePicker(true);
      return;
    }
    
    try {
      setIsLoading(true);
      setStatus({ type: 'info', message: 'Sedang membuat jadwal pertandingan...' });
      
      // Konversi string tanggal ke objek Date
      const startDateObj = new Date(startDate);
      
      const result = generateJadwal(startDateObj);
      
      if (result.isValid) {
        setStatus({
          type: 'success',
          message: 'Jadwal pertandingan berhasil dibuat!'
        });
        setValidationMessages([]);
        setShowStartDatePicker(false);
      } else {
        setStatus({
          type: 'warning',
          message: 'Jadwal pertandingan berhasil dibuat, tetapi terdapat beberapa masalah:'
        });
        setValidationMessages(result.messages);
        setShowStartDatePicker(false);
      }
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

  // Fungsi untuk memperbaiki jadwal
  const handleOptimizeSchedule = () => {
    try {
      setIsLoading(true);
      setStatus({ type: 'info', message: 'Sedang memperbaiki jadwal pertandingan...' });
      
      const result = optimizeSchedule();
      
      if (result.optimized) {
        if (result.isValid) {
          setStatus({
            type: 'success',
            message: `Jadwal berhasil diperbaiki! ${result.optimizationCount} pertandingan telah dipindahkan.`
          });
          setValidationMessages([]);
        } else {
          setStatus({
            type: 'warning',
            message: `Jadwal diperbaiki sebagian (${result.optimizationCount} pertandingan dipindahkan), tetapi masih terdapat beberapa masalah:`
          });
          setValidationMessages(result.messages);
        }
      } else {
        if (result.isValid) {
          setStatus({
            type: 'success',
            message: 'Jadwal sudah optimal dan tidak perlu diperbaiki.'
          });
          setValidationMessages([]);
        } else {
          setStatus({
            type: 'warning',
            message: 'Tidak dapat memperbaiki jadwal secara otomatis. Silakan perbaiki secara manual:'
          });
          setValidationMessages(result.messages);
        }
      }
    } catch (error) {
      console.error("Error saat memperbaiki jadwal:", error);
      setStatus({
        type: 'error',
        message: `Gagal memperbaiki jadwal: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler untuk memperbaiki jadwal yang sudah ada
  const handleFixSchedule = () => {
    if (window.confirm('Apakah Anda yakin ingin memperbaiki jadwal? Ini akan membuat jadwal baru dari awal.')) {
      setIsLoading(true);
      setStatus({ type: 'info', message: 'Sedang memperbaiki jadwal...' });
      
      try {
        const result = fixExistingSchedule();
        
        if (result.isValid) {
          setStatus({ type: 'success', message: 'Jadwal berhasil dibuat ulang dan sekarang valid!' });
          
          // Perbarui tanggal yang tersedia
          const dates = [...new Set(pertandingan.map(p => p.tanggal))].sort();
          setAvailableDates(dates);
          
          // Jika ada tanggal yang dipilih, pastikan masih ada dalam jadwal
          if (selectedDate && !dates.includes(selectedDate)) {
            setSelectedDate(dates[0] || '');
          }
          
          // Perbarui pesan validasi
          setValidationMessages([]);
        } else {
          setStatus({ type: 'error', message: 'Gagal memperbaiki jadwal. ' + result.messages[0] });
          setValidationMessages(result.messages);
        }
      } catch (error) {
        console.error('Error saat memperbaiki jadwal:', error);
        setStatus({ type: 'error', message: 'Terjadi kesalahan saat memperbaiki jadwal.' });
      } finally {
        setIsLoading(false);
      }
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
    if (!window.confirm('Apakah Anda yakin ingin menghapus semua jadwal pertandingan? Tindakan ini akan menghapus semua jadwal, hasil pertandingan, statistik pemain (gol, kartu), klasemen, dan tidak dapat dibatalkan.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      setStatus({ type: 'info', message: 'Menghapus jadwal, statistik, dan klasemen...' });

      // Hapus dari Firestore jika diperlukan
      if (window.confirm('Apakah Anda juga ingin menghapus jadwal dari Firebase?')) {
        await deleteCollectionData('matches');
      }
      
      // Hapus dari state aplikasi
      clearSchedule();
      
      setSelectedDate('');
      setAvailableDates([]);
      setStartDate('');
      
      setStatus({ 
        type: 'success', 
        message: 'Jadwal pertandingan, statistik pemain, dan klasemen berhasil direset!' 
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
        
        <div className="flex space-x-2">
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
                onClick={handleValidateSchedule}
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white font-medium py-2 px-4 rounded-md inline-flex items-center shadow-sm"
              >
                {isLoading ? (
                  <Loader className="h-5 w-5 mr-1 animate-spin" />
                ) : (
                  <Calendar className="h-5 w-5 mr-1" />
                )}
                Validasi Jadwal
              </button>
              
              <button
                onClick={handleOptimizeSchedule}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-2 px-4 rounded-md inline-flex items-center shadow-sm"
              >
                {isLoading ? (
                  <Loader className="h-5 w-5 mr-1 animate-spin" />
                ) : (
                  <RefreshCcw className="h-5 w-5 mr-1" />
                )}
                Perbaiki Jadwal
              </button>
              
              <button
                onClick={handleFixSchedule}
                disabled={isLoading}
                className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-medium py-2 px-4 rounded-md inline-flex items-center shadow-sm"
              >
                {isLoading ? (
                  <Loader className="h-5 w-5 mr-1 animate-spin" />
                ) : (
                  <RefreshCcw className="h-5 w-5 mr-1" />
                )}
                Perbaiki Jadwal
              </button>
              
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
      
      {/* Status message */}
      {status.type && (
        <div className={`p-4 rounded-md ${
          status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
          status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 
          status.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          <p className="font-medium">{status.message}</p>
          
          {showErrorDetails && (
            <div className="mt-2">
              <button
                onClick={() => setShowErrorDetails(false)}
                className="text-sm underline mb-2"
              >
                Sembunyikan detail error
              </button>
              <ul className="list-disc pl-5 text-sm">
                {errorDetails.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
          
          {status.type === 'error' && errorDetails.length > 0 && !showErrorDetails && (
            <button
              onClick={() => setShowErrorDetails(true)}
              className="text-sm underline mt-1"
            >
              Lihat detail error
            </button>
          )}
        </div>
      )}
      
      {validationMessages.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md">
          <h3 className="font-bold mb-2 flex items-center">
            <RefreshCcw className="h-5 w-5 mr-1" />
            Peringatan jadwal:
          </h3>
          <ul className="list-disc pl-5">
            {validationMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Dialog Pemilihan Tanggal Mulai Turnamen */}
      {showStartDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Pilih Tanggal Mulai Turnamen</h3>
              <button 
                onClick={() => setShowStartDatePicker(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Silakan pilih tanggal mulai turnamen. Jadwal pertandingan akan dibuat berdasarkan tanggal ini.
              </p>
              
              <div className="flex items-center text-blue-700 bg-blue-50 p-4 rounded-lg mb-6">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm">
                    Anda dapat mengatur jadwal pertandingan di sini. Klik pada tanggal untuk melihat pertandingan pada hari tersebut.
                  </p>
                </div>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai Turnamen:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={getTodayDate()}
                max={getMaxDate()}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStartDatePicker(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium transition-colors duration-200"
              >
                Batal
              </button>
              <button
                onClick={handleGenerateJadwal}
                disabled={!startDate || isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg text-white font-medium transition-colors duration-200 flex items-center"
              >
                {isLoading ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                Buat Jadwal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Peringatan untuk hari dengan jumlah pertandingan tidak tepat 3 */}
      {pertandingan.length > 0 && hariDenganPertandinganTidakTepat3.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800 mb-2">Peringatan:</h3>
              <p className="text-yellow-700 mb-3">
                Beberapa hari memiliki jumlah pertandingan tidak tepat 3. Ini hanya diperbolehkan untuk jadwal yang tersisa dan tidak ada pilihan lain.
              </p>
              <div className="bg-white rounded-md p-3 border border-yellow-100">
                <h4 className="font-medium text-yellow-800 mb-2 text-sm">Hari dengan jumlah pertandingan tidak tepat 3:</h4>
                <ul className="list-disc pl-5 text-yellow-700 space-y-1 text-sm">
                  {hariDenganPertandinganTidakTepat3
                    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                    .map(([date, count]) => (
                      <li key={date}>
                        {formatDate(date)}: <span className="font-medium">{count} pertandingan</span>
                      </li>
                    ))
                  }
                </ul>
              </div>
            </div>
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
                <Trophy className="mr-2 h-4 w-4" />
                Statistik Jadwal
              </div>
            </button>
          </div>

          {activeTab === 'schedule' ? (
            <>
              {/* Ringkasan Jadwal */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-800 mb-3 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Ringkasan Jadwal {selectedGrup !== 'all' ? `Grup ${selectedGrup}` : 'Semua Grup'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500">Total Pertandingan:</div>
                    <div className="text-xl font-bold text-blue-700">{totalPertandingan} Pertandingan</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500">Jumlah Hari Pertandingan:</div>
                    <div className="text-xl font-bold text-blue-700">{hariPertandingan} Hari</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500">Pertandingan Selesai:</div>
                    <div className="text-xl font-bold text-blue-700">
                      {pertandinganSelesai} dari {totalPertandingan} 
                      <span className="text-sm font-normal ml-1">
                        ({Math.round((pertandinganSelesai / totalPertandingan) * 100) || 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

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
                  {selectedDate && (
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="inline-flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {pertandinganHariIni.length} Pertandingan
                      </span>
                    </div>
                  )}
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
          <div className="flex flex-col items-center">
            <div className="bg-blue-50 p-4 rounded-lg mb-6 max-w-md text-left">
              <div className="flex">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-800 mb-1">Petunjuk:</h3>
                  <p className="text-blue-700 text-sm">
                    Klik tombol "Buat Jadwal" untuk memulai. Anda akan diminta untuk memilih tanggal mulai turnamen terlebih dahulu.
                  </p>
                </div>
              </div>
            </div>
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
        </div>
      )}

      {pertandingan.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Informasi Jadwal
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Ringkasan Jadwal:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Total pertandingan: <span className="font-medium">{pertandingan.length} pertandingan</span> dalam <span className="font-medium">{availableDates.length} hari</span>.</li>
                <li>Pertandingan selesai: <span className="font-medium">{pertandingan.filter(p => p.hasil && p.hasil.selesai).length} pertandingan</span> ({Math.round((pertandingan.filter(p => p.hasil && p.hasil.selesai).length / pertandingan.length) * 100) || 0}%).</li>
                <li>Rata-rata pertandingan per hari: <span className="font-medium">{(pertandingan.length / availableDates.length).toFixed(1)} pertandingan</span>.</li>
                <li>Tanggal mulai turnamen: <span className="font-medium">{formatDate(availableDates[0])}</span></li>
                <li>Tanggal akhir turnamen: <span className="font-medium">{formatDate(availableDates[availableDates.length - 1])}</span></li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Aturan Jadwal:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Setiap hari diusahakan memiliki tepat 3 pertandingan dengan jadwal tetap.</li>
                <li>Jadwal pertandingan diatur dengan memperhatikan waktu istirahat tim.</li>
                <li>Tidak ada tim yang bermain dua kali dalam sehari.</li>
                <li>Tidak ada tim yang bermain di hari berturut-turut.</li>
                <li>Rata-rata waktu istirahat antar pertandingan untuk setiap tim: <span className="font-medium">3-5 hari</span>.</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-2">Jadwal Waktu Pertandingan:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Pertandingan 1: <span className="font-medium">13:30 - 14:35 WIB</span></li>
                <li>Pertandingan 2: <span className="font-medium">14:45 - 15:50 WIB</span></li>
                <li>Pertandingan 3: <span className="font-medium">16:00 - 17:05 WIB</span></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JadwalPertandingan;
