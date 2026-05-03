type CompactScoreboardProps = {
  blueScore: number;
  redScore: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

function getSizeClassName(size: CompactScoreboardProps['size']): string {
  if (size === 'sm') {
    return 'text-3xl sm:text-4xl';
  }

  if (size === 'lg') {
    return 'text-4xl sm:text-6xl';
  }

  if (size === 'xl') {
    return 'text-7xl sm:text-8xl lg:text-9xl';
  }

  return 'text-4xl sm:text-5xl';
}

export function CompactScoreboard({
  blueScore,
  redScore,
  size = 'md',
  className = '',
}: CompactScoreboardProps) {
  const scoreClassName = getSizeClassName(size);

  return (
    <div
      className={`rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4 ${className}`}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="min-w-0 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blueTeam/70">
            Azul
          </p>
          <p className={`mt-1 font-black tracking-tight text-blueTeam ${scoreClassName}`}>
            {blueScore}
          </p>
        </div>
        <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
          VS
        </span>
        <div className="min-w-0 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-redTeam/70">
            Rojo
          </p>
          <p className={`mt-1 font-black tracking-tight text-redTeam ${scoreClassName}`}>
            {redScore}
          </p>
        </div>
      </div>
    </div>
  );
}
