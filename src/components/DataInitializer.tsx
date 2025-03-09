import { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { 
  initializeTeamsToFirestore, 
  initializePlayersToFirestore,
  deleteCollectionData
} from '../services/firebase';
import { ArrowUpFromLine, Database, Loader, Trash2 } from 'lucide-react';

const DataInitializer = () => {
  const { teams } = useTournament();
  
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // Fungsi untuk menginisialisasi data tim ke Firestore
  const handleInitializeTeams = async () => {
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

  // Fungsi untuk menghapus data tim
  const handleDeleteTeams = async () => {
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
            disabled={isLoading}
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
            disabled={isLoading}
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
          disabled={isLoading}
          className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-6 rounded-md shadow-sm transition-colors mb-8"
        >
          {isLoading ? (
            <Loader className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <ArrowUpFromLine className="mr-2 h-5 w-5" />
          )}
          Inisialisasi Semua Data (Tim & Pemain)
        </button>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Hapus Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleDeleteTeams}
              disabled={isLoading}
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
              disabled={isLoading}
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
