import "./globals.css";

export const metadata = {
  title: "Constancia — Trabajos documentados",
  description: "Generá constancias profesionales de servicio con fotos, firma, QR verificable e historial.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}</body></html>;
}
