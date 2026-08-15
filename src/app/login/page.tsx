import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginClient } from "@/components/LoginClient";

export const metadata: Metadata = {
  title: "Login",
  description: "Entre ou crie sua conta Hollow.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#060609] text-sm text-[var(--fg-muted)]">
          Carregando…
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
