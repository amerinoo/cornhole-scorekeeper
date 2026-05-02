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

export function MainNav() {
  return (
    <nav className="w-full max-w-full overflow-x-auto">
      <div className="inline-flex min-w-full gap-1 rounded-[1.6rem] border border-slate-200/80 bg-slate-100/85 p-1.5 shadow-sm backdrop-blur lg:min-w-0">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-[1.1rem] px-4 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white/90 hover:text-ink'
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
