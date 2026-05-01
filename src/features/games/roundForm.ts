import type { Game, PlayerThrowInput, Round } from '../../models';

export type RoundFormState = {
  blueThrows: PlayerThrowInput[];
  redThrows: PlayerThrowInput[];
};

function createEmptyThrows(playerIds: string[]): PlayerThrowInput[] {
  return playerIds.map((playerId) => ({
    playerId,
    cornholes: 0,
    woodies: 0,
  }));
}

export function createEmptyRoundForm(game: Pick<Game, 'bluePlayerIds' | 'redPlayerIds'>): RoundFormState {
  return {
    blueThrows: createEmptyThrows(game.bluePlayerIds),
    redThrows: createEmptyThrows(game.redPlayerIds),
  };
}

export function createRoundFormFromRound(round: Round): RoundFormState {
  return {
    blueThrows: round.blueThrows.map((playerThrow) => ({
      playerId: playerThrow.playerId,
      cornholes: playerThrow.cornholes,
      woodies: playerThrow.woodies,
    })),
    redThrows: round.redThrows.map((playerThrow) => ({
      playerId: playerThrow.playerId,
      cornholes: playerThrow.cornholes,
      woodies: playerThrow.woodies,
    })),
  };
}
