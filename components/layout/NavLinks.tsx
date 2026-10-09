import Link from "next/link";

type NavItem = { label: string; href: string };

const NAV: NavItem[] = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Cursos", href: "/#cursos" },
  { label: "Turismo", href: "/#turismo" },
  { label: "Mis reservas", href: "/mis-reservas" },
  { label: "Profesores", href: "/profesores" },
  { label: "Precios", href: "/precios" },
  { label: "Sobre nosotros", href: "/sobre-nosotros" },
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
      {NAV.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          onClick={onNavigate}
          className={className}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}