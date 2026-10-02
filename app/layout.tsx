import type { Metadata, Viewport } from "next";
import "./globals.css";
import {SupportWidget} from "@/components/SupportWidget";

export const metadata: Metadata = {
  metadataBase: new URL("https://constancia-nu.vercel.app"),
  applicationName: "Constancia",
  title: {
    default: "Constancia — Gestión de servicios de punta a punta",
    template: "%s | Constancia",
  },
  description: "Gestioná clientes, equipos, presupuestos, órdenes, técnicos, evidencia, constancias, cobros y próximos services en un solo sistema.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: "Constancia",
    title: "Constancia — Trabajá, documentá, cobrá y volvé a vender.",
    description: "Clientes, activos, presupuestos, órdenes, técnicos, evidencia, constancias, cobros, contratos y próximos services en un solo sistema.",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/brand/constancia-icon.svg", type: "image/svg+xml" }],
    shortcut: "/brand/constancia-icon.svg",
    apple: "/brand/constancia-app-icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "Constancia",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f5ef",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}<SupportWidget/></body></html>;
}
