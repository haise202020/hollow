"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  BagIcon,
  ChevronIcon,
  InvoiceIcon,
  LogoutIcon,
  ShieldIcon,
  UserIcon,
} from "@/components/icons";
import { prefetchAccountData } from "@/components/account/useAccountData";
import { isAdminDiscordId } from "@/lib/auth/admin";

const navItems = [
  { href: "/", label: "Início" },
  { href: "/robux", label: "Robux" },
  { href: "/gamepasses", label: "Gamepasses" },
  { href: "/suporte", label: "Suporte" },
];

type SessionUser = {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string | null;
  discordId?: string | null;
  hasPassword?: boolean;
};

type Indicator = {
  left: number;
  width: number;
  ready: boolean;
};

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState<Indicator>({
    left: 0,
    width: 0,
    ready: false,
  });

  // Detecta scroll para ativar modo pílula
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 30);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { user?: SessionUser | null }) => {
        if (!cancelled) setUser(data.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useLayoutEffect(() => {
    function updateIndicator() {
      const activeHref =
        navItems.find((item) => isActivePath(pathname, item.href))?.href ??
        null;
      const nav = navRef.current;
      const activeEl = activeHref ? itemRefs.current[activeHref] : null;

      if (!nav || !activeEl) {
        setIndicator((prev) => ({ ...prev, ready: false }));
        return;
      }

      const navBox = nav.getBoundingClientRect();
      const itemBox = activeEl.getBoundingClientRect();
      setIndicator({
        left: itemBox.left - navBox.left,
        width: itemBox.width,
        ready: true,
      });
    }

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [pathname]);

  async function logout() {
    setMenuOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.refresh();
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/perfil") ||
      pathname.startsWith("/faturas") ||
      pathname.startsWith("/compras")
    ) {
      router.push("/");
    }
  }

  const label = user?.displayName || user?.username;
  const isAdmin = isAdminDiscordId(user?.discordId);

  const menuItems = [
    ...(isAdmin
      ? [{ href: "/admin/dashboard", label: "Dashboard", icon: ShieldIcon }]
      : []),
    { href: "/perfil", label: "Perfil", icon: UserIcon },
    { href: "/faturas", label: "Faturas", icon: InvoiceIcon },
    { href: "/compras", label: "Minhas compras", icon: BagIcon },
  ];

  return (
    <>
      {/* Spacer to prevent content jump — matches header height */}
      <div
        className={`transition-[height] ${
          scrolled
            ? "duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            : "duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
        }`}
        style={{ height: scrolled ? 76 : 80 }}
      />

      <header className="fixed top-0 right-0 left-0 z-[80]">
        {/* Outer wrapper handles vertical position + padding animation */}
        <div
          className={`transition-[padding] ${
            scrolled
              ? "duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              : "duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
          }`}
          style={{
            paddingTop: scrolled ? 12 : 0,
            paddingBottom: scrolled ? 12 : 0,
          }}
        >
          {/* Glass container — morphs between full bar and floating pill */}
          <div
            className={`relative mx-auto transition-[max-width,border-radius,padding,box-shadow] ${
              scrolled
                ? "duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                : "duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
            }`}
            style={{
              maxWidth: scrolled ? "56rem" : "100%",
              borderRadius: scrolled ? 9999 : 0,
              borderWidth: scrolled ? 1 : 0,
              borderStyle: "solid",
              borderColor: scrolled
                ? "rgba(255,255,255,0.1)"
                : "rgba(255,255,255,0.06)",
              borderBottomWidth: scrolled ? 1 : 1,
              background: scrolled
                ? "rgba(7,7,10,0.65)"
                : "rgba(7,7,10,0.8)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: scrolled
                ? "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset"
                : "none",
              paddingLeft: scrolled ? 24 : 0,
              paddingRight: scrolled ? 24 : 0,
            }}
          >
            {/* Desktop nav — positioned relative to glass container, always centered */}
            <nav
              ref={navRef}
              className={`absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-white/[0.08] bg-[#0c0c12]/90 px-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-transform ${
              scrolled
                ? "duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                : "duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
            } md:flex`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute top-1.5 bottom-1.5 rounded-full bg-white/[0.08] transition-all duration-300 ease-out"
                style={{
                  left: indicator.left,
                  width: indicator.width,
                  opacity: indicator.ready ? 1 : 0,
                }}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-[7px] h-[2px] rounded-full bg-[var(--accent-bright)] transition-all duration-300 ease-out"
                style={{
                  left: indicator.left + Math.max((indicator.width - 20) / 2, 0),
                  width: 20,
                  opacity: indicator.ready ? 1 : 0,
                }}
              />

              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    ref={(el) => {
                      itemRefs.current[item.href] = el;
                    }}
                    className={`relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                      active
                        ? "text-white"
                        : "text-[var(--fg-muted)] hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div
              className={`site-container relative flex items-center justify-between transition-[height] ${
              scrolled
                ? "duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                : "duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
            }`}
              style={{ height: scrolled ? 52 : 72 }}
            >
              {/* Logo */}
              <Link
                href="/"
                className="relative z-10 flex shrink-0 items-center gap-2.5"
              >
                <Image
                  src="/logo.png"
                  alt="Hollow"
                  width={36}
                  height={36}
                  priority
                  className={`transition-[height] ${
                    scrolled
                      ? "duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      : "duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
                  }`}
                  style={{
                    height: scrolled ? 28 : 36,
                    width: "auto",
                  }}
                />
                <span
                  className={`font-display font-bold tracking-tight text-white transition-[font-size,opacity] ${
                    scrolled
                      ? "duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      : "duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
                  }`}
                  style={{
                    fontSize: scrolled ? "1rem" : "1.25rem",
                    opacity: scrolled ? 0.9 : 1,
                  }}
                >
                  hollow
                </span>
              </Link>

              {/* Right side */}
              <div className="relative z-10 flex items-center gap-2">
                {user ? (
                  <div className="relative hidden sm:block" ref={menuRef}>
                    <button
                      type="button"
                      aria-expanded={menuOpen}
                      aria-haspopup="menu"
                      onClick={() => {
                        prefetchAccountData();
                        setMenuOpen((value) => !value);
                      }}
                      className={`inline-flex items-center gap-2 rounded-xl border bg-white/[0.03] py-1 pl-1 pr-2.5 transition ${
                        menuOpen
                          ? "border-[var(--accent-bright)]"
                          : "border-white/[0.08] hover:border-[var(--accent)]/40"
                      }`}
                    >
                      {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatarUrl}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/20 text-xs font-bold text-[var(--accent-bright)]">
                          {(label || "?").slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <span className="max-w-[110px] truncate text-sm font-medium text-white">
                        {label}
                      </span>
                      <ChevronIcon
                        className={`h-4 w-4 text-[var(--fg-muted)] transition ${
                          menuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {menuOpen ? (
                      <div
                        role="menu"
                        className="user-menu-enter absolute right-0 mt-2 w-[220px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101014]/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                        onMouseEnter={() => {
                          prefetchAccountData();
                        }}
                      >
                        {menuItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              role="menuitem"
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/90 transition hover:bg-white/[0.05]"
                            >
                              <Icon className="h-4 w-4 text-[var(--fg-muted)]" />
                              {item.label}
                            </Link>
                          );
                        })}
                        <div className="my-1 h-px bg-white/[0.06]" />
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => void logout()}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-rose-300 transition hover:bg-rose-500/10"
                        >
                          <LogoutIcon className="h-4 w-4" />
                          Encerrar sessão
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className={`hidden rounded-lg bg-[var(--accent)] font-semibold text-[#08090d] transition-[padding,font-size] ${
                      scrolled
                        ? "duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        : "duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
                    } hover:bg-[var(--accent-bright)] hover:shadow-[0_0_20px_var(--accent-glow)] sm:inline-flex`}
                    style={{
                      padding: scrolled ? "8px 16px" : "10px 20px",
                      fontSize: scrolled ? "0.8125rem" : "0.875rem",
                    }}
                  >
                    Entrar
                  </Link>
                )}

                {/* Mobile hamburger */}
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white md:hidden"
                  aria-label={open ? "Fechar menu" : "Abrir menu"}
                  aria-expanded={open}
                  onClick={() => setOpen((value) => !value)}
                >
                  <span className="sr-only">Menu</span>
                  <div className="space-y-1.5">
                    <span className="block h-0.5 w-4 bg-white" />
                    <span className="block h-0.5 w-4 bg-white" />
                    <span className="block h-0.5 w-4 bg-white" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {open ? (
          <div className="fixed inset-x-0 top-[72px] z-[79] border-t border-white/5 bg-[#0c0c11]/95 backdrop-blur-xl md:hidden">
            <nav className="site-container flex flex-col gap-1 py-3">
              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-full px-4 py-2.5 text-sm transition-colors duration-300 ${
                      active
                        ? "bg-white/[0.08] text-white"
                        : "text-[var(--fg-muted)] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {user ? (
                <>
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="rounded-full px-4 py-2.5 text-sm text-[var(--accent-bright)] hover:bg-white/5"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      void logout();
                    }}
                    className="rounded-full px-4 py-2.5 text-left text-sm text-rose-300 hover:bg-white/5"
                  >
                    Encerrar sessão
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-[var(--accent)] px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Entrar
                </Link>
              )}
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
}