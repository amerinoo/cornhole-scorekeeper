import { useMemo, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { CompactScoreboard } from "../../components/CompactScoreboard";
import { CornholeIcon, MissIcon, WoodieIcon } from "../../components/icons";
import type { PlayerThrow, Round } from "../../models";
import { tryFormatFirestoreDate } from "../../utils/format";
import { usePlayers } from "../players/hooks/usePlayers";
import { RecentRoundsTimeline } from "./components/RecentRoundsTimeline";
import { useGame } from "./hooks/useGame";
import { useRounds } from "./hooks/useRounds";
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
    return "Ganador Equipo Azul";
  }

  if (winnerTeam === "red") {
    return "Ganador Equipo Rojo";
  }

  return "Partida en juego";
}

function winnerClassName(winnerTeam: "blue" | "red" | undefined): string {
  if (winnerTeam === "blue") {
    return "border-blueTeam/25 bg-blueTeam/10 text-blueTeam";
  }

  if (winnerTeam === "red") {
    return "border-redTeam/25 bg-redTeam/10 text-redTeam";
  }

  return "border-slate-200 bg-white/85 text-slate-700";
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

function throwingTeamLabel(roundNumber: number): string {
  return "Jugada por Equipo " + (roundNumber % 2 === 0 ? "Rojo" : "Azul");
}

function throwingTeamClassName(roundNumber: number): string {
  return roundNumber % 2 === 0
    ? "bg-redTeam/10 text-redTeam ring-redTeam/20"
    : "bg-blueTeam/10 text-blueTeam ring-blueTeam/20";
}

function ThrowTotal({ icon, value }: { icon: ReactNode; value: number }) {
  return (
    <span className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-white px-2 py-1.5 ring-1 ring-slate-200 sm:flex-col sm:gap-1.5 sm:py-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 sm:h-8 sm:w-8">
        {icon}
      </span>
      <span className="text-lg font-black leading-none text-ink sm:text-xl">
        {value}
      </span>
    </span>
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
  const blueTeamNames = renderNames(game.bluePlayerIds, namesById);
  const redTeamNames = renderNames(game.redPlayerIds, namesById);
  const url = window.location.href;

  return (
    <main className="min-h-screen bg-court px-2 py-3 text-ink sm:px-6 sm:py-6 lg:px-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl flex-col gap-3 rounded-[1.5rem] border border-white/70 bg-white/80 p-3 shadow-card backdrop-blur sm:min-h-[calc(100vh-3rem)] sm:gap-4 sm:rounded-[2rem] sm:p-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Cornhole Scorekeeper
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 sm:text-sm">
              <p>
                Objetivo:{" "}
                <span className="font-bold">{game.targetScore} puntos</span>
              </p>
              {lastUpdatedLabel ? (
                <p>
                  Última actualización:{" "}
                  <span className="font-bold">{lastUpdatedLabel}</span>
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <p
              className={`inline-flex rounded-full border px-3 py-1.5 text-base font-black sm:px-4 sm:py-2 ${winnerClassName(game.winnerTeam)}`}
            >
              {winnerLabel(game.winnerTeam)}
            </p>
            <div className="rounded-xl bg-white p-1 ring-1 ring-slate-200">
              <QRCode value={url} size={40} />
            </div>
          </div>
        </header>

        <section>
          <article className="rounded-[2rem] bg-white/92">
            <CompactScoreboard
              blueScore={game.blueScore}
              redScore={game.redScore}
              blueSubtitle={blueTeamNames}
              redSubtitle={redTeamNames}
              size="md"
            />
          </article>
          {rounds.length > 0 ? (
            <div className="mt-2 min-w-0 rounded-[1.25rem] bg-white/75 p-2 sm:mt-3 sm:rounded-[1.6rem] sm:p-3">
              <RecentRoundsTimeline rounds={rounds} compact className="w-full" />
            </div>
          ) : null}
        </section>

        <section className="grid gap-4">
          <article className="min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-sand p-3 sm:rounded-[2rem] sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {lastRound ? (
                <p className="text-base font-black tracking-tight text-slate-700 sm:text-xl">
                  Última ronda jugada {lastRound.roundNumber}
                </p>
              ) : null}
              {lastRound ? (
                <p
                  className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 sm:text-sm ${throwingTeamClassName(lastRound.roundNumber)}`}
                >
                  {throwingTeamLabel(lastRound.roundNumber)}
                </p>
              ) : null}
            </div>
            {!lastRound ? (
              <p className="mt-2 text-lg font-black tracking-tight sm:mt-3 sm:text-3xl">
                {lastRoundSummary.title}
              </p>
            ) : null}
            {lastRound ? (
              <div className="mt-2 grid min-w-0 gap-2 md:grid-cols-[7rem_minmax(0,1fr)] sm:mt-3 sm:gap-3 lg:grid-cols-[8rem_minmax(0,1fr)]">
                <div
                  className={`min-w-0 flex flex-col items-center justify-center rounded-[1.25rem] px-4 py-2.5 text-center sm:rounded-[1.4rem] sm:px-4 sm:py-3 ${lastRoundSummary.badgeClassName}`}
                >
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] opacity-80 sm:text-xs sm:tracking-[0.18em]">
                    Neto
                  </p>
                  <p className="mt-1 text-2xl font-black leading-none sm:text-3xl">
                    {lastRoundSummary.badgeLabel ?? "0"}
                  </p>
                </div>

                <div className="grid min-w-0 gap-2">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="min-w-0 rounded-[1.25rem] border border-blueTeam/20 bg-white/85 p-2.5 sm:rounded-[1.4rem] sm:p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-blueTeam/80 sm:text-xs sm:tracking-[0.18em]">
                          Azul bruto
                        </p>
                        <p className="text-2xl font-black leading-none text-blueTeam sm:text-3xl">
                          {lastRound.blueRawScore}
                        </p>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-1.5 text-sm text-slate-700 sm:gap-2">
                        <ThrowTotal
                          icon={
                            <CornholeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                          }
                          value={blueThrowTotals.cornholes}
                        />
                        <ThrowTotal
                          icon={
                            <WoodieIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                          }
                          value={blueThrowTotals.woodies}
                        />
                        <ThrowTotal
                          icon={<MissIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
                          value={blueThrowTotals.misses}
                        />
                      </div>
                    </div>
                    <div className="min-w-0 rounded-[1.25rem] border border-redTeam/20 bg-white/85 p-2.5 sm:rounded-[1.4rem] sm:p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-redTeam/80 sm:text-xs sm:tracking-[0.18em]">
                          Rojo bruto
                        </p>
                        <p className="text-2xl font-black leading-none text-redTeam sm:text-3xl">
                          {lastRound.redRawScore}
                        </p>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-1.5 text-sm text-slate-700 sm:gap-2">
                        <ThrowTotal
                          icon={
                            <CornholeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                          }
                          value={redThrowTotals.cornholes}
                        />
                        <ThrowTotal
                          icon={
                            <WoodieIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                          }
                          value={redThrowTotals.woodies}
                        />
                        <ThrowTotal
                          icon={<MissIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
                          value={redThrowTotals.misses}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
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
