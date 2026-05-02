import { describe, expect, it } from 'vitest';
import type { Game, Player, Round } from '../../models';
import { aggregateFinishedGameStats, aggregateGlobalStats } from './aggregation';

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
      {
        teamColor: 'blue',
        victories: 1,
        winRate: 1,
        netPoints: 1,
      },
      {
        teamColor: 'red',
        victories: 0,
        winRate: 0,
        netPoints: 0,
      },
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
      cornholeRate: 0.5,
      woodyRate: 0.5,
      missRate: 0,
      winRate: 1,
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
      cornholeRate: 0.5,
      woodyRate: 0,
      missRate: 0.5,
      winRate: 0,
    });
  });

  it('ignores unfinished games in global stats', () => {
    const players = [
      { id: 'p1', name: 'Ana', createdAt: fakeTimestamp },
      { id: 'p2', name: 'Luis', createdAt: fakeTimestamp },
    ] as unknown as Player[];

    const games = [
      {
        id: 'g1',
        mode: '1v1',
        targetScore: 21,
        status: 'in_progress',
        bluePlayerIds: ['p1'],
        redPlayerIds: ['p2'],
        blueScore: 8,
        redScore: 6,
        createdAt: fakeTimestamp,
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
            woodies: 0,
            misses: 3,
            rawScore: 3,
            bagsThrown: 4,
          },
        ],
        redThrows: [
          {
            playerId: 'p2',
            cornholes: 0,
            woodies: 2,
            misses: 2,
            rawScore: 2,
            bagsThrown: 4,
          },
        ],
        blueRawScore: 3,
        redRawScore: 2,
        blueNetScore: 1,
        redNetScore: 0,
        createdAt: fakeTimestamp,
        updatedAt: fakeTimestamp,
      },
    ] as unknown as Round[];

    const result = aggregateGlobalStats(players, games, rounds);

    expect(result.colors).toEqual([
      { teamColor: 'blue', victories: 0, winRate: 0, netPoints: 0 },
      { teamColor: 'red', victories: 0, winRate: 0, netPoints: 0 },
    ]);
    expect(result.players.find((player) => player.playerId === 'p1')).toMatchObject({
      gamesPlayed: 0,
      cornholes: 0,
      woodies: 0,
      misses: 0,
      bagsThrown: 0,
      rawScore: 0,
      victories: 0,
      accuracy: 0,
      winRate: 0,
    });
  });

  it('aggregates finished game stats for a single match', () => {
    const players = [
      { id: 'p1', name: 'Ana', createdAt: fakeTimestamp },
      { id: 'p2', name: 'Luis', createdAt: fakeTimestamp },
      { id: 'p3', name: 'Marta', createdAt: fakeTimestamp },
      { id: 'p4', name: 'Pablo', createdAt: fakeTimestamp },
    ] as unknown as Player[];

    const game = {
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
    } as unknown as Game;

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
      {
        id: 'r2',
        gameId: 'g1',
        roundNumber: 2,
        blueThrows: [
          {
            playerId: 'p1',
            cornholes: 0,
            woodies: 1,
            misses: 1,
            rawScore: 1,
            bagsThrown: 2,
          },
          {
            playerId: 'p2',
            cornholes: 1,
            woodies: 0,
            misses: 1,
            rawScore: 3,
            bagsThrown: 2,
          },
        ],
        redThrows: [
          {
            playerId: 'p3',
            cornholes: 0,
            woodies: 2,
            misses: 0,
            rawScore: 2,
            bagsThrown: 2,
          },
          {
            playerId: 'p4',
            cornholes: 1,
            woodies: 0,
            misses: 1,
            rawScore: 3,
            bagsThrown: 2,
          },
        ],
        blueRawScore: 4,
        redRawScore: 5,
        blueNetScore: 0,
        redNetScore: 1,
        createdAt: fakeTimestamp,
        updatedAt: fakeTimestamp,
      },
    ] as unknown as Round[];

    const result = aggregateFinishedGameStats(game, rounds, players);

    expect(result.totalRounds).toBe(2);
    expect(result.teams).toEqual([
      expect.objectContaining({
        teamColor: 'blue',
        rawScore: 9,
        netPoints: 1,
        roundsWon: 1,
        roundWinRate: 0.5,
        accuracy: 0.625,
        cornholeRate: 0.25,
        woodyRate: 0.375,
        missRate: 0.375,
      }),
      expect.objectContaining({
        teamColor: 'red',
        rawScore: 9,
        netPoints: 1,
        roundsWon: 1,
        roundWinRate: 0.5,
        accuracy: 0.625,
        cornholeRate: 0.25,
        woodyRate: 0.375,
        missRate: 0.375,
      }),
    ]);
    expect(result.players.find((player) => player.playerId === 'p1')).toMatchObject({
      teamColor: 'blue',
      cornholes: 1,
      woodies: 2,
      misses: 1,
      bagsThrown: 4,
      rawScore: 5,
      accuracy: 0.75,
      cornholeRate: 0.25,
      woodyRate: 0.5,
      missRate: 0.25,
    });
  });
});
