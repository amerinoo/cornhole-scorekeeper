import type { Game, Player, Round, TeamColor } from '../../models';

export type PlayerGlobalStats = {
  playerId: string;
  playerName: string;
  cornholes: number;
  woodies: number;
  misses: number;
  bagsThrown: number;
  rawScore: number;
  victories: number;
  gamesPlayed: number;
  accuracy: number;
  cornholeRate: number;
  woodyRate: number;
  missRate: number;
  winRate: number;
};

export type ColorStats = {
  teamColor: TeamColor;
  victories: number;
  winRate: number;
  netPoints: number;
};

export type GlobalStats = {
  players: PlayerGlobalStats[];
  colors: ColorStats[];
};

export type FinishedGamePlayerStats = {
  playerId: string;
  playerName: string;
  teamColor: TeamColor;
  cornholes: number;
  woodies: number;
  misses: number;
  bagsThrown: number;
  rawScore: number;
  accuracy: number;
  cornholeRate: number;
  woodyRate: number;
  missRate: number;
};

export type FinishedGameTeamStats = {
  teamColor: TeamColor;
  cornholes: number;
  woodies: number;
  misses: number;
  bagsThrown: number;
  rawScore: number;
  netPoints: number;
  roundsWon: number;
  roundWinRate: number;
  accuracy: number;
  cornholeRate: number;
  woodyRate: number;
  missRate: number;
};

export type FinishedGameStats = {
  players: FinishedGamePlayerStats[];
  teams: FinishedGameTeamStats[];
  totalRounds: number;
};

type ThrowBreakdown = {
  accuracy: number;
  cornholeRate: number;
  woodyRate: number;
  missRate: number;
};

function createThrowBreakdown(
  cornholes: number,
  woodies: number,
  misses: number,
  bagsThrown: number,
): ThrowBreakdown {
  if (bagsThrown === 0) {
    return {
      accuracy: 0,
      cornholeRate: 0,
      woodyRate: 0,
      missRate: 0,
    };
  }

  return {
    accuracy: (cornholes + woodies) / bagsThrown,
    cornholeRate: cornholes / bagsThrown,
    woodyRate: woodies / bagsThrown,
    missRate: misses / bagsThrown,
  };
}

function createEmptyPlayerStats(player: Player): PlayerGlobalStats {
  return {
    playerId: player.id,
    playerName: player.name,
    cornholes: 0,
    woodies: 0,
    misses: 0,
    bagsThrown: 0,
    rawScore: 0,
    victories: 0,
    gamesPlayed: 0,
    accuracy: 0,
    cornholeRate: 0,
    woodyRate: 0,
    missRate: 0,
    winRate: 0,
  };
}

export function aggregateGlobalStats(
  players: Player[],
  games: Game[],
  rounds: Round[],
): GlobalStats {
  const playerStatsMap = new Map(
    players.map((player) => [player.id, createEmptyPlayerStats(player)]),
  );
  const finishedGames = games.filter((game) => game.status === 'finished');
  const finishedGamesById = new Map(finishedGames.map((game) => [game.id, game]));

  for (const game of finishedGames) {
    for (const playerId of [...game.bluePlayerIds, ...game.redPlayerIds]) {
      const playerStats = playerStatsMap.get(playerId);

      if (!playerStats) {
        continue;
      }

      playerStats.gamesPlayed += 1;
    }
  }

  for (const round of rounds) {
    const game = finishedGamesById.get(round.gameId);

    if (!game) {
      continue;
    }

    for (const playerThrow of [...round.blueThrows, ...round.redThrows]) {
      const playerStats = playerStatsMap.get(playerThrow.playerId);

      if (!playerStats) {
        continue;
      }

      playerStats.cornholes += playerThrow.cornholes;
      playerStats.woodies += playerThrow.woodies;
      playerStats.misses += playerThrow.misses;
      playerStats.bagsThrown += playerThrow.bagsThrown;
      playerStats.rawScore += playerThrow.rawScore;
    }
  }

  for (const game of finishedGames) {
    if (!game.winnerTeam) {
      continue;
    }

    const winnerPlayerIds =
      game.winnerTeam === 'blue' ? game.bluePlayerIds : game.redPlayerIds;

    for (const playerId of winnerPlayerIds) {
      const playerStats = playerStatsMap.get(playerId);

      if (!playerStats) {
        continue;
      }

      playerStats.victories += 1;
    }
  }

  const playerStats = [...playerStatsMap.values()]
    .map((player) => {
      const breakdown = createThrowBreakdown(
        player.cornholes,
        player.woodies,
        player.misses,
        player.bagsThrown,
      );

      return {
        ...player,
        ...breakdown,
        winRate:
          player.gamesPlayed === 0
            ? 0
            : player.victories / player.gamesPlayed,
      };
    })
    .sort((left, right) => {
      if (right.victories !== left.victories) {
        return right.victories - left.victories;
      }

      return right.rawScore - left.rawScore;
    });

  const finishedRounds = rounds.filter((round) => finishedGamesById.has(round.gameId));
  const blueNetPoints = finishedRounds.reduce(
    (sum, round) => sum + round.blueNetScore,
    0,
  );
  const redNetPoints = finishedRounds.reduce(
    (sum, round) => sum + round.redNetScore,
    0,
  );
  const totalFinishedGames = finishedGames.length;

  return {
    players: playerStats,
    colors: [
      {
        teamColor: 'blue',
        victories: finishedGames.filter((game) => game.winnerTeam === 'blue').length,
        winRate:
          totalFinishedGames === 0
            ? 0
            : finishedGames.filter((game) => game.winnerTeam === 'blue').length / totalFinishedGames,
        netPoints: blueNetPoints,
      },
      {
        teamColor: 'red',
        victories: finishedGames.filter((game) => game.winnerTeam === 'red').length,
        winRate:
          totalFinishedGames === 0
            ? 0
            : finishedGames.filter((game) => game.winnerTeam === 'red').length / totalFinishedGames,
        netPoints: redNetPoints,
      },
    ],
  };
}

export function aggregateFinishedGameStats(
  game: Game,
  rounds: Round[],
  players: Player[],
): FinishedGameStats {
  const namesById = new Map(players.map((player) => [player.id, player.name]));
  const playerStatsMap = new Map<string, FinishedGamePlayerStats>();

  const allPlayerIds = [
    ...game.bluePlayerIds.map((playerId) => ({ playerId, teamColor: 'blue' as const })),
    ...game.redPlayerIds.map((playerId) => ({ playerId, teamColor: 'red' as const })),
  ];

  for (const { playerId, teamColor } of allPlayerIds) {
    playerStatsMap.set(playerId, {
      playerId,
      playerName: namesById.get(playerId) ?? playerId,
      teamColor,
      cornholes: 0,
      woodies: 0,
      misses: 0,
      bagsThrown: 0,
      rawScore: 0,
      accuracy: 0,
      cornholeRate: 0,
      woodyRate: 0,
      missRate: 0,
    });
  }

  const teamStatsMap = new Map<TeamColor, Omit<FinishedGameTeamStats, 'accuracy' | 'cornholeRate' | 'woodyRate' | 'missRate' | 'roundWinRate'>>([
    [
      'blue',
      {
        teamColor: 'blue',
        cornholes: 0,
        woodies: 0,
        misses: 0,
        bagsThrown: 0,
        rawScore: 0,
        netPoints: 0,
        roundsWon: 0,
      },
    ],
    [
      'red',
      {
        teamColor: 'red',
        cornholes: 0,
        woodies: 0,
        misses: 0,
        bagsThrown: 0,
        rawScore: 0,
        netPoints: 0,
        roundsWon: 0,
      },
    ],
  ]);

  for (const round of rounds) {
    const blueTeamStats = teamStatsMap.get('blue');
    const redTeamStats = teamStatsMap.get('red');

    if (!blueTeamStats || !redTeamStats) {
      continue;
    }

    blueTeamStats.rawScore += round.blueRawScore;
    blueTeamStats.netPoints += round.blueNetScore;
    redTeamStats.rawScore += round.redRawScore;
    redTeamStats.netPoints += round.redNetScore;

    if (round.blueNetScore > 0) {
      blueTeamStats.roundsWon += 1;
    }

    if (round.redNetScore > 0) {
      redTeamStats.roundsWon += 1;
    }

    for (const playerThrow of round.blueThrows) {
      const playerStats = playerStatsMap.get(playerThrow.playerId);

      if (!playerStats) {
        continue;
      }

      playerStats.cornholes += playerThrow.cornholes;
      playerStats.woodies += playerThrow.woodies;
      playerStats.misses += playerThrow.misses;
      playerStats.bagsThrown += playerThrow.bagsThrown;
      playerStats.rawScore += playerThrow.rawScore;

      blueTeamStats.cornholes += playerThrow.cornholes;
      blueTeamStats.woodies += playerThrow.woodies;
      blueTeamStats.misses += playerThrow.misses;
      blueTeamStats.bagsThrown += playerThrow.bagsThrown;
    }

    for (const playerThrow of round.redThrows) {
      const playerStats = playerStatsMap.get(playerThrow.playerId);

      if (!playerStats) {
        continue;
      }

      playerStats.cornholes += playerThrow.cornholes;
      playerStats.woodies += playerThrow.woodies;
      playerStats.misses += playerThrow.misses;
      playerStats.bagsThrown += playerThrow.bagsThrown;
      playerStats.rawScore += playerThrow.rawScore;

      redTeamStats.cornholes += playerThrow.cornholes;
      redTeamStats.woodies += playerThrow.woodies;
      redTeamStats.misses += playerThrow.misses;
      redTeamStats.bagsThrown += playerThrow.bagsThrown;
    }
  }

  return {
    totalRounds: rounds.length,
    players: [...playerStatsMap.values()]
      .map((player) => ({
        ...player,
        ...createThrowBreakdown(
          player.cornholes,
          player.woodies,
          player.misses,
          player.bagsThrown,
        ),
      }))
      .sort((left, right) => {
        if (left.teamColor !== right.teamColor) {
          return left.teamColor.localeCompare(right.teamColor);
        }

        return right.rawScore - left.rawScore;
      }),
    teams: [...teamStatsMap.values()].map((team) => ({
      ...team,
      roundWinRate: rounds.length === 0 ? 0 : team.roundsWon / rounds.length,
      ...createThrowBreakdown(
        team.cornholes,
        team.woodies,
        team.misses,
        team.bagsThrown,
      ),
    })),
  };
}
