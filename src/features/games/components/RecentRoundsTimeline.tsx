import { useEffect, useRef } from "react";
import type { Round } from "../../../models";

type RecentRoundsTimelineProps = {
  rounds: Round[];
  compact?: boolean;
  showRoundLabels?: boolean;
  className?: string;
  autoScrollToEnd?: boolean;
};

export function RecentRoundsTimeline({
  rounds,
  compact = false,
  showRoundLabels = true,
  className = "",
  autoScrollToEnd = false,
}: RecentRoundsTimelineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousRoundsCountRef = useRef(rounds.length);

  useEffect(() => {
    const container = containerRef.current;

    if (!autoScrollToEnd || !container) {
      previousRoundsCountRef.current = rounds.length;
      return;
    }

    if (rounds.length > previousRoundsCountRef.current) {
      container.scrollTo({
        left: container.scrollWidth,
        behavior: "smooth",
      });
    }

    previousRoundsCountRef.current = rounds.length;
  }, [autoScrollToEnd, rounds.length]);

  if (rounds.length === 0) {
    return (
      <p className="text-sm font-medium text-slate-500">
        Aún no hay rondas guardadas.
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`scrollbar-hidden min-w-0 max-w-full overflow-x-auto ${className}`}
    >
      <div className={`flex w-max items-start ${compact ? "gap-2" : "gap-3"}`}>
        {rounds.map((round) => {
          const netScore =
            round.blueNetScore > 0 ? round.blueNetScore : round.redNetScore;
          const colorClassName =
            round.blueNetScore > 0
              ? "bg-blueTeam text-white"
              : round.redNetScore > 0
                ? "bg-redTeam text-white"
                : "bg-slate-200 text-slate-700";

          return (
            <div key={round.id} className="flex shrink-0 flex-col items-center gap-1">
              <div
                className={`flex items-center justify-center rounded-full font-black ${colorClassName} ${
                  compact ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-xs"
                }`}
              >
                {netScore}
              </div>
              {showRoundLabels ? (
                <span
                  className={`font-semibold uppercase text-slate-500 ${
                    compact ? "text-[10px] tracking-[0.12em]" : "text-[11px] tracking-[0.16em]"
                  }`}
                >
                  R{round.roundNumber}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
