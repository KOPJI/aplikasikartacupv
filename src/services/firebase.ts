import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  query,
  where,
  writeBatch
} from 'firebase/firestore';

// Firebase konfigurasi
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Fungsi untuk menghapus data koleksi
export const deleteCollectionData = async (collectionName: string) => {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnapshot) => {
      batch.delete(doc(db, collectionName, docSnapshot.id));
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error(`Error menghapus koleksi ${collectionName}:`, error);
    throw error;
  }
};

// Fungsi-fungsi untuk teams
export const getTeamsFromFirestore = async () => {
  try {
    const teamsCollection = collection(db, 'teams');
    const teamsSnapshot = await getDocs(teamsCollection);
    const teamsList = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return teamsList;
  } catch (error) {
    console.error("Error mendapatkan data tim:", error);
    throw error;
  }
};

export const saveTeamToFirestore = async (team: any) => {
  try {
    // Jika tim sudah memiliki ID, gunakan ID tersebut
    if (team.id) {
      await setDoc(doc(db, 'teams', team.id), team);
    } else {
      // Jika belum ada ID, buat dokumen baru dengan ID otomatis
      await addDoc(collection(db, 'teams'), team);
    }
  } catch (error) {
    console.error("Error menyimpan tim:", error);
    throw error;
  }
};

export const deleteTeamFromFirestore = async (teamId: string) => {
  try {
    await deleteDoc(doc(db, 'teams', teamId));
  } catch (error) {
    console.error("Error menghapus tim:", error);
    throw error;
  }
};

// Fungsi-fungsi untuk players
export const getPlayersFromFirestore = async () => {
  try {
    const playersCollection = collection(db, 'players');
    const playersSnapshot = await getDocs(playersCollection);
    const playersList = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return playersList;
  } catch (error) {
    console.error("Error mendapatkan data pemain:", error);
    throw error;
  }
};

export const getPlayersByTeamFromFirestore = async (teamId: string) => {
  try {
    const playersCollection = collection(db, 'players');
    const q = query(playersCollection, where("timId", "==", teamId));
    const playersSnapshot = await getDocs(q);
    const playersList = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return playersList;
  } catch (error) {
    console.error(`Error mendapatkan pemain untuk tim ${teamId}:`, error);
    throw error;
  }
};

export const savePlayerToFirestore = async (player: any) => {
  try {
    if (player.id) {
      await setDoc(doc(db, 'players', player.id), player);
    } else {
      await addDoc(collection(db, 'players'), player);
    }
  } catch (error) {
    console.error("Error menyimpan pemain:", error);
    throw error;
  }
};

export const deletePlayerFromFirestore = async (playerId: string) => {
  try {
    await deleteDoc(doc(db, 'players', playerId));
  } catch (error) {
    console.error("Error menghapus pemain:", error);
    throw error;
  }
};

// Fungsi-fungsi untuk matches
export const getMatchesFromFirestore = async () => {
  try {
    const matchesCollection = collection(db, 'matches');
    const matchesSnapshot = await getDocs(matchesCollection);
    const matchesList = matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return matchesList;
  } catch (error) {
    console.error("Error mendapatkan data pertandingan:", error);
    throw error;
  }
};

export const saveMatchToFirestore = async (match: any) => {
  try {
    if (match.id) {
      await setDoc(doc(db, 'matches', match.id), match);
    } else {
      await addDoc(collection(db, 'matches'), match);
    }
  } catch (error) {
    console.error("Error menyimpan pertandingan:", error);
    throw error;
  }
};

// Fungsi-fungsi untuk babak gugur
export const getKnockoutMatchesFromFirestore = async () => {
  try {
    const knockoutsCollection = collection(db, 'knockouts');
    const knockoutsSnapshot = await getDocs(knockoutsCollection);
    const knockoutsList = knockoutsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return knockoutsList;
  } catch (error) {
    console.error("Error mendapatkan data babak gugur:", error);
    throw error;
  }
};

export const saveKnockoutMatchToFirestore = async (match: any) => {
  try {
    if (match.id) {
      await setDoc(doc(db, 'knockouts', match.id), match);
    } else {
      await addDoc(collection(db, 'knockouts'), match);
    }
  } catch (error) {
    console.error("Error menyimpan pertandingan babak gugur:", error);
    throw error;
  }
};

// Fungsi-fungsi untuk goals
export const getGoalsFromFirestore = async () => {
  try {
    const goalsCollection = collection(db, 'goals');
    const goalsSnapshot = await getDocs(goalsCollection);
    const goalsList = goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return goalsList;
  } catch (error) {
    console.error("Error mendapatkan data gol:", error);
    throw error;
  }
};

export const saveGoalToFirestore = async (goal: any) => {
  try {
    if (goal.id) {
      await setDoc(doc(db, 'goals', goal.id), goal);
    } else {
      await addDoc(collection(db, 'goals'), goal);
    }
  } catch (error) {
    console.error("Error menyimpan data gol:", error);
    throw error;
  }
};

// Fungsi-fungsi untuk kartu
export const getYellowCardsFromFirestore = async () => {
  try {
    const cardsCollection = collection(db, 'card_yellows');
    const cardsSnapshot = await getDocs(cardsCollection);
    const cardsList = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return cardsList;
  } catch (error) {
    console.error("Error mendapatkan data kartu kuning:", error);
    throw error;
  }
};

export const getRedCardsFromFirestore = async () => {
  try {
    const cardsCollection = collection(db, 'card_red');
    const cardsSnapshot = await getDocs(cardsCollection);
    const cardsList = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return cardsList;
  } catch (error) {
    console.error("Error mendapatkan data kartu merah:", error);
    throw error;
  }
};

export const saveCardToFirestore = async (card: any) => {
  try {
    const collectionName = card.jenis === 'kuning' ? 'card_yellows' : 'card_red';
    if (card.id) {
      await setDoc(doc(db, collectionName, card.id), card);
    } else {
      await addDoc(collection(db, collectionName), card);
    }
  } catch (error) {
    console.error("Error menyimpan data kartu:", error);
    throw error;
  }
};

// Fungsi-fungsi untuk inisialisasi data
export const initializeTeamsToFirestore = async (teams: any[]) => {
  try {
    const batch = writeBatch(db);
    
    teams.forEach(team => {
      const teamRef = doc(db, 'teams', team.id);
      batch.set(teamRef, team);
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error inisialisasi tim ke Firestore:", error);
    throw error;
  }
};

export const initializePlayersToFirestore = async (teams: any[]) => {
  try {
    const playersPromises = [];
    
    for (const team of teams) {
      if (team.pemain && team.pemain.length > 0) {
        for (const player of team.pemain) {
          playersPromises.push(
            setDoc(doc(db, 'players', player.id), {
              ...player,
              timId: team.id
            })
          );
        }
      }
    }
    
    await Promise.all(playersPromises);
    return true;
  } catch (error) {
    console.error("Error inisialisasi pemain ke Firestore:", error);
    throw error;
  }
};

export const initializeMatchesToFirestore = async (matches: any[]) => {
  try {
    const batch = writeBatch(db);
    
    matches.forEach(match => {
      const matchRef = doc(db, 'matches', match.id);
      batch.set(matchRef, match);
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error inisialisasi pertandingan ke Firestore:", error);
    throw error;
  }
};

export const initializeKnockoutMatchesToFirestore = async (matches: any[]) => {
  try {
    const batch = writeBatch(db);
    
    matches.forEach(match => {
      const matchRef = doc(db, 'knockouts', match.id);
      batch.set(matchRef, match);
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error inisialisasi babak gugur ke Firestore:", error);
    throw error;
  }
};
