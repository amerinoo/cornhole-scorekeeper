import {
  collection,
  deleteField,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  writeBatch,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type {
  Game,
  PlayerThrowInput,
  Round,
  SaveRoundInput,
} from '../models';
import { calculateRound, recalculateGameScore, validateRoundInput } from '../utils/scoring';

const roundsCollectionName = 'rounds';
const gamesCollectionName = 'games';

function requireDb() {
  if (!db) {
    throw new Error('Firebase no está configurado.');
  }

  return db;
}

function mapRound(document: { id: string; data: () => unknown }): Round {
  return {
    id: document.id,
    ...(document.data() as Omit<Round, 'id'>),
  };
}

async function getRoundsForGame(gameId: string): Promise<Round[]> {
  const firestore = requireDb();
  const roundsSnapshot = await getDocs(
    query(
      collection(firestore, roundsCollectionName),
      where('gameId', '==', gameId),
    ),
  );

  return roundsSnapshot.docs
    .map((document) => mapRound(document))
    .sort((left, right) => left.roundNumber - right.roundNumber);
}

function buildSaveInput(
  game: Game,
  blueThrows: PlayerThrowInput[],
  redThrows: PlayerThrowInput[],
): SaveRoundInput {
  return {
    gameId: game.id,
    mode: game.mode,
    targetScore: game.targetScore,
    blueThrows,
    redThrows,
  };
}

export function subscribeToRounds(
  gameId: string,
  onData: (rounds: Round[]) => void,
  onError: (error: Error) => void,
): () => void {
  try {
    const firestore = requireDb();
    const roundsQuery = query(
      collection(firestore, roundsCollectionName),
      where('gameId', '==', gameId),
    );

    return onSnapshot(
      roundsQuery,
      (snapshot) => {
        const rounds = snapshot.docs
          .map((document) => mapRound(document))
          .sort((left, right) => left.roundNumber - right.roundNumber);

        onData(rounds);
      },
      (error) => {
        onError(error);
      },
    );
  } catch (error) {
    onError(error instanceof Error ? error : new Error('No se pudo leer rounds.'));
    return () => undefined;
  }
}

export function subscribeToAllRounds(
  onData: (rounds: Round[]) => void,
  onError: (error: Error) => void,
): () => void {
  try {
    const firestore = requireDb();
    const roundsReference = collection(firestore, roundsCollectionName);

    return onSnapshot(
      roundsReference,
      (snapshot) => {
        const rounds = snapshot.docs
          .map((document) => mapRound(document))
          .sort((left, right) => {
            if (left.gameId !== right.gameId) {
              return left.gameId.localeCompare(right.gameId);
            }

            return left.roundNumber - right.roundNumber;
          });

        onData(rounds);
      },
      (error) => {
        onError(error);
      },
    );
  } catch (error) {
    onError(error instanceof Error ? error : new Error('No se pudo leer rounds.'));
    return () => undefined;
  }
}

export async function createRound(
  game: Game,
  blueThrows: PlayerThrowInput[],
  redThrows: PlayerThrowInput[],
): Promise<void> {
  if (game.status === 'finished') {
    throw new Error('La partida ya está finalizada. Edita una ronda existente.');
  }

  const validation = validateRoundInput(buildSaveInput(game, blueThrows, redThrows));

  if (!validation.isValid) {
    throw new Error(validation.errors.join(' '));
  }

  const firestore = requireDb();
  const existingRounds = await getRoundsForGame(game.id);
  const roundNumber =
    existingRounds.length > 0
      ? Math.max(...existingRounds.map((round) => round.roundNumber)) + 1
      : 1;
  const calculatedRound = calculateRound(game.mode, blueThrows, redThrows);

  const nextGameState = recalculateGameScore(
    [
      ...existingRounds,
      {
        blueNetScore: calculatedRound.blueNetScore,
        redNetScore: calculatedRound.redNetScore,
      },
    ],
    game.targetScore,
  );
  const roundReference = doc(collection(firestore, roundsCollectionName));
  const gameReference = doc(firestore, gamesCollectionName, game.id);
  const batch = writeBatch(firestore);

  batch.set(roundReference, {
    gameId: game.id,
    roundNumber,
    ...calculatedRound,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.update(gameReference, {
    blueScore: nextGameState.blueScore,
    redScore: nextGameState.redScore,
    status: nextGameState.status,
    winnerTeam: nextGameState.winnerTeam ?? deleteField(),
    finishedAt:
      nextGameState.status === 'finished'
        ? game.finishedAt ?? serverTimestamp()
        : deleteField(),
  });

  await batch.commit();
}

export async function updateRound(
  game: Game,
  roundId: string,
  blueThrows: PlayerThrowInput[],
  redThrows: PlayerThrowInput[],
): Promise<void> {
  const validation = validateRoundInput(buildSaveInput(game, blueThrows, redThrows));

  if (!validation.isValid) {
    throw new Error(validation.errors.join(' '));
  }

  const firestore = requireDb();
  const existingRounds = await getRoundsForGame(game.id);
  const existingRound = existingRounds.find((round) => round.id === roundId);

  if (!existingRound) {
    throw new Error('La ronda que intentas editar ya no existe.');
  }

  const calculatedRound = calculateRound(game.mode, blueThrows, redThrows);
  const recalculatedRounds = existingRounds.map((round) =>
    round.id === roundId
      ? {
          ...round,
          blueNetScore: calculatedRound.blueNetScore,
          redNetScore: calculatedRound.redNetScore,
        }
      : round,
  );

  const nextGameState = recalculateGameScore(recalculatedRounds, game.targetScore);
  const roundReference = doc(firestore, roundsCollectionName, roundId);
  const gameReference = doc(firestore, gamesCollectionName, game.id);
  const batch = writeBatch(firestore);

  batch.update(roundReference, {
    ...calculatedRound,
    updatedAt: serverTimestamp(),
  });
  batch.update(gameReference, {
    blueScore: nextGameState.blueScore,
    redScore: nextGameState.redScore,
    status: nextGameState.status,
    winnerTeam: nextGameState.winnerTeam ?? deleteField(),
    finishedAt:
      nextGameState.status === 'finished'
        ? game.finishedAt ?? serverTimestamp()
        : deleteField(),
  });

  await batch.commit();
}
