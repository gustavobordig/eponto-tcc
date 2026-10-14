import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { Toaster } from 'react-hot-toast';
import "@/app/globals.css";
import { SCRIPT_TEMA } from "@/shared/lib/tema";

// Plus Jakarta Sans fica próxima do logotipo; JetBrains Mono nos horários
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "MK Ponto",
  description: "Registro de ponto eletrônico, banco de horas, férias e ausências.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // O script põe a classe .dark antes da hidratação; por isso o aviso fica suprimido no <html>
    <html lang="pt-BR" className={`${jakarta.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased"
      >
        {/* Aplica o tema salvo antes da primeira pintura (sem piscar o claro) */}
        <Script id="tema" strategy="beforeInteractive">
          {SCRIPT_TEMA}
        </Script>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
