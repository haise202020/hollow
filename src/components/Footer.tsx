import Link from "next/link";
import { ShieldIcon } from "./icons";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-[#0a0a0f]">
      <div className="site-container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-xl font-bold text-white">
            hollow
          </p>
          <p className="mt-2 max-w-md text-sm text-[var(--fg-muted)]">
            Robux e gamepasses com o melhor preço do Brasil. Entrega segura e
            suporte rápido.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--fg-muted)]">
          <Link href="/robux" className="hover:text-white">
            Robux
          </Link>
          <Link href="/gamepasses" className="hover:text-white">
            Gamepasses
          </Link>
          <Link href="/suporte" className="hover:text-white">
            Suporte
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[var(--purple-bright)]">
            <ShieldIcon className="h-4 w-4" />
            Compra protegida
          </span>
        </div>
      </div>
    </footer>
  );
}
