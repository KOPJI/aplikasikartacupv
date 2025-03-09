import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Shield } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';

const TimForm = () => {
  const { addTeam, getTeam, updateTeam } = useTournament();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [formData, setFormData] = useState({
    nama: '',
    logo: '',
    grup: 'A',
  });
  
  const [error, setError] = useState('');
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  
  const isEdit = Boolean(id);
  
  useEffect(() => {
    if (isEdit && id) {
      const tim = getTeam(id);
      if (tim) {
        setFormData({
          nama: tim.nama,
          logo: tim.logo,
          grup: tim.grup,
        });
        
        if (tim.logo) {
          setPreviewLogo(tim.logo);
        }
      } else {
        navigate('/tim');
      }
    }
  }, [id, isEdit, getTeam, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData({ ...formData, logo: result });
      setPreviewLogo(result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama.trim()) {
      setError('Nama tim harus diisi');
      return;
    }
    
    try {
      if (isEdit && id) {
        const tim = getTeam(id);
        if (tim) {
          updateTeam({
            ...tim,
            nama: formData.nama,
            logo: formData.logo,
            grup: formData.grup,
          });
        }
      } else {
        addTeam(formData);
      }
      navigate('/tim');
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan data');
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/tim')}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Edit Tim' : 'Tambah Tim Baru'}
        </h1>
      </div>
      
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
                Nama Tim
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan nama tim"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo Tim
              </label>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 border border-gray-300 rounded-md flex items-center justify-center overflow-hidden bg-gray-100">
                    {previewLogo ? (
                      <img src={previewLogo} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="flex-grow">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Pilih gambar logo tim. PNG, JPG, or GIF (maks. 2MB).
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grup
              </label>
              <select
                name="grup"
                value={formData.grup}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="A">Grup A</option>
                <option value="B">Grup B</option>
                <option value="C">Grup C</option>
                <option value="D">Grup D</option>
              </select>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? 'Simpan Perubahan' : 'Tambah Tim'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimForm;
