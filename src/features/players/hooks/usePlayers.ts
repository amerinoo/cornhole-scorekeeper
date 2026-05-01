import { useEffect, useState } from 'react';
import type { Player } from '../../../models';
import { subscribeToPlayers } from '../../../services/players';

type UsePlayersResult = {
  players: Player[];
  isLoading: boolean;
  error: string | null;
};

export function usePlayers(): UsePlayersResult {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToPlayers(
      (nextPlayers) => {
        setPlayers(nextPlayers);
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
    players,
    isLoading,
    error,
  };
}
