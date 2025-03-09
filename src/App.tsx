import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
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
  useEffect(() => {
    // Menambahkan Google Font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <TournamentProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <div className="container mx-auto py-6 px-4">
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
      </Router>
    </TournamentProvider>
  );
}

export default App;
