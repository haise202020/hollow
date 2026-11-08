import type { Metadata } from "next";
import { DiscordIcon, ShieldIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Suporte",
  description:
    "Suporte Hollow pelo Discord. Entre em discord.gg/hollowbux para atendimento.",
};

const DISCORD_SUPPORT_URL = "https://discord.gg/hollowbux";

export default function SuportePage() {
  return (
    <div className="site-container py-12 md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--accent-bright)]">
          Suporte
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
          Suporte pelo Discord
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--fg-muted)]">
          Todo o atendimento da Hollow é feito no Discord — dúvidas sobre
          Robux, gamepasses, status de pedido ou pagamento.
        </p>

        <a
          href={DISCORD_SUPPORT_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center justify-center gap-3 rounded-2xl bg-[#5865F2] px-6 py-3.5 text-sm font-bold text-white transition hover:brightness-110"
        >
          <DiscordIcon className="h-5 w-5" />
          Entrar no Discord
        </a>

        <p className="mt-4 text-sm text-[var(--fg-muted)]">
          Convite:{" "}
          <a
            href={DISCORD_SUPPORT_URL}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[var(--accent-bright)] hover:text-white"
          >
            discord.gg/hollowbux
          </a>
        </p>
      </div>

      <ul className="mx-auto mt-12 grid max-w-3xl gap-4 text-left text-sm text-[var(--fg-muted)] sm:grid-cols-3">
        {[
          "Atendimento humano em português no Discord.",
          "Nunca pedimos a senha da sua conta Roblox.",
          "Leve o ID do pedido pra agilizar o suporte.",
        ].map((text) => (
          <li
            key={text}
            className="flex gap-3 rounded-2xl border border-white/[0.04] bg-[#09090d] p-4"
          >
            <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent-bright)]" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
