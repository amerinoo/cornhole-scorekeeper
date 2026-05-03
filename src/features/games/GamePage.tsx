import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { CompactScoreboard } from "../../components/CompactScoreboard";
import { FirebaseStatusBanner } from "../../components/FirebaseStatusBanner";
import { CornholeIcon, MissIcon, WoodieIcon } from "../../components/icons";
import type { Game, Round } from "../../models";
import { formatPercent } from "../../utils/format";
import {
  calculateRound,
  getBagsPerPlayer,
  validateRoundInput,
} from "../../utils/scoring";
import { aggregateFinishedGameStats } from "../stats/aggregation";
import { usePlayers } from "../players/hooks/usePlayers";
import { RecentRoundsTimeline } from "./components/RecentRoundsTimeline";
import { RoundFormCard } from "./components/RoundFormCard";
import { RoundsHistoryCard } from "./components/RoundsHistoryCard";
import { useGame } from "./hooks/useGame";
import { useRoundActions } from "./hooks/useRoundActions";
import { useRounds } from "./hooks/useRounds";
import {
  createEmptyRoundForm,
  createRoundFormFromRound,
  type RoundFormState,
} from "./roundForm";

function PlayerChips({
  playerIds,
  namesById,
}: {
  playerIds: string[];
  namesById: Map<string, string>;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {playerIds.map((playerId) => (
        <span
          key={playerId}
          className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
        >
          {namesById.get(playerId) ?? playerId}
        </span>
      ))}
    </div>
  );
}

function InlineStat({
  icon,
  value,
  detail,
}: {
  icon: ReactNode;
  value: number;
  detail?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
      <span className="text-slate-500">{icon}</span>
      <span className="font-semibold text-slate-700">{value}</span>
      {detail ? <span className="text-slate-500">{detail}</span> : null}
    </span>
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

function getGameStatusLabel(status: Game["status"]): string {
  if (status === "finished") {
    return "Finalizada";
  }

  if (status === "in_progress") {
    return "En curso";
  }

  return "Preparación";
}

export function GamePage() {
  const { gameId = "" } = useParams();
  const { game, isLoading: isGameLoading, error: gameError } = useGame(gameId);
  const {
    rounds,
    isLoading: areRoundsLoading,
    error: roundsError,
  } = useRounds(gameId);
  const { players } = usePlayers();
  const roundActions = useRoundActions();
  const [editingRoundId, setEditingRoundId] = useState<string | null>(null);
  const [formState, setFormState] = useState<RoundFormState>({
    blueThrows: [],
    redThrows: [],
  });
  const [localValidationErrors, setLocalValidationErrors] = useState<string[]>(
    [],
  );
  const [displayLinkState, setDisplayLinkState] = useState<
    "idle" | "copied" | "error"
  >("idle");

  const namesById = useMemo(
    () => new Map(players.map((player) => [player.id, player.name])),
    [players],
  );
  const finishedGameStats = useMemo(
    () => (game ? aggregateFinishedGameStats(game, rounds, players) : null),
    [game, players, rounds],
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
    if (
      !game ||
      formState.blueThrows.length === 0 ||
      formState.redThrows.length === 0
    ) {
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
    team: "blue" | "red",
    playerId: string,
    field: "cornholes" | "woodies",
    value: number,
  ) {
    const bagsPerPlayer = game ? getBagsPerPlayer(game.mode) : 0;

    setLocalValidationErrors([]);
    roundActions.clearError();
    setFormState((currentState) => {
      const currentThrows =
        team === "blue" ? currentState.blueThrows : currentState.redThrows;
      const nextThrows = currentThrows.map((playerThrow) => {
        if (playerThrow.playerId !== playerId) {
          return playerThrow;
        }

        const otherField = field === "cornholes" ? "woodies" : "cornholes";
        const maxAllowed = Math.max(0, bagsPerPlayer - playerThrow[otherField]);
        const sanitizedValue = Math.min(sanitizeThrowValue(value), maxAllowed);

        return {
          ...playerThrow,
          [field]: sanitizedValue,
        };
      });

      return team === "blue"
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
    const latestRoundId = rounds.at(-1)?.id ?? null;

    if (
      !game ||
      (game.status === "finished" &&
        (!editingRoundId || editingRoundId !== latestRoundId))
    ) {
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
    const latestRoundId = rounds.at(-1)?.id ?? null;

    if (
      !game ||
      (game.status === "finished" && round.id !== latestRoundId)
    ) {
      return;
    }

    setEditingRoundId(round.id);
    setLocalValidationErrors([]);
    roundActions.clearError();
    setFormState(createRoundFormFromRound(round));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleCopyDisplayLink() {
    if (!game) {
      return;
    }

    const displayUrl = new URL(
      `${normalizedBasePath}game/${game.id}/display`,
      window.location.origin,
    ).toString();

    try {
      await navigator.clipboard.writeText(displayUrl);
      setDisplayLinkState("copied");
      window.setTimeout(() => {
        setDisplayLinkState("idle");
      }, 2400);
    } catch {
      setDisplayLinkState("error");
    }
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
    game.winnerTeam === "blue"
      ? "Gana Equipo Azul"
      : game.winnerTeam === "red"
        ? "Gana Equipo Rojo"
        : "Sin ganador todavía";
  const latestRoundId = rounds.at(-1)?.id ?? null;
  const isEditingLatestRound =
    latestRoundId !== null && editingRoundId === latestRoundId;
  const isGameEditable = game.status !== "finished";
  const isRoundFormVisible = isGameEditable || isEditingLatestRound;
  const projectedBlueScore = editingRound
    ? game.blueScore - editingRound.blueNetScore + preview.blueNetScore
    : game.blueScore + preview.blueNetScore;
  const projectedRedScore = editingRound
    ? game.redScore - editingRound.redNetScore + preview.redNetScore
    : game.redScore + preview.redNetScore;
  const activeRoundNumber = editingRound
    ? editingRound.roundNumber
    : nextRoundNumber(rounds);
  const scoringTeamLabel =
    preview.blueNetScore > 0
      ? `Azul +${preview.blueNetScore}`
      : preview.redNetScore > 0
        ? `Rojo +${preview.redNetScore}`
        : "Empate 0";
  const scoringTeamClassName =
    preview.blueNetScore > 0
      ? "bg-blueTeam text-white"
      : preview.redNetScore > 0
        ? "bg-redTeam text-white"
        : "bg-slate-200 text-slate-700";
  const roundsCount = finishedGameStats?.totalRounds ?? rounds.length;
  const basePath = import.meta.env.BASE_URL ?? "/";
  const normalizedBasePath = basePath.endsWith("/") ? basePath : `${basePath}/`;
  const displayPath = `${normalizedBasePath}game/${game.id}/display`;

  return (
    <section className="space-y-6">
      <FirebaseStatusBanner />

      <section className="rounded-[2rem] border border-white/70 bg-white/90 px-4 py-5 shadow-card backdrop-blur sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <CompactScoreboard
            blueScore={game.blueScore}
            redScore={game.redScore}
            size="lg"
          />
          <div className="text-left sm:pb-2 sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Objetivo {game.targetScore}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {winnerLabel}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-2 font-semibold text-slate-700">
            {getGameStatusLabel(game.status)}
          </span>
          <span>
            {game.mode} · objetivo {game.targetScore} · {roundsCount} ronda
            {roundsCount === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <RecentRoundsTimeline rounds={rounds} className="w-full sm:flex-1" />
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Ronda {activeRoundNumber}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-4 py-2 text-sm font-black ${scoringTeamClassName}`}
              >
                {scoringTeamLabel}
              </span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                Marcador {projectedBlueScore} - {projectedRedScore}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-[1.6rem] border border-blueTeam/20 bg-blueTeam/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blueTeam/80">
            Equipo Azul
          </p>
          <PlayerChips playerIds={game.bluePlayerIds} namesById={namesById} />
        </article>

        <article className="rounded-[1.6rem] border border-redTeam/20 bg-redTeam/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-redTeam/80">
            Equipo Rojo
          </p>
          <PlayerChips playerIds={game.redPlayerIds} namesById={namesById} />
        </article>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row">
        <a
          href={displayPath}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-[1.4rem] border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
        >
          Abrir display
        </a>
        <button
          type="button"
          onClick={() => {
            void handleCopyDisplayLink();
          }}
          className="inline-flex items-center justify-center rounded-[1.4rem] bg-ink px-5 py-3 text-sm font-semibold text-white"
        >
          {displayLinkState === "copied"
            ? "Enlace copiado"
            : displayLinkState === "error"
              ? "No se pudo copiar"
              : "Copiar enlace display"}
        </button>
      </section>

      {isRoundFormVisible ? (
        <RoundFormCard
          game={game}
          rounds={rounds}
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
      ) : (
        <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm font-medium text-slate-600">
          La partida está finalizada. Solo puedes corregir la última ronda para
          reabrirla si la puntuación final era incorrecta.
        </article>
      )}

      {!isRoundFormVisible && finishedGameStats ? (
        <article className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-card backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Estadísticas de la partida
              </p>
              <h3 className="mt-1 text-xl font-black tracking-tight">
                Resumen final
              </h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              {finishedGameStats.totalRounds} ronda
              {finishedGameStats.totalRounds === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {finishedGameStats.teams.map((team) => (
              <div
                key={team.teamColor}
                className={`rounded-[1.5rem] border p-4 ${
                  team.teamColor === "blue"
                    ? "border-blueTeam/30 bg-blueTeam/5"
                    : "border-redTeam/30 bg-redTeam/5"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p
                    className={`text-sm font-black uppercase tracking-[0.18em] ${
                      team.teamColor === "blue"
                        ? "text-blueTeam"
                        : "text-redTeam"
                    }`}
                  >
                    Equipo {team.teamColor === "blue" ? "Azul" : "Rojo"}
                  </p>
                  <p className="text-lg font-black text-ink">
                    {team.netPoints} netos
                  </p>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Rondas
                    </p>
                    <p className="mt-1 text-lg font-black text-ink">
                      {team.roundsWon}{" "}
                      <span className="text-sm font-semibold text-slate-500">
                        {formatPercent(team.roundWinRate)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Brutos
                    </p>
                    <p className="mt-1 text-lg font-black text-ink">
                      {team.rawScore}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Acierto
                    </p>
                    <p className="mt-1 text-lg font-black text-ink">
                      {formatPercent(team.accuracy)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                  <InlineStat
                    icon={<CornholeIcon className="h-4 w-4" />}
                    value={team.cornholes}
                    detail={formatPercent(team.cornholeRate)}
                  />
                  <InlineStat
                    icon={<WoodieIcon className="h-4 w-4" />}
                    value={team.woodies}
                    detail={formatPercent(team.woodyRate)}
                  />
                  <InlineStat
                    icon={<MissIcon className="h-4 w-4" />}
                    value={team.misses}
                    detail={formatPercent(team.missRate)}
                  />
                  <span>S {team.bagsThrown}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-2 py-2 font-semibold">Jugador</th>
                  <th className="px-2 py-2 font-semibold">
                    <CornholeIcon className="h-4 w-4" />
                  </th>
                  <th className="px-2 py-2 font-semibold">
                    <WoodieIcon className="h-4 w-4" />
                  </th>
                  <th className="px-2 py-2 font-semibold">
                    <MissIcon className="h-4 w-4" />
                  </th>
                  <th className="px-2 py-2 font-semibold">S</th>
                  <th className="px-2 py-2 font-semibold">Pts</th>
                  <th className="px-2 py-2 font-semibold">Acierto</th>
                </tr>
              </thead>
              <tbody>
                {finishedGameStats.players.map((player) => (
                  <tr
                    key={player.playerId}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-2 py-2 font-semibold text-ink">
                      <span
                        className={
                          player.teamColor === "blue"
                            ? "text-blueTeam"
                            : "text-redTeam"
                        }
                      >
                        {player.playerName}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-slate-700">
                      {player.cornholes}{" "}
                      <span className="text-xs text-slate-500">
                        {formatPercent(player.cornholeRate)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-slate-700">
                      {player.woodies}{" "}
                      <span className="text-xs text-slate-500">
                        {formatPercent(player.woodyRate)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-slate-700">
                      {player.misses}{" "}
                      <span className="text-xs text-slate-500">
                        {formatPercent(player.missRate)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-slate-700">
                      {player.bagsThrown}
                    </td>
                    <td className="px-2 py-2 text-slate-700">
                      {player.rawScore}
                    </td>
                    <td className="px-2 py-2 font-medium text-ink">
                      {formatPercent(player.accuracy)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ) : null}

      {areRoundsLoading ? (
        <article className="rounded-3xl border border-white/70 bg-white/90 p-6 text-sm text-slate-600 shadow-card backdrop-blur">
          Cargando rondas...
        </article>
      ) : (
      <RoundsHistoryCard
        rounds={rounds}
        namesById={namesById}
        editingRoundId={editingRoundId}
        canEditRound={(round) =>
          game.status !== "finished" || round.id === latestRoundId
        }
        onEdit={handleEditRound}
      />
      )}
    </section>
  );
}
