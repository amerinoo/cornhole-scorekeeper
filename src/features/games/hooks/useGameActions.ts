import { useState } from 'react';
import { deleteGame } from '../../../services/games';

type UseGameActionsResult = {
  isSubmitting: boolean;
  error: string | null;
  remove: (gameId: string) => Promise<boolean>;
  clearError: () => void;
};

export function useGameActions(): UseGameActionsResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    isSubmitting,
    error,
    remove: async (gameId: string) => {
      setIsSubmitting(true);
      setError(null);

      try {
        await deleteGame(gameId);
        return true;
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'No se pudo borrar la partida.',
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
