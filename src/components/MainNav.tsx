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
      <div className="inline-flex min-w-max items-center gap-1 lg:min-w-0">
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
