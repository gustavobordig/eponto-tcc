import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "@/app/globals.css";

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
    <html lang="pt-BR" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body
        suppressHydrationWarning
        className="antialiased"
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
