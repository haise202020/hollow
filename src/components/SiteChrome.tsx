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
      <main
        className="relative z-0 flex-1"
        style={
          bare
            ? {
                background:
                  "linear-gradient(to right, #08050F 0%, #08050F 30%, #0C0714 45%, #120A20 65%, #170E29 85%, #170E29 100%)",
              }
            : undefined
        }
      >
        {children}
      </main>
      {!bare ? <Footer /> : null}
      {!bare ? <ChatWidget /> : null}
    </>
  );
}
