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

function renderPlayerLine(playerIds: string[], namesById: Map<string, string>) {
  return playerIds.map((playerId) => namesById.get(playerId) ?? playerId).join(' · ');
}

function RecentRoundsTimeline({ rounds }: { rounds: Round[] }) {
  const recentRounds = rounds.slice(-5);

  if (recentRounds.length === 0) {
    return (
      <p className="text-sm font-medium text-slate-500">
        Aún no hay rondas guardadas.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-start gap-3">
      {recentRounds.map((round, index) => {
        const isLatest = index === recentRounds.length - 1;
        const netScore = round.blueNetScore > 0 ? round.blueNetScore : round.redNetScore;
        const colorClassName =
          round.blueNetScore > 0
            ? 'bg-blueTeam text-white'
            : round.redNetScore > 0
              ? 'bg-redTeam text-white'
              : 'bg-slate-200 text-slate-700';

        return (
          <div key={round.id} className="flex flex-col items-center gap-1">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-black ${colorClassName} ${
                isLatest ? 'ring-4 ring-ink/10' : ''
              }`}
            >
              {netScore}
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              R{round.roundNumber}
            </span>
          </div>
        );
      })}
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
  const projectedBlueScore = game.blueScore + preview.blueNetScore;
  const projectedRedScore = game.redScore + preview.redNetScore;
  const activeRoundNumber = editingRound ? editingRound.roundNumber : nextRoundNumber(rounds);

  return (
    <section className="space-y-6">
      <FirebaseStatusBanner />

      <section className="sticky top-4 z-20 rounded-[2rem] bg-white/95 px-4 py-5 shadow-card backdrop-blur sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blueTeam">
              Azul
            </p>
            <p className="text-5xl font-black leading-none tracking-tight text-blueTeam sm:text-7xl">
              {game.blueScore}
            </p>
          </div>
          <div className="pb-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Objetivo {game.targetScore}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-500">{winnerLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-redTeam">
              Rojo
            </p>
            <p className="text-5xl font-black leading-none tracking-tight text-redTeam sm:text-7xl">
              {game.redScore}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <RecentRoundsTimeline rounds={rounds} />
          <p className="text-sm font-semibold text-slate-500">
            Ronda {activeRoundNumber} · Si guardas {projectedBlueScore} - {projectedRedScore}
          </p>
        </div>
      </section>

      <section className="space-y-3 px-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-black uppercase tracking-[0.18em] text-blueTeam">Azul</span>
          <span className="text-slate-700">
            {renderPlayerLine(game.bluePlayerIds, namesById)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-black uppercase tracking-[0.18em] text-redTeam">Rojo</span>
          <span className="text-slate-700">
            {renderPlayerLine(game.redPlayerIds, namesById)}
          </span>
        </div>
      </section>

      <RoundFormCard
        game={game}
        namesById={namesById}
        formState={formState}
        preview={preview}
        validationErrors={localValidationErrors}
        submitError={roundActions.error}
        isSubmitting={roundActions.isSubmitting}
        editingRoundNumber={editingRound?.roundNumber ?? null}
        projectedBlueScore={projectedBlueScore}
        projectedRedScore={projectedRedScore}
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
