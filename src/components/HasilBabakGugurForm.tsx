import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Shield, Trash2 } from 'lucide-react';
import { useTournament, PencetakGol, KartuPemain } from '../context/TournamentContext';

const HasilBabakGugurForm = () => {
  // @ts-ignore
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getPertandinganBabakGugurById, 
    getTeam, 
    getTeamPlayers,
    simpanHasilBabakGugur 
  } = useTournament();
  
  const [error, setError] = useState('');
  const [match, setMatch] = useState<any>(null);
  const [timA, setTimA] = useState<any>(null);
  const [timB, setTimB] = useState<any>(null);
  const [pemainTimA, setPemainTimA] = useState<any[]>([]);
  const [pemainTimB, setPemainTimB] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    skorTimA: 0,
    skorTimB: 0,
    pencetakGol: [] as PencetakGol[],
    kartu: [] as KartuPemain[],
    selesai: true
  });
  
  // Load match data
  useEffect(() => {
    if (!id) return;
    
    const selectedMatch = getPertandinganBabakGugurById(id);
    if (!selectedMatch) {
      navigate('/babak-gugur');
      return;
    }
    
    setMatch(selectedMatch);
    
    // Load team data
    if (selectedMatch.timA && selectedMatch.timB) {
      const teamA = getTeam(selectedMatch.timA);
      const teamB = getTeam(selectedMatch.timB);
      setTimA(teamA);
      setTimB(teamB);
      
      // Load players
      if (teamA) setPemainTimA(getTeamPlayers(teamA.id));
      if (teamB) setPemainTimB(getTeamPlayers(teamB.id));
    } else {
      navigate('/babak-gugur');
      return;
    }
    
    // If result exists, load it
    if (selectedMatch.hasil) {
      setFormData({
        skorTimA: selectedMatch.hasil.skorTimA,
        skorTimB: selectedMatch.hasil.skorTimB,
        pencetakGol: selectedMatch.hasil.pencetakGol,
        kartu: selectedMatch.hasil.kartu,
        selesai: selectedMatch.hasil.selesai
      });
    }
  }, [id, getPertandinganBabakGugurById, getTeam, getTeamPlayers, navigate]);
  
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
  
  // Fungsi helper untuk mendapatkan label tahap
  const getTahapLabel = (tahap: string) => {
    switch (tahap) {
      case 'perempat': return 'Perempat Final';
      case 'semifinal': return 'Semifinal';
      case 'final': return 'Final';
      default: return tahap;
    }
  };
  
  // Handle scoring changes
  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value) || 0
    });
  };
  
  // Add goal scorer
  const addGoalScorer = () => {
    setFormData({
      ...formData,
      pencetakGol: [
        ...formData.pencetakGol,
        {
          pertandinganId: id || '',
          pemainId: '',
          jumlah: 1
        }
      ]
    });
  };
  
  // Update goal scorer
  const updateGoalScorer = (index: number, field: string, value: string | number) => {
    const updatedScorers = [...formData.pencetakGol];
    updatedScorers[index] = {
      ...updatedScorers[index],
      [field]: field === 'jumlah' ? parseInt(value as string) || 1 : value
    };
    
    setFormData({
      ...formData,
      pencetakGol: updatedScorers
    });
  };
  
  // Remove goal scorer
  const removeGoalScorer = (index: number) => {
    const updatedScorers = [...formData.pencetakGol];
    updatedScorers.splice(index, 1);
    
    setFormData({
      ...formData,
      pencetakGol: updatedScorers
    });
  };
  
  // Add card
  const addCard = (jenis: 'kuning' | 'merah') => {
    setFormData({
      ...formData,
      kartu: [
        ...formData.kartu,
        {
          pertandinganId: id || '',
          pemainId: '',
          jenis,
          jumlah: 1
        }
      ]
    });
  };
  
  // Update card
  const updateCard = (index: number, field: string, value: string | number) => {
    const updatedCards = [...formData.kartu];
    updatedCards[index] = {
      ...updatedCards[index],
      [field]: field === 'jumlah' ? parseInt(value as string) || 1 : value
    };
    
    setFormData({
      ...formData,
      kartu: updatedCards
    });
  };
  
  // Remove card
  const removeCard = (index: number) => {
    setFormData({
      ...formData,
      kartu: formData.kartu.filter((_, i) => i !== index)
    });
  };
  
  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate goal count matches scorers
    const totalGoalsA = formData.pencetakGol
      .filter(g => {
        const player = pemainTimA.find(p => p.id === g.pemainId);
        return !!player;
      })
      .reduce((sum, g) => sum + g.jumlah, 0);
      
    const totalGoalsB = formData.pencetakGol
      .filter(g => {
        const player = pemainTimB.find(p => p.id === g.pemainId);
        return !!player;
      })
      .reduce((sum, g) => sum + g.jumlah, 0);
    
    if (totalGoalsA !== formData.skorTimA) {
      setError(`Jumlah gol oleh pemain Tim A (${totalGoalsA}) tidak sesuai dengan skor Tim A (${formData.skorTimA})`);
      return;
    }
    
    if (totalGoalsB !== formData.skorTimB) {
      setError(`Jumlah gol oleh pemain Tim B (${totalGoalsB}) tidak sesuai dengan skor Tim B (${formData.skorTimB})`);
      return;
    }
    
    // Validate all scorers have player IDs
    const invalidScorers = formData.pencetakGol.filter(g => !g.pemainId);
    if (invalidScorers.length > 0) {
      setError('Semua pencetak gol harus dipilih');
      return;
    }
    
    // Validate all cards have player IDs
    const invalidCards = formData.kartu.filter(c => !c.pemainId);
    if (invalidCards.length > 0) {
      setError('Semua pemain penerima kartu harus dipilih');
      return;
    }
    
    if (formData.skorTimA === formData.skorTimB) {
      // Di babak gugur tidak boleh seri
      if (!window.confirm('Skor seri tidak diperbolehkan di babak gugur. Tim A akan dinyatakan sebagai pemenang. Lanjutkan?')) {
        return;
      }
    }
    
    try {
      simpanHasilBabakGugur({
        pertandinganId: id || '',
        skorTimA: formData.skorTimA,
        skorTimB: formData.skorTimB,
        pencetakGol: formData.pencetakGol,
        kartu: formData.kartu,
        selesai: true
      });
      
      navigate('/babak-gugur');
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan hasil');
    }
  };
  
  if (!match || !timA || !timB) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">Memuat data pertandingan...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/babak-gugur')}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Input Hasil {getTahapLabel(match.tahap)}
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {getTahapLabel(match.tahap)} #{match.nomorPertandingan}
            </span>
            <span className="ml-2 text-gray-600 text-sm">
              {match.waktu} WIB
            </span>
          </div>
          <div className="text-gray-700 mt-2 md:mt-0">
            {formatDate(match.tanggal)}
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mb-2">
              {timA.logo ? (
                <img src={timA.logo} alt={timA.nama} className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <span className="font-semibold text-lg">{timA.nama}</span>
          </div>
          
          <div className="mx-4 text-center font-bold text-gray-500">
            VS
          </div>
          
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mb-2">
              {timB.logo ? (
                <img src={timB.logo} alt={timB.nama} className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <span className="font-semibold text-lg">{timB.nama}</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Skor Pertandingan</h2>
          
          <div className="flex items-center justify-center space-x-8">
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                {timA.nama}
              </label>
              <input
                type="number"
                name="skorTimA"
                value={formData.skorTimA}
                onChange={handleScoreChange}
                min="0"
                className="text-center w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl font-bold"
              />
            </div>
            
            <div className="text-xl font-bold text-gray-500">-</div>
            
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                {timB.nama}
              </label>
              <input
                type="number"
                name="skorTimB"
                value={formData.skorTimB}
                onChange={handleScoreChange}
                min="0"
                className="text-center w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl font-bold"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Pencetak Gol</h2>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => addGoalScorer()}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah Pencetak Gol
              </button>
              <button
                type="button"
                onClick={() => addGoalScorer()}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center ml-4"
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah Assist
              </button>
            </div>
          </div>
          
          {formData.pencetakGol.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Belum ada pencetak gol yang ditambahkan
            </div>
          ) : (
            <div className="space-y-3">
              {formData.pencetakGol.map((scorer, index) => (
                <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md">
                  <div className="flex-1">
                    <select
                      value={scorer.pemainId}
                      onChange={(e) => updateGoalScorer(index, 'pemainId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Pilih Pemain</option>
                      <optgroup label={timA.nama}>
                        {pemainTimA.map(player => (
                          <option key={`A-${player.id}`} value={player.id}>
                            {player.nama} ({player.nomorPunggung})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label={timB.nama}>
                        {pemainTimB.map(player => (
                          <option key={`B-${player.id}`} value={player.id}>
                            {player.nama} ({player.nomorPunggung})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      value={scorer.jumlah}
                      onChange={(e) => updateGoalScorer(index, 'jumlah', e.target.value)}
                      min="1"
                      className="w-full text-center px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Jumlah"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGoalScorer(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Kartu</h2>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => addCard('kuning')}
                className="text-yellow-600 hover:text-yellow-800 text-sm font-medium flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah Kartu Kuning
              </button>
              <button
                type="button"
                onClick={() => addCard('merah')}
                className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center ml-4"
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah Kartu Merah
              </button>
            </div>
          </div>
          
          {formData.kartu.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Belum ada kartu yang diberikan
            </div>
          ) : (
            <div className="space-y-3">
              {formData.kartu.map((card, index) => (
                <div 
                  key={index} 
                  className={`flex items-center space-x-3 p-3 rounded-md ${
                    card.jenis === 'kuning' ? 'bg-yellow-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex-1">
                    <select
                      value={card.pemainId}
                      onChange={(e) => updateCard(index, 'pemainId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Pilih Pemain</option>
                      <optgroup label={timA.nama}>
                        {pemainTimA.map(player => (
                          <option key={`A-${player.id}`} value={player.id}>
                            {player.nama} ({player.nomorPunggung})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label={timB.nama}>
                        {pemainTimB.map(player => (
                          <option key={`B-${player.id}`} value={player.id}>
                            {player.nama} ({player.nomorPunggung})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div className="w-32">
                    <select
                      value={card.jenis}
                      onChange={(e) => updateCard(index, 'jenis', e.target.value as 'kuning' | 'merah')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="kuning">Kuning</option>
                      <option value="merah">Merah</option>
                    </select>
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      value={card.jumlah}
                      onChange={(e) => updateCard(index, 'jumlah', e.target.value)}
                      min="1"
                      className="w-full text-center px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Jumlah"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCard(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Save className="h-4 w-4 mr-2" />
            Simpan Hasil Pertandingan
          </button>
        </div>
      </form>
    </div>
  );
};

export default HasilBabakGugurForm;
