import Link from "next/link";
import { ChatIcon } from "./icons";

export function ChatWidget() {
  return (
    <Link
      href="/suporte"
      aria-label="Abrir suporte"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--purple)] text-white shadow-[0_10px_30px_rgba(139,92,246,0.45)] transition hover:scale-105 hover:bg-[var(--purple-bright)]"
    >
      <ChatIcon className="h-6 w-6" />
    </Link>
  );
}
