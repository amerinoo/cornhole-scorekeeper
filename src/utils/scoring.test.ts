import type { Round } from '../models';
import {
  buildPlayerThrow,
  calculateCancellation,
  calculateMisses,
  calculateRound,
  calculateRawScore,
  detectWinner,
  getBagsPerPlayer,
  recalculateGameScore,
  validateTeamThrows,
  validateRoundInput,
} from './scoring';

function createRound(
  blueNetScore: number,
  redNetScore: number,
): Pick<Round, 'blueNetScore' | 'redNetScore'> {
  return {
    blueNetScore,
    redNetScore,
  };
}

describe('scoring utils', () => {
  it('allows up to 4 bags per player in 1v1', () => {
    expect(getBagsPerPlayer('1v1')).toBe(4);
  });

  it('allows up to 2 bags per player in 2v2', () => {
    expect(getBagsPerPlayer('2v2')).toBe(2);
  });

  it('does not allow a team to exceed 4 bags per round', () => {
    const result = validateTeamThrows('2v2', [
      {
        playerId: 'blue-1',
        cornholes: 2,
        woodies: 0,
        misses: 0,
        rawScore: 6,
        bagsThrown: 2,
      },
      {
        playerId: 'blue-2',
        cornholes: 2,
        woodies: 1,
        misses: -1,
        rawScore: 7,
        bagsThrown: 3,
      },
    ]);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El equipo debe lanzar exactamente 4 sacos.');
    expect(result.errors).toContain(
      'El jugador no puede superar 2 sacos en modo 2v2.',
    );
  });

  it('calculates misses correctly in 1v1', () => {
    expect(calculateMisses('1v1', 2, 1)).toBe(1);
  });

  it('calculates misses correctly in 2v2', () => {
    expect(calculateMisses('2v2', 1, 1)).toBe(0);
  });

  it('calculates raw score correctly', () => {
    expect(calculateRawScore(2, 1)).toBe(7);
  });

  it('builds a player throw with derived fields', () => {
    expect(
      buildPlayerThrow('2v2', {
        playerId: 'player-1',
        cornholes: 1,
        woodies: 1,
      }),
    ).toEqual({
      playerId: 'player-1',
      cornholes: 1,
      woodies: 1,
      misses: 0,
      rawScore: 4,
      bagsThrown: 2,
    });
  });

  it('calculates cancellation correctly', () => {
    expect(calculateCancellation(6, 4)).toEqual({
      blueNetScore: 2,
      redNetScore: 0,
    });
  });

  it('calculates a whole round correctly', () => {
    expect(
      calculateRound(
        '2v2',
        [
          { playerId: 'blue-1', cornholes: 1, woodies: 1 },
          { playerId: 'blue-2', cornholes: 0, woodies: 1 },
        ],
        [
          { playerId: 'red-1', cornholes: 1, woodies: 0 },
          { playerId: 'red-2', cornholes: 0, woodies: 1 },
        ],
      ),
    ).toMatchObject({
      blueRawScore: 5,
      redRawScore: 4,
      blueNetScore: 1,
      redNetScore: 0,
    });
  });

  it('validates a full round with 8 bags total', () => {
    expect(
      validateRoundInput({
        gameId: 'game-1',
        mode: '2v2',
        targetScore: 21,
        blueThrows: [
          { playerId: 'blue-1', cornholes: 1, woodies: 1 },
          { playerId: 'blue-2', cornholes: 0, woodies: 1 },
        ],
        redThrows: [
          { playerId: 'red-1', cornholes: 1, woodies: 0 },
          { playerId: 'red-2', cornholes: 0, woodies: 1 },
        ],
      }).isValid,
    ).toBe(true);
  });

  it('rejects a round that does not sum 8 bags when players are missing', () => {
    const result = validateRoundInput({
      gameId: 'game-1',
      mode: '2v2',
      targetScore: 21,
      blueThrows: [{ playerId: 'blue-1', cornholes: 1, woodies: 1 }],
      redThrows: [
        { playerId: 'red-1', cornholes: 1, woodies: 0 },
        { playerId: 'red-2', cornholes: 0, woodies: 1 },
      ],
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Azul: El equipo debe lanzar exactamente 4 sacos.');
    expect(result.errors).toContain('La ronda debe sumar exactamente 8 sacos.');
  });

  it('recalculates score across multiple rounds', () => {
    const result = recalculateGameScore(
      [createRound(2, 0), createRound(0, 3), createRound(4, 0)],
      11,
    );

    expect(result).toEqual({
      blueScore: 6,
      redScore: 3,
      winnerTeam: undefined,
      status: 'in_progress',
    });
  });

  it('recalculates score correctly after editing a round', () => {
    const roundOne = createRound(2, 0);
    const roundThree = createRound(4, 0);
    const edited = [roundOne, createRound(1, 0), roundThree];

    const result = recalculateGameScore(edited, 11);

    expect(result).toEqual({
      blueScore: 7,
      redScore: 0,
      winnerTeam: undefined,
      status: 'in_progress',
    });
  });

  it('detects winner at 11 points', () => {
    expect(detectWinner(11, 9, 11)).toBe('blue');
  });

  it('detects winner at 21 points', () => {
    expect(detectWinner(18, 21, 21)).toBe('red');
  });
});
