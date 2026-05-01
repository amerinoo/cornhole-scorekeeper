type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-card backdrop-blur">
      <h2 className="text-2xl font-black tracking-tight">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
        {description}
      </p>
    </section>
  );
}
