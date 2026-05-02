import { Outlet } from 'react-router-dom';
import { MainNav } from '../components/MainNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-court text-ink">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="relative z-40 mb-6 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-card backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blueTeam/80">
            Cornhole Scorekeeper
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div />
            <MainNav />
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
