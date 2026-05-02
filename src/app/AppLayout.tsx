import { Outlet } from 'react-router-dom';
import { MainNav } from '../components/MainNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-court text-ink">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="relative z-40 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MainNav mobileOnly />
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blueTeam/80 sm:text-base">
                Cornhole Scorekeeper
              </p>
            </div>
            <MainNav desktopOnly />
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
