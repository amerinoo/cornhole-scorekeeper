export const MissIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className}>
    <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="5" />
    <path d="M23 23L41 41M41 23L23 41" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
  </svg>
);