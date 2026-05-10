type CompactScoreboardProps = {
  blueScore: number;
  redScore: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTeamLabels?: boolean;
  blueSubtitle?: string;
  redSubtitle?: string;
  padding?: 'none' | 'md';
};

function getSizeClassName(size: CompactScoreboardProps['size']): string {
  if (size === 'xs') {
    return 'text-2xl sm:text-2xl';
  }

  if (size === 'sm') {
    return 'text-3xl sm:text-4xl';
  }

  if (size === 'lg') {
    return 'text-4xl sm:text-6xl';
  }

  if (size === 'xl') {
    return 'text-5xl sm:text-8xl lg:text-9xl';
  }

  return 'text-4xl sm:text-5xl';
}

export function CompactScoreboard({
  blueScore,
  redScore,
  size = 'md',
  className = '',
  showTeamLabels = true,
  blueSubtitle,
  redSubtitle,
  padding = 'md',
}: CompactScoreboardProps) {
  const scoreClassName = getSizeClassName(size);
  const gapClassName = size === 'xs' ? 'gap-2' : 'gap-3';
  const vsClassName = size === 'xs' ? 'text-[10px]' : 'text-xs';
  const paddingClassName = padding === 'none' ? 'p-0' : 'p-4';

  return (
    <div
      className={`rounded-[1.6rem] border border-slate-200 bg-slate-50 ${paddingClassName} ${className}`}
    >
      <div className={`grid grid-cols-[1fr_auto_1fr] items-center ${gapClassName}`}>
        <div className="min-w-0 text-center">
          {showTeamLabels ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blueTeam/70">
              Azul
            </p>
          ) : null}
          <p className={`${showTeamLabels ? "mt-1" : ""} font-black tracking-tight text-blueTeam ${scoreClassName}`}>
            {blueScore}
          </p>
          {blueSubtitle ? (
            <p className="mt-0.5 truncate text-xs font-bold leading-tight text-blueTeam/80 sm:text-sm">
              {blueSubtitle}
            </p>
          ) : null}
        </div>
        <span className={`${vsClassName} font-black uppercase tracking-[0.16em] text-slate-400`}>
          VS
        </span>
        <div className="min-w-0 text-center">
          {showTeamLabels ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-redTeam/70">
              Rojo
            </p>
          ) : null}
          <p className={`${showTeamLabels ? "mt-1" : ""} font-black tracking-tight text-redTeam ${scoreClassName}`}>
            {redScore}
          </p>
          {redSubtitle ? (
            <p className="mt-0.5 truncate text-xs font-bold leading-tight text-redTeam/80 sm:text-sm">
              {redSubtitle}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
