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
  tone = 'dark',
}: {
  playerIds: string[];
  namesById: Map<string, string>;
  tone?: 'dark' | 'light' | 'plain';
}) {
  const chipClassName =
    tone === 'plain'
      ? 'bg-transparent text-slate-700 ring-0'
      : tone === 'light'
        ? 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
        : 'bg-white/15 text-white ring-1 ring-white/15';

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {playerIds.map((playerId, index) => (
        <div key={playerId} className="flex items-center gap-2">
          {tone === 'plain' && index > 0 ? (
            <span className="text-xs font-black text-slate-300">·</span>
          ) : null}
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${chipClassName}`}>
            {namesById.get(playerId) ?? playerId}
          </span>
        </div>
      ))}
    </div>
  );
}

function PlayerNamesInline({
  playerIds,
  namesById,
}: {
  playerIds: string[];
  namesById: Map<string, string>;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-slate-700">
      {playerIds.map((playerId, index) => (
        <div key={playerId} className="flex items-center gap-2">
          {index > 0 ? <span className="text-xs font-black text-slate-300">·</span> : null}
          <span>{namesById.get(playerId) ?? playerId}</span>
        </div>
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
        : 'border-slate-200 bg-slate-100 text-ink';

  return (
    <article className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 ${toneClassName}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="text-sm font-black tracking-tight sm:text-base">{value}</p>
    </article>
  );
}

export function HomePage() {
  const { games, isLoading } = useGames();
  const { players } = usePlayers();
  const namesById = new Map(players.map((player) => [player.id, player.name]));
  const canStartGame = players.length >= 2;
  const canStart2v2 = players.length >= 4;

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
            {canStartGame
              ? 'Abre una partida y empieza a puntuar.'
              : 'Prepara jugadores y deja la app lista para jugar.'}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Diseñada para móvil, marcador en tiempo real y control rápido de rondas.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to={canStartGame ? '/partidas/nueva' : '/jugadores'}
              className="inline-flex items-center justify-center rounded-[1.4rem] bg-ink px-5 py-4 text-sm font-semibold text-white"
            >
              {canStartGame ? 'Nueva partida' : 'Crear jugadores'}
            </Link>
            <Link
              to={canStartGame ? '/jugadores' : '/reglas'}
              className="inline-flex items-center justify-center rounded-[1.4rem] border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700"
            >
              {canStartGame ? 'Gestionar jugadores' : 'Ver reglas'}
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <StatCard label="Jugadores" value={players.length} />
            <StatCard label="En curso" value={ongoingGames.length} tone="blue" />
            <StatCard label="Finalizadas" value={finishedGames.length} tone="red" />
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-ink">Estado de preparación</p>
            <p className="mt-2">
              {canStartGame
                ? `Ya puedes jugar 1v1. ${canStart2v2 ? 'También puedes crear partidas 2v2.' : 'Añade 2 jugadores más para activar 2v2.'}`
                : 'Necesitas al menos 2 jugadores para crear una partida.'}
            </p>
          </div>
        </article>

        {latestOngoingGame ? (
          <article className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Continuar partida
                  </p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-ink">
                    La más reciente
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                    {latestOngoingGame.mode}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                    Objetivo {latestOngoingGame.targetScore}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                    {formatRelativeMinutes(
                      latestOngoingGame.updatedAt ?? latestOngoingGame.createdAt,
                    ) ?? 'actividad reciente'}
                  </span>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="min-w-0 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blueTeam/70">
                      Azul
                    </p>
                    <p className="mt-1 text-4xl font-black tracking-tight text-blueTeam sm:text-5xl">
                      {latestOngoingGame.blueScore}
                    </p>
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    VS
                  </span>
                  <div className="min-w-0 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-redTeam/70">
                      Rojo
                    </p>
                    <p className="mt-1 text-4xl font-black tracking-tight text-redTeam sm:text-5xl">
                      {latestOngoingGame.redScore}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-blueTeam/20 bg-blueTeam/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blueTeam/80">
                    Equipo Azul
                  </p>
                  <PlayerChips
                    playerIds={latestOngoingGame.bluePlayerIds}
                    namesById={namesById}
                    tone="plain"
                  />
                </div>

                <div className="rounded-[1.4rem] border border-redTeam/20 bg-redTeam/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-redTeam/80">
                    Equipo Rojo
                  </p>
                  <PlayerChips
                    playerIds={latestOngoingGame.redPlayerIds}
                    namesById={namesById}
                    tone="plain"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/game/${latestOngoingGame.id}`}
                className="inline-flex items-center justify-center rounded-[1.4rem] bg-ink px-5 py-4 text-sm font-semibold text-white"
              >
                Continuar ahora
              </Link>
              <Link
                to="/partidas/en-curso"
                className="inline-flex items-center justify-center rounded-[1.4rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700"
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
          {latestFinishedGame ? (
            <>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Último resultado
                    </p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-ink">
                      Partida finalizada
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                      {latestFinishedGame.mode}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                      Objetivo {latestFinishedGame.targetScore}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                      {formatRelativeMinutes(
                        latestFinishedGame.finishedAt ??
                          latestFinishedGame.updatedAt ??
                          latestFinishedGame.createdAt,
                      ) ?? 'partida reciente'}
                    </span>
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div className="min-w-0 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blueTeam/70">
                        Azul
                      </p>
                      <p className="mt-1 text-4xl font-black tracking-tight text-blueTeam sm:text-5xl">
                        {latestFinishedGame.blueScore}
                      </p>
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      VS
                    </span>
                    <div className="min-w-0 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-redTeam/70">
                        Rojo
                      </p>
                      <p className="mt-1 text-4xl font-black tracking-tight text-redTeam sm:text-5xl">
                        {latestFinishedGame.redScore}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-blueTeam/20 bg-blueTeam/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blueTeam/80">
                    Equipo Azul
                  </p>
                  <PlayerNamesInline
                    playerIds={latestFinishedGame.bluePlayerIds}
                    namesById={namesById}
                  />
                </div>

                <div className="rounded-[1.4rem] border border-redTeam/20 bg-redTeam/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-redTeam/80">
                    Equipo Rojo
                  </p>
                  <PlayerNamesInline
                    playerIds={latestFinishedGame.redPlayerIds}
                    namesById={namesById}
                  />
                </div>
              </div>
              </div>

              <Link
                to="/historial"
                className="mt-5 inline-flex rounded-[1.4rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700"
              >
                Ver historial
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Último resultado
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Aún no hay partidas finalizadas.
              </p>
            </>
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
