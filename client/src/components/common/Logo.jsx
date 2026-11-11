import { Link } from "react-router-dom";

export function Logo({ className = "" }) {
  return (
    <Link
      to="/"
      className={`font-heading text-lg font-bold uppercase tracking-[0.22em] ${className}`}
      aria-label="Stride Athletics - Beranda"
    >
      Stride Athletics
    </Link>
  );
}
