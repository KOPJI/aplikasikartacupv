import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { 
  getTeamsFromFirestore, 
  getPlayersFromFirestore,
  savePlayerToFirestore,
  deletePlayerFromFirestore 
} from '../services/firebase';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";

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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manajemen Detail Pemain</h1>

      {/* Filter dan Pencarian */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Input
              type="text"
              placeholder="Cari pemain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select
          value={selectedGrup}
          onValueChange={setSelectedGrup}
          className="w-32"
        >
          <option value="A">Grup A</option>
          <option value="B">Grup B</option>
          <option value="C">Grup C</option>
          <option value="D">Grup D</option>
        </Select>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger onClick={() => setIsAddDialogOpen(true)}>
            <Button className="flex items-center gap-2">
              Tambah Pemain
            </Button>
          </DialogTrigger>
          {isAddDialogOpen && (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Pemain Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nama Pemain</Label>
                  <Input
                    value={newPlayer.nama}
                    onChange={(e) => setNewPlayer({...newPlayer, nama: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Nomor Punggung</Label>
                  <Input
                    value={newPlayer.nomorPunggung}
                    onChange={(e) => setNewPlayer({...newPlayer, nomorPunggung: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Posisi</Label>
                  <Select
                    value={newPlayer.posisi}
                    onValueChange={(value) => setNewPlayer({...newPlayer, posisi: value})}
                  >
                    <option value="">Pilih Posisi</option>
                    <option value="Penyerang">Penyerang</option>
                    <option value="Gelandang">Gelandang</option>
                    <option value="Bertahan">Bertahan</option>
                    <option value="Kiper">Kiper</option>
                  </Select>
                </div>
                <div>
                  <Label>Tim</Label>
                  <Select
                    value={newPlayer.timId}
                    onValueChange={(value) => setNewPlayer({...newPlayer, timId: value})}
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
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleAddPlayer} disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>

      {/* Tabel Pemain */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Nama Pemain</TableHead>
              <TableHead>Nomor Punggung</TableHead>
              <TableHead>Posisi</TableHead>
              <TableHead>Tim</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.map((player, index) => (
              <TableRow key={player.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{player.nama}</TableCell>
                <TableCell>{player.nomorPunggung}</TableCell>
                <TableCell>{player.posisi}</TableCell>
                <TableCell>{getTeamName(player.timId)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPlayer(player);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePlayer(player.id)}
                    >
                      Hapus
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Edit Pemain */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {isEditDialogOpen && selectedPlayer && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Pemain</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nama Pemain</Label>
                <Input
                  value={selectedPlayer.nama}
                  onChange={(e) => setSelectedPlayer({...selectedPlayer, nama: e.target.value})}
                />
              </div>
              <div>
                <Label>Nomor Punggung</Label>
                <Input
                  value={selectedPlayer.nomorPunggung}
                  onChange={(e) => setSelectedPlayer({...selectedPlayer, nomorPunggung: e.target.value})}
                />
              </div>
              <div>
                <Label>Posisi</Label>
                <Select
                  value={selectedPlayer.posisi}
                  onValueChange={(value) => setSelectedPlayer({...selectedPlayer, posisi: value})}
                >
                  <option value="Penyerang">Penyerang</option>
                  <option value="Gelandang">Gelandang</option>
                  <option value="Bertahan">Bertahan</option>
                  <option value="Kiper">Kiper</option>
                </Select>
              </div>
              <div>
                <Label>Tim</Label>
                <Select
                  value={selectedPlayer.timId}
                  onValueChange={(value) => setSelectedPlayer({...selectedPlayer, timId: value})}
                >
                  {teams
                    .filter(team => team.grup === selectedGrup)
                    .map(team => (
                      <option key={team.id} value={team.id}>{team.nama}</option>
                    ))
                  }
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleEditPlayer} disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default DetailManajemenPemain; 