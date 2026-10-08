import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="Habla Colombia, ir al inicio"
      className="flex items-center gap-2"
    >
      <svg
        viewBox="0 0 40 34"
        width="38"
        height="32"
        fill="none"
        stroke="#ffc928"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M2 30 14 6l8 14 5-8 11 18" />
        <path d="M2 30c6-6 10-6 14-2s10 4 22 0" />
      </svg>
      <span className="flex flex-col leading-tight">
        <span className="text-lg font-bold tracking-tight text-white">
          Habla Colombia
        </span>
        <span className="text-[11px] text-white/80">Español real, vida real.</span>
      </span>
    </Link>
  );
}