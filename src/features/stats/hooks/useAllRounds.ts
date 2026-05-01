import { useEffect, useState } from 'react';
import type { Round } from '../../../models';
import { subscribeToAllRounds } from '../../../services/rounds';

type UseAllRoundsResult = {
  rounds: Round[];
  isLoading: boolean;
  error: string | null;
};

export function useAllRounds(): UseAllRoundsResult {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToAllRounds(
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
  }, []);

  return {
    rounds,
    isLoading,
    error,
  };
}
