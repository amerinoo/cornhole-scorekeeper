export const PointsIcon = ({ className, value = 12 }: { className?: string; value?: number }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className}>
    <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="5" />
    <text
      x="32"
      y="39"
      textAnchor="middle"
      fontSize="22"
      fontWeight="700"
      fill="currentColor"
    >
      {value}
    </text>
  </svg>
);