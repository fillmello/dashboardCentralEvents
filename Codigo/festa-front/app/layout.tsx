import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Suspense } from "react";
import { Nav } from "./components/Nav";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Festa de Multiplicação — Central de Posts",
  description:
    "Dashboard operacional em tempo real para a esteira de produção de conteúdo da Festa de Multiplicação.",
};

// Applies the saved theme (falling back to the OS preference) before first
// paint, so dark mode never flashes light. Kept inline + minified on purpose.
const themeInit = `(function(){try{var t=localStorage.getItem('praca:theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-black">
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted static theme bootstrap */}
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <Suspense>
          <Nav />
        </Suspense>
        <main className="flex-1">
          <Suspense>{children}</Suspense>
        </main>
      </body>
    </html>
  );
}
