import { Link } from 'react-router-dom';
import { formatRelativeMinutes, getFirestoreDate } from '../../utils/format';
import { useGames } from '../../features/games/hooks/useGames';
import { usePlayers } from '../../features/players/hooks/usePlayers';

const cards = [
  {
    title: 'Nueva partida',
    description: 'Configura un duelo 1v1 o 2v2 y arranca el marcador.',
    to: '/partidas/nueva',
    accent: 'border-blueTeam/30 bg-blueTeam/5',
  },
  {
    title: 'Jugadores',
    description: 'Gestiona la lista global de jugadores para estadísticas.',
    to: '/jugadores',
    accent: 'border-redTeam/30 bg-redTeam/5',
  },
  {
    title: 'Partidas en curso',
    description: 'Recupera una partida activa y sigue anotando rondas.',
    to: '/partidas/en-curso',
    accent: 'border-slate-300 bg-white',
  },
  {
    title: 'Historial',
    description: 'Consulta partidas finalizadas y sus resultados.',
    to: '/historial',
    accent: 'border-slate-300 bg-white',
  },
  {
    title: 'Estadísticas',
    description: 'Revisa métricas globales por jugador y por color.',
    to: '/estadisticas',
    accent: 'border-slate-300 bg-white',
  },
];

export function HomePage() {
  const { games, isLoading } = useGames();
  const { players } = usePlayers();
  const namesById = new Map(players.map((player) => [player.id, player.name]));
  const latestOngoingGame = games
    .filter((game) => game.status !== 'finished')
    .sort((left, right) => {
      const leftMs =
        getFirestoreDate(left.updatedAt ?? left.createdAt)?.getTime() ?? 0;
      const rightMs =
        getFirestoreDate(right.updatedAt ?? right.createdAt)?.getTime() ?? 0;
      return rightMs - leftMs;
    })[0];

  return (
    <section className="space-y-6">
      {latestOngoingGame ? (
        <article className="rounded-3xl border border-ink/10 bg-ink p-6 text-white shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
            Continuar última partida
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight">
                Azul {latestOngoingGame.blueScore} - {latestOngoingGame.redScore} Rojo
              </h2>
              <p className="mt-2 text-sm text-white/80">
                {latestOngoingGame.mode} · objetivo {latestOngoingGame.targetScore} ·{' '}
                {formatRelativeMinutes(
                  latestOngoingGame.updatedAt ?? latestOngoingGame.createdAt,
                ) ?? 'actividad reciente'}
              </p>
              <p className="mt-2 text-sm text-white/80">
                Azul: {latestOngoingGame.bluePlayerIds
                  .map((playerId) => namesById.get(playerId) ?? playerId)
                  .join(' · ')}
              </p>
              <p className="mt-1 text-sm text-white/80">
                Rojo: {latestOngoingGame.redPlayerIds
                  .map((playerId) => namesById.get(playerId) ?? playerId)
                  .join(' · ')}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                to={`/game/${latestOngoingGame.id}`}
                className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-ink"
              >
                Continuar ahora
              </Link>
              <Link
                to="/partidas/en-curso"
                className="inline-flex rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white"
              >
                Ver todas
              </Link>
            </div>
          </div>
        </article>
      ) : !isLoading ? (
        <article className="rounded-3xl border border-slate-200 bg-sand p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Acceso rápido
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight">
                No hay partidas en curso
              </h2>
              <p className="mt-2 text-sm text-slate-700">
                Crea una nueva y aparecerá aquí para retomarla con un toque.
              </p>
            </div>
            <Link
              to="/partidas/nueva"
              className="inline-flex rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              Crear partida
            </Link>
          </div>
        </article>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className={`rounded-3xl border p-5 shadow-card transition hover:-translate-y-0.5 ${card.accent}`}
          >
            <p className="text-lg font-bold">{card.title}</p>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-card backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Estado actual
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight">
            Fase 5 lista y fase extra añadida
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>CRUD básico de jugadores conectado a Firestore.</li>
            <li>Creación de partidas 1v1 y 2v2 con validación.</li>
            <li>Registro y edición de rondas con recálculo completo.</li>
            <li>Historial, estadísticas y lista de partidas en curso.</li>
          </ul>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-sand p-5 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Reglas clave
          </p>
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            <p>1v1: 4 sacos por jugador.</p>
            <p>2v2: 2 sacos por jugador.</p>
            <p>4 sacos por equipo y 8 por ronda.</p>
            <p>Cancelación neta por ronda.</p>
          </div>
        </article>
      </div>
    </section>
  );
}
