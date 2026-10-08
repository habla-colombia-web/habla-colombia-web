import Link from "next/link";

type NavItem = { label: string; href?: string };

const NAV: NavItem[] = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Cursos", href: "/#cursos" },
  { label: "Turismo", href: "/#turismo" },
  { label: "Mis reservas", href: "/mis-reservas" },
  { label: "Profesores" },
  { label: "Precios" },
  { label: "Sobre nosotros" },
];

export default function NavLinks({
  className = "",
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {NAV.map((item) =>
        item.href ? (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className={className}
          >
            {item.label}
          </Link>
        ) : (
          <span
            key={item.label}
            title="Próximamente"
            aria-disabled="true"
            className={`${className} cursor-not-allowed opacity-60`}
          >
            {item.label}
          </span>
        ),
      )}
    </>
  );
}