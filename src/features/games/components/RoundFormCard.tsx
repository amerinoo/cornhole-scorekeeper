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
  inputs,
  previewThrows,
  bagsPerPlayer,
  namesById,
  onChange,
}: ThrowGroupProps) {
  return (
    <article className={`rounded-3xl border p-5 ${accentClassName}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>
      <div className="mt-4 grid gap-4">
        {inputs.map((playerThrow, index) => {
          const previewThrow = previewThrows[index];
          const bagsUsed = playerThrow.cornholes + playerThrow.woodies;
          const maxCornholes = bagsPerPlayer - playerThrow.woodies;
          const maxWoodies = bagsPerPlayer - playerThrow.cornholes;
          const misses = previewThrow?.misses ?? Math.max(0, bagsPerPlayer - bagsUsed);

          return (
            <div
              key={playerThrow.playerId}
              className="rounded-2xl border border-white/80 bg-white/80 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-base font-bold text-ink">
                  {namesById.get(playerThrow.playerId) ?? playerThrow.playerId}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {bagsUsed}/{bagsPerPlayer} usados
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <ValueControls
                  label="Cornholes"
                  value={playerThrow.cornholes}
                  total={bagsPerPlayer}
                  maxSelectable={maxCornholes}
                  onChange={(value) => {
                    onChange(playerThrow.playerId, 'cornholes', value);
                  }}
                />
                <ValueControls
                  label="Woodies"
                  value={playerThrow.woodies}
                  total={bagsPerPlayer}
                  maxSelectable={maxWoodies}
                  onChange={(value) => {
                    onChange(playerThrow.playerId, 'woodies', value);
                  }}
                />
                <ValueControls
                  label="Misses"
                  value={misses}
                  total={bagsPerPlayer}
                  maxSelectable={bagsPerPlayer}
                  interactive={false}
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

  return (
    <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Ronda
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">{heading}</h3>
          <p className="mt-2 text-sm text-slate-600">
            Cada jugador lanza {bagsPerPlayer} saco{bagsPerPlayer === 1 ? '' : 's'}
            {' '}en modo {game.mode}. Los misses se calculan automáticamente.
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
          accentClassName="border-blueTeam/30 bg-blueTeam/5"
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
          accentClassName="border-redTeam/30 bg-redTeam/5"
          inputs={formState.redThrows}
          previewThrows={preview.redThrows}
          bagsPerPlayer={bagsPerPlayer}
          namesById={namesById}
          onChange={(playerId, field, value) => {
            onChange('red', playerId, field, value);
          }}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Azul bruto / neto / misses
          </p>
          <p className="mt-2 text-2xl font-black text-blueTeam">
            {preview.blueRawScore} / {preview.blueNetScore}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            Misses {preview.blueThrows.reduce((sum, playerThrow) => sum + playerThrow.misses, 0)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Rojo bruto / neto / misses
          </p>
          <p className="mt-2 text-2xl font-black text-redTeam">
            {preview.redRawScore} / {preview.redNetScore}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            Misses {preview.redThrows.reduce((sum, playerThrow) => sum + playerThrow.misses, 0)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Marcador si guardas ahora
          </p>
          <p className="mt-2 text-2xl font-black text-ink">
            {projectedBlueScore} - {projectedRedScore}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            Solo puntúa el equipo con mayor bruto en la cancelación.
          </p>
        </div>
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

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="sticky bottom-4 mt-6 w-full rounded-3xl bg-ink px-5 py-4 text-sm font-semibold text-white shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? 'Guardando ronda...'
          : editingRoundNumber
            ? 'Guardar cambios de la ronda'
            : 'Guardar ronda'}
      </button>
    </article>
  );
}
