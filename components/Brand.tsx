import Link from "next/link";

export function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className={"brand brand-logo" + (inverted ? " brand-logo-inverted" : "")} aria-label="Constancia — Inicio">
      <img
        src={inverted ? "/brand/constancia-logo-on-dark.svg" : "/brand/constancia-logo.svg"}
        alt="Constancia"
        className="brand-image"
      />
    </Link>
  );
}
