import { useEffect, useState } from 'react';
import type { Game } from '../../../models';
import { subscribeToGames } from '../../../services/games';

type UseGamesResult = {
  games: Game[];
  isLoading: boolean;
  error: string | null;
};

export function useGames(): UseGamesResult {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToGames(
      (nextGames) => {
        setGames(nextGames);
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
    games,
    isLoading,
    error,
  };
}
