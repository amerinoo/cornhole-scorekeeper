import { Link } from 'react-router-dom';
import { formatRelativeMinutes, getFirestoreDate } from '../../utils/format';
import { useGames } from '../../features/games/hooks/useGames';
import { usePlayers } from '../../features/players/hooks/usePlayers';

const quickLinks = [
  {
    title: 'Partidas en curso',
    description: 'Retoma una partida activa.',
    to: '/partidas/en-curso',
    accent: 'border-blueTeam/20 bg-blueTeam/5',
  },
  {
    title: 'Historial',
    description: 'Consulta partidas finalizadas.',
    to: '/historial',
    accent: 'border-redTeam/20 bg-redTeam/5',
  },
  {
    title: 'Estadísticas',
    description: 'Métricas globales por jugador y color.',
    to: '/estadisticas',
    accent: 'border-slate-200 bg-white/90',
  },
];

function PlayerChips({
  playerIds,
  namesById,
}: {
  playerIds: string[];
  namesById: Map<string, string>;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {playerIds.map((playerId) => (
        <span
          key={playerId}
          className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/15"
        >
          {namesById.get(playerId) ?? playerId}
        </span>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'blue' | 'red';
}) {
  const toneClassName =
    tone === 'blue'
      ? 'border-blueTeam/20 bg-blueTeam/5 text-blueTeam'
      : tone === 'red'
        ? 'border-redTeam/20 bg-redTeam/5 text-redTeam'
        : 'border-white/70 bg-white/90 text-ink';

  return (
    <article className={`rounded-[1.75rem] border p-4 shadow-card ${toneClassName}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
    </article>
  );
}

export function HomePage() {
  const { games, isLoading } = useGames();
  const { players } = usePlayers();
  const namesById = new Map(players.map((player) => [player.id, player.name]));

  const ongoingGames = games
    .filter((game) => game.status !== 'finished')
    .sort((left, right) => {
      const leftMs =
        getFirestoreDate(left.updatedAt ?? left.createdAt)?.getTime() ?? 0;
      const rightMs =
        getFirestoreDate(right.updatedAt ?? right.createdAt)?.getTime() ?? 0;
      return rightMs - leftMs;
    });

  const finishedGames = games
    .filter((game) => game.status === 'finished')
    .sort((left, right) => {
      const leftMs =
        getFirestoreDate(left.finishedAt ?? left.updatedAt ?? left.createdAt)?.getTime() ?? 0;
      const rightMs =
        getFirestoreDate(right.finishedAt ?? right.updatedAt ?? right.createdAt)?.getTime() ?? 0;
      return rightMs - leftMs;
    });

  const latestOngoingGame = ongoingGames[0];
  const latestFinishedGame = finishedGames[0];

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blueTeam/80">
            Inicio
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Abre una partida y empieza a puntuar.
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Diseñada para móvil, marcador en tiempo real y control rápido de rondas.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/partidas/nueva"
              className="inline-flex items-center justify-center rounded-[1.4rem] bg-ink px-5 py-4 text-sm font-semibold text-white"
            >
              Nueva partida
            </Link>
            <Link
              to="/jugadores"
              className="inline-flex items-center justify-center rounded-[1.4rem] border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700"
            >
              Gestionar jugadores
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <StatCard label="Jugadores" value={players.length} />
            <StatCard label="En curso" value={ongoingGames.length} tone="blue" />
            <StatCard label="Finalizadas" value={finishedGames.length} tone="red" />
          </div>
        </article>

        {latestOngoingGame ? (
          <article className="rounded-[2rem] bg-ink p-6 text-white shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
              Continuar partida
            </p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-200">
                  Azul
                </p>
                <p className="text-5xl font-black leading-none tracking-tight sm:text-6xl">
                  {latestOngoingGame.blueScore}
                </p>
              </div>
              <div className="pb-2 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
                  {latestOngoingGame.mode} · objetivo {latestOngoingGame.targetScore}
                </p>
                <p className="mt-2 text-sm font-semibold text-white/70">
                  {formatRelativeMinutes(
                    latestOngoingGame.updatedAt ?? latestOngoingGame.createdAt,
                  ) ?? 'actividad reciente'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-200">
                  Rojo
                </p>
                <p className="text-5xl font-black leading-none tracking-tight sm:text-6xl">
                  {latestOngoingGame.redScore}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                Equipo Azul
              </p>
              <PlayerChips playerIds={latestOngoingGame.bluePlayerIds} namesById={namesById} />
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                Equipo Rojo
              </p>
              <PlayerChips playerIds={latestOngoingGame.redPlayerIds} namesById={namesById} />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/game/${latestOngoingGame.id}`}
                className="inline-flex items-center justify-center rounded-[1.4rem] bg-white px-5 py-4 text-sm font-semibold text-ink"
              >
                Continuar ahora
              </Link>
              <Link
                to="/partidas/en-curso"
                className="inline-flex items-center justify-center rounded-[1.4rem] border border-white/15 bg-white/10 px-5 py-4 text-sm font-semibold text-white"
              >
                Ver todas
              </Link>
            </div>
          </article>
        ) : (
          <article className="rounded-[2rem] border border-slate-200 bg-sand p-6 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Sin partidas activas
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              No hay nada en juego.
            </h2>
            <p className="mt-3 text-sm text-slate-700">
              Crea una nueva partida y aparecerá aquí para retomarla rápido.
            </p>
            <Link
              to="/partidas/nueva"
              className="mt-6 inline-flex rounded-[1.4rem] bg-ink px-5 py-4 text-sm font-semibold text-white"
            >
              Crear partida
            </Link>
          </article>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <article className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Acceso rápido
              </p>
              <h3 className="mt-2 text-2xl font-black tracking-tight">
                Lo más usado
              </h3>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {quickLinks.map((link) => (
              <Link
                key={link.title}
                to={link.to}
                className={`rounded-[1.6rem] border p-4 transition hover:-translate-y-0.5 ${link.accent}`}
              >
                <p className="text-lg font-black tracking-tight">{link.title}</p>
                <p className="mt-2 text-sm text-slate-600">{link.description}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Último resultado
          </p>
          {latestFinishedGame ? (
            <>
              <h3 className="mt-3 text-3xl font-black tracking-tight">
                Azul {latestFinishedGame.blueScore} - {latestFinishedGame.redScore} Rojo
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {latestFinishedGame.mode} · objetivo {latestFinishedGame.targetScore}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {formatRelativeMinutes(
                  latestFinishedGame.finishedAt ??
                    latestFinishedGame.updatedAt ??
                    latestFinishedGame.createdAt,
                ) ?? 'partida reciente'}
              </p>
              <div className="mt-5 space-y-3 text-sm text-slate-700">
                <p>
                  <span className="font-semibold text-blueTeam">Azul:</span>{' '}
                  {latestFinishedGame.bluePlayerIds
                    .map((playerId) => namesById.get(playerId) ?? playerId)
                    .join(' · ')}
                </p>
                <p>
                  <span className="font-semibold text-redTeam">Rojo:</span>{' '}
                  {latestFinishedGame.redPlayerIds
                    .map((playerId) => namesById.get(playerId) ?? playerId)
                    .join(' · ')}
                </p>
              </div>
              <Link
                to="/historial"
                className="mt-6 inline-flex rounded-[1.4rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700"
              >
                Ver historial
              </Link>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              Aún no hay partidas finalizadas.
            </p>
          )}
        </article>
      </div>

      <Link
        to="/reglas"
        className="block rounded-[2rem] border border-slate-200 bg-sand p-5 shadow-card transition hover:-translate-y-0.5"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Reglas
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-2xl font-black tracking-tight">
              Consulta el formato y la puntuación.
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              1v1, 2v2, sacos por ronda, cancelación y condición de victoria.
            </p>
          </div>
          <span className="inline-flex rounded-[1.4rem] bg-white px-5 py-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
            Ver reglas
          </span>
        </div>
      </Link>

      {isLoading ? (
        <p className="text-sm text-slate-500">Sincronizando datos de Firestore...</p>
      ) : null}
    </section>
  );
}
