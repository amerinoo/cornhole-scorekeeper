import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { CompactScoreboard } from "../../components/CompactScoreboard";
import { CornholeIcon, MissIcon, WoodieIcon } from "../../components/icons";
import type { PlayerThrow, Round } from "../../models";
import { tryFormatFirestoreDate } from "../../utils/format";
import { usePlayers } from "../players/hooks/usePlayers";
import { RecentRoundsTimeline } from "./components/RecentRoundsTimeline";
import { useGame } from "./hooks/useGame";
import { useRounds } from "./hooks/useRounds";
import { getStatusLabel } from "./components/GameSummaryCard";
import QRCode from "react-qr-code";

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

function getLastRoundSummary(round: Round | null): {
  title: string;
  badgeLabel: string | null;
  badgeClassName: string;
} {
  if (!round) {
    return {
      title: "Aún no se ha jugado ninguna ronda.",
      badgeLabel: null,
      badgeClassName: "",
    };
  }

  if (round.blueNetScore > 0) {
    return {
      title: `Ronda ${round.roundNumber}`,
      badgeLabel: `+${round.blueNetScore}`,
      badgeClassName: "bg-blueTeam text-white",
    };
  }

  if (round.redNetScore > 0) {
    return {
      title: `Ronda ${round.roundNumber}`,
      badgeLabel: `+${round.redNetScore}`,
      badgeClassName: "bg-redTeam text-white",
    };
  }

  return {
    title: `Ronda ${round.roundNumber}`,
    badgeLabel: "Empate 0",
    badgeClassName: "bg-slate-200 text-slate-700",
  };
}

function getThrowTotals(throws: PlayerThrow[]) {
  return throws.reduce(
    (totals, playerThrow) => ({
      cornholes: totals.cornholes + playerThrow.cornholes,
      woodies: totals.woodies + playerThrow.woodies,
      misses: totals.misses + playerThrow.misses,
    }),
    { cornholes: 0, woodies: 0, misses: 0 },
  );
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
  const lastRoundSummary = getLastRoundSummary(lastRound);
  const blueThrowTotals = lastRound
    ? getThrowTotals(lastRound.blueThrows)
    : { cornholes: 0, woodies: 0, misses: 0 };
  const redThrowTotals = lastRound
    ? getThrowTotals(lastRound.redThrows)
    : { cornholes: 0, woodies: 0, misses: 0 };
  const url = window.location.href;

  return (
    <main className="min-h-screen bg-court px-4 py-6 text-ink sm:px-6 lg:px-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-6 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-card backdrop-blur sm:p-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
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
          <div className="relative grid gap-2 rounded-3xl border border-slate-200 bg-white/90 px-5 py-4 text-sm shadow-sm">
            {/* QR */}
            <div className="absolute top-3 right-3 cursor-pointer hover:scale-105 transition">
              <QRCode value={url} size={64} />
            </div>

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

        <section>
          <article className="rounded-[2rem] bg-white/92">
            <CompactScoreboard
              blueScore={game.blueScore}
              redScore={game.redScore}
              size="xl"
            />
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="min-w-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-sand p-5 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Última ronda
            </p>
            <div className="mt-3 flex flex-wrap items-start gap-3">
              <h2 className="min-w-0 text-xl font-black tracking-tight sm:text-3xl">
                {lastRoundSummary.title}
              </h2>
              {lastUpdatedLabel ? (
                <span className="rounded-full bg-white/85 px-3 py-2 text-sm font-semibold text-slate-600">
                  {lastUpdatedLabel}
                </span>
              ) : null}
            </div>
            {lastRound ? (
              <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[11rem_minmax(0,1fr)]">
                <div
                  className={`min-w-0 flex flex-col items-center justify-center rounded-[1.6rem] px-4 py-5 text-center sm:px-5 sm:py-6 ${lastRoundSummary.badgeClassName}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
                    Neto
                  </p>
                  <p className="mt-2 text-4xl font-black leading-none sm:text-5xl">
                    {lastRoundSummary.badgeLabel ?? "0"}
                  </p>
                </div>

                <div className="grid min-w-0 gap-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="min-w-0 rounded-[1.4rem] border border-blueTeam/20 bg-white/85 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blueTeam/80">
                        Azul bruto
                      </p>
                      <p className="mt-2 text-4xl font-black text-blueTeam">
                        {lastRound.blueRawScore}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-700">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                          <CornholeIcon className="h-4 w-4 text-slate-500" />
                          <span className="font-semibold">
                            {blueThrowTotals.cornholes}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                          <WoodieIcon className="h-4 w-4 text-slate-500" />
                          <span className="font-semibold">
                            {blueThrowTotals.woodies}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                          <MissIcon className="h-4 w-4 text-slate-500" />
                          <span className="font-semibold">
                            {blueThrowTotals.misses}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 rounded-[1.4rem] border border-redTeam/20 bg-white/85 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-redTeam/80">
                        Rojo bruto
                      </p>
                      <p className="mt-2 text-4xl font-black text-redTeam">
                        {lastRound.redRawScore}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-700">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                          <CornholeIcon className="h-4 w-4 text-slate-500" />
                          <span className="font-semibold">
                            {redThrowTotals.cornholes}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                          <WoodieIcon className="h-4 w-4 text-slate-500" />
                          <span className="font-semibold">
                            {redThrowTotals.woodies}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                          <MissIcon className="h-4 w-4 text-slate-500" />
                          <span className="font-semibold">
                            {redThrowTotals.misses}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            {rounds.length > 0 ? (
              <div className="mt-5 min-w-0 rounded-[1.6rem] bg-white/75 p-4">
                <RecentRoundsTimeline rounds={rounds} className="w-full" />
              </div>
            ) : null}
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Equipos
            </p>
            <div className="mt-4 grid gap-3">
              <div className="min-w-0 rounded-[1.5rem] border border-blueTeam/30 bg-blueTeam/10 px-4 py-3.5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blueTeam/80">
                  Equipo Azul
                </p>
                <p className="mt-2 text-xl font-bold leading-tight sm:text-2xl">
                  {renderNames(game.bluePlayerIds, namesById)}
                </p>
              </div>
              <div className="min-w-0 rounded-[1.5rem] border border-redTeam/30 bg-redTeam/10 px-4 py-3.5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-redTeam/80">
                  Equipo Rojo
                </p>
                <p className="mt-2 text-xl font-bold leading-tight sm:text-2xl">
                  {renderNames(game.redPlayerIds, namesById)}
                </p>
              </div>
            </div>
          </article>
        </section>

        <footer className="flex justify-center border-t border-slate-200/70 pt-4">
          <Link
            to={`/game/${game.id}`}
            className="text-xs font-semibold text-slate-400 transition hover:text-slate-700"
          >
            Volver a la app
          </Link>
        </footer>
      </div>
    </main>
  );
}
