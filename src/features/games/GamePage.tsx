import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FirebaseStatusBanner } from '../../components/FirebaseStatusBanner';
import type { Game, Round } from '../../models';
import { calculateRound, validateRoundInput } from '../../utils/scoring';
import { usePlayers } from '../players/hooks/usePlayers';
import { RoundFormCard } from './components/RoundFormCard';
import { RoundsHistoryCard } from './components/RoundsHistoryCard';
import { useGame } from './hooks/useGame';
import { useRoundActions } from './hooks/useRoundActions';
import { useRounds } from './hooks/useRounds';
import { createEmptyRoundForm, createRoundFormFromRound, type RoundFormState } from './roundForm';

function TeamNames({
  playerIds,
  namesById,
}: {
  playerIds: string[];
  namesById: Map<string, string>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {playerIds.map((playerId) => (
        <span
          key={playerId}
          className="rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-slate-700"
        >
          {namesById.get(playerId) ?? playerId}
        </span>
      ))}
    </div>
  );
}

function createFallbackRoundCalculation() {
  return {
    blueThrows: [],
    redThrows: [],
    blueRawScore: 0,
    redRawScore: 0,
    blueNetScore: 0,
    redNetScore: 0,
  };
}

function sanitizeThrowValue(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.floor(value);
}

function nextRoundNumber(rounds: Round[]): number {
  return rounds.length === 0
    ? 1
    : Math.max(...rounds.map((round) => round.roundNumber)) + 1;
}

export function GamePage() {
  const { gameId = '' } = useParams();
  const { game, isLoading: isGameLoading, error: gameError } = useGame(gameId);
  const { rounds, isLoading: areRoundsLoading, error: roundsError } = useRounds(gameId);
  const { players } = usePlayers();
  const roundActions = useRoundActions();
  const [editingRoundId, setEditingRoundId] = useState<string | null>(null);
  const [formState, setFormState] = useState<RoundFormState>({
    blueThrows: [],
    redThrows: [],
  });
  const [localValidationErrors, setLocalValidationErrors] = useState<string[]>([]);

  const namesById = useMemo(
    () => new Map(players.map((player) => [player.id, player.name])),
    [players],
  );

  useEffect(() => {
    if (!game || editingRoundId) {
      return;
    }

    setFormState(createEmptyRoundForm(game));
  }, [game, editingRoundId]);

  const editingRound = useMemo(
    () => rounds.find((round) => round.id === editingRoundId) ?? null,
    [editingRoundId, rounds],
  );

  const preview = useMemo(() => {
    if (!game || formState.blueThrows.length === 0 || formState.redThrows.length === 0) {
      return createFallbackRoundCalculation();
    }

    return calculateRound(game.mode, formState.blueThrows, formState.redThrows);
  }, [formState, game]);

  const validation = useMemo(() => {
    if (!game) {
      return { isValid: false, errors: [] };
    }

    return validateRoundInput({
      gameId: game.id,
      mode: game.mode,
      targetScore: game.targetScore,
      blueThrows: formState.blueThrows,
      redThrows: formState.redThrows,
    });
  }, [formState, game]);

  function resetForm(currentGame: Game) {
    setEditingRoundId(null);
    setLocalValidationErrors([]);
    roundActions.clearError();
    setFormState(createEmptyRoundForm(currentGame));
  }

  function handleThrowChange(
    team: 'blue' | 'red',
    playerId: string,
    field: 'cornholes' | 'woodies',
    value: number,
  ) {
    const sanitizedValue = sanitizeThrowValue(value);

    setLocalValidationErrors([]);
    roundActions.clearError();
    setFormState((currentState) => {
      const nextThrows = (
        team === 'blue' ? currentState.blueThrows : currentState.redThrows
      ).map((playerThrow) =>
        playerThrow.playerId === playerId
          ? {
              ...playerThrow,
              [field]: sanitizedValue,
            }
          : playerThrow,
      );

      return team === 'blue'
        ? {
            ...currentState,
            blueThrows: nextThrows,
          }
        : {
            ...currentState,
            redThrows: nextThrows,
          };
    });
  }

  async function handleSubmitRound() {
    if (!game) {
      return;
    }

    if (!validation.isValid) {
      setLocalValidationErrors(validation.errors);
      return;
    }

    const wasSuccessful = await roundActions.submitRound(
      game,
      editingRoundId,
      formState.blueThrows,
      formState.redThrows,
    );

    if (wasSuccessful) {
      resetForm(game);
    }
  }

  function handleEditRound(round: Round) {
    setEditingRoundId(round.id);
    setLocalValidationErrors([]);
    roundActions.clearError();
    setFormState(createRoundFormFromRound(round));
  }

  if (isGameLoading) {
    return (
      <section className="space-y-6">
        <FirebaseStatusBanner />
        <article className="rounded-3xl border border-white/70 bg-white/90 p-6 text-sm text-slate-600 shadow-card backdrop-blur">
          Cargando partida...
        </article>
      </section>
    );
  }

  if (gameError || roundsError) {
    return (
      <section className="space-y-6">
        <FirebaseStatusBanner />
        <article className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {gameError ?? roundsError}
        </article>
      </section>
    );
  }

  if (!game) {
    return (
      <section className="space-y-6">
        <FirebaseStatusBanner />
        <article className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          La partida no existe.
        </article>
      </section>
    );
  }

  const winnerLabel =
    game.winnerTeam === 'blue'
      ? 'Gana Equipo Azul'
      : game.winnerTeam === 'red'
        ? 'Gana Equipo Rojo'
        : 'Sin ganador todavía';

  return (
    <section className="space-y-6">
      <FirebaseStatusBanner />

      <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Partida en tiempo real
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Azul {game.blueScore} - {game.redScore} Rojo
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Estado: <span className="font-semibold">{game.status}</span> · Objetivo{' '}
              <span className="font-semibold">{game.targetScore}</span>
            </p>
            <p className="mt-1 text-sm text-slate-600">{winnerLabel}</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              to={`/game/${game.id}/display`}
              className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
            >
              Abrir display
            </Link>
            <Link
              to="/partidas/nueva"
              className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
            >
              Crear otra partida
            </Link>
          </div>
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-blueTeam/30 bg-blueTeam/5 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blueTeam/80">
            Equipo Azul
          </p>
          <div className="mt-4">
            <TeamNames playerIds={game.bluePlayerIds} namesById={namesById} />
          </div>
        </article>

        <article className="rounded-3xl border border-redTeam/30 bg-redTeam/5 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-redTeam/80">
            Equipo Rojo
          </p>
          <div className="mt-4">
            <TeamNames playerIds={game.redPlayerIds} namesById={namesById} />
          </div>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-card backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Próxima ronda
          </p>
          <p className="mt-3 text-3xl font-black text-ink">
            {editingRound ? `Editando ${editingRound.roundNumber}` : nextRoundNumber(rounds)}
          </p>
        </article>
        <article className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-card backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Rondas guardadas
          </p>
          <p className="mt-3 text-3xl font-black text-ink">{rounds.length}</p>
        </article>
        <article className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-card backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Actualización
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-700">
            Firestore en tiempo real activo
          </p>
        </article>
      </div>

      <RoundFormCard
        game={game}
        namesById={namesById}
        formState={formState}
        preview={preview}
        validationErrors={localValidationErrors}
        submitError={roundActions.error}
        isSubmitting={roundActions.isSubmitting}
        editingRoundNumber={editingRound?.roundNumber ?? null}
        onChange={handleThrowChange}
        onSubmit={() => {
          void handleSubmitRound();
        }}
        onCancelEdit={() => {
          resetForm(game);
        }}
      />

      {areRoundsLoading ? (
        <article className="rounded-3xl border border-white/70 bg-white/90 p-6 text-sm text-slate-600 shadow-card backdrop-blur">
          Cargando rondas...
        </article>
      ) : (
        <RoundsHistoryCard
          rounds={rounds}
          namesById={namesById}
          editingRoundId={editingRoundId}
          onEdit={handleEditRound}
        />
      )}
    </section>
  );
}
