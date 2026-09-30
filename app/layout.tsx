import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://constancia-nu.vercel.app"),
  applicationName: "Constancia",
  title: {
    default: "Constancia — Trabajos documentados",
    template: "%s | Constancia",
  },
  description: "Generá constancias profesionales de servicio con fotos, firma, QR verificable, cobros e historial.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: "Constancia",
    title: "Constancia — Hiciste el trabajo. Dejá constancia.",
    description: "Constancias profesionales con fotos, firma, QR verificable, cobros e historial.",
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
  return <html lang="es"><body>{children}</body></html>;
}
