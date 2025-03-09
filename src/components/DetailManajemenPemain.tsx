import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { 
  getTeamsFromFirestore, 
  getPlayersFromFirestore,
  savePlayerToFirestore,
  deletePlayerFromFirestore 
} from '../services/firebase';
import { Shield, Users, Plus, Pencil, Trash2 } from 'lucide-react';

// Import semua komponen UI dari file index
import { 
  Button,
  Input,
  Label,
  Select,
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./ui";

interface Player {
  id: string;
  nama: string;
  nomorPunggung: string;
  posisi: string;
  timId: string;
  grup: string;
}

interface Team {
  id: string;
  nama: string;
  grup: string;
}

const DetailManajemenPemain = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedGrup, setSelectedGrup] = useState<string>('A');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newPlayer, setNewPlayer] = useState({
    nama: '',
    nomorPunggung: '',
    posisi: '',
    timId: '',
    grup: 'A'
  });

  // Load data awal
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const teamsData = await getTeamsFromFirestore();
      const playersData = await getPlayersFromFirestore();
      
      setTeams(teamsData);
      setPlayers(playersData);
    } catch (error) {
      setError('Gagal memuat data: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Filter pemain berdasarkan grup dan pencarian
  const filteredPlayers = players.filter(player => {
    const matchesGrup = player.grup === selectedGrup;
    const matchesSearch = player.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         player.nomorPunggung.includes(searchQuery);
    return matchesGrup && matchesSearch;
  });

  // Mendapatkan nama tim berdasarkan timId
  const getTeamName = (timId: string) => {
    const team = teams.find(t => t.id === timId);
    return team ? team.nama : 'Tim tidak ditemukan';
  };

  // Handler untuk menambah pemain baru
  const handleAddPlayer = async () => {
    try {
      setLoading(true);
      const playerId = Date.now().toString();
      const playerData = {
        id: playerId,
        ...newPlayer
      };

      await savePlayerToFirestore(playerData);
      setPlayers([...players, playerData]);
      setIsAddDialogOpen(false);
      setNewPlayer({
        nama: '',
        nomorPunggung: '',
        posisi: '',
        timId: '',
        grup: 'A'
      });
    } catch (error) {
      setError('Gagal menambah pemain: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk mengedit pemain
  const handleEditPlayer = async () => {
    if (!selectedPlayer) return;

    try {
      setLoading(true);
      await savePlayerToFirestore(selectedPlayer);
      setPlayers(players.map(p => p.id === selectedPlayer.id ? selectedPlayer : p));
      setIsEditDialogOpen(false);
      setSelectedPlayer(null);
    } catch (error) {
      setError('Gagal mengedit pemain: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk menghapus pemain
  const handleDeletePlayer = async (playerId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pemain ini?')) return;

    try {
      setLoading(true);
      await deletePlayerFromFirestore(playerId);
      setPlayers(players.filter(p => p.id !== playerId));
    } catch (error) {
      setError('Gagal menghapus pemain: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Mendapatkan warna berdasarkan posisi pemain
  const getPositionColor = (posisi: string) => {
    switch (posisi) {
      case 'Penyerang': return 'bg-red-100 text-red-800';
      case 'Gelandang': return 'bg-blue-100 text-blue-800';
      case 'Bertahan': return 'bg-green-100 text-green-800';
      case 'Kiper': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="animate-slide-in">
      <div className="card mb-6">
        <div className="card-header flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <Users className="mr-2 h-6 w-6" />
            Manajemen Detail Pemain
          </h1>
          <span className="badge badge-green">{filteredPlayers.length} Pemain</span>
        </div>
        <div className="card-body">
          <div className="bg-green-50 p-4 rounded-lg mb-6 border-l-4 border-green-500">
            <p className="text-green-800">
              Kelola data pemain untuk setiap tim dalam turnamen. Anda dapat menambah, mengedit, atau menghapus pemain.
            </p>
          </div>

          {/* Filter dan Pencarian */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="col-span-2">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <Input
                  type="text"
                  placeholder="Cari pemain berdasarkan nama atau nomor punggung..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 form-input"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  value={selectedGrup}
                  onValueChange={setSelectedGrup}
                  className="form-input"
                >
                  <option value="A">Grup A</option>
                  <option value="B">Grup B</option>
                  <option value="C">Grup C</option>
                  <option value="D">Grup D</option>
                </Select>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger onClick={() => setIsAddDialogOpen(true)}>
                  <Button className="btn btn-primary flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Tambah
                  </Button>
                </DialogTrigger>
                {isAddDialogOpen && (
                  <DialogContent className="card">
                    <DialogHeader className="card-header">
                      <DialogTitle className="flex items-center">
                        <Plus className="h-5 w-5 mr-2" />
                        Tambah Pemain Baru
                      </DialogTitle>
                    </DialogHeader>
                    <div className="card-body space-y-4">
                      <div className="form-group">
                        <Label className="form-label">Nama Pemain</Label>
                        <Input
                          value={newPlayer.nama}
                          onChange={(e) => setNewPlayer({...newPlayer, nama: e.target.value})}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <Label className="form-label">Nomor Punggung</Label>
                        <Input
                          value={newPlayer.nomorPunggung}
                          onChange={(e) => setNewPlayer({...newPlayer, nomorPunggung: e.target.value})}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <Label className="form-label">Posisi</Label>
                        <Select
                          value={newPlayer.posisi}
                          onValueChange={(value) => setNewPlayer({...newPlayer, posisi: value})}
                          className="form-input"
                        >
                          <option value="">Pilih Posisi</option>
                          <option value="Penyerang">Penyerang</option>
                          <option value="Gelandang">Gelandang</option>
                          <option value="Bertahan">Bertahan</option>
                          <option value="Kiper">Kiper</option>
                        </Select>
                      </div>
                      <div className="form-group">
                        <Label className="form-label">Tim</Label>
                        <Select
                          value={newPlayer.timId}
                          onValueChange={(value) => setNewPlayer({...newPlayer, timId: value})}
                          className="form-input"
                        >
                          <option value="">Pilih Tim</option>
                          {teams
                            .filter(team => team.grup === selectedGrup)
                            .map(team => (
                              <option key={team.id} value={team.id}>{team.nama}</option>
                            ))
                          }
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="btn btn-outline">
                          Batal
                        </Button>
                        <Button onClick={handleAddPlayer} disabled={loading} className="btn btn-primary">
                          {loading ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                )}
              </Dialog>
            </div>
          </div>

          {/* Tampilkan error jika ada */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Tabel Pemain */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-green-700">Memuat data...</span>
            </div>
          ) : filteredPlayers.length > 0 ? (
            <div className="table-container">
              <Table className="table">
                <TableHeader className="table-header">
                  <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Nama Pemain</TableHead>
                    <TableHead className="text-center">Posisi</TableHead>
                    <TableHead>Tim</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.map((player, index) => (
                    <TableRow key={player.id} className="table-row hover-lift">
                      <TableCell className="font-bold text-center">{player.nomorPunggung}</TableCell>
                      <TableCell className="font-medium">{player.nama}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPositionColor(player.posisi)}`}>
                          {player.posisi}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-green-600" />
                          {getTeamName(player.timId)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPlayer(player);
                              setIsEditDialogOpen(true);
                            }}
                            className="btn btn-outline"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePlayer(player.id)}
                            className="btn btn-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500">Tidak ada pemain</h3>
              <p className="text-gray-400 mt-2">
                Belum ada pemain yang terdaftar untuk Grup {selectedGrup}
              </p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)} 
                className="btn btn-primary mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pemain Baru
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialog Edit Pemain */}
      {selectedPlayer && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="card">
            <DialogHeader className="card-header">
              <DialogTitle className="flex items-center">
                <Pencil className="h-5 w-5 mr-2" />
                Edit Pemain
              </DialogTitle>
            </DialogHeader>
            <div className="card-body space-y-4">
              <div className="form-group">
                <Label className="form-label">Nama Pemain</Label>
                <Input
                  value={selectedPlayer.nama}
                  onChange={(e) => setSelectedPlayer({...selectedPlayer, nama: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <Label className="form-label">Nomor Punggung</Label>
                <Input
                  value={selectedPlayer.nomorPunggung}
                  onChange={(e) => setSelectedPlayer({...selectedPlayer, nomorPunggung: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <Label className="form-label">Posisi</Label>
                <Select
                  value={selectedPlayer.posisi}
                  onValueChange={(value) => setSelectedPlayer({...selectedPlayer, posisi: value})}
                  className="form-input"
                >
                  <option value="">Pilih Posisi</option>
                  <option value="Penyerang">Penyerang</option>
                  <option value="Gelandang">Gelandang</option>
                  <option value="Bertahan">Bertahan</option>
                  <option value="Kiper">Kiper</option>
                </Select>
              </div>
              <div className="form-group">
                <Label className="form-label">Tim</Label>
                <Select
                  value={selectedPlayer.timId}
                  onValueChange={(value) => setSelectedPlayer({...selectedPlayer, timId: value})}
                  className="form-input"
                >
                  <option value="">Pilih Tim</option>
                  {teams
                    .filter(team => team.grup === selectedPlayer.grup)
                    .map(team => (
                      <option key={team.id} value={team.id}>{team.nama}</option>
                    ))
                  }
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="btn btn-outline">
                  Batal
                </Button>
                <Button onClick={handleEditPlayer} disabled={loading} className="btn btn-primary">
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DetailManajemenPemain; 