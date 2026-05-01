import type { GameMode, TargetScore } from './game';
import type { Timestamp } from 'firebase/firestore';

export type PlayerThrow = {
  playerId: string;
  cornholes: number;
  woodies: number;
  misses: number;
  rawScore: number;
  bagsThrown: number;
};

export type PlayerThrowInput = {
  playerId: string;
  cornholes: number;
  woodies: number;
};

export type Round = {
  id: string;
  gameId: string;
  roundNumber: number;
  blueThrows: PlayerThrow[];
  redThrows: PlayerThrow[];
  blueRawScore: number;
  redRawScore: number;
  blueNetScore: number;
  redNetScore: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type RoundCalculation = {
  blueThrows: PlayerThrow[];
  redThrows: PlayerThrow[];
  blueRawScore: number;
  redRawScore: number;
  blueNetScore: number;
  redNetScore: number;
};

export type SaveRoundInput = {
  gameId: string;
  mode: GameMode;
  targetScore: TargetScore;
  blueThrows: PlayerThrowInput[];
  redThrows: PlayerThrowInput[];
};
