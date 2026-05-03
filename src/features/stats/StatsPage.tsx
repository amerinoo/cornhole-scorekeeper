import { useMemo, useState, type ReactNode } from 'react';
import { FirebaseStatusBanner } from '../../components/FirebaseStatusBanner';
import {
  CornholeIcon,
  MissIcon,
  WoodieIcon,
} from '../../components/icons';
import { formatPercent } from '../../utils/format';
import { useGames } from '../games/hooks/useGames';
import { usePlayers } from '../players/hooks/usePlayers';
import { aggregateGlobalStats } from './aggregation';
import { useAllRounds } from './hooks/useAllRounds';

function StatLabel({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-slate-500">{icon}</span>
      <span>{label}</span>
    </span>
  );
}

export function StatsPage() {
  const { players, isLoading: arePlayersLoading, error: playersError } = usePlayers();
  const { games, isLoading: areGamesLoading, error: gamesError } = useGames();
  const { rounds, isLoading: areRoundsLoading, error: roundsError } = useAllRounds();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<'victories' | 'accuracy' | 'rawScore' | 'gamesPlayed'>(
    'victories',
  );

  const isLoading = arePlayersLoading || areGamesLoading || areRoundsLoading;
  const error = playersError ?? gamesError ?? roundsError;
  const stats = aggregateGlobalStats(players, games, rounds);
  const finishedGames = games.filter((game) => game.status === 'finished').length;
  const totalRounds = rounds.length;
  const totalBags = stats.players.reduce((sum, player) => sum + player.bagsThrown, 0);
  const topWinner = stats.players[0] ?? null;
  const topAccuracyPlayer = [...stats.players]
    .filter((player) => player.bagsThrown > 0)
    .sort((left, right) => right.accuracy - left.accuracy)[0] ?? null;
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('es-ES');
  const sortedPlayers = useMemo(() => {
    const filteredPlayers = stats.players.filter((player) => {
      if (!normalizedSearch) {
        return true;
      }

      return player.playerName.toLocaleLowerCase('es-ES').includes(normalizedSearch);
    });

    return [...filteredPlayers].sort((left, right) => {
      if (sortKey === 'accuracy') {
        return right.accuracy - left.accuracy;
      }

      if (sortKey === 'rawScore') {
        return right.rawScore - left.rawScore;
      }

      if (sortKey === 'gamesPlayed') {
        return right.gamesPlayed - left.gamesPlayed;
      }

      return right.victories - left.victories;
    });
  }, [normalizedSearch, sortKey, stats.players]);

  return (
    <section className="space-y-6">
      <FirebaseStatusBanner />

      <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Estadísticas globales
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight">
          Resumen por jugador y por color
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Solo cuenta partidas finalizadas, con porcentajes de cornhole, woody,
          miss, victorias y acierto.
        </p>
      </article>

      {isLoading ? (
        <article className="rounded-3xl border border-white/70 bg-white/90 p-6 text-sm text-slate-600 shadow-card backdrop-blur">
          Cargando estadísticas...
        </article>
      ) : null}

      {error ? (
        <article className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </article>
      ) : null}

      {!isLoading ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-card backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Partidas cerradas
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-ink">{finishedGames}</p>
            </article>
            <article className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-card backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Rondas analizadas
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-ink">{totalRounds}</p>
            </article>
            <article className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-card backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Sacos lanzados
              </p>
              <p className="mt-2 text-3xl font-black tracking-tight text-ink">{totalBags}</p>
            </article>
            <article className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-card backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Mejor acierto
              </p>
              <p className="mt-2 text-xl font-black tracking-tight text-ink">
                {topAccuracyPlayer?.playerName ?? 'Sin datos'}
              </p>
              {topAccuracyPlayer ? (
                <p className="mt-2 text-sm text-slate-600">
                  {formatPercent(topAccuracyPlayer.accuracy)}
                </p>
              ) : null}
            </article>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {stats.colors.map((color) => (
              <article
                key={color.teamColor}
                className={`rounded-3xl border p-6 shadow-card ${
                  color.teamColor === 'blue'
                    ? 'border-blueTeam/30 bg-blueTeam/5'
                    : 'border-redTeam/30 bg-redTeam/5'
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Equipo {color.teamColor === 'blue' ? 'Azul' : 'Rojo'}
                </p>
                <p className="mt-3 text-3xl font-black text-ink">
                  {color.victories} victoria{color.victories === 1 ? '' : 's'}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Porcentaje de victoria:{' '}
                  <span className="font-semibold">{formatPercent(color.winRate)}</span>
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Puntos netos acumulados: <span className="font-semibold">{color.netPoints}</span>
                </p>
              </article>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Líder actual
              </p>
              <h3 className="mt-3 text-3xl font-black tracking-tight text-ink">
                {topWinner?.playerName ?? 'Sin resultados'}
              </h3>
              {topWinner ? (
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-700">
                    Victorias {topWinner.victories}
                  </span>
                  <span className="rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-700">
                    Partidas {topWinner.gamesPlayed}
                  </span>
                  <span className="rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-700">
                    Acierto {formatPercent(topWinner.accuracy)}
                  </span>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">
                  Aún no hay estadísticas acumuladas.
                </p>
              )}
            </article>

            <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Buscar y ordenar
                  </p>
                  <h3 className="mt-2 text-xl font-black tracking-tight text-ink">
                    Vista de jugadores
                  </h3>
                </div>
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  {sortedPlayers.length} visibles
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                  }}
                  placeholder="Buscar jugador"
                  className="min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blueTeam"
                />
                <select
                  value={sortKey}
                  onChange={(event) => {
                    setSortKey(event.target.value as typeof sortKey);
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blueTeam"
                >
                  <option value="victories">Ordenar por victorias</option>
                  <option value="accuracy">Ordenar por acierto</option>
                  <option value="rawScore">Ordenar por puntos brutos</option>
                  <option value="gamesPlayed">Ordenar por partidas</option>
                </select>
              </div>
            </article>
          </div>

          <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Jugadores
            </p>

            {sortedPlayers.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">
                No hay jugadores que coincidan con la búsqueda.
              </p>
            ) : null}

            <div className="mt-4 grid gap-3 lg:hidden">
              {sortedPlayers.map((player) => (
                <article
                  key={player.playerId}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black text-ink">{player.playerName}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Victorias {player.victories} · Partidas {player.gamesPlayed}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                      {formatPercent(player.accuracy)}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <StatLabel
                          icon={<CornholeIcon className="h-4 w-4" />}
                          label="Cornholes"
                        />
                      </p>
                      <p className="mt-2 font-black text-ink">{player.cornholes}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <StatLabel
                          icon={<WoodieIcon className="h-4 w-4" />}
                          label="Woodies"
                        />
                      </p>
                      <p className="mt-2 font-black text-ink">{player.woodies}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <StatLabel
                          icon={<MissIcon className="h-4 w-4" />}
                          label="Misses"
                        />
                      </p>
                      <p className="mt-2 font-black text-ink">{player.misses}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Brutos
                      </p>
                      <p className="mt-2 font-black text-ink">{player.rawScore}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-4 hidden overflow-x-auto lg:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Jugador</th>
                    <th className="px-3 py-3 font-semibold">
                      <StatLabel
                        icon={<CornholeIcon className="h-4 w-4" />}
                        label="Cornholes"
                      />
                    </th>
                    <th className="px-3 py-3 font-semibold">
                      <StatLabel
                        icon={<WoodieIcon className="h-4 w-4" />}
                        label="Woodies"
                      />
                    </th>
                    <th className="px-3 py-3 font-semibold">
                      <StatLabel
                        icon={<MissIcon className="h-4 w-4" />}
                        label="Misses"
                      />
                    </th>
                    <th className="px-3 py-3 font-semibold">Sacos</th>
                    <th className="px-3 py-3 font-semibold">Brutos</th>
                    <th className="px-3 py-3 font-semibold">Victorias</th>
                    <th className="px-3 py-3 font-semibold">Partidas</th>
                    <th className="px-3 py-3 font-semibold">Acierto</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map((player) => (
                    <tr key={player.playerId} className="border-b border-slate-100 last:border-0">
                      <td className="px-3 py-3 font-semibold text-ink">{player.playerName}</td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-ink">{player.cornholes}</div>
                        <div className="text-xs text-slate-500">
                          {formatPercent(player.cornholeRate)}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-ink">{player.woodies}</div>
                        <div className="text-xs text-slate-500">
                          {formatPercent(player.woodyRate)}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-ink">{player.misses}</div>
                        <div className="text-xs text-slate-500">
                          {formatPercent(player.missRate)}
                        </div>
                      </td>
                      <td className="px-3 py-3">{player.bagsThrown}</td>
                      <td className="px-3 py-3">{player.rawScore}</td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-ink">{player.victories}</div>
                        <div className="text-xs text-slate-500">
                          {formatPercent(player.winRate)}
                        </div>
                      </td>
                      <td className="px-3 py-3">{player.gamesPlayed}</td>
                      <td className="px-3 py-3">{formatPercent(player.accuracy)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </>
      ) : null}
    </section>
  );
}
