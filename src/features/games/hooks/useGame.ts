import { useEffect, useState } from 'react';
import type { Game } from '../../../models';
import { subscribeToGame } from '../../../services/games';

type UseGameResult = {
  game: Game | null;
  isLoading: boolean;
  error: string | null;
};

export function useGame(gameId: string): UseGameResult {
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToGame(
      gameId,
      (nextGame) => {
        setGame(nextGame);
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
    game,
    isLoading,
    error,
  };
}
