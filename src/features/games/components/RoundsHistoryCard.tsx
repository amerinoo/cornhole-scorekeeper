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
      </div>

      {rounds.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">
          Todavía no se ha guardado ninguna ronda.
        </p>
      ) : (
        <div className="mt-4 grid gap-4">
          {rounds.map((round) => (
            <article
              key={round.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-base font-bold text-ink">
                    Ronda {round.roundNumber}
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
                  {editingRoundId === round.id ? 'Editando' : 'Editar'}
                </button>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-blueTeam/20 bg-blueTeam/5 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blueTeam/80">
                    Azul
                  </p>
                  <p className="mt-2 text-lg font-black text-blueTeam">
                    Bruto {round.blueRawScore} · Neto {round.blueNetScore}
                  </p>
                  <div className="mt-3 grid gap-2">
                    {round.blueThrows.map((playerThrow) => (
                      <p key={playerThrow.playerId} className="text-sm text-slate-700">
                        <span className="font-semibold">
                          {namesById.get(playerThrow.playerId) ?? playerThrow.playerId}
                        </span>
                        {' · '}C {playerThrow.cornholes} · W {playerThrow.woodies} · M{' '}
                        {playerThrow.misses} · P {playerThrow.rawScore}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-redTeam/20 bg-redTeam/5 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-redTeam/80">
                    Rojo
                  </p>
                  <p className="mt-2 text-lg font-black text-redTeam">
                    Bruto {round.redRawScore} · Neto {round.redNetScore}
                  </p>
                  <div className="mt-3 grid gap-2">
                    {round.redThrows.map((playerThrow) => (
                      <p key={playerThrow.playerId} className="text-sm text-slate-700">
                        <span className="font-semibold">
                          {namesById.get(playerThrow.playerId) ?? playerThrow.playerId}
                        </span>
                        {' · '}C {playerThrow.cornholes} · W {playerThrow.woodies} · M{' '}
                        {playerThrow.misses} · P {playerThrow.rawScore}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </article>
  );
}
