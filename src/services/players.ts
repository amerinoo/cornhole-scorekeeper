import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Player } from '../models';

const playersCollectionName = 'players';
const gamesCollectionName = 'games';

function requireDb() {
  if (!db) {
    throw new Error('Firebase no está configurado.');
  }

  return db;
}

function normalizePlayerName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function subscribeToPlayers(
  onData: (players: Player[]) => void,
  onError: (error: Error) => void,
): () => void {
  try {
    const firestore = requireDb();
    const playersQuery = query(
      collection(firestore, playersCollectionName),
      orderBy('name', 'asc'),
    );

    return onSnapshot(
      playersQuery,
      (snapshot) => {
        const players = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        })) as Player[];

        onData(players);
      },
      (error) => {
        onError(error);
      },
    );
  } catch (error) {
    onError(error instanceof Error ? error : new Error('No se pudo leer players.'));
    return () => undefined;
  }
}

export async function createPlayer(name: string): Promise<void> {
  const firestore = requireDb();
  const normalizedName = normalizePlayerName(name);

  if (!normalizedName) {
    throw new Error('El nombre del jugador es obligatorio.');
  }

  await addDoc(collection(firestore, playersCollectionName), {
    name: normalizedName,
    createdAt: serverTimestamp(),
  });
}

export async function updatePlayer(playerId: string, name: string): Promise<void> {
  const firestore = requireDb();
  const normalizedName = normalizePlayerName(name);

  if (!normalizedName) {
    throw new Error('El nombre del jugador es obligatorio.');
  }

  await updateDoc(doc(firestore, playersCollectionName, playerId), {
    name: normalizedName,
  });
}

export async function deletePlayer(playerId: string): Promise<void> {
  const firestore = requireDb();
  const [blueGamesSnapshot, redGamesSnapshot] = await Promise.all([
    getDocs(
      query(
        collection(firestore, gamesCollectionName),
        where('bluePlayerIds', 'array-contains', playerId),
      ),
    ),
    getDocs(
      query(
        collection(firestore, gamesCollectionName),
        where('redPlayerIds', 'array-contains', playerId),
      ),
    ),
  ]);

  if (!blueGamesSnapshot.empty || !redGamesSnapshot.empty) {
    throw new Error(
      'No se puede borrar un jugador que ya está asociado a partidas.',
    );
  }

  await deleteDoc(doc(firestore, playersCollectionName, playerId));
}
