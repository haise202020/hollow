"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Notification data ─── */
const NOTIFICATIONS = [
  { title: "Entrega concluída", body: "Seus 1.000 Robux foram entregues com sucesso." },
  { title: "Robux entregues", body: "2.500 Robux adicionados à sua conta." },
  { title: "Pedido finalizado", body: "Seus 500 Robux chegaram. Aproveite!" },
  { title: "Entrega realizada", body: "5.000 Robux entregues com sucesso." },
  { title: "Robux creditados", body: "1.700 Robux já estão na sua conta." },
  { title: "Entrega confirmada", body: "3.200 Robux entregues em menos de 2 min." },
];

/* ─── Phone notification component ─── */
function PhoneNotification({
  notification,
  visible,
}: {
  notification: (typeof NOTIFICATIONS)[number];
  visible: boolean;
}) {
  return (
    <div
      className={`pointer-events-none absolute top-4 left-3 right-3 z-30 flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-[#1a1a2e]/95 px-4 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-4 opacity-0"
      }`}
    >
      {/* Hollow logo mini */}
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/15">
        <Image
          src="/logo.png"
          alt=""
          width={20}
          height={20}
          className="h-5 w-auto opacity-90"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
          Hollow
        </p>
        <p className="mt-0.5 text-[13px] font-semibold leading-tight text-white">
          {notification.title}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--fg-muted)]">
          {notification.body}
        </p>
      </div>

      <span className="mt-0.5 text-[9px] text-[var(--fg-muted)]">agora</span>
    </div>
  );
}

/* ─── Interactive 3D Phone ─── */
function PhoneMockup() {
  const phoneRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [notifIndex, setNotifIndex] = useState(0);
  const [notifVisible, setNotifVisible] = useState(false);

  // Mouse parallax
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!phoneRef.current) return;
    const rect = phoneRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    setRotation({
      x: Math.max(-8, Math.min(8, -deltaY * 8)),
      y: Math.max(-8, Math.min(8, deltaX * 8)),
    });
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
  }, []);

  // Notification cycle
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function cycle() {
      setNotifVisible(true);
      timeout = setTimeout(() => {
        setNotifVisible(false);
        timeout = setTimeout(() => {
          setNotifIndex((prev) => (prev + 1) % NOTIFICATIONS.length);
          cycle();
        }, 800);
      }, 4000);
    }

    // Start after initial delay
    timeout = setTimeout(cycle, 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className="relative mx-auto w-[280px] sm:w-[300px] lg:w-[320px]"
      style={{ perspective: "1200px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={phoneRef}
        className="relative transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Phone body */}
        <div className="relative overflow-hidden rounded-[3rem] border-[3px] border-[#2a2a3a] bg-[#0a0a0f] shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)_inset]">
          {/* Screen bezel highlight */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[2.8rem] border border-white/[0.04]"
          />

          {/* Dynamic island / notch */}
          <div className="absolute top-3 left-1/2 z-40 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />

          {/* Screen content area */}
          <div className="relative aspect-[9/19.5] w-full overflow-hidden bg-gradient-to-b from-[#0f0f18] to-[#0a0a10]">
            {/* Status bar */}
            <div className="flex items-center justify-between px-6 pt-12 pb-2">
              <span className="text-[10px] font-medium text-white/60">9:41</span>
              <div className="flex items-center gap-1.5">
                <svg className="h-3 w-3 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z" />
                </svg>
                <svg className="h-3 w-3 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
                </svg>
              </div>
            </div>

            {/* Wallpaper ambient glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-1/3 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]/10 blur-[60px]"
            />

            {/* App grid placeholder — subtle dots */}
            <div className="mt-8 grid grid-cols-4 gap-x-4 gap-y-6 px-6">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="h-12 w-12 rounded-xl bg-white/[0.04] border border-white/[0.03]" />
                </div>
              ))}
            </div>

            {/* Bottom dock */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/[0.04] bg-white/[0.02] px-6 py-4 backdrop-blur-md">
              <div className="flex justify-between">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 w-12 rounded-xl bg-white/[0.05] border border-white/[0.04]" />
                ))}
              </div>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-1.5 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-white/20" />

            {/* Notification overlay */}
            <PhoneNotification
              notification={NOTIFICATIONS[notifIndex]}
              visible={notifVisible}
            />
          </div>
        </div>

        {/* Phone side reflection */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-1 top-[10%] bottom-[10%] w-[2px] rounded-full bg-gradient-to-b from-transparent via-white/[0.08] to-transparent"
        />
      </div>
    </div>
  );
}

/* ─── Main section ─── */
export function HomeProof() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg)]">
      {/* Subtle ambient */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-5%] top-[20%] h-[500px] w-[500px] rounded-full bg-[rgba(168,85,247,0.06)] blur-[140px]"
      />

      <div className="site-container relative py-20 md:py-28 lg:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          {/* ── Left: Text content ── */}
          <div className="max-w-xl">
            {/* Label */}
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--accent-bright)]">
              Entrega automática
            </span>

            {/* Title */}
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-[3.5rem]">
              Do pedido à entrega,{" "}
              <span className="text-[var(--accent)]">sem você intervir.</span>
            </h2>

            {/* Description */}
            <p className="mt-5 text-lg leading-relaxed text-[var(--fg-muted)]">
              A Hollow automatiza cada etapa. Você escolhe, paga e recebe seus
              Robux com acompanhamento em tempo real — sem precisar ficar
              esperando na tela.
            </p>

            {/* Steps */}
            <div className="mt-10 space-y-5">
              {[
                { step: "01", label: "Escolha o produto" },
                { step: "02", label: "Faça o pagamento via PIX" },
                { step: "03", label: "Receba seus Robux automaticamente" },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] font-mono text-xs font-bold text-[var(--accent-bright)]">
                    {item.step}
                  </span>
                  <span className="text-base font-medium text-white">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Complementary line */}
            <p className="mt-8 text-sm text-[var(--fg-muted)]">
              Seu pedido continua em andamento mesmo sem você acompanhar a tela.
            </p>
          </div>

          {/* ── Right: 3D Phone ── */}
          <div className="flex items-center justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}