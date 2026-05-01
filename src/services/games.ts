import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { CreateGameInput, Game } from '../models';
import { validateCreateGameInput } from '../features/games/validation';

const gamesCollectionName = 'games';

function requireDb() {
  if (!db) {
    throw new Error('Firebase no está configurado.');
  }

  return db;
}

export async function createGame(input: CreateGameInput): Promise<string> {
  const firestore = requireDb();
  const validation = validateCreateGameInput(input);

  if (!validation.isValid) {
    throw new Error(validation.errors.join(' '));
  }

  const createdGame = await addDoc(collection(firestore, gamesCollectionName), {
    mode: input.mode,
    targetScore: input.targetScore,
    status: 'setup',
    bluePlayerIds: input.bluePlayerIds,
    redPlayerIds: input.redPlayerIds,
    blueScore: 0,
    redScore: 0,
    createdAt: serverTimestamp(),
  });

  return createdGame.id;
}

export function subscribeToGame(
  gameId: string,
  onData: (game: Game | null) => void,
  onError: (error: Error) => void,
): () => void {
  try {
    const firestore = requireDb();
    const gameReference = doc(firestore, gamesCollectionName, gameId);

    return onSnapshot(
      gameReference,
      (snapshot) => {
        if (!snapshot.exists()) {
          onData(null);
          return;
        }

        onData({
          id: snapshot.id,
          ...snapshot.data(),
        } as Game);
      },
      (error) => {
        onError(error);
      },
    );
  } catch (error) {
    onError(error instanceof Error ? error : new Error('No se pudo leer games.'));
    return () => undefined;
  }
}

export function subscribeToGames(
  onData: (games: Game[]) => void,
  onError: (error: Error) => void,
): () => void {
  try {
    const firestore = requireDb();
    const gamesQuery = query(
      collection(firestore, gamesCollectionName),
      orderBy('createdAt', 'desc'),
    );

    return onSnapshot(
      gamesQuery,
      (snapshot) => {
        onData(
          snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          })) as Game[],
        );
      },
      (error) => {
        onError(error);
      },
    );
  } catch (error) {
    onError(error instanceof Error ? error : new Error('No se pudo leer games.'));
    return () => undefined;
  }
}
