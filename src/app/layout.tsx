import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Unbounded } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "GymControl — Gestión de Gimnasio",
  description: "Sistema inteligente para la administración de gimnasios y centros de entrenamiento.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GymControl",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "GymControl — Gestión de Gimnasio",
    description: "Sistema inteligente para la administración de gimnasios y centros de entrenamiento.",
    url: "https://gymcontrol-peach.vercel.app",
    siteName: "GymControl",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GymControl Dashboard",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GymControl — Gestión de Gimnasio",
    description: "Sistema inteligente para la administración de gimnasios y centros de entrenamiento.",
    images: ["/og-image.jpg"],
  },
};

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from 'sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { QueryProvider } from '@/components/providers/query-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${unbounded.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <QueryProvider>
              {children}
              <Toaster 
                richColors 
                position="top-right" 
                closeButton
                expand={false}
                toastOptions={{
                  style: {
                    background: 'rgba(9, 9, 11, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '14px',
                    borderRadius: '12px',
                  },
                  className: 'premium-toast',
                }}
              />
            </QueryProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
