import type { Timestamp } from 'firebase/firestore';
import type { PlayerThrow } from './round';

export type GameMode = '1v1' | '2v2';
export type GameStatus = 'setup' | 'in_progress' | 'finished';
export type TeamColor = 'blue' | 'red';
export type TargetScore = 11 | 21;

export type Game = {
  id: string;
  mode: GameMode;
  targetScore: TargetScore;
  status: GameStatus;
  bluePlayerIds: string[];
  redPlayerIds: string[];
  blueScore: number;
  redScore: number;
  winnerTeam?: TeamColor;
  createdAt: Timestamp;
  finishedAt?: Timestamp;
};

export type CreateGameInput = {
  mode: GameMode;
  targetScore: TargetScore;
  bluePlayerIds: string[];
  redPlayerIds: string[];
};

export type RoundInput = {
  blueThrows: PlayerThrow[];
  redThrows: PlayerThrow[];
};
