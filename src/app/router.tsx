import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RulesPage } from './pages/RulesPage';

const PlayersPage = lazy(async () => {
  const module = await import('../features/players');
  return { default: module.PlayersPage };
});

const NewGamePage = lazy(async () => {
  const module = await import('../features/games');
  return { default: module.NewGamePage };
});

const OngoingGamesPage = lazy(async () => {
  const module = await import('../features/games');
  return { default: module.OngoingGamesPage };
});

const GamePage = lazy(async () => {
  const module = await import('../features/games');
  return { default: module.GamePage };
});

const GameDisplayPage = lazy(async () => {
  const module = await import('../features/games');
  return { default: module.GameDisplayPage };
});

const HistoryPage = lazy(async () => {
  const module = await import('../features/games');
  return { default: module.HistoryPage };
});

const StatsPage = lazy(async () => {
  const module = await import('../features/stats');
  return { default: module.StatsPage };
});

function RouteFallback() {
  return (
    <section className="space-y-6">
      <article className="rounded-3xl border border-white/70 bg-white/90 p-6 text-sm text-slate-600 shadow-card backdrop-blur">
        Cargando pantalla...
      </article>
    </section>
  );
}

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

function getRouterBasename(): string {
  const baseUrl = import.meta.env.BASE_URL ?? '/';

  if (baseUrl === '/') {
    return '/';
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

export const router = createBrowserRouter([
  {
    path: '/game/:gameId/display',
    element: withSuspense(<GameDisplayPage />),
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'jugadores',
        element: withSuspense(<PlayersPage />),
      },
      {
        path: 'partidas/nueva',
        element: withSuspense(<NewGamePage />),
      },
      {
        path: 'partidas/en-curso',
        element: withSuspense(<OngoingGamesPage />),
      },
      {
        path: 'game/:gameId',
        element: withSuspense(<GamePage />),
      },
      {
        path: 'historial',
        element: withSuspense(<HistoryPage />),
      },
      {
        path: 'estadisticas',
        element: withSuspense(<StatsPage />),
      },
      {
        path: 'reglas',
        element: <RulesPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
], {
  basename: getRouterBasename(),
});
