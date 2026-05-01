import type {
  GameMode,
  PlayerThrow,
  PlayerThrowInput,
  RoundCalculation,
  Round,
  SaveRoundInput,
  TargetScore,
  TeamColor,
} from '../models';

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export type CancellationResult = {
  blueNetScore: number;
  redNetScore: number;
};

export type WinnerResult = TeamColor | undefined;

export type RecalculatedGameScore = {
  blueScore: number;
  redScore: number;
  winnerTeam: WinnerResult;
  status: 'setup' | 'in_progress' | 'finished';
};

export type StoredPlayerThrowInput = Pick<
  PlayerThrow,
  'playerId' | 'cornholes' | 'woodies'
> &
  Partial<Pick<PlayerThrow, 'misses' | 'rawScore' | 'bagsThrown'>>;

export function getBagsPerPlayer(mode: GameMode): number {
  return mode === '1v1' ? 4 : 2;
}

export function calculateMisses(
  mode: GameMode,
  cornholes: number,
  woodies: number,
): number {
  return getBagsPerPlayer(mode) - cornholes - woodies;
}

export function calculateRawScore(cornholes: number, woodies: number): number {
  return cornholes * 3 + woodies;
}

export function validatePlayerThrow(
  mode: GameMode,
  playerThrow: StoredPlayerThrowInput,
): ValidationResult {
  const errors: string[] = [];
  const bagsPerPlayer = getBagsPerPlayer(mode);
  const thrownBags = playerThrow.cornholes + playerThrow.woodies;
  const expectedMisses = calculateMisses(
    mode,
    playerThrow.cornholes,
    playerThrow.woodies,
  );
  const expectedRawScore = calculateRawScore(
    playerThrow.cornholes,
    playerThrow.woodies,
  );

  if (!playerThrow.playerId.trim()) {
    errors.push('El jugador es obligatorio.');
  }

  if (playerThrow.cornholes < 0 || playerThrow.woodies < 0) {
    errors.push('Los valores no pueden ser negativos.');
  }

  if (thrownBags > bagsPerPlayer) {
    errors.push(
      `El jugador no puede superar ${bagsPerPlayer} sacos en modo ${mode}.`,
    );
  }

  if (
    typeof playerThrow.bagsThrown === 'number' &&
    playerThrow.bagsThrown !== bagsPerPlayer
  ) {
    errors.push(
      `bagsThrown debe ser ${bagsPerPlayer} en modo ${mode} para cada jugador.`,
    );
  }

  if (
    typeof playerThrow.misses === 'number' &&
    playerThrow.misses !== expectedMisses
  ) {
    errors.push('misses no coincide con el cálculo automático.');
  }

  if (
    typeof playerThrow.rawScore === 'number' &&
    playerThrow.rawScore !== expectedRawScore
  ) {
    errors.push('rawScore no coincide con la puntuación calculada.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateTeamThrows(
  mode: GameMode,
  throwsByTeam: PlayerThrow[],
): ValidationResult {
  const errors: string[] = [];
  const expectedPlayers = mode === '1v1' ? 1 : 2;
  const expectedBags = 4;

  if (throwsByTeam.length !== expectedPlayers) {
    errors.push(
      `El equipo debe tener ${expectedPlayers} jugador(es) en modo ${mode}.`,
    );
  }

  for (const playerThrow of throwsByTeam) {
    const playerValidation = validatePlayerThrow(mode, playerThrow);
    errors.push(...playerValidation.errors);
  }

  const totalBags = throwsByTeam.reduce(
    (sum, playerThrow) => sum + playerThrow.bagsThrown,
    0,
  );

  if (totalBags !== expectedBags) {
    errors.push(`El equipo debe lanzar exactamente ${expectedBags} sacos.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function buildPlayerThrow(
  mode: GameMode,
  playerThrow: PlayerThrowInput,
): PlayerThrow {
  const bagsThrown = getBagsPerPlayer(mode);

  return {
    playerId: playerThrow.playerId,
    cornholes: playerThrow.cornholes,
    woodies: playerThrow.woodies,
    misses: calculateMisses(mode, playerThrow.cornholes, playerThrow.woodies),
    rawScore: calculateRawScore(playerThrow.cornholes, playerThrow.woodies),
    bagsThrown,
  };
}

export function calculateRound(
  mode: GameMode,
  blueInputs: PlayerThrowInput[],
  redInputs: PlayerThrowInput[],
): RoundCalculation {
  const blueThrows = blueInputs.map((playerThrow) =>
    buildPlayerThrow(mode, playerThrow),
  );
  const redThrows = redInputs.map((playerThrow) =>
    buildPlayerThrow(mode, playerThrow),
  );
  const blueRawScore = calculateTeamRawScore(blueThrows);
  const redRawScore = calculateTeamRawScore(redThrows);
  const cancellation = calculateCancellation(blueRawScore, redRawScore);

  return {
    blueThrows,
    redThrows,
    blueRawScore,
    redRawScore,
    blueNetScore: cancellation.blueNetScore,
    redNetScore: cancellation.redNetScore,
  };
}

export function validateRoundInput(
  input: SaveRoundInput,
): ValidationResult {
  const errors: string[] = [];
  const calculatedRound = calculateRound(
    input.mode,
    input.blueThrows,
    input.redThrows,
  );
  const blueValidation = validateTeamThrows(input.mode, calculatedRound.blueThrows);
  const redValidation = validateTeamThrows(input.mode, calculatedRound.redThrows);

  errors.push(...blueValidation.errors.map((error) => `Azul: ${error}`));
  errors.push(...redValidation.errors.map((error) => `Rojo: ${error}`));

  const totalRoundBags =
    calculatedRound.blueThrows.reduce(
      (sum, playerThrow) => sum + playerThrow.bagsThrown,
      0,
    ) +
    calculatedRound.redThrows.reduce(
      (sum, playerThrow) => sum + playerThrow.bagsThrown,
      0,
    );

  if (totalRoundBags !== 8) {
    errors.push('La ronda debe sumar exactamente 8 sacos.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function calculateTeamRawScore(throwsByTeam: PlayerThrow[]): number {
  return throwsByTeam.reduce((sum, playerThrow) => sum + playerThrow.rawScore, 0);
}

export function calculateCancellation(
  blueRawScore: number,
  redRawScore: number,
): CancellationResult {
  if (blueRawScore > redRawScore) {
    return {
      blueNetScore: blueRawScore - redRawScore,
      redNetScore: 0,
    };
  }

  if (redRawScore > blueRawScore) {
    return {
      blueNetScore: 0,
      redNetScore: redRawScore - blueRawScore,
    };
  }

  return {
    blueNetScore: 0,
    redNetScore: 0,
  };
}

export function detectWinner(
  blueScore: number,
  redScore: number,
  targetScore: TargetScore,
): WinnerResult {
  if (blueScore >= targetScore && blueScore > redScore) {
    return 'blue';
  }

  if (redScore >= targetScore && redScore > blueScore) {
    return 'red';
  }

  return undefined;
}

export function recalculateGameScore(
  rounds: Pick<Round, 'blueNetScore' | 'redNetScore'>[],
  targetScore: TargetScore,
): RecalculatedGameScore {
  const totals = rounds.reduce(
    (accumulator, round) => ({
      blueScore: accumulator.blueScore + round.blueNetScore,
      redScore: accumulator.redScore + round.redNetScore,
    }),
    { blueScore: 0, redScore: 0 },
  );

  const winnerTeam = detectWinner(
    totals.blueScore,
    totals.redScore,
    targetScore,
  );

  if (winnerTeam) {
    return {
      ...totals,
      winnerTeam,
      status: 'finished',
    };
  }

  return {
    ...totals,
    winnerTeam: undefined,
    status: rounds.length === 0 ? 'setup' : 'in_progress',
  };
}
