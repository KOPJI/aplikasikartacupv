import { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { 
  initializeTeamsToFirestore, 
  initializePlayersToFirestore,
  initializeMatchesToFirestore,
  initializeKnockoutMatchesToFirestore,
  getTeamsFromFirestore,
  getPlayersFromFirestore,
  getMatchesFromFirestore,
  getKnockoutMatchesFromFirestore
} from '../services/firebase';
import { ArrowDownToLine, ArrowUpFromLine, Database, RefreshCcw } from 'lucide-react';

const FirestoreIntegration = () => {
  const { 
    teams, 
    pertandingan, 
    pertandinganBabakGugur,
    loadTeamsFromFirestore,
    loadMatchesFromFirestore,
    loadKnockoutMatchesFromFirestore
  } = useTournament();
  
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // Fungsi untuk mengirim data ke Firestore
  const handleSendToFirestore = async () => {
    try {
      setIsLoading(true);
      setStatus({ type: 'info', message: 'Menginisialisasi data ke Firestore...' });

      // Inisialisasi tim
      await initializeTeamsToFirestore(teams);
      
      // Inisialisasi pemain
      await initializePlayersToFirestore(teams);
      
      // Inisialisasi pertandingan
      await initializeMatchesToFirestore(pertandingan);
      
      // Inisialisasi babak gugur
      await initializeKnockoutMatchesToFirestore(pertandinganBabakGugur);
      
      setStatus({ 
        type: 'success', 
        message: 'Data berhasil diinisialisasi ke Firestore!' 
      });
    } catch (error) {
      console.error("Error saat inisialisasi data:", error);
      setStatus({ 
        type: 'error', 
        message: `Gagal menginisialisasi data: ${error instanceof Error ? error.message : String(error)}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk mengambil data dari Firestore
  const handleLoadFromFirestore = async () => {
    try {
      setIsLoading(true);
      setStatus({ type: 'info', message: 'Mengambil data dari Firestore...' });

      // Ambil data tim
      const teamsData = await getTeamsFromFirestore();
      
      // Ambil data pemain
      const playersData = await getPlayersFromFirestore();
      
      // Ambil data pertandingan
      const matchesData = await getMatchesFromFirestore();

      // Ambil data babak gugur
      const knockoutMatchesData = await getKnockoutMatchesFromFirestore();

      // Update state dalam context
      await loadTeamsFromFirestore(teamsData, playersData);
      await loadMatchesFromFirestore(matchesData);
      await loadKnockoutMatchesFromFirestore(knockoutMatchesData);
      
      setStatus({ 
        type: 'success', 
        message: 'Data berhasil dimuat dari Firestore!' 
      });
    } catch (error) {
      console.error("Error saat memuat data:", error);
      setStatus({ 
        type: 'error', 
        message: `Gagal memuat data: ${error instanceof Error ? error.message : String(error)}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk sinkronisasi dua arah
  const handleSyncWithFirestore = async () => {
    try {
      setIsLoading(true);
      setStatus({ type: 'info', message: 'Melakukan sinkronisasi data dengan Firestore...' });

      // Kirim semua data lokal ke Firestore
      await handleSendToFirestore();

      // Ambil kembali data dari Firestore untuk memastikan konsistensi
      await handleLoadFromFirestore();
      
      setStatus({ 
        type: 'success', 
        message: 'Sinkronisasi data dengan Firestore berhasil!' 
      });
    } catch (error) {
      console.error("Error saat sinkronisasi data:", error);
      setStatus({ 
        type: 'error', 
        message: `Gagal sinkronisasi data: ${error instanceof Error ? error.message : String(error)}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Integrasi Firebase</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
          <Database className="mr-2 h-5 w-5 text-blue-600" />
          Integrasi dengan Firebase Firestore
        </h2>
        
        <p className="text-gray-600 mb-6">
          Gunakan tombol di bawah untuk menginisialisasi data tim dan pemain ke Firebase Firestore atau sebaliknya. 
          Data yang diinisialisasi mencakup tim, pemain, jadwal pertandingan, dan hasil pertandingan.
        </p>

        {status.type && (
          <div className={`mb-6 p-4 rounded-md ${
            status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
            status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {status.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleSendToFirestore}
            disabled={isLoading}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-md shadow-sm transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Proses...
              </span>
            ) : (
              <>
                <ArrowUpFromLine className="mr-2 h-5 w-5" />
                Kirim ke Firestore
              </>
            )}
          </button>

          <button
            onClick={handleLoadFromFirestore}
            disabled={isLoading}
            className="flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-6 rounded-md shadow-sm transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Proses...
              </span>
            ) : (
              <>
                <ArrowDownToLine className="mr-2 h-5 w-5" />
                Ambil dari Firestore
              </>
            )}
          </button>

          <button
            onClick={handleSyncWithFirestore}
            disabled={isLoading}
            className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-6 rounded-md shadow-sm transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Proses...
              </span>
            ) : (
              <>
                <RefreshCcw className="mr-2 h-5 w-5" />
                Sinkronisasi 2 Arah
              </>
            )}
          </button>
        </div>

        <div className="mt-6 bg-gray-50 rounded-md p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Informasi Integrasi</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Data tim akan disimpan di koleksi <code className="bg-gray-100 px-1 rounded">teams</code></li>
            <li>Data pemain akan disimpan di koleksi <code className="bg-gray-100 px-1 rounded">players</code></li>
            <li>Jadwal dan hasil pertandingan grup akan disimpan di koleksi <code className="bg-gray-100 px-1 rounded">matches</code></li>
            <li>Jadwal dan hasil babak gugur akan disimpan di koleksi <code className="bg-gray-100 px-1 rounded">knockouts</code></li>
            <li>Data statistik pemain (gol, kartu) akan disimpan di koleksi terpisah</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FirestoreIntegration;
