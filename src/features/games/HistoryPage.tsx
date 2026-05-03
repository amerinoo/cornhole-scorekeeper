import { useMemo, useState } from 'react';
import { FirebaseStatusBanner } from '../../components/FirebaseStatusBanner';
import { getFirestoreDate } from '../../utils/format';
import { usePlayers } from '../players/hooks/usePlayers';
import { GameSummaryCard } from './components/GameSummaryCard';
import { useGames } from './hooks/useGames';

export function HistoryPage() {
  const { games, isLoading, error } = useGames();
  const { players } = usePlayers();
  const [searchTerm, setSearchTerm] = useState('');
  const namesById = new Map(players.map((player) => [player.id, player.name]));
  const finishedGames = useMemo(
    () =>
      games
        .filter((game) => game.status === 'finished')
        .sort((left, right) => {
          const leftMs =
            getFirestoreDate(left.finishedAt ?? left.updatedAt ?? left.createdAt)?.getTime() ?? 0;
          const rightMs =
            getFirestoreDate(right.finishedAt ?? right.updatedAt ?? right.createdAt)?.getTime() ?? 0;
          return rightMs - leftMs;
        }),
    [games],
  );
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('es-ES');
  const filteredGames = finishedGames.filter((game) => {
    if (!normalizedSearch) {
      return true;
    }

    const haystack = [
      game.mode,
      `objetivo ${game.targetScore}`,
      game.winnerTeam === 'blue' ? 'azul' : game.winnerTeam === 'red' ? 'rojo' : '',
      ...game.bluePlayerIds.map((playerId) => namesById.get(playerId) ?? playerId),
      ...game.redPlayerIds.map((playerId) => namesById.get(playerId) ?? playerId),
    ]
      .join(' ')
      .toLocaleLowerCase('es-ES');

    return haystack.includes(normalizedSearch);
  });

  return (
    <section className="space-y-6">
      <FirebaseStatusBanner />

      <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Historial
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight">
          Partidas finalizadas
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Se muestran solo partidas cerradas, con resultado final y ganador.
        </p>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
            }}
            placeholder="Buscar por jugador, modo, ganador u objetivo"
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blueTeam"
          />
          <span className="rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
            {filteredGames.length} resultado{filteredGames.length === 1 ? '' : 's'}
          </span>
        </div>
      </article>

      {isLoading ? (
        <article className="rounded-3xl border border-white/70 bg-white/90 p-6 text-sm text-slate-600 shadow-card backdrop-blur">
          Cargando historial...
        </article>
      ) : null}

      {error ? (
        <article className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </article>
      ) : null}

      {!isLoading && finishedGames.length === 0 ? (
        <article className="rounded-3xl border border-slate-200 bg-sand p-6 text-sm text-slate-700 shadow-card">
          Aún no hay partidas terminadas.
        </article>
      ) : null}

      <div className="grid gap-4">
        {filteredGames.map((game) => (
          <GameSummaryCard
            key={game.id}
            game={game}
            namesById={namesById}
            actionLabel="Ver detalle"
            to={`/game/${game.id}`}
            showWinner
          />
        ))}
      </div>

      {!isLoading && finishedGames.length > 0 && filteredGames.length === 0 ? (
        <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-700 shadow-card backdrop-blur">
          No hay resultados que coincidan con la búsqueda.
        </article>
      ) : null}
    </section>
  );
}
