import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/vendeda/theme-provider";

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

// Display font for headlines — warm, modern, distinct from body
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vendeya.pe"),
  title: {
    default: "Vende Ya — Subastas en Vivo & Marketplace",
    template: "%s · Vende Ya",
  },
  description:
    "El marketplace social del Perú. Compra y vende en subastas en vivo, paga con Yape, Plin o PagoEfectivo. Emite tu producto en directo y vende al mejor postor.",
  keywords: [
    "Vende Ya", "subastas en vivo", "marketplace Perú", "Yape", "Plin",
    "PagoEfectivo", "live shopping", "Lima", "comprar online Perú",
  ],
  authors: [{ name: "Vende Ya" }],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Vende Ya — Subastas en Vivo & Marketplace",
    description: "El marketplace social del Perú. Subastas en vivo, Yape/Plin, envíos Olva.",
    siteName: "Vende Ya",
    type: "website",
    locale: "es_PE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vende Ya",
    description: "El marketplace social del Perú. Subastas en vivo.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF5A1F" },
    { media: "(prefers-color-scheme: dark)",  color: "#1A1410" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // allow zoom for accessibility
  viewportFit: "cover", // iOS safe area
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PE" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${display.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
