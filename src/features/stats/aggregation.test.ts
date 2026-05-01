import { describe, expect, it } from 'vitest';
import type { Game, Player, Round } from '../../models';
import { aggregateGlobalStats } from './aggregation';

const fakeTimestamp = {
  toDate: () => new Date('2026-05-02T10:00:00Z'),
};

describe('aggregateGlobalStats', () => {
  it('aggregates player and color stats correctly', () => {
    const players = [
      { id: 'p1', name: 'Ana', createdAt: fakeTimestamp },
      { id: 'p2', name: 'Luis', createdAt: fakeTimestamp },
      { id: 'p3', name: 'Marta', createdAt: fakeTimestamp },
      { id: 'p4', name: 'Pablo', createdAt: fakeTimestamp },
    ] as unknown as Player[];

    const games = [
      {
        id: 'g1',
        mode: '2v2',
        targetScore: 21,
        status: 'finished',
        bluePlayerIds: ['p1', 'p2'],
        redPlayerIds: ['p3', 'p4'],
        blueScore: 21,
        redScore: 18,
        winnerTeam: 'blue',
        createdAt: fakeTimestamp,
        finishedAt: fakeTimestamp,
      },
    ] as unknown as Game[];

    const rounds = [
      {
        id: 'r1',
        gameId: 'g1',
        roundNumber: 1,
        blueThrows: [
          {
            playerId: 'p1',
            cornholes: 1,
            woodies: 1,
            misses: 0,
            rawScore: 4,
            bagsThrown: 2,
          },
          {
            playerId: 'p2',
            cornholes: 0,
            woodies: 1,
            misses: 1,
            rawScore: 1,
            bagsThrown: 2,
          },
        ],
        redThrows: [
          {
            playerId: 'p3',
            cornholes: 1,
            woodies: 0,
            misses: 1,
            rawScore: 3,
            bagsThrown: 2,
          },
          {
            playerId: 'p4',
            cornholes: 0,
            woodies: 1,
            misses: 1,
            rawScore: 1,
            bagsThrown: 2,
          },
        ],
        blueRawScore: 5,
        redRawScore: 4,
        blueNetScore: 1,
        redNetScore: 0,
        createdAt: fakeTimestamp,
        updatedAt: fakeTimestamp,
      },
    ] as unknown as Round[];

    const result = aggregateGlobalStats(players, games, rounds);

    expect(result.colors).toEqual([
      { teamColor: 'blue', victories: 1, netPoints: 1 },
      { teamColor: 'red', victories: 0, netPoints: 0 },
    ]);

    expect(result.players.find((player) => player.playerId === 'p1')).toMatchObject({
      cornholes: 1,
      woodies: 1,
      misses: 0,
      bagsThrown: 2,
      rawScore: 4,
      victories: 1,
      gamesPlayed: 1,
      accuracy: 1,
    });

    expect(result.players.find((player) => player.playerId === 'p3')).toMatchObject({
      cornholes: 1,
      woodies: 0,
      misses: 1,
      bagsThrown: 2,
      rawScore: 3,
      victories: 0,
      gamesPlayed: 1,
      accuracy: 0.5,
    });
  });
});
