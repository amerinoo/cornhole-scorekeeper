import { Outlet } from 'react-router-dom';
import { MainNav } from '../components/MainNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-court text-ink">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <header className="relative z-40 mb-6 -mx-4 border-b border-white/70 bg-[#f8f5ea]/88 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <MainNav mobileOnly />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blueTeam/80 sm:text-base">
                  Cornhole Scorekeeper
                </p>
              </div>
            </div>
            <MainNav desktopOnly />
          </div>
        </header>
        <main className="flex-1 pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
