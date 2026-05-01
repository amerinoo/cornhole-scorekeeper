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
};

export type ColorStats = {
  teamColor: TeamColor;
  victories: number;
  netPoints: number;
};

export type GlobalStats = {
  players: PlayerGlobalStats[];
  colors: ColorStats[];
};

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
  const gamesById = new Map(games.map((game) => [game.id, game]));

  for (const game of games) {
    for (const playerId of [...game.bluePlayerIds, ...game.redPlayerIds]) {
      const playerStats = playerStatsMap.get(playerId);

      if (!playerStats) {
        continue;
      }

      playerStats.gamesPlayed += 1;
    }
  }

  for (const round of rounds) {
    const game = gamesById.get(round.gameId);

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
    .map((player) => ({
      ...player,
      accuracy:
        player.bagsThrown === 0
          ? 0
          : (player.cornholes + player.woodies) / player.bagsThrown,
    }))
    .sort((left, right) => {
      if (right.victories !== left.victories) {
        return right.victories - left.victories;
      }

      return right.rawScore - left.rawScore;
    });

  const blueNetPoints = rounds.reduce(
    (sum, round) => sum + round.blueNetScore,
    0,
  );
  const redNetPoints = rounds.reduce(
    (sum, round) => sum + round.redNetScore,
    0,
  );

  return {
    players: playerStats,
    colors: [
      {
        teamColor: 'blue',
        victories: finishedGames.filter((game) => game.winnerTeam === 'blue').length,
        netPoints: blueNetPoints,
      },
      {
        teamColor: 'red',
        victories: finishedGames.filter((game) => game.winnerTeam === 'red').length,
        netPoints: redNetPoints,
      },
    ],
  };
}
