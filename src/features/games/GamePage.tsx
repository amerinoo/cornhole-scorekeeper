import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FirebaseStatusBanner } from '../../components/FirebaseStatusBanner';
import type { Game, Round } from '../../models';
import { calculateRound, getBagsPerPlayer, validateRoundInput } from '../../utils/scoring';
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
    const bagsPerPlayer = game ? getBagsPerPlayer(game.mode) : 0;

    setLocalValidationErrors([]);
    roundActions.clearError();
    setFormState((currentState) => {
      const currentThrows =
        team === 'blue' ? currentState.blueThrows : currentState.redThrows;
      const nextThrows = currentThrows.map((playerThrow) => {
        if (playerThrow.playerId !== playerId) {
          return playerThrow;
        }

        const otherField = field === 'cornholes' ? 'woodies' : 'cornholes';
        const maxAllowed = Math.max(0, bagsPerPlayer - playerThrow[otherField]);
        const sanitizedValue = Math.min(sanitizeThrowValue(value), maxAllowed);

        return {
          ...playerThrow,
          [field]: sanitizedValue,
        };
      });

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

      <article className="sticky top-4 z-20 rounded-3xl border border-white/70 bg-white/95 p-4 shadow-card backdrop-blur sm:p-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3">
          <div className="rounded-3xl bg-blueTeam p-4 text-white sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              Equipo Azul
            </p>
            <p className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
              {game.blueScore}
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="rounded-full border border-slate-200 bg-white px-3 py-2 text-base font-black tracking-[0.2em] text-slate-500 sm:px-5 sm:text-xl">
              VS
            </div>
          </div>

          <div className="rounded-3xl bg-redTeam p-4 text-white sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              Equipo Rojo
            </p>
            <p className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
              {game.redScore}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-slate-600">
            <span>Objetivo {game.targetScore}</span>
            <span>{winnerLabel}</span>
            <span>
              Si guardas: {game.blueScore + preview.blueNetScore} -{' '}
              {game.redScore + preview.redNetScore}
            </span>
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
        projectedBlueScore={game.blueScore + preview.blueNetScore}
        projectedRedScore={game.redScore + preview.redNetScore}
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
