import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Inicio' },
  { to: '/jugadores', label: 'Jugadores' },
  { to: '/partidas/nueva', label: 'Nueva partida' },
  { to: '/partidas/en-curso', label: 'En curso' },
  { to: '/historial', label: 'Historial' },
  { to: '/estadisticas', label: 'Estadísticas' },
  { to: '/reglas', label: 'Reglas' },
];

export function MainNav({
  mobileOnly = false,
  desktopOnly = false,
}: {
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const navVisibilityClassName = mobileOnly
    ? 'lg:hidden'
    : desktopOnly
      ? 'hidden lg:block'
      : '';

  return (
    <nav className={`relative z-50 ${navVisibilityClassName}`}>
      <div className="flex items-center justify-end lg:hidden">
        <button
          type="button"
          onClick={() => {
            setIsOpen((current) => !current);
          }}
          aria-expanded={isOpen}
          aria-label="Abrir menú"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-ink shadow-sm"
        >
          <span className="flex flex-col gap-1">
            <span className="block h-0.5 w-4 rounded-full bg-current" />
            <span className="block h-0.5 w-4 rounded-full bg-current" />
            <span className="block h-0.5 w-4 rounded-full bg-current" />
          </span>
        </button>
      </div>

      {isOpen ? (
        <div className="absolute right-0 top-14 z-50 w-64 rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-xl lg:hidden">
          <div className="grid gap-1">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  setIsOpen(false);
                }}
                className={({ isActive }) =>
                  `rounded-[1rem] px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-ink text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ) : null}

      <div className="hidden items-center gap-1 lg:flex">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'bg-ink text-white'
                  : 'text-slate-500 hover:bg-white/60 hover:text-ink'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
