import { Link } from 'react-router-dom';

const cards = [
  {
    title: 'Nueva partida',
    description: 'Configura un duelo 1v1 o 2v2 y arranca el marcador.',
    to: '/partidas/nueva',
    accent: 'border-blueTeam/30 bg-blueTeam/5',
  },
  {
    title: 'Jugadores',
    description: 'Gestiona la lista global de jugadores para estadísticas.',
    to: '/jugadores',
    accent: 'border-redTeam/30 bg-redTeam/5',
  },
  {
    title: 'Partidas en curso',
    description: 'Recupera una partida activa y sigue anotando rondas.',
    to: '/partidas/en-curso',
    accent: 'border-slate-300 bg-white',
  },
  {
    title: 'Historial',
    description: 'Consulta partidas finalizadas y sus resultados.',
    to: '/historial',
    accent: 'border-slate-300 bg-white',
  },
  {
    title: 'Estadísticas',
    description: 'Revisa métricas globales por jugador y por color.',
    to: '/estadisticas',
    accent: 'border-slate-300 bg-white',
  },
];

export function HomePage() {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className={`rounded-3xl border p-5 shadow-card transition hover:-translate-y-0.5 ${card.accent}`}
          >
            <p className="text-lg font-bold">{card.title}</p>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-card backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Estado actual
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight">
            Fase 5 lista y fase extra añadida
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>CRUD básico de jugadores conectado a Firestore.</li>
            <li>Creación de partidas 1v1 y 2v2 con validación.</li>
            <li>Registro y edición de rondas con recálculo completo.</li>
            <li>Historial, estadísticas y lista de partidas en curso.</li>
          </ul>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-sand p-5 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Reglas clave
          </p>
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            <p>1v1: 4 sacos por jugador.</p>
            <p>2v2: 2 sacos por jugador.</p>
            <p>4 sacos por equipo y 8 por ronda.</p>
            <p>Cancelación neta por ronda.</p>
          </div>
        </article>
      </div>
    </section>
  );
}
