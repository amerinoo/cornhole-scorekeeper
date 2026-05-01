import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blueTeam: '#1565c0',
        redTeam: '#d32f2f',
        sand: '#f4ebd0',
        ink: '#10243e',
      },
      boxShadow: {
        card: '0 18px 36px rgba(16, 36, 62, 0.08)',
      },
      backgroundImage: {
        court:
          'radial-gradient(circle at top, rgba(244, 235, 208, 0.85), transparent 42%), linear-gradient(180deg, #f8f5ea 0%, #ffffff 58%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
