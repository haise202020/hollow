import Link from "next/link";
import { ShieldIcon } from "./icons";

const year = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-[#0a0a0f]">
      <div className="site-container py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <p className="font-display text-xl font-bold text-white">hollow</p>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--fg-muted)]">
              Robux e gamepasses com o melhor preço do Brasil. Entrega segura,
              suporte rápido e transparência em cada pedido.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Links principais" className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Navegação
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/robux" className="text-[var(--fg-muted)] transition hover:text-white">
                  Comprar Robux
                </Link>
              </li>
              <li>
                <Link href="/gamepasses" className="text-[var(--fg-muted)] transition hover:text-white">
                  Gamepasses
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-[var(--fg-muted)] transition hover:text-white">
                  Minha conta
                </Link>
              </li>
              <li>
                <Link href="/suporte" className="text-[var(--fg-muted)] transition hover:text-white">
                  Suporte
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Links legais" className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Institucional
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="cursor-default text-[var(--fg-muted)] opacity-60">
                  Termos de uso
                </span>
              </li>
              <li>
                <span className="cursor-default text-[var(--fg-muted)] opacity-60">
                  Política de privacidade
                </span>
              </li>
              <li>
                <span className="cursor-default text-[var(--fg-muted)] opacity-60">
                  Política de reembolso
                </span>
              </li>
            </ul>
          </nav>

          {/* Trust & Payment */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
                Pagamento seguro
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-white">
                  PIX
                </span>
                <span className="inline-flex items-center rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-white">
                  Mercado Pago
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-[var(--secondary)]">
              <ShieldIcon className="h-4 w-4 shrink-0" />
              <span>Compra protegida</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-[var(--fg-muted)] sm:flex-row">
          <p>&copy; {year} Hollow. Todos os direitos reservados.</p>
          <p>
            Hollow não é afiliada ou endossada pela Roblox Corporation.
          </p>
        </div>
      </div>
    </footer>
  );
}