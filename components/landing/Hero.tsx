import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative isolate overflow-hidden bg-linear-to-br from-navy via-[#12356b] to-[#1d6a8a] text-white"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 1000 300"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 -z-10 h-2/3 w-full"
      >
        <path
          d="M0 300V150l110-60 120 70 140-90 150 80 140-70 140 60 200-50v210z"
          fill="#2c5c58"
          opacity=".7"
        />
        <path
          d="M0 300V210l150-30 170 40 200-30 200 40 280-30v100z"
          fill="#1d6a47"
        />
        <path
          d="M0 300V250l200-20 250 25 250-20 300 15v50z"
          fill="#0f4d33"
        />
      </svg>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
          Aprende español colombiano
        </p>
        <h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          Habla español, vive la experiencia{" "}
          <span className="text-gold">de Colombia</span>
        </h1>
        <p className="mt-5 max-w-lg text-base text-white/90 sm:text-lg">
          Aprende español de forma práctica, natural y divertida. Con profesores
          nativos, situaciones reales y una comunidad internacional que, como
          tú, quiere vivir nuevas experiencias.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/registro"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-semibold text-navy hover:brightness-95"
          >
            Comienza ahora
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <button
            type="button"
            disabled
            title="Próximamente"
            className="inline-flex items-center gap-3 rounded-full py-2 pr-4 font-medium text-white/80 disabled:cursor-not-allowed"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70">
              <Play size={14} aria-hidden="true" />
            </span>
            Ver video
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 right-8 hidden max-w-xs text-right text-xl italic leading-snug text-white/95 xl:block">
        No solo aprendes un idioma, conectas con una cultura
        <span
          aria-hidden="true"
          className="ml-auto mt-2 flex h-6 w-10 flex-col overflow-hidden rounded-sm"
        >
          <i className="h-1/2 bg-[#ffd100]" />
          <i className="h-1/4 bg-[#003893]" />
          <i className="h-1/4 bg-[#ce1126]" />
        </span>
      </div>
    </section>
  );
}