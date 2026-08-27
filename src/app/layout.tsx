import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/vendeda/theme-provider";
import { AuthProvider } from "@/components/vendeda/AuthProvider";
import { PWAInstallPrompt, PWAUpdateBanner } from "@/components/vendeda/PWA";
import { LayoutClientWrapper } from '@/components/vendeda/LayoutClientWrapper';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Display font for headlines â€” warm, modern, distinct from body
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vendeya.live"),
  title: {
    default: "Vende Ya â€” Subastas en Vivo & Marketplace",
    template: "%s Â· Vende Ya",
  },
  description:
    "El marketplace social del PerÃº. Compra y vende en subastas en vivo, paga con Yape, Plin o PagoEfectivo. Emite tu producto en directo y vende al mejor postor.",
  keywords: [
    "Vende Ya", "subastas en vivo", "marketplace PerÃº", "Yape", "Plin",
    "PagoEfectivo", "live shopping", "Lima", "comprar online PerÃº",
  ],
  authors: [{ name: "Vende Ya" }],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  appleWebApp: {
    capable: true,
    title: "Vende Ya",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Vende Ya â€” Subastas en Vivo & Marketplace",
    description: "El marketplace social del PerÃº. Subastas en vivo, Yape/Plin, envÃ­os Olva.",
    siteName: "Vende Ya",
    type: "website",
    locale: "es_PE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vende Ya",
    description: "El marketplace social del PerÃº. Subastas en vivo.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)",  color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PE" suppressHydrationWarning>
      <head>
        {/*
         * Flaticon Uicons CDN REMOVED â€” the cdn-uicons.flaticon.com 3.0.2
         * URLs return 404 (CDN moved/deprecated), breaking the page with
         * ERR_ABORTED 404 errors. The Flaticon component still exists in
         * src/components/vendeda/Flaticon.tsx but is not used by any
         * actual UI â€” all real icons use lucide-react which is bundled.
         * If Flaticon icons are needed in the future, self-host the
         * uicons CSS + woff2 files under /public/fonts/uicons/.
         */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${display.variable} antialiased bg-background text-foreground h-[100dvh] flex flex-col overflow-hidden overscroll-none`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <LayoutClientWrapper>{children}</LayoutClientWrapper>
            <Toaster />
            <SonnerToaster position="top-center" richColors />
            <PWAInstallPrompt />
            <PWAUpdateBanner />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
