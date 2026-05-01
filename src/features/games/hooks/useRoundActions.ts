import { useState } from 'react';
import type { Game, PlayerThrowInput } from '../../../models';
import { createRound, updateRound } from '../../../services/rounds';

type UseRoundActionsResult = {
  isSubmitting: boolean;
  error: string | null;
  submitRound: (
    game: Game,
    roundId: string | null,
    blueThrows: PlayerThrowInput[],
    redThrows: PlayerThrowInput[],
  ) => Promise<boolean>;
  clearError: () => void;
};

export function useRoundActions(): UseRoundActionsResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    isSubmitting,
    error,
    submitRound: async (game, roundId, blueThrows, redThrows) => {
      setIsSubmitting(true);
      setError(null);

      try {
        if (roundId) {
          await updateRound(game, roundId, blueThrows, redThrows);
        } else {
          await createRound(game, blueThrows, redThrows);
        }

        return true;
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'No se pudo guardar la ronda.',
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    clearError: () => {
      setError(null);
    },
  };
}
