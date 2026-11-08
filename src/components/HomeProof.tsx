import Image from "next/image";
import { DiscordIcon } from "./icons";

function Mascot({
  src,
  alt,
  width,
  height,
  imageClass,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  imageClass: string;
}) {
  return (
    <div className="flex h-[260px] items-end justify-center md:h-[420px]">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 768px) 80vw, 360px"
        className={`w-auto max-w-full object-contain object-bottom ${imageClass}`}
      />
    </div>
  );
}

export function HomeProof() {
  return (
    <section className="relative border-t border-white/[0.06] bg-[#0b0c11]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[42%] h-48 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.16),transparent_68%)]"
      />

      <div className="site-container relative grid gap-16 py-16 md:grid-cols-3 md:items-start md:gap-x-10 md:py-20 lg:gap-x-14">
        <article className="flex flex-col">
          <Mascot
            src="/photos/6.png"
            alt="Mascote Hollow conferindo um Robux"
            width={480}
            height={640}
            imageClass="h-[240px] md:h-[320px]"
          />
          <div className="mt-6 border-t border-white/10 pt-6">
            <h2 className="font-display text-[1.65rem] font-bold leading-[1.15] text-white">
              Compra transparente,{" "}
              <span className="text-[var(--secondary)]">entrega garantida.</span>
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--fg-muted)]">
              Preço claro, taxa de 30% já inclusa no cálculo e entrega segura —
              sem pedir senha da sua conta Roblox.
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-1">
              <div className="border-l-2 border-[var(--accent)] pl-4">
                <h3 className="font-display text-base font-semibold text-white">
                  Sem acesso à conta
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--fg-muted)]">
                  Você só informa o username. Nada de senha ou dados sensíveis.
                </p>
              </div>
              <div className="border-l-2 border-white/15 pl-4">
                <h3 className="font-display text-base font-semibold text-white">
                  Suporte em português
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--fg-muted)]">
                  Acompanhamento do pedido e ajuda rápida quando precisar.
                </p>
              </div>
            </div>
          </div>
        </article>

        <article className="flex flex-col">
          <Mascot
            src="/photos/7.png"
            alt="Mascote Hollow no trono de Robux"
            width={1024}
            height={1536}
            imageClass="h-[260px] md:h-[420px]"
          />
          <div className="mt-6 border-t border-white/10 pt-6">
            <h2 className="font-display text-[1.65rem] font-bold leading-[1.15] text-white">
              Entrega rápida,{" "}
              <span className="text-[var(--accent)]">sem enrolação.</span>
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--fg-muted)]">
              Você escolhe, confirma e recebe com acompanhamento até a
              conclusão. Pedidos de Robux e gamepasses processados com
              agilidade.
            </p>
            <h3 className="mt-8 font-display text-[1.65rem] font-bold leading-[1.15] text-white">
              Melhor preço,{" "}
              <span className="text-[var(--secondary)]">sem surpresas.</span>
            </h3>
            <p className="mt-4 font-display text-5xl font-bold leading-none tracking-tight text-white">
              R$ 38
              <span className="text-[0.55em] text-[var(--fg-muted)]">,00</span>
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--fg-muted)]">
              1.000 Robux, com taxa de 30% já inclusa. Transparência total no
              valor que você paga.
            </p>
          </div>
        </article>

        <article className="flex flex-col">
          <Mascot
            src="/photos/8.png"
            alt="Mascote Hollow do suporte"
            width={1411}
            height={1115}
            imageClass="h-[200px] md:h-[260px]"
          />
          <div className="mt-6 border-t border-white/10 pt-6">
            <h2 className="font-display text-[1.65rem] font-bold leading-[1.15] text-white">
              Precisa de ajuda?{" "}
              <span className="text-[var(--secondary)]">Suporte real.</span>
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--fg-muted)]">
              Atendimento pelo Discord com equipe em português. Dúvidas sobre
              Robux, gamepasses ou status do pedido resolvidas de verdade.
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-1">
              <div>
                <h3 className="font-display text-base font-semibold text-white">
                  Equipe em português
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--fg-muted)]">
                  Fale direto com a equipe Hollow e resolva seu pedido com
                  clareza.
                </p>
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-white">
                  Resposta ágil
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--fg-muted)]">
                  Dúvidas sobre entrega, taxa ou gamepass? Respondemos rápido.
                </p>
              </div>
            </div>
            <a
              href="https://discord.gg/hollowbux"
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2.5 rounded-lg bg-[#5865F2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6d78f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b96ff]"
            >
              <DiscordIcon className="h-4 w-4" />
              Entrar no Discord
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
