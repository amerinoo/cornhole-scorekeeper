import type { ReactNode } from "react";
import type { Game, PlayerThrowInput, RoundCalculation } from "../../../models";
import { CornholeIcon, PointsIcon, WoodieIcon } from "../../../components/icons";
import { getBagsPerPlayer } from "../../../utils/scoring";

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
  onChange: (
    team: "blue" | "red",
    playerId: string,
    field: "cornholes" | "woodies",
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
  previewThrows: RoundCalculation["blueThrows"];
  bagsPerPlayer: number;
  namesById: Map<string, string>;
  onChange: (
    playerId: string,
    field: "cornholes" | "woodies",
    value: number,
  ) => void;
};

function getUsedBags(input: PlayerThrowInput): number {
  return input.cornholes + input.woodies;
}

function ValueControls({
  label,
  icon,
  value,
  total,
  maxSelectable,
  onChange,
  interactive = true,
}: {
  label: string;
  icon: ReactNode;
  value: number;
  total: number;
  maxSelectable: number;
  onChange?: (value: number) => void;
  interactive?: boolean;
}) {
  return (
    <div className="space-y-2">
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-600 ring-1 ring-slate-200">
          {icon}
        </span>
        <span>{label}</span>
      </span>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: total }, (_, index) => index + 1).map(
          (preset) => {
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
                    ? "bg-ink text-white"
                    : isDisabled
                      ? "border border-slate-200 bg-slate-100 text-slate-300"
                      : "border border-slate-200 bg-white text-slate-700"
                } ${interactive ? "" : "cursor-default"}`}
              >
                {preset}
              </button>
            );
          },
        )}
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
      <p
        className={`text-sm font-black uppercase tracking-[0.2em] ${accentTextClassName}`}
      >
        {title}
      </p>
      <div className="mt-3">
        {inputs.map((playerThrow, index) => {
          const previewThrow = previewThrows[index];
          const maxCornholes = bagsPerPlayer - playerThrow.woodies;
          const maxWoodies = bagsPerPlayer - playerThrow.cornholes;
          const usedBags = getUsedBags(playerThrow);

          return (
            <div
              key={playerThrow.playerId}
              className={`py-4 ${index === 0 ? "" : `border-t ${dividerClassName}`}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-ink">
                    {namesById.get(playerThrow.playerId) ??
                      playerThrow.playerId}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {usedBags}/{bagsPerPlayer} sacos asignados
                  </p>
                </div>
                <div className="flex items-center justify-center text-ink">
                  <PointsIcon
                    className="h-12 w-12"
                    value={previewThrow?.rawScore ?? 0}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <ValueControls
                  label="Cornholes"
                  icon={<CornholeIcon className="h-3.5 w-3.5" />}
                  value={playerThrow.cornholes}
                  total={bagsPerPlayer}
                  maxSelectable={maxCornholes}
                  onChange={(value) => {
                    onChange(playerThrow.playerId, "cornholes", value);
                  }}
                />
                <ValueControls
                  label="Woodies"
                  icon={<WoodieIcon className="h-3.5 w-3.5" />}
                  value={playerThrow.woodies}
                  total={bagsPerPlayer}
                  maxSelectable={maxWoodies}
                  onChange={(value) => {
                    onChange(playerThrow.playerId, "woodies", value);
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
  onChange,
  onSubmit,
  onCancelEdit,
}: RoundFormCardProps) {
  const bagsPerPlayer = getBagsPerPlayer(game.mode);
  const heading = editingRoundNumber
    ? `Editar ronda ${editingRoundNumber}`
    : "Registrar nueva ronda";
  const totalBags =
    bagsPerPlayer * (formState.blueThrows.length + formState.redThrows.length);
  const blueUsedBags = formState.blueThrows.reduce(
    (sum, playerThrow) => sum + getUsedBags(playerThrow),
    0,
  );
  const redUsedBags = formState.redThrows.reduce(
    (sum, playerThrow) => sum + getUsedBags(playerThrow),
    0,
  );
  const usedBags = blueUsedBags + redUsedBags;
  const roundPreviewValue =
    preview.blueNetScore > 0
      ? `+${preview.blueNetScore}`
      : preview.redNetScore > 0
        ? `+${preview.redNetScore}`
        : "0";
  const roundPreviewClassName =
    preview.blueNetScore > 0
      ? "bg-blueTeam text-white"
      : preview.redNetScore > 0
        ? "bg-redTeam text-white"
        : "bg-slate-100 text-slate-700";

  return (
    <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Ronda
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">{heading}</h3>
          <p className="mt-2 text-sm text-slate-600">
            Cada jugador lanza {bagsPerPlayer} saco
            {bagsPerPlayer === 1 ? "" : "s"} en modo {game.mode}.
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

      <div className="sticky top-4 z-10 mt-6 rounded-[1.6rem] border border-white/70 bg-white/95 p-4 shadow-card backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Resumen provisional
        </p>

        <div className="mt-3 grid grid-cols-3 items-stretch gap-3">
          <div
            className={`col-span-1 flex min-w-0 flex-col justify-center items-center rounded-[1.4rem] px-5 py-4 text-left ${roundPreviewClassName}`}
          >
            <p className="mt-1 text-4xl font-black leading-none tracking-tight">
              {roundPreviewValue}
            </p>
          </div>

          <div className="col-span-2 flex min-w-0 flex-col gap-3">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 text-sm">
              <span className="rounded-full bg-slate-100 px-3 py-2 font-semibold text-slate-700 whitespace-nowrap">
                Sacos {usedBags}/{totalBags}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                <span className="whitespace-nowrap">
                  Bruto {preview.blueRawScore}-{preview.redRawScore}
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-[1.2rem] bg-ink px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Guardando..."
                : editingRoundNumber
                  ? "Guardar cambios"
                  : "Guardar ronda"}
            </button>
          </div>
        </div>
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
            onChange("blue", playerId, field, value);
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
            onChange("red", playerId, field, value);
          }}
        />
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
    </article>
  );
}
