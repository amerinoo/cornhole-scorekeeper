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
  'Los equipos lanzan de forma alterna hasta completar la ronda',
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

function RuleGroup({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>
      <p className="mt-3 text-sm text-slate-600">{description}</p>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <p key={item} className="flex gap-3 text-sm text-slate-700">
            <span className="mt-2 h-2 w-2 rounded-full bg-slate-300" />
            <span>{item}</span>
          </p>
        ))}
      </div>
    </section>
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

      <article className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
        <div className="grid gap-6 lg:grid-cols-2">
          <RuleGroup
            title="Puntuación"
            description="Cada bolsa suma según dónde acabe. La ronda se resuelve con cancelación neta."
            items={scoringItems}
          />
          <RuleGroup
            title="Formato"
            description="La app soporta partidas 1v1 y 2v2 con equipos fijos Azul y Rojo."
            items={formatItems}
          />
          <RuleGroup
            title="Sacos"
            description="Las validaciones impiden que un jugador o equipo lance más sacos de los permitidos."
            items={bagItems}
          />
          <RuleGroup
            title="Victoria"
            description="La partida termina cuando un equipo alcanza o supera el objetivo configurado."
            items={winningItems}
          />
        </div>
      </article>

      <article className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Qué significa cada tiro
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-lg font-black text-blueTeam">Cornhole</p>
                <p className="mt-1 text-sm text-slate-700">
                  El saco entra por el agujero. Vale 3 puntos.
                </p>
              </div>
              <div>
                <p className="text-lg font-black text-redTeam">Woody</p>
                <p className="mt-1 text-sm text-slate-700">
                  El saco se queda sobre la tabla. Vale 1 punto.
                </p>
              </div>
              <div>
                <p className="text-lg font-black text-ink">Miss</p>
                <p className="mt-1 text-sm text-slate-700">
                  El saco no puntúa. Vale 0 puntos y la app lo calcula automáticamente.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-slate-200 pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Orden de lanzamiento
            </p>
            <p className="mt-3 text-sm text-slate-700">
              Durante una ronda, Azul y Rojo lanzan de forma alterna hasta completar
              sus 4 sacos por equipo. La ronda termina cuando ambos equipos han
              lanzado todos sus sacos.
            </p>
          </section>
        </div>
      </article>

      <article className="rounded-[2rem] border border-slate-200 bg-sand p-6 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Ejemplo de cancelación
        </p>
        <p className="mt-3 text-sm text-slate-700">
          Se comparan los puntos brutos de ambos equipos y solo suma la diferencia.
        </p>

        <div className="mt-5">
          <div className="grid grid-cols-[1fr_auto_1fr_auto_0.95fr] items-stretch gap-2 rounded-[1.6rem] bg-white p-3 ring-1 ring-slate-200">
            <div className="flex flex-col justify-center rounded-[1.25rem] bg-blueTeam/8 px-3 py-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blueTeam/70">
                Azul
              </p>
              <p className="mt-1 text-3xl font-black text-blueTeam sm:text-4xl">6</p>
              <p className="mt-1 text-xs font-medium text-slate-600">bruto</p>
            </div>

            <div className="flex items-center justify-center">
              <p className="text-2xl font-black text-slate-300 sm:text-3xl">−</p>
            </div>

            <div className="flex flex-col justify-center rounded-[1.25rem] bg-redTeam/8 px-3 py-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-redTeam/70">
                Rojo
              </p>
              <p className="mt-1 text-3xl font-black text-redTeam sm:text-4xl">4</p>
              <p className="mt-1 text-xs font-medium text-slate-600">bruto</p>
            </div>

            <div className="flex items-center justify-center">
              <p className="text-2xl font-black text-slate-300 sm:text-3xl">=</p>
            </div>

            <div className="flex flex-col justify-center rounded-[1rem] bg-blueTeam px-2 py-2 text-center text-white">
              <p className="text-base font-black sm:text-lg">Azul +2</p>
              <p className="mt-0.5 text-[10px] font-medium text-white/80">
                Rojo no suma
              </p>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
