"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Notification data ─── */
const NOTIFICATIONS = [
  { id: 1, title: "Entrega concluída", body: "Seus 1.000 Robux foram entregues com sucesso." },
  { id: 2, title: "Robux entregues", body: "2.500 Robux adicionados à sua conta." },
  { id: 3, title: "Pedido finalizado", body: "Seus 500 Robux chegaram. Aproveite!" },
  { id: 4, title: "Entrega realizada", body: "5.000 Robux entregues com sucesso." },
  { id: 5, title: "Robux creditados", body: "1.700 Robux já estão na sua conta." },
  { id: 6, title: "Entrega confirmada", body: "3.200 Robux entregues em menos de 2 min." },
];

type NotifItem = (typeof NOTIFICATIONS)[number] & { key: number; entering: boolean };

/* ─── Inclinação inicial 3D (perspectiva premium, voltada para a direita) ─── */
const BASE_ROTATION = { x: 2, y: 7, z: 3 };

/* ─── Single notification card in the stack ─── */
function NotifCard({
  notification,
  index,
}: {
  notification: NotifItem;
  index: number;
}) {
  const opacity = index === 0 ? 1 : index === 1 ? 0.85 : 0.7;
  const scale = index === 0 ? 1 : index === 1 ? 0.97 : 0.94;

  return (
    <div
      className={`absolute left-3 right-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        notification.entering ? "animate-notif-enter" : ""
      }`}
      style={{
        bottom: `${80 + index * 72}px`,
        opacity,
        transform: `scale(${scale})`,
        zIndex: 30 - index,
      }}
    >
      <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-[#1c1c28]/90 px-3.5 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        {/* Hollow logo mini */}
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/15">
          <Image
            src="/logo.png"
            alt=""
            width={18}
            height={18}
            className="h-4 w-auto opacity-90"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--fg-muted)]">
              HOLLOW
            </p>
            <span className="text-[8px] text-[var(--fg-muted)]">agora</span>
          </div>
          <p className="mt-0.5 text-[11px] font-semibold leading-tight text-white">
            {notification.title}
          </p>
          <p className="mt-0.5 text-[10px] leading-snug text-[var(--fg-muted)]">
            {notification.body}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Status Bar Icons ─── */
function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-4 pb-1">
      <span className="text-[13px] font-semibold text-white">9:41</span>
      <div className="flex items-center gap-1.5">
        <svg className="h-3.5 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2 22h4V12H2v10zm6 0h4V7H8v15zm6 0h4V2h-4v20zm6 0h4v-8h-4v8z" />
        </svg>
        <svg className="h-3.5 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
        </svg>
        <div className="flex items-center gap-0.5">
          <div className="relative h-3 w-6 rounded-[3px] border border-white/80">
            <div className="absolute inset-[1px] right-[2px] rounded-[2px] bg-white" style={{ width: "80%" }} />
          </div>
          <div className="h-1.5 w-[2px] rounded-r-full bg-white/80" />
        </div>
      </div>
    </div>
  );
}

/* ─── Dynamic Island ─── */
function DynamicIsland() {
  return (
    <div className="absolute top-2 left-1/2 z-40 h-[28px] w-[100px] -translate-x-1/2 rounded-full bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
      <div className="absolute right-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#0a0a12] ring-1 ring-white/[0.08]" />
    </div>
  );
}

/* ─── Interactive 3D Phone with Lock Screen ─── */
function PhoneMockup() {
  const phoneRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: BASE_ROTATION.x, y: BASE_ROTATION.y });
  const [stack, setStack] = useState<NotifItem[]>([]);
  const nextKey = useRef(0);
  const notifCycleIndex = useRef(0);

  // Smooth mouse parallax
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!phoneRef.current) return;
    const rect = phoneRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    setRotation({
      x: Math.max(-6, Math.min(6, -deltaY * 6)),
      y: Math.max(-6, Math.min(6, deltaX * 6)),
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setRotation({ x: BASE_ROTATION.x, y: BASE_ROTATION.y });
  }, []);

  // Notification stack cycle: new enters at top from above, old ones shift down, max 3
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function addNotification() {
      const notif = NOTIFICATIONS[notifCycleIndex.current % NOTIFICATIONS.length];
      notifCycleIndex.current++;
      const newItem: NotifItem = { ...notif, key: nextKey.current++, entering: true };

      setStack((prev) => {
        // Mark existing items as no longer entering
        const settled = prev.map((item) => ({ ...item, entering: false }));
        const updated = [newItem, ...settled];
        return updated.slice(0, 3);
      });

      // Remove entering flag after animation completes
      setTimeout(() => {
        setStack((prev) =>
          prev.map((item) =>
            item.key === newItem.key ? { ...item, entering: false } : item
          )
        );
      }, 700);

      // Schedule next notification (4-8s random interval)
      const delay = 4000 + Math.random() * 4000;
      timeout = setTimeout(addNotification, delay);
    }

    // Initial delay before first notification
    timeout = setTimeout(addNotification, 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className="relative mx-auto w-[280px] sm:w-[300px] lg:w-[320px]"
      style={{ perspective: "1200px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={phoneRef}
        className="relative transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${BASE_ROTATION.z}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Phone outer shell */}
        <div className="relative overflow-hidden rounded-[3.2rem] border-[3px] border-[#3a3a4a] bg-[#0d0d14] shadow-[20px_40px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.03)_inset,0_0_60px_rgba(168,85,247,0.08)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[2px] rounded-[3rem] border border-white/[0.03]"
          />

          {/* Screen — Lock Screen */}
          <div className="relative aspect-[9/19.5] w-full overflow-hidden bg-[#08060e]">
            {/* Wallpaper ambient glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-[35%] left-1/2 h-[60%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(168,85,247,0.12)_0%,transparent_70%)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-[10%] right-[10%] h-[30%] w-[40%] rounded-full bg-[radial-gradient(ellipse,rgba(139,92,246,0.08)_0%,transparent_70%)]"
            />

            <DynamicIsland />
            <StatusBar />

            {/* Lock Screen Content */}
            <div className="relative flex flex-col items-center pt-16 pb-4">
              <p className="text-[13px] font-medium text-white/70">
                Terça-feira, 11 de Novembro
              </p>
              <p className="mt-1 font-display text-[72px] font-bold leading-none tracking-tight text-white">
                9:41
              </p>
            </div>

            {/* Bottom controls — safe zone below notifications */}
            <div className="absolute bottom-6 left-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.12] backdrop-blur-sm">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
            </div>

            <div className="absolute bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.12] backdrop-blur-sm">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-1.5 left-1/2 h-[5px] w-32 -translate-x-1/2 rounded-full bg-white/25" />

            {/* Notification stack — positioned above bottom controls */}
            {stack.map((notif, i) => (
              <NotifCard
                key={notif.key}
                notification={notif}
                index={i}
              />
            ))}
          </div>
        </div>

        {/* Side reflections */}
        <div aria-hidden className="pointer-events-none absolute -right-[1px] top-[8%] bottom-[8%] w-[2px] rounded-full bg-gradient-to-b from-transparent via-white/[0.12] to-transparent" />
        <div aria-hidden className="pointer-events-none absolute -left-[1px] top-[15%] bottom-[15%] w-[1px] rounded-full bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

        {/* Side button — right */}
        <div aria-hidden className="pointer-events-none absolute -right-[4px] top-[28%] h-12 w-[3px] rounded-r-sm bg-[#2a2a3a]" />

        {/* Volume buttons — left */}
        <div aria-hidden className="pointer-events-none absolute -left-[4px] top-[22%] h-6 w-[3px] rounded-l-sm bg-[#2a2a3a]" />
        <div aria-hidden className="pointer-events-none absolute -left-[4px] top-[30%] h-10 w-[3px] rounded-l-sm bg-[#2a2a3a]" />
        <div aria-hidden className="pointer-events-none absolute -left-[4px] top-[42%] h-10 w-[3px] rounded-l-sm bg-[#2a2a3a]" />
      </div>
    </div>
  );
}

/* ─── Main section ─── */
export function HomeProof() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg)]">
      {/* Keyframes for notification enter animation (top-to-bottom) */}
      <style>{`
        @keyframes notif-enter {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-notif-enter {
          animation: notif-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div
        aria-hidden
        className="pointer-events-none absolute left-[-5%] top-[20%] h-[500px] w-[500px] rounded-full bg-[rgba(168,85,247,0.06)] blur-[140px]"
      />

      <div className="site-container relative py-20 md:py-28 lg:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left: 3D Phone with Lock Screen */}
          <div className="flex items-center justify-center lg:justify-start">
            <PhoneMockup />
          </div>

          {/* Right: Text content */}
          <div className="max-w-xl">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--accent-bright)]">
              Entrega automática
            </span>

            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-[3.5rem]">
              Do pedido à entrega,{" "}
              <span className="text-[var(--accent)]">sem você intervir.</span>
            </h2>

            <p className="mt-5 text-lg leading-relaxed text-[var(--fg-muted)]">
              A Hollow automatiza cada etapa. Você escolhe, paga e recebe seus
              Robux com acompanhamento em tempo real — sem precisar ficar
              esperando na tela.
            </p>

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

            <p className="mt-8 text-sm text-[var(--fg-muted)]">
              Seu pedido continua em andamento mesmo sem você acompanhar a tela.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}