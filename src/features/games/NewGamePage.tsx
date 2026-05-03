import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FirebaseStatusBanner } from '../../components/FirebaseStatusBanner';
import type { GameMode, Player, TargetScore } from '../../models';
import { usePlayers } from '../players/hooks/usePlayers';
import { useCreateGame } from './hooks/useCreateGame';
import { validateCreateGameInput } from './validation';

type TeamLineupCardProps = {
  title: string;
  accentClassName: string;
  players: Player[];
  selectedIds: string[];
  opposingIds: string[];
  onChange: (slotIndex: number, playerId: string) => void;
};

function createEmptySelections(count: number): string[] {
  return Array.from({ length: count }, () => '');
}

function TeamLineupCard({
  title,
  accentClassName,
  players,
  selectedIds,
  opposingIds,
  onChange,
}: TeamLineupCardProps) {
  const selectedCount = selectedIds.filter((playerId) => playerId.length > 0).length;
  const selectedNames = selectedIds
    .map((playerId) => players.find((player) => player.id === playerId)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <article className={`rounded-3xl border p-5 ${accentClassName}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            {title}
          </p>
          <h3 className="mt-2 text-xl font-black tracking-tight">
            {selectedCount}/{selectedIds.length} seleccionados
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {selectedNames.length > 0
              ? selectedNames.join(' · ')
              : 'Todavía no hay jugadores asignados.'}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {selectedIds.map((selectedId, slotIndex) => (
          <label key={`${title}-${slotIndex}`} className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Jugador {slotIndex + 1}
            </span>
            <select
              value={selectedId}
              onChange={(event) => {
                onChange(slotIndex, event.target.value);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-ink"
            >
              <option value="">Selecciona jugador</option>
              {players.map((player) => {
                const isTakenBySameTeam =
                  selectedId !== player.id &&
                  selectedIds.some((playerId) => playerId === player.id);
                const isTakenByOtherTeam = opposingIds.includes(player.id);

                return (
                  <option
                    key={player.id}
                    value={player.id}
                    disabled={isTakenBySameTeam || isTakenByOtherTeam}
                  >
                    {player.name}
                  </option>
                );
              })}
            </select>
          </label>
        ))}
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
  const [bluePlayerIds, setBluePlayerIds] = useState<string[]>(() =>
    createEmptySelections(1),
  );
  const [redPlayerIds, setRedPlayerIds] = useState<string[]>(() =>
    createEmptySelections(1),
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const playersPerTeam = mode === '1v1' ? 1 : 2;
  const normalizedBluePlayerIds = bluePlayerIds.filter(
    (playerId) => playerId.length > 0,
  );
  const normalizedRedPlayerIds = redPlayerIds.filter(
    (playerId) => playerId.length > 0,
  );
  const canCreateGame = players.length >= playersPerTeam * 2;
  const totalRequiredPlayers = playersPerTeam * 2;
  const selectedPlayersCount =
    normalizedBluePlayerIds.length + normalizedRedPlayerIds.length;
  const missingSelections = Math.max(0, totalRequiredPlayers - selectedPlayersCount);
  const isReadyToCreate = canCreateGame && missingSelections === 0;

  function updateSelection(
    slotIndex: number,
    playerId: string,
    currentIds: string[],
    opposingIds: string[],
    setter: (nextIds: string[]) => void,
  ) {
    if (playerId && opposingIds.includes(playerId)) {
      return;
    }

    const nextIds = [...currentIds];
    nextIds[slotIndex] = playerId;

    if (playerId) {
      nextIds.forEach((currentId, currentIndex) => {
        if (currentIndex !== slotIndex && currentId === playerId) {
          nextIds[currentIndex] = '';
        }
      });
    }

    setter(nextIds);
    setValidationErrors([]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateCreateGameInput({
      mode,
      targetScore,
      bluePlayerIds: normalizedBluePlayerIds,
      redPlayerIds: normalizedRedPlayerIds,
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    const gameId = await create({
      mode,
      targetScore,
      bluePlayerIds: normalizedBluePlayerIds,
      redPlayerIds: normalizedRedPlayerIds,
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
          Nueva partida
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight">
          Elige equipos y empieza
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Selecciona formato, puntuación objetivo y jugadores de cada equipo.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Paso 1
            </p>
            <p className="mt-2 text-sm font-semibold text-ink">Modo y objetivo</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Paso 2
            </p>
            <p className="mt-2 text-sm font-semibold text-ink">Asignar equipos</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Paso 3
            </p>
            <p className="mt-2 text-sm font-semibold text-ink">Crear y jugar</p>
          </div>
        </div>
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
                    const nextPlayersPerTeam = value === '1v1' ? 1 : 2;

                    setMode(value);
                    setBluePlayerIds(createEmptySelections(nextPlayersPerTeam));
                    setRedPlayerIds(createEmptySelections(nextPlayersPerTeam));
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
            <p className="font-semibold">Crea jugadores antes de iniciar una partida.</p>
            <Link
              to="/jugadores"
              className="mt-4 inline-flex rounded-2xl border border-amber-300 bg-white px-4 py-3 font-semibold text-amber-900"
            >
              Ir a jugadores
            </Link>
          </article>
        ) : null}

        {!isLoading && players.length > 0 ? (
          <article className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-card backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Resumen
                </p>
                <h3 className="mt-2 text-xl font-black tracking-tight">
                  {mode} · a {targetScore}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-blueTeam/10 px-4 py-2 font-semibold text-blueTeam">
                  Azul {normalizedBluePlayerIds.length}/{playersPerTeam}
                </span>
                <span className="rounded-full bg-redTeam/10 px-4 py-2 font-semibold text-redTeam">
                  Rojo {normalizedRedPlayerIds.length}/{playersPerTeam}
                </span>
                <span className="rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-700">
                  Disponibles {players.length}
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              {isReadyToCreate
                ? 'Todo listo para crear la partida.'
                : canCreateGame
                  ? `Faltan ${missingSelections} selección${missingSelections === 1 ? '' : 'es'} para empezar.`
                  : `Necesitas ${totalRequiredPlayers} jugadores para este modo.`}
            </p>
          </article>
        ) : null}

        {!isLoading && players.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <TeamLineupCard
              title="Equipo Azul"
              accentClassName="border-blueTeam/30 bg-blueTeam/5"
              players={players}
              selectedIds={bluePlayerIds}
              opposingIds={normalizedRedPlayerIds}
              onChange={(slotIndex, playerId) => {
                updateSelection(
                  slotIndex,
                  playerId,
                  bluePlayerIds,
                  normalizedRedPlayerIds,
                  setBluePlayerIds,
                );
              }}
            />
            <TeamLineupCard
              title="Equipo Rojo"
              accentClassName="border-redTeam/30 bg-redTeam/5"
              players={players}
              selectedIds={redPlayerIds}
              opposingIds={normalizedBluePlayerIds}
              onChange={(slotIndex, playerId) => {
                updateSelection(
                  slotIndex,
                  playerId,
                  redPlayerIds,
                  normalizedBluePlayerIds,
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

        <div className="sticky bottom-4 rounded-[2rem] bg-white/95 p-2 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="px-3 text-sm text-slate-600">
              {isReadyToCreate
                ? 'La partida se abrirá justo después de crearla.'
                : 'Completa la configuración para habilitar el inicio.'}
            </p>
            <button
              type="submit"
              disabled={!isReadyToCreate || isSubmitting}
              className="w-full rounded-[1.4rem] bg-ink px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-56"
            >
              {isSubmitting ? 'Creando partida...' : 'Crear partida'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
