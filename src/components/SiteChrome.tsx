"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "@/components/ChatWidget";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = pathname === "/login";

  return (
    <>
      {!bare ? <Header /> : null}
      <main className="flex-1">{children}</main>
      {!bare ? <Footer /> : null}
      {!bare ? <ChatWidget /> : null}
    </>
  );
}
