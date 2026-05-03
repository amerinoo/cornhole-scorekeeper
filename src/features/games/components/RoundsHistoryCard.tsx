import { useMemo, useState, type ReactNode } from 'react';
import {
  CornholeIcon,
  MissIcon,
  WoodieIcon,
} from '../../../components/icons';
import type { Round } from '../../../models';
import { tryFormatFirestoreDate } from '../../../utils/format';

type RoundsHistoryCardProps = {
  rounds: Round[];
  namesById: Map<string, string>;
  editingRoundId: string | null;
  canEditRound: (round: Round) => boolean;
  onEdit: (round: Round) => void;
};

function ThrowStat({
  icon,
  value,
}: {
  icon: ReactNode;
  value: number;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
      <span className="text-slate-500">{icon}</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </span>
  );
}

export function RoundsHistoryCard({
  rounds,
  namesById,
  editingRoundId,
  canEditRound,
  onEdit,
}: RoundsHistoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedRoundId, setExpandedRoundId] = useState<string | null>(null);
  const sortedRounds = useMemo(() => [...rounds].sort((a, b) => b.roundNumber - a.roundNumber), [rounds]);
  const latestRound = sortedRounds[0] ?? null;

  function getRoundNet(round: Round) {
    return round.blueNetScore > 0 ? round.blueNetScore : round.redNetScore;
  }

  function getRoundWinnerLabel(round: Round) {
    if (round.blueNetScore > 0) {
      return `Azul ${round.blueNetScore}`;
    }

    if (round.redNetScore > 0) {
      return `Rojo ${round.redNetScore}`;
    }

    return 'Empate 0';
  }

  function getCircleClassName(round: Round) {
    if (round.blueNetScore > 0) {
      return 'bg-blueTeam text-white';
    }

    if (round.redNetScore > 0) {
      return 'bg-redTeam text-white';
    }

    return 'bg-slate-200 text-slate-700';
  }

  return (
    <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Historial de rondas
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">
            {rounds.length} ronda{rounds.length === 1 ? '' : 's'}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsOpen((current) => !current);
          }}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
        >
          {isOpen ? 'Ocultar' : `Ver ${rounds.length} ronda${rounds.length === 1 ? '' : 's'}`}
        </button>
      </div>

      {rounds.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">
          Todavía no se ha guardado ninguna ronda.
        </p>
      ) : !isOpen ? (
        <div className="mt-4 rounded-[1.75rem] bg-slate-50 p-4">
          <p className="text-sm font-semibold text-ink">
            {latestRound ? `Última: ${getRoundWinnerLabel(latestRound)}` : 'Sin rondas todavía'}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {latestRound
              ? `Ronda ${latestRound.roundNumber} · Bruto ${latestRound.blueRawScore}-${latestRound.redRawScore}`
              : 'Despliega para ver y editar rondas anteriores.'}
          </p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-slate-200">
          {sortedRounds.map((round) => {
            const isRoundEditable = canEditRound(round);

            return (
              <div key={round.id} className="py-3">
              <button
                type="button"
                onClick={() => {
                  setExpandedRoundId((current) => (current === round.id ? null : round.id));
                }}
                className="flex w-full items-center gap-3 text-left"
              >
                <span className="min-w-20 text-sm font-black text-ink">
                  Ronda {round.roundNumber}
                </span>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${getCircleClassName(round)}`}
                >
                  {getRoundNet(round)}
                </span>
                <span className="min-w-0 flex-1 text-sm text-slate-600">
                  {getRoundWinnerLabel(round)} · Bruto {round.blueRawScore}-{round.redRawScore}
                </span>
              </button>

              {expandedRoundId === round.id ? (
                <div className="mt-4 rounded-[1.75rem] bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-black text-ink">
                        {getRoundWinnerLabel(round)}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Bruto: Azul {round.blueRawScore} · Rojo {round.redRawScore}
                      </p>
                      {tryFormatFirestoreDate(round.updatedAt) ? (
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          Actualizada {tryFormatFirestoreDate(round.updatedAt)}
                        </p>
                      ) : null}
                    </div>
                    {isRoundEditable ? (
                      <button
                        type="button"
                        onClick={() => {
                          onEdit(round);
                        }}
                        className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                          editingRoundId === round.id
                            ? 'bg-ink text-white'
                            : 'border border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        {editingRoundId === round.id ? 'Editando' : 'Editar ronda'}
                      </button>
                    ) : (
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Solo lectura
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-blueTeam">
                        Azul
                      </p>
                      <div className="mt-2 grid gap-2">
                        {round.blueThrows.map((playerThrow) => (
                          <div
                            key={playerThrow.playerId}
                            className="flex flex-wrap items-center gap-2 text-sm text-slate-700"
                          >
                            <span className="font-semibold">
                              {namesById.get(playerThrow.playerId) ?? playerThrow.playerId}
                            </span>
                            <ThrowStat
                              icon={<CornholeIcon className="h-3.5 w-3.5" />}
                              value={playerThrow.cornholes}
                            />
                            <ThrowStat
                              icon={<WoodieIcon className="h-3.5 w-3.5" />}
                              value={playerThrow.woodies}
                            />
                            <ThrowStat
                              icon={<MissIcon className="h-3.5 w-3.5" />}
                              value={playerThrow.misses}
                            />
                            <span className="text-sm font-semibold text-slate-600">
                              {playerThrow.rawScore} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-redTeam">
                        Rojo
                      </p>
                      <div className="mt-2 grid gap-2">
                        {round.redThrows.map((playerThrow) => (
                          <div
                            key={playerThrow.playerId}
                            className="flex flex-wrap items-center gap-2 text-sm text-slate-700"
                          >
                            <span className="font-semibold">
                              {namesById.get(playerThrow.playerId) ?? playerThrow.playerId}
                            </span>
                            <ThrowStat
                              icon={<CornholeIcon className="h-3.5 w-3.5" />}
                              value={playerThrow.cornholes}
                            />
                            <ThrowStat
                              icon={<WoodieIcon className="h-3.5 w-3.5" />}
                              value={playerThrow.woodies}
                            />
                            <ThrowStat
                              icon={<MissIcon className="h-3.5 w-3.5" />}
                              value={playerThrow.misses}
                            />
                            <span className="text-sm font-semibold text-slate-600">
                              {playerThrow.rawScore} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
