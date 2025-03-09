import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';
import GrupList from './components/GrupList';
import TimForm from './components/TimForm';
import PemainForm from './components/PemainForm';
import DaftarTim from './components/DaftarTim';
import JadwalPertandingan from './components/JadwalPertandingan';
import HasilPertandinganForm from './components/HasilPertandinganForm';
import Klasemen from './components/Klasemen';
import BaganGugur from './components/BaganGugur';
import HasilBabakGugurForm from './components/HasilBabakGugurForm';
import DataInitializer from './components/DataInitializer';
import FirestoreIntegration from './components/FirestoreIntegration';
import StatistikPemain from './components/StatistikPemain';
import DetailManajemenPemain from './components/DetailManajemenPemain';
import { TournamentProvider } from './context/TournamentContext';
import './index.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Menambahkan Google Font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Simulasi loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      document.head.removeChild(link);
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-green-800 to-green-600">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-3xl font-bold text-white font-['Oswald'] tracking-wider">KARTA CUP</h1>
          <p className="text-green-200 mt-2">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <TournamentProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 font-['Montserrat']">
          <Navbar />
          <div 
            className="relative pt-6 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-green-100 to-transparent z-0"></div>
            <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-green-100 to-transparent z-0"></div>
            
            {/* Main content */}
            <div className="relative z-10">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/grup" element={<GrupList />} />
                <Route path="/tim/tambah" element={<TimForm />} />
                <Route path="/tim/edit/:id" element={<TimForm />} />
                <Route path="/tim" element={<DaftarTim />} />
                <Route path="/pemain/tambah/:timId" element={<PemainForm />} />
                <Route path="/pemain/edit/:id" element={<PemainForm />} />
                <Route path="/jadwal" element={<JadwalPertandingan />} />
                <Route path="/hasil/:id" element={<HasilPertandinganForm />} />
                <Route path="/klasemen" element={<Klasemen />} />
                <Route path="/babak-gugur" element={<BaganGugur />} />
                <Route path="/babak-gugur/hasil/:id" element={<HasilBabakGugurForm />} />
                <Route path="/data-initializer" element={<DataInitializer />} />
                <Route path="/firebase-integration" element={<FirestoreIntegration />} />
                <Route path="/statistik" element={<StatistikPemain />} />
                <Route path="/manajemen-pemain" element={<DetailManajemenPemain />} />
              </Routes>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="bg-gradient-to-r from-green-800 to-green-600 text-white py-6">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm">© 2025 KARTA CUP. Semua hak dilindungi.</p>
              <p className="text-xs text-green-200 mt-1">Aplikasi Manajemen Turnamen Sepak Bola</p>
            </div>
          </footer>
        </div>
      </Router>
    </TournamentProvider>
  );
}

export default App;
