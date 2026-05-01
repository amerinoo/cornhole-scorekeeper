import { useState } from 'react';
import {
  createPlayer,
  deletePlayer,
  updatePlayer,
} from '../../../services/players';

type UsePlayerActionsResult = {
  isSubmitting: boolean;
  error: string | null;
  create: (name: string) => Promise<boolean>;
  update: (playerId: string, name: string) => Promise<boolean>;
  remove: (playerId: string) => Promise<boolean>;
  clearError: () => void;
};

export function usePlayerActions(): UsePlayerActionsResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<void>): Promise<boolean> {
    setIsSubmitting(true);
    setError(null);

    try {
      await action();
      return true;
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'No se pudo completar la acción.',
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isSubmitting,
    error,
    create: (name: string) => {
      return run(async () => {
        await createPlayer(name);
      });
    },
    update: (playerId: string, name: string) => {
      return run(async () => {
        await updatePlayer(playerId, name);
      });
    },
    remove: (playerId: string) => {
      return run(async () => {
        await deletePlayer(playerId);
      });
    },
    clearError: () => {
      setError(null);
    },
  };
}
