import { FirebaseStatusBanner } from '../../components/FirebaseStatusBanner';
import { formatPercent } from '../../utils/format';
import { useGames } from '../games/hooks/useGames';
import { usePlayers } from '../players/hooks/usePlayers';
import { aggregateGlobalStats } from './aggregation';
import { useAllRounds } from './hooks/useAllRounds';

export function StatsPage() {
  const { players, isLoading: arePlayersLoading, error: playersError } = usePlayers();
  const { games, isLoading: areGamesLoading, error: gamesError } = useGames();
  const { rounds, isLoading: areRoundsLoading, error: roundsError } = useAllRounds();

  const isLoading = arePlayersLoading || areGamesLoading || areRoundsLoading;
  const error = playersError ?? gamesError ?? roundsError;
  const stats = aggregateGlobalStats(players, games, rounds);

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
          Cornholes, woodies, misses, sacos, puntos, victorias y acierto
          acumulado.
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
                <p className="mt-2 text-sm text-slate-700">
                  Puntos netos acumulados: <span className="font-semibold">{color.netPoints}</span>
                </p>
              </article>
            ))}
          </div>

          <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Jugadores
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Jugador</th>
                    <th className="px-3 py-3 font-semibold">Cornholes</th>
                    <th className="px-3 py-3 font-semibold">Woodies</th>
                    <th className="px-3 py-3 font-semibold">Misses</th>
                    <th className="px-3 py-3 font-semibold">Sacos</th>
                    <th className="px-3 py-3 font-semibold">Brutos</th>
                    <th className="px-3 py-3 font-semibold">Victorias</th>
                    <th className="px-3 py-3 font-semibold">Partidas</th>
                    <th className="px-3 py-3 font-semibold">Acierto</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.players.map((player) => (
                    <tr key={player.playerId} className="border-b border-slate-100 last:border-0">
                      <td className="px-3 py-3 font-semibold text-ink">{player.playerName}</td>
                      <td className="px-3 py-3">{player.cornholes}</td>
                      <td className="px-3 py-3">{player.woodies}</td>
                      <td className="px-3 py-3">{player.misses}</td>
                      <td className="px-3 py-3">{player.bagsThrown}</td>
                      <td className="px-3 py-3">{player.rawScore}</td>
                      <td className="px-3 py-3">{player.victories}</td>
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
