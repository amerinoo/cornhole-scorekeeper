import type { CreateGameInput } from '../../models';

export type GameSetupValidationResult = {
  isValid: boolean;
  errors: string[];
};

export function validateCreateGameInput(
  input: CreateGameInput,
): GameSetupValidationResult {
  const errors: string[] = [];
  const expectedPlayersPerTeam = input.mode === '1v1' ? 1 : 2;

  if (input.bluePlayerIds.length !== expectedPlayersPerTeam) {
    errors.push(
      `Equipo Azul debe tener ${expectedPlayersPerTeam} jugador(es) en ${input.mode}.`,
    );
  }

  if (input.redPlayerIds.length !== expectedPlayersPerTeam) {
    errors.push(
      `Equipo Rojo debe tener ${expectedPlayersPerTeam} jugador(es) en ${input.mode}.`,
    );
  }

  const allPlayerIds = [...input.bluePlayerIds, ...input.redPlayerIds];
  const uniqueIds = new Set(allPlayerIds);

  if (allPlayerIds.length !== uniqueIds.size) {
    errors.push('Un mismo jugador no puede estar en ambos equipos.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
