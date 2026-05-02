const scoringItems = [
  'Cornhole: 3 puntos',
  'Woody: 1 punto',
  'Miss: 0 puntos',
  'La cancelación deja puntuar solo al equipo con mayor bruto',
];

const formatItems = [
  '1v1: 1 jugador por equipo',
  '2v2: 2 jugadores por equipo',
  'Cada equipo lanza siempre 4 sacos por ronda',
  'Cada ronda tiene 8 sacos en total',
];

const bagItems = [
  '1v1: 4 sacos por jugador',
  '2v2: 2 sacos por jugador',
  'Un equipo nunca puede lanzar más de 4 sacos',
  'Los misses se calculan automáticamente',
];

const winningItems = [
  'Objetivo de 11 o 21 puntos',
  'Gana el primer equipo que llegue o supere el objetivo',
  'No hay regla de pasarse de puntos',
  'Las partidas finalizadas quedan en solo lectura',
];

function RuleChip({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
      {children}
    </span>
  );
}

function RuleSection({
  title,
  description,
  items,
  accentClassName,
}: {
  title: string;
  description: string;
  items: string[];
  accentClassName: string;
}) {
  return (
    <article className={`rounded-[2rem] border p-6 shadow-card ${accentClassName}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>
      <p className="mt-3 text-sm text-slate-600">{description}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {items.map((item) => (
          <RuleChip key={item}>{item}</RuleChip>
        ))}
      </div>
    </article>
  );
}

export function RulesPage() {
  return (
    <section className="space-y-6">
      <article className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blueTeam/80">
          Reglas
        </p>
        <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Lo esencial para anotar bien una partida.
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
          Esta app sigue una estructura fija para que el marcador sea rápido,
          consistente y fácil de compartir en móvil o proyector.
        </p>
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <RuleSection
          title="Puntuación"
          description="Cada bolsa suma según dónde acabe. La ronda se resuelve con cancelación neta."
          items={scoringItems}
          accentClassName="border-blueTeam/20 bg-blueTeam/5"
        />
        <RuleSection
          title="Formato"
          description="La app soporta partidas 1v1 y 2v2 con equipos fijos Azul y Rojo."
          items={formatItems}
          accentClassName="border-redTeam/20 bg-redTeam/5"
        />
        <RuleSection
          title="Sacos"
          description="Las validaciones impiden que un jugador o equipo lance más sacos de los permitidos."
          items={bagItems}
          accentClassName="border-white/70 bg-white/90 backdrop-blur"
        />
        <RuleSection
          title="Victoria"
          description="La partida termina cuando un equipo alcanza o supera el objetivo configurado."
          items={winningItems}
          accentClassName="border-white/70 bg-white/90 backdrop-blur"
        />
      </div>

      <article className="rounded-[2rem] border border-slate-200 bg-sand p-6 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Ejemplo de cancelación
        </p>
        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-700">
          <p>Azul hace 6 puntos brutos.</p>
          <p>Rojo hace 4 puntos brutos.</p>
          <p>Azul suma 2 puntos netos.</p>
          <p>Rojo suma 0.</p>
        </div>
      </article>
    </section>
  );
}
