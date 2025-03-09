import { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { 
  initializeTeamsToFirestore, 
  initializePlayersToFirestore,
  deleteCollectionData,
  getTeamsFromFirestore,
  getPlayersFromFirestore,
  db
} from '../services/firebase';
import { ArrowUpFromLine, ArrowDownToLine, Database, Loader, Trash2, AlertCircle } from 'lucide-react';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const DataInitializer = () => {
  const { teams, loadTeamsFromFirestore } = useTournament();
  
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  const [firebaseConnected, setFirebaseConnected] = useState<boolean | null>(null);

  // Periksa koneksi Firebase saat komponen dimuat
  useEffect(() => {
    const checkFirebaseConnection = async () => {
      try {
        // Coba mengambil data sederhana untuk memeriksa koneksi
        const testCollection = await getTeamsFromFirestore();
        console.log("Firebase connection successful");
        setFirebaseConnected(true);
      } catch (error) {
        console.error("Firebase connection error:", error);
        setFirebaseConnected(false);
        setStatus({
          type: 'error',
          message: `Gagal terhubung ke Firebase: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    };

    checkFirebaseConnection();
  }, []);

  // Fungsi untuk menginisialisasi data tim ke Firestore
  const handleInitializeTeams = async () => {
    if (!firebaseConnected) {
      setStatus({
        type: 'error',
        message: 'Tidak dapat terhubung ke Firebase. Periksa konfigurasi Firebase Anda.'
      });
      return;
    }

    try {
      setIsLoading(true);
      setStatus({ type: 'info', message: 'Menginisialisasi data tim ke Firestore...' });

      await initializeTeamsToFirestore(teams);
      
      setStatus({ 
        type: 'success', 
        message: 'Data tim berhasil diinisialisasi ke Firestore!' 
      });
    } catch (error) {
      console.error("Error saat inisialisasi data tim:", error);
      setStatus({ 
        type: 'error', 
        message: `Gagal menginisialisasi data tim: ${error instanceof Error ? error.message : String(error)}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk menginisialisasi data pemain ke Firestore
  const handleInitializePlayers = async () => {
    if (!firebaseConnected) {
      setStatus({
        type: 'error',
        message: 'Tidak dapat terhubung ke Firebase. Periksa konfigurasi Firebase Anda.'
      });
      return;
    }

    try {
      setIsLoading(true);
      setStatus({ type: 'info', message: 'Menginisialisasi data pemain ke Firestore...' });

      await initializePlayersToFirestore(teams);
      
      setStatus({ 
        type: 'success', 
        message: 'Data pemain berhasil diinisialisasi ke Firestore!' 
      });
    } catch (error) {
      console.error("Error saat inisialisasi data pemain:", error);
      setStatus({ 
        type: 'error', 
        message: `Gagal menginisialisasi data pemain: ${error instanceof Error ? error.message : String(error)}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk menginisialisasi data tim dan pemain sekaligus
  const handleInitializeAll = async () => {
    if (!firebaseConnected) {
      setStatus({
        type: 'error',
        message: 'Tidak dapat terhubung ke Firebase. Periksa konfigurasi Firebase Anda.'
      });
      return;
    }

    try {
      setIsLoading(true);
      setStatus({ type: 'info', message: 'Menginisialisasi data tim dan pemain ke Firestore...' });

      // Inisialisasi tim
      await initializeTeamsToFirestore(teams);
      
      // Inisialisasi pemain
      await initializePlayersToFirestore(teams);
      
      setStatus({ 
        type: 'success', 
        message: 'Data tim dan pemain berhasil diinisialisasi ke Firestore!' 
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
    if (!firebaseConnected) {
      setStatus({
        type: 'error',
        message: 'Tidak dapat terhubung ke Firebase. Periksa konfigurasi Firebase Anda.'
      });
      return;
    }

    try {
      setIsLoading(true);
      setStatus({ type: 'info', message: 'Mengambil data dari Firestore...' });

      // Ambil data tim
      const teamsData = await getTeamsFromFirestore();
      
      // Ambil data pemain
      const playersData = await getPlayersFromFirestore();

      // Update state dalam context
      await loadTeamsFromFirestore(teamsData, playersData);
      
      setStatus({ 
        type: 'success', 
        message: 'Data tim dan pemain berhasil dimuat dari Firestore!' 
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

  // Fungsi untuk menghapus data tim
  const handleDeleteTeams = async () => {
    if (!firebaseConnected) {
      setStatus({
        type: 'error',
        message: 'Tidak dapat terhubung ke Firebase. Periksa konfigurasi Firebase Anda.'
      });
      return;
    }

    if (!window.confirm('Apakah Anda yakin ingin menghapus semua data tim dari Firestore?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      setStatus({ type: 'info', message: 'Menghapus data tim dari Firestore...' });

      await deleteCollectionData('teams');
      
      setStatus({ 
        type: 'success', 
        message: 'Data tim berhasil dihapus dari Firestore!' 
      });
    } catch (error) {
      console.error("Error saat menghapus data tim:", error);
      setStatus({ 
        type: 'error', 
        message: `Gagal menghapus data tim: ${error instanceof Error ? error.message : String(error)}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk menghapus data pemain
  const handleDeletePlayers = async () => {
    if (!firebaseConnected) {
      setStatus({
        type: 'error',
        message: 'Tidak dapat terhubung ke Firebase. Periksa konfigurasi Firebase Anda.'
      });
      return;
    }

    if (!window.confirm('Apakah Anda yakin ingin menghapus semua data pemain dari Firestore?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      setStatus({ type: 'info', message: 'Menghapus data pemain dari Firestore...' });

      await deleteCollectionData('players');
      
      setStatus({ 
        type: 'success', 
        message: 'Data pemain berhasil dihapus dari Firestore!' 
      });
    } catch (error) {
      console.error("Error saat menghapus data pemain:", error);
      setStatus({ 
        type: 'error', 
        message: `Gagal menghapus data pemain: ${error instanceof Error ? error.message : String(error)}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Inisialisasi Data</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
          <Database className="mr-2 h-5 w-5 text-blue-600" />
          Inisialisasi Data ke Firebase Firestore
        </h2>
        
        <p className="text-gray-600 mb-6">
          Gunakan tombol di bawah untuk menginisialisasi data tim dan pemain ke Firebase Firestore.
          Data yang sudah ada di Firestore akan diperbarui jika memiliki ID yang sama.
        </p>

        {firebaseConnected === false && (
          <div className="mb-6 p-4 rounded-md bg-red-50 text-red-700 border border-red-200 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Tidak dapat terhubung ke Firebase</p>
              <p className="text-sm mt-1">
                Pastikan konfigurasi Firebase Anda benar dan Anda memiliki koneksi internet yang stabil.
                Periksa juga apakah Project ID dan kredensial lainnya sudah benar.
              </p>
            </div>
          </div>
        )}

        {status.type && (
          <div className={`mb-6 p-4 rounded-md ${
            status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
            status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {status.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleInitializeTeams}
            disabled={isLoading || firebaseConnected === false}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-md shadow-sm transition-colors"
          >
            {isLoading ? (
              <Loader className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ArrowUpFromLine className="mr-2 h-5 w-5" />
            )}
            Inisialisasi Data Tim
          </button>

          <button
            onClick={handleInitializePlayers}
            disabled={isLoading || firebaseConnected === false}
            className="flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-6 rounded-md shadow-sm transition-colors"
          >
            {isLoading ? (
              <Loader className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ArrowUpFromLine className="mr-2 h-5 w-5" />
            )}
            Inisialisasi Data Pemain
          </button>
        </div>

        <button
          onClick={handleInitializeAll}
          disabled={isLoading || firebaseConnected === false}
          className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-6 rounded-md shadow-sm transition-colors mb-8"
        >
          {isLoading ? (
            <Loader className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <ArrowUpFromLine className="mr-2 h-5 w-5" />
          )}
          Inisialisasi Semua Data (Tim & Pemain)
        </button>

        <div className="border-t border-gray-200 pt-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Ambil Data dari Firestore</h3>
          <button
            onClick={handleLoadFromFirestore}
            disabled={isLoading || firebaseConnected === false}
            className="w-full flex items-center justify-center bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white py-3 px-6 rounded-md shadow-sm transition-colors"
          >
            {isLoading ? (
              <Loader className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ArrowDownToLine className="mr-2 h-5 w-5" />
            )}
            Ambil Data dari Firestore
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Tombol ini akan mengambil data tim dan pemain dari Firestore dan memperbarui data lokal.
            Data lokal yang ada akan digantikan dengan data dari Firestore.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Hapus Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleDeleteTeams}
              disabled={isLoading || firebaseConnected === false}
              className="flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 px-6 rounded-md shadow-sm transition-colors"
            >
              {isLoading ? (
                <Loader className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-5 w-5" />
              )}
              Hapus Data Tim
            </button>

            <button
              onClick={handleDeletePlayers}
              disabled={isLoading || firebaseConnected === false}
              className="flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 px-6 rounded-md shadow-sm transition-colors"
            >
              {isLoading ? (
                <Loader className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-5 w-5" />
              )}
              Hapus Data Pemain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataInitializer;
