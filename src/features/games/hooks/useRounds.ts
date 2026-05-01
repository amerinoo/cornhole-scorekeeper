import { useEffect, useState } from 'react';
import type { Round } from '../../../models';
import { subscribeToRounds } from '../../../services/rounds';

type UseRoundsResult = {
  rounds: Round[];
  isLoading: boolean;
  error: string | null;
};

export function useRounds(gameId: string): UseRoundsResult {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToRounds(
      gameId,
      (nextRounds) => {
        setRounds(nextRounds);
        setIsLoading(false);
      },
      (nextError) => {
        setError(nextError.message);
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [gameId]);

  return {
    rounds,
    isLoading,
    error,
  };
}
