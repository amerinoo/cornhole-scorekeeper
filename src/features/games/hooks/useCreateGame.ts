import { useState } from 'react';
import type { CreateGameInput } from '../../../models';
import { createGame } from '../../../services/games';

type UseCreateGameResult = {
  isSubmitting: boolean;
  error: string | null;
  create: (input: CreateGameInput) => Promise<string | null>;
};

export function useCreateGame(): UseCreateGameResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    isSubmitting,
    error,
    create: async (input) => {
      setIsSubmitting(true);
      setError(null);

      try {
        return await createGame(input);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'No se pudo crear la partida.',
        );
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
  };
}
