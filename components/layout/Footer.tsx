import Link from "next/link";
import Logo from "./Logo";
import { getContent } from "@/lib/content";

function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function safeUrl(v: string): string | null {
  const t = v.trim();
  return /^https?:\/\//i.test(t) ? t : null;
}

function whatsappUrl(v: string): string | null {
  const u = safeUrl(v);
  if (u) return u;
  const digits = v.replace(/\D/g, "");
  return digits.length >= 7 ? `https://wa.me/${digits}` : null;
}

type Col = { title: string; items: { label: string; href?: string }[] };

const COLUMNS: Col[] = [
  {
    title: "Habla Colombia",
    items: [
      { label: "Inicio", href: "/#inicio" },
      { label: "Cursos", href: "/#cursos" },
      { label: "Turismo", href: "/#turismo" },
      { label: "Profesores", href: "/profesores" },
      { label: "Precios", href: "/precios" },
      { label: "Sobre nosotros", href: "/sobre-nosotros" },
    ],
  },
  {
    title: "Cursos",
    items: [
      { label: "Español desde cero", href: "/#cursos" },
      { label: "Español para viajeros", href: "/#cursos" },
      { label: "Español para la vida social", href: "/#cursos" },
      { label: "Español para vivir en Colombia", href: "/#cursos" },
      { label: "Español para trabajar", href: "/#cursos" },
    ],
  },
  {
    title: "Por qué elegirnos",
    items: [
      { label: "Profesores nativos y certificados" },
      { label: "Clases 100% online y flexibles" },
      { label: "Conversaciones reales" },
      { label: "Comunidad internacional" },
    ],
  },
  {
    title: "Destinos",
    items: [
      { label: "Eje Cafetero", href: "/#turismo" },
      { label: "Medellín", href: "/#turismo" },
      { label: "Costa Pacífica", href: "/#turismo" },
      { label: "Bogotá", href: "/#turismo" },
      { label: "Cartagena", href: "/#turismo" },
    ],
  },
];

export default async function Footer() {
  const content = await getContent();

  const socials = [
    {
      label: "Facebook",
      href: safeUrl(content.social_facebook),
      icon: (
        <Svg>
          <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
        </Svg>
      ),
    },
    {
      label: "Instagram",
      href: safeUrl(content.social_instagram),
      icon: (
        <Svg>
          <path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
          <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
          <path d="M16.5 7.5v.01" />
        </Svg>
      ),
    },
    {
      label: "X",
      href: safeUrl(content.social_x),
      icon: (
        <Svg>
          <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
          <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
        </Svg>
      ),
    },
    {
      label: "WhatsApp",
      href: whatsappUrl(content.social_whatsapp),
      icon: (
        <Svg>
          <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
          <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
        </Svg>
      ),
    },
  ];

  const circle =
    "flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy";

  return (
    <footer className="bg-navy text-white/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 text-center sm:px-6 lg:text-left">
        <div className="order-1 flex justify-center lg:justify-start">
          <Logo />
        </div>

        <div className="order-2 flex flex-col items-center gap-4 lg:order-3 lg:flex-row lg:justify-between">
          <div className="flex items-center gap-3">
            {socials.map((s) =>
              s.href ? (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={`${circle} hover:brightness-90`}
                >
                  {s.icon}
                </a>
              ) : (
                <span
                  key={s.label}
                  title="Próximamente"
                  aria-label={`${s.label} (próximamente)`}
                  className={`${circle} cursor-not-allowed opacity-60`}
                >
                  {s.icon}
                </span>
              ),
            )}
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy">
            <span
              aria-hidden="true"
              className="flex h-4 w-6 flex-col overflow-hidden rounded-sm"
            >
              <i className="h-1/2 bg-[#ffd100]" />
              <i className="h-1/4 bg-[#003893]" />
              <i className="h-1/4 bg-[#ce1126]" />
            </span>
            Es
          </span>
        </div>

        <div className="order-3 grid gap-8 sm:grid-cols-2 lg:order-2 lg:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-base font-bold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {col.items.map((item) => (
                  <li key={item.label}>
                    {item.href ? (
                      <Link href={item.href} className="hover:text-white">
                        {item.label}
                      </Link>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="order-4 border-t border-white/15 pt-6 text-sm">
          &copy; {new Date().getFullYear()} Habla Colombia. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}