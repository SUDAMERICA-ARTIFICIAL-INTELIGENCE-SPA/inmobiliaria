import { Inter, JetBrains_Mono } from 'next/font/google';
import { Metadata } from 'next';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'CARLOS PULIDO | Real Estate Intelligence',
  description: 'Plataforma de inteligencia inmobiliaria potenciada por IA para Miami-Dade County — Proyecto exclusivo para Carlos Pulido',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen bg-black text-white antialiased overflow-hidden font-sans`}>
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-20" />
        <div className="relative z-10 h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
