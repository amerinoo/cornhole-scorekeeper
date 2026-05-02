import type { Game, PlayerThrowInput, RoundCalculation } from '../../../models';
import { getBagsPerPlayer } from '../../../utils/scoring';

type RoundFormCardProps = {
  game: Game;
  namesById: Map<string, string>;
  formState: {
    blueThrows: PlayerThrowInput[];
    redThrows: PlayerThrowInput[];
  };
  preview: RoundCalculation;
  validationErrors: string[];
  submitError: string | null;
  isSubmitting: boolean;
  editingRoundNumber: number | null;
  projectedBlueScore: number;
  projectedRedScore: number;
  onChange: (
    team: 'blue' | 'red',
    playerId: string,
    field: 'cornholes' | 'woodies',
    value: number,
  ) => void;
  onSubmit: () => void;
  onCancelEdit: () => void;
};

type ThrowGroupProps = {
  title: string;
  accentClassName: string;
  accentTextClassName: string;
  dividerClassName: string;
  inputs: PlayerThrowInput[];
  previewThrows: RoundCalculation['blueThrows'];
  bagsPerPlayer: number;
  namesById: Map<string, string>;
  onChange: (
    playerId: string,
    field: 'cornholes' | 'woodies',
    value: number,
  ) => void;
};

function ValueControls({
  label,
  value,
  total,
  maxSelectable,
  onChange,
  interactive = true,
}: {
  label: string;
  value: number;
  total: number;
  maxSelectable: number;
  onChange?: (value: number) => void;
  interactive?: boolean;
}) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: total }, (_, index) => index + 1).map((preset) => {
          const isSelected = value === preset;
          const isDisabled = preset > maxSelectable;

          return (
            <button
              key={preset}
              type="button"
              disabled={!interactive || isDisabled}
              onClick={() => {
                onChange?.(isSelected ? 0 : preset);
              }}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-black transition ${
                isSelected
                  ? 'bg-ink text-white'
                  : isDisabled
                    ? 'border border-slate-200 bg-slate-100 text-slate-300'
                    : 'border border-slate-200 bg-white text-slate-700'
              } ${interactive ? '' : 'cursor-default'}`}
            >
              {preset}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ThrowGroup({
  title,
  accentClassName,
  accentTextClassName,
  dividerClassName,
  inputs,
  previewThrows,
  bagsPerPlayer,
  namesById,
  onChange,
}: ThrowGroupProps) {
  return (
    <article className={`rounded-[2rem] border px-5 py-4 ${accentClassName}`}>
      <p className={`text-sm font-black uppercase tracking-[0.2em] ${accentTextClassName}`}>
        {title}
      </p>
      <div className="mt-3">
        {inputs.map((playerThrow, index) => {
          const previewThrow = previewThrows[index];
          const maxCornholes = bagsPerPlayer - playerThrow.woodies;
          const maxWoodies = bagsPerPlayer - playerThrow.cornholes;

          return (
            <div
              key={playerThrow.playerId}
              className={`py-4 ${index === 0 ? '' : `border-t ${dividerClassName}`}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-base font-bold text-ink">
                  {namesById.get(playerThrow.playerId) ?? playerThrow.playerId}
                </p>
                <div className="min-w-12 rounded-full bg-ink px-3 py-1 text-center text-sm font-black text-white">
                  {previewThrow?.rawScore ?? 0}
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <ValueControls
                  label="Cornholes (+3)"
                  value={playerThrow.cornholes}
                  total={bagsPerPlayer}
                  maxSelectable={maxCornholes}
                  onChange={(value) => {
                    onChange(playerThrow.playerId, 'cornholes', value);
                  }}
                />
                <ValueControls
                  label="Woodies (+1)"
                  value={playerThrow.woodies}
                  total={bagsPerPlayer}
                  maxSelectable={maxWoodies}
                  onChange={(value) => {
                    onChange(playerThrow.playerId, 'woodies', value);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export function RoundFormCard({
  game,
  namesById,
  formState,
  preview,
  validationErrors,
  submitError,
  isSubmitting,
  editingRoundNumber,
  projectedBlueScore,
  projectedRedScore,
  onChange,
  onSubmit,
  onCancelEdit,
}: RoundFormCardProps) {
  const bagsPerPlayer = getBagsPerPlayer(game.mode);
  const heading = editingRoundNumber
    ? `Editar ronda ${editingRoundNumber}`
    : 'Registrar nueva ronda';
  const roundSummaryLabel =
    preview.blueNetScore > 0
      ? `Azul ${preview.blueNetScore}`
      : preview.redNetScore > 0
        ? `Rojo ${preview.redNetScore}`
        : 'Empate 0';

  return (
    <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Ronda
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">{heading}</h3>
          <p className="mt-2 text-sm text-slate-600">
            Cada jugador lanza {bagsPerPlayer} saco{bagsPerPlayer === 1 ? '' : 's'} en modo {game.mode}.
          </p>
        </div>

        {editingRoundNumber ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
          >
            Cancelar edición
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <ThrowGroup
          title="Equipo Azul"
          accentClassName="border-blueTeam/20 bg-blueTeam/5"
          accentTextClassName="text-blueTeam"
          dividerClassName="border-blueTeam/15"
          inputs={formState.blueThrows}
          previewThrows={preview.blueThrows}
          bagsPerPlayer={bagsPerPlayer}
          namesById={namesById}
          onChange={(playerId, field, value) => {
            onChange('blue', playerId, field, value);
          }}
        />
        <ThrowGroup
          title="Equipo Rojo"
          accentClassName="border-redTeam/20 bg-redTeam/5"
          accentTextClassName="text-redTeam"
          dividerClassName="border-redTeam/15"
          inputs={formState.redThrows}
          previewThrows={preview.redThrows}
          bagsPerPlayer={bagsPerPlayer}
          namesById={namesById}
          onChange={(playerId, field, value) => {
            onChange('red', playerId, field, value);
          }}
        />
      </div>

      <div className="mt-6 rounded-[2rem] border border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <p className="text-lg font-black text-blueTeam">Azul {preview.blueNetScore}</p>
          <p className="text-lg font-black text-redTeam">Rojo {preview.redNetScore}</p>
          <p className="text-lg font-black text-ink">{roundSummaryLabel}</p>
        </div>
        <p className="mt-2 text-sm font-medium text-slate-600">
          Bruto: Azul {preview.blueRawScore} · Rojo {preview.redRawScore}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-600">
          Marcador si guardas: {projectedBlueScore} - {projectedRedScore}
        </p>
      </div>

      {validationErrors.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {validationErrors.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      ) : null}

      {submitError ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}

      <div className="sticky bottom-4 mt-6 rounded-[2rem] bg-white/95 p-2 shadow-xl backdrop-blur">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full rounded-[1.4rem] bg-ink px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? 'Guardando ronda...'
            : editingRoundNumber
              ? 'Guardar cambios de la ronda'
              : 'Guardar ronda'}
        </button>
      </div>
    </article>
  );
}
