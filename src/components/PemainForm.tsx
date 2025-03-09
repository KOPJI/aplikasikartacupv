import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Users } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';

const PemainForm = () => {
  const { addPlayer, getTeam, getPlayer, updatePlayer } = useTournament();
  const navigate = useNavigate();
  // @ts-ignore
  const { id, timId } = useParams<{ id?: string; timId?: string }>();
  
  const [formData, setFormData] = useState({
    nama: '',
    nomorPunggung: 0,
    posisi: '',
    timId: timId || '',
  });
  
  const [error, setError] = useState('');
  const isEdit = Boolean(id);
  
  useEffect(() => {
    if (isEdit && id) {
      const pemain = getPlayer(id);
      if (pemain) {
        setFormData({
          nama: pemain.nama,
          nomorPunggung: pemain.nomorPunggung,
          posisi: pemain.posisi,
          timId: pemain.timId,
        });
      } else {
        navigate('/tim');
      }
    } else if (timId) {
      const tim = getTeam(timId);
      if (!tim) {
        navigate('/tim');
      }
    }
  }, [id, timId, isEdit, getPlayer, getTeam, navigate]);
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'nomorPunggung' ? parseInt(value) || 0 : value,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama.trim()) {
      setError('Nama pemain harus diisi');
      return;
    }
    
    if (formData.nomorPunggung <= 0) {
      setError('Nomor punggung harus lebih dari 0');
      return;
    }
    
    if (!formData.posisi.trim()) {
      setError('Posisi pemain harus diisi');
      return;
    }
    
    try {
      if (isEdit && id) {
        updatePlayer({
          id,
          nama: formData.nama,
          nomorPunggung: formData.nomorPunggung,
          posisi: formData.posisi,
          timId: formData.timId,
        });
      } else {
        addPlayer(formData);
      }
      navigate('/tim');
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan data');
    }
  };
  
  // Get current team name
  const currentTeam = getTeam(formData.timId);
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/tim')}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold flex items-center">
          <Users className="mr-2 h-5 w-5" />
          {id ? 'Edit Pemain' : 'Tambah Pemain Baru'}
        </h1>
      </div>
      
      {currentTeam && (
        <div className="mb-4 flex items-center bg-blue-50 text-blue-700 p-3 rounded-md">
          <Users className="mr-2 h-5 w-5" />
          Tim: <span className="font-semibold ml-1">{currentTeam.nama}</span>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Pemain
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan nama pemain"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Punggung
              </label>
              <input
                type="number"
                name="nomorPunggung"
                value={formData.nomorPunggung || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nomor punggung"
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Posisi
              </label>
              <select
                name="posisi"
                value={formData.posisi}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">Pilih Posisi</option>
                <option value="Penjaga Gawang">Penjaga Gawang</option>
                <option value="Bek">Bek</option>
                <option value="Gelandang">Gelandang</option>
                <option value="Penyerang">Penyerang</option>
              </select>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? 'Simpan Perubahan' : 'Tambah Pemain'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PemainForm;
