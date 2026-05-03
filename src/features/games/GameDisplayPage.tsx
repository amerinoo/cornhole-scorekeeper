import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { CompactScoreboard } from "../../components/CompactScoreboard";
import type { Round } from "../../models";
import { tryFormatFirestoreDate } from "../../utils/format";
import { usePlayers } from "../players/hooks/usePlayers";
import { useGame } from "./hooks/useGame";
import { useRounds } from "./hooks/useRounds";
import { getStatusLabel } from "./components/GameSummaryCard";

function renderNames(
  playerIds: string[],
  namesById: Map<string, string>,
): string {
  return playerIds
    .map((playerId) => namesById.get(playerId) ?? playerId)
    .join(" · ");
}

function winnerLabel(winnerTeam: "blue" | "red" | undefined): string {
  if (winnerTeam === "blue") {
    return "Gana Equipo Azul";
  }

  if (winnerTeam === "red") {
    return "Gana Equipo Rojo";
  }

  return "Partida en juego";
}

function lastRoundLabel(round: Round | null): string {
  if (!round) {
    return "Aún no se ha jugado ninguna ronda.";
  }

  if (round.blueNetScore > 0) {
    return `Ronda ${round.roundNumber}: Azul suma ${round.blueNetScore}`;
  }

  if (round.redNetScore > 0) {
    return `Ronda ${round.roundNumber}: Rojo suma ${round.redNetScore}`;
  }

  return `Ronda ${round.roundNumber}: empate en cancelación`;
}

export function GameDisplayPage() {
  const { gameId = "" } = useParams();
  const { game, isLoading: isGameLoading, error: gameError } = useGame(gameId);
  const {
    rounds,
    isLoading: areRoundsLoading,
    error: roundsError,
  } = useRounds(gameId);
  const { players } = usePlayers();
  const namesById = useMemo(
    () => new Map(players.map((player) => [player.id, player.name])),
    [players],
  );

  if (isGameLoading || areRoundsLoading) {
    return (
      <main className="min-h-screen bg-court px-4 py-8 text-ink">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center justify-center rounded-[2rem] border border-white/70 bg-white/85 p-8 text-xl font-semibold shadow-card backdrop-blur">
          Cargando display...
        </div>
      </main>
    );
  }

  if (gameError || roundsError) {
    return (
      <main className="min-h-screen bg-court px-4 py-8 text-ink">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-red-200 bg-red-50 p-8 text-lg font-semibold text-red-700 shadow-card">
          {gameError ?? roundsError}
        </div>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="min-h-screen bg-court px-4 py-8 text-ink">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-lg font-semibold text-amber-900 shadow-card">
          La partida no existe.
        </div>
      </main>
    );
  }

  const lastRound =
    rounds.length > 0 ? (rounds[rounds.length - 1] ?? null) : null;
  const lastUpdatedLabel = tryFormatFirestoreDate(lastRound?.updatedAt);

  return (
    <main className="min-h-screen bg-court px-4 py-6 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-6 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-card backdrop-blur sm:p-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
              Display mode
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Cornhole Scorekeeper
            </h1>
            <p className="mt-3 text-lg font-semibold text-slate-700 sm:text-xl">
              {winnerLabel(game.winnerTeam)}
            </p>
          </div>

          <div className="grid gap-2 rounded-3xl border border-slate-200 bg-white/90 px-5 py-4 text-sm shadow-sm">
            <p>
              Estado:{" "}
              <span className="font-bold">{getStatusLabel(game.status)}</span>
            </p>
            <p>
              Objetivo:{" "}
              <span className="font-bold">{game.targetScore} puntos</span>
            </p>
            <p>
              Rondas: <span className="font-bold">{rounds.length}</span>
            </p>
            {lastUpdatedLabel ? (
              <p>
                Última actualización:{" "}
                <span className="font-bold">{lastUpdatedLabel}</span>
              </p>
            ) : null}
          </div>
        </header>

        <section className="grid flex-1 gap-5">
          <article className="rounded-[2rem] border border-slate-200 bg-white/92 p-6 shadow-sm lg:p-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <CompactScoreboard
                blueScore={game.blueScore}
                redScore={game.redScore}
                size="xl"
              />
              <div className="min-w-0 rounded-[1.7rem] border border-blueTeam/30 bg-blueTeam/10 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blueTeam/80">
                  Equipo Azul
                </p>
                <p className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
                  {renderNames(game.bluePlayerIds, namesById)}
                </p>
              </div>

              <div className="min-w-0 rounded-[1.7rem] border border-redTeam/30 bg-redTeam/10 p-5 text-left xl:flex-1 xl:text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-redTeam/80">
                  Equipo Rojo
                </p>
                <p className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
                  {renderNames(game.redPlayerIds, namesById)}
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-sand p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Última ronda
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
              {lastRoundLabel(lastRound)}
            </h2>
            {lastRound ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blueTeam/80">
                    Azul bruto / neto
                  </p>
                  <p className="mt-2 text-3xl font-black text-blueTeam">
                    {lastRound.blueRawScore} / {lastRound.blueNetScore}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-redTeam/80">
                    Rojo bruto / neto
                  </p>
                  <p className="mt-2 text-3xl font-black text-redTeam">
                    {lastRound.redRawScore} / {lastRound.redNetScore}
                  </p>
                </div>
              </div>
            ) : null}
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Estado del enlace
            </p>
            <div className="mt-4 grid gap-3 text-lg font-semibold text-slate-700">
              <p>
                Cualquier pantalla con este enlace se actualiza en tiempo real.
              </p>
              <p>Vista limpia pensada para TV o proyector.</p>
              <p>Sin controles de edición.</p>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
