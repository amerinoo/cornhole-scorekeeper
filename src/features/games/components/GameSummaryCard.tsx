import { Link } from 'react-router-dom';
import type { Game } from '../../../models';
import { tryFormatFirestoreDate } from '../../../utils/format';

type GameSummaryCardProps = {
  game: Game;
  namesById: Map<string, string>;
  actionLabel: string;
  to: string;
  showWinner?: boolean;
};

function renderPlayerNames(playerIds: string[], namesById: Map<string, string>): string {
  return playerIds.map((playerId) => namesById.get(playerId) ?? playerId).join(' · ');
}

export function GameSummaryCard({
  game,
  namesById,
  actionLabel,
  to,
  showWinner = false,
}: GameSummaryCardProps) {
  const createdAtLabel = tryFormatFirestoreDate(game.createdAt) ?? 'Sin fecha';
  const finishedAtLabel = tryFormatFirestoreDate(game.finishedAt);
  const winnerLabel =
    game.winnerTeam === 'blue'
      ? 'Ganador: Equipo Azul'
      : game.winnerTeam === 'red'
        ? 'Ganador: Equipo Rojo'
        : 'Sin ganador';

  return (
    <article className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-card backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            {game.mode} · objetivo {game.targetScore}
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">
            Azul {game.blueScore} - {game.redScore} Rojo
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Estado: <span className="font-semibold">{game.status}</span>
          </p>
          <p className="mt-1 text-sm text-slate-600">Creada: {createdAtLabel}</p>
          {finishedAtLabel ? (
            <p className="mt-1 text-sm text-slate-600">Finalizada: {finishedAtLabel}</p>
          ) : null}
          {showWinner ? (
            <p className="mt-1 text-sm font-semibold text-slate-700">{winnerLabel}</p>
          ) : null}
        </div>

        <Link
          to={to}
          className="inline-flex rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white"
        >
          {actionLabel}
        </Link>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-blueTeam/20 bg-blueTeam/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blueTeam/80">
            Equipo Azul
          </p>
          <p className="mt-2 text-sm text-slate-700">
            {renderPlayerNames(game.bluePlayerIds, namesById)}
          </p>
        </div>
        <div className="rounded-2xl border border-redTeam/20 bg-redTeam/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-redTeam/80">
            Equipo Rojo
          </p>
          <p className="mt-2 text-sm text-slate-700">
            {renderPlayerNames(game.redPlayerIds, namesById)}
          </p>
        </div>
      </div>
    </article>
  );
}
