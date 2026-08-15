const stats = [
  {
    title: "+48.200 vendas",
    description: "Pedidos de Robux e gamepasses concluídos com sucesso.",
  },
  {
    title: "+19.800 clientes",
    description: "Comunidade ativa com recompra e indicação no Brasil.",
  },
  {
    title: "#1 em confiança",
    description: "Preço baixo, entrega segura e suporte rápido.",
  },
];

export function StatsBar() {
  return (
    <section className="border-y border-white/5 bg-[#111118]">
      <div className="site-container grid gap-8 py-8 md:grid-cols-3 md:gap-6 md:py-10">
        {stats.map((stat) => (
          <div key={stat.title} className="text-center md:text-left">
            <h2 className="font-display text-2xl font-bold text-white md:text-[1.7rem]">
              {stat.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
              {stat.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
