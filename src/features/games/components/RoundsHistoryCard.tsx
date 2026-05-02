import { useMemo, useState } from 'react';
import type { Round } from '../../../models';
import { tryFormatFirestoreDate } from '../../../utils/format';

type RoundsHistoryCardProps = {
  rounds: Round[];
  namesById: Map<string, string>;
  editingRoundId: string | null;
  onEdit: (round: Round) => void;
};

export function RoundsHistoryCard({
  rounds,
  namesById,
  editingRoundId,
  onEdit,
}: RoundsHistoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedRoundId, setExpandedRoundId] = useState<string | null>(null);
  const sortedRounds = useMemo(() => [...rounds].sort((a, b) => b.roundNumber - a.roundNumber), [rounds]);

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
          {isOpen ? 'Ocultar' : 'Ver rondas'}
        </button>
      </div>

      {rounds.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">
          Todavía no se ha guardado ninguna ronda.
        </p>
      ) : !isOpen ? (
        <p className="mt-4 text-sm text-slate-600">
          Despliega para ver y editar rondas anteriores.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-slate-200">
          {sortedRounds.map((round) => (
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
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-blueTeam">
                        Azul
                      </p>
                      <div className="mt-2 grid gap-2">
                        {round.blueThrows.map((playerThrow) => (
                          <p key={playerThrow.playerId} className="text-sm text-slate-700">
                            <span className="font-semibold">
                              {namesById.get(playerThrow.playerId) ?? playerThrow.playerId}
                            </span>
                            {' · '}C {playerThrow.cornholes} · W {playerThrow.woodies} · M {playerThrow.misses} · T {playerThrow.rawScore}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-redTeam">
                        Rojo
                      </p>
                      <div className="mt-2 grid gap-2">
                        {round.redThrows.map((playerThrow) => (
                          <p key={playerThrow.playerId} className="text-sm text-slate-700">
                            <span className="font-semibold">
                              {namesById.get(playerThrow.playerId) ?? playerThrow.playerId}
                            </span>
                            {' · '}C {playerThrow.cornholes} · W {playerThrow.woodies} · M {playerThrow.misses} · T {playerThrow.rawScore}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
