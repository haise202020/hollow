import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

const satoshi = localFont({
  src: [
    {
      path: "../../fontes/Satoshi/Satoshi-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../fontes/Satoshi/Satoshi-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fontes/Satoshi/Satoshi-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fontes/Satoshi/Satoshi-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../fontes/Satoshi/Satoshi-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const poppins = localFont({
  src: [
    {
      path: "../../fontes/Poppins-Bold/Poppins-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fontes/Poppins-Bold/Poppins-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fontes/Poppins-Bold/Poppins-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../fontes/Poppins-Bold/Poppins-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../fontes/Poppins-Bold/Poppins-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hollow — Robux e Gamepasses mais baratos do Brasil",
    template: "%s | Hollow",
  },
  description:
    "Compre Robux barato e gamepasses de jogos do Roblox na Hollow. Entrega segura, suporte rápido e o melhor preço do Brasil.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Hollow — Robux e Gamepasses",
    description:
      "Robux e gamepasses com o preço mais baixo do Brasil. Entrega segura.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${satoshi.variable} ${poppins.variable} h-full`}
    >
      <body className="flex min-h-full flex-col font-sans antialiased">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
