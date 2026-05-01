import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FirebaseStatusBanner } from '../../components/FirebaseStatusBanner';
import type { GameMode, Player, TargetScore } from '../../models';
import { usePlayers } from '../players/hooks/usePlayers';
import { useCreateGame } from './hooks/useCreateGame';
import { validateCreateGameInput } from './validation';

type TeamSelectorProps = {
  title: string;
  accentClassName: string;
  players: Player[];
  selectedIds: string[];
  maxSelections: number;
  onToggle: (playerId: string) => void;
};

function TeamSelector({
  title,
  accentClassName,
  players,
  selectedIds,
  maxSelections,
  onToggle,
}: TeamSelectorProps) {
  return (
    <article className={`rounded-3xl border p-5 ${accentClassName}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            {title}
          </p>
          <h3 className="mt-2 text-xl font-black tracking-tight">
            {selectedIds.length}/{maxSelections} seleccionados
          </h3>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {players.map((player) => {
          const isSelected = selectedIds.includes(player.id);

          return (
            <button
              key={player.id}
              type="button"
              onClick={() => {
                onToggle(player.id);
              }}
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                isSelected
                  ? 'border-ink bg-ink text-white'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              {player.name}
            </button>
          );
        })}
      </div>
    </article>
  );
}

export function NewGamePage() {
  const navigate = useNavigate();
  const { players, isLoading, error } = usePlayers();
  const { create, isSubmitting, error: submitError } = useCreateGame();
  const [mode, setMode] = useState<GameMode>('1v1');
  const [targetScore, setTargetScore] = useState<TargetScore>(21);
  const [bluePlayerIds, setBluePlayerIds] = useState<string[]>([]);
  const [redPlayerIds, setRedPlayerIds] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const playersPerTeam = mode === '1v1' ? 1 : 2;
  const canCreateGame = players.length >= playersPerTeam * 2;

  const selectablePlayers = useMemo(() => players, [players]);

  function toggleSelection(
    playerId: string,
    currentIds: string[],
    opposingIds: string[],
    setter: (nextIds: string[]) => void,
  ) {
    if (currentIds.includes(playerId)) {
      setter(currentIds.filter((id) => id !== playerId));
      return;
    }

    if (opposingIds.includes(playerId)) {
      return;
    }

    if (currentIds.length >= playersPerTeam) {
      setter([...currentIds.slice(1), playerId]);
      return;
    }

    setter([...currentIds, playerId]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateCreateGameInput({
      mode,
      targetScore,
      bluePlayerIds,
      redPlayerIds,
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    const gameId = await create({
      mode,
      targetScore,
      bluePlayerIds,
      redPlayerIds,
    });

    if (gameId) {
      void navigate(`/game/${gameId}`);
    }
  }

  return (
    <section className="space-y-6">
      <FirebaseStatusBanner />

      <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Crear partida
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight">
          Configura un duelo nuevo
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Elige formato, objetivo y jugadores. Al guardar se crea el documento en
          Firestore y se abre la pantalla de partida.
        </p>
      </article>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-card backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Modo
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(['1v1', '2v2'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setMode(value);
                    setBluePlayerIds([]);
                    setRedPlayerIds([]);
                    setValidationErrors([]);
                  }}
                  className={`rounded-2xl border px-4 py-4 text-sm font-semibold ${
                    mode === value
                      ? 'border-ink bg-ink text-white'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-card backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Objetivo
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[11, 21].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setTargetScore(value as TargetScore);
                  }}
                  className={`rounded-2xl border px-4 py-4 text-sm font-semibold ${
                    targetScore === value
                      ? 'border-blueTeam bg-blueTeam text-white'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  A {value}
                </button>
              ))}
            </div>
          </article>
        </div>

        {isLoading ? (
          <article className="rounded-3xl border border-white/70 bg-white/90 p-5 text-sm text-slate-600 shadow-card backdrop-blur">
            Cargando jugadores...
          </article>
        ) : null}

        {error ? (
          <article className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </article>
        ) : null}

        {!isLoading && players.length === 0 ? (
          <article className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            Crea jugadores antes de iniciar una partida.
          </article>
        ) : null}

        {!isLoading && players.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <TeamSelector
              title="Equipo Azul"
              accentClassName="border-blueTeam/30 bg-blueTeam/5"
              players={selectablePlayers}
              selectedIds={bluePlayerIds}
              maxSelections={playersPerTeam}
              onToggle={(playerId) => {
                toggleSelection(
                  playerId,
                  bluePlayerIds,
                  redPlayerIds,
                  setBluePlayerIds,
                );
              }}
            />
            <TeamSelector
              title="Equipo Rojo"
              accentClassName="border-redTeam/30 bg-redTeam/5"
              players={selectablePlayers}
              selectedIds={redPlayerIds}
              maxSelections={playersPerTeam}
              onToggle={(playerId) => {
                toggleSelection(
                  playerId,
                  redPlayerIds,
                  bluePlayerIds,
                  setRedPlayerIds,
                );
              }}
            />
          </div>
        ) : null}

        {validationErrors.length > 0 ? (
          <article className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <div className="space-y-1">
              {validationErrors.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </div>
          </article>
        ) : null}

        {submitError ? (
          <article className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {submitError}
          </article>
        ) : null}

        <button
          type="submit"
          disabled={!canCreateGame || isSubmitting}
          className="w-full rounded-3xl bg-ink px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creando partida...' : 'Crear partida'}
        </button>
      </form>
    </section>
  );
}
