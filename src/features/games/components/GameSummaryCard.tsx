import { CompactScoreboard } from '../../../components/CompactScoreboard';
import { Link } from 'react-router-dom';
import type { Game } from '../../../models';
import {
  formatRelativeMinutes,
  tryFormatFirestoreDate,
} from '../../../utils/format';

type GameSummaryCardProps = {
  game: Game;
  namesById: Map<string, string>;
  actionLabel: string;
  to: string;
  showWinner?: boolean;
  badgeLabel?: string;
};

function renderPlayerNames(playerIds: string[], namesById: Map<string, string>): string {
  return playerIds.map((playerId) => namesById.get(playerId) ?? playerId).join(' · ');
}

export function getStatusLabel(status: Game['status']): string {
  if (status === 'finished') {
    return 'Finalizada';
  }

  if (status === 'in_progress') {
    return 'En curso';
  }

  return 'Preparación';
}

export function GameSummaryCard({
  game,
  namesById,
  actionLabel,
  to,
  showWinner = false,
  badgeLabel,
}: GameSummaryCardProps) {
  const createdAtLabel = tryFormatFirestoreDate(game.createdAt) ?? 'Sin fecha';
  const finishedAtLabel = tryFormatFirestoreDate(game.finishedAt);
  const activityLabel = formatRelativeMinutes(game.updatedAt ?? game.createdAt);
  const winnerLabel =
    game.winnerTeam === 'blue'
      ? 'Ganador: Equipo Azul'
      : game.winnerTeam === 'red'
        ? 'Ganador: Equipo Rojo'
        : 'Sin ganador';

  return (
    <article className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-card backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
              {game.mode} · objetivo {game.targetScore}
            </p>
            <p className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-ink ring-1 ring-slate-200">
              {getStatusLabel(game.status)}
            </p>
            {badgeLabel ? (
              <p className="inline-flex rounded-full bg-sand px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-ink">
                {badgeLabel}
              </p>
            ) : null}
          </div>

          <CompactScoreboard
            blueScore={game.blueScore}
            redScore={game.redScore}
            size="sm"
            className="mt-4 rounded-[1.4rem]"
          />

          {activityLabel ? (
            <p className="mt-4 text-sm text-slate-600">
              Última actividad: {activityLabel}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-slate-600">Creada: {createdAtLabel}</p>
          {finishedAtLabel ? (
            <p className="mt-1 text-sm text-slate-600">Finalizada: {finishedAtLabel}</p>
          ) : null}
          {showWinner ? (
            <p className="mt-1 text-sm font-semibold text-slate-700">{winnerLabel}</p>
          ) : null}
        </div>

        <div className="flex w-full lg:w-auto">
          <Link
            to={to}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white lg:w-auto"
          >
            {actionLabel}
          </Link>
        </div>
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
