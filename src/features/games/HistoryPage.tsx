import { FirebaseStatusBanner } from '../../components/FirebaseStatusBanner';
import { usePlayers } from '../players/hooks/usePlayers';
import { GameSummaryCard } from './components/GameSummaryCard';
import { useGames } from './hooks/useGames';

export function HistoryPage() {
  const { games, isLoading, error } = useGames();
  const { players } = usePlayers();
  const namesById = new Map(players.map((player) => [player.id, player.name]));
  const finishedGames = games.filter((game) => game.status === 'finished');

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
        {finishedGames.map((game) => (
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
    </section>
  );
}
