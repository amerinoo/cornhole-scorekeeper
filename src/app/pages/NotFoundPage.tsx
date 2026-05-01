import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-card backdrop-blur">
      <h2 className="text-2xl font-black tracking-tight">Página no encontrada</h2>
      <p className="mt-3 text-sm text-slate-600 sm:text-base">
        La ruta no existe en esta fase del proyecto.
      </p>
      <Link
        to="/"
        className="mt-5 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
      >
        Volver al inicio
      </Link>
    </section>
  );
}
