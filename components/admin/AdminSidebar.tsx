import Link from "next/link";
import {
  GraduationCap,
  Home,
  LayoutDashboard,
  Users,
  Video,
} from "lucide-react";

const ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/estudiantes", label: "Estudiantes", icon: Users },
  { href: "/admin/profesores", label: "Profesores", icon: GraduationCap },
  { href: "/admin/clases", label: "Clases", icon: Video },
];

export default function AdminSidebar({ active }: { active: string }) {
  return (
    <aside className="rounded-2xl bg-navy p-4 text-white lg:sticky lg:top-6 lg:self-start">
      <p className="px-3 pb-3 text-sm font-bold">Habla Colombia</p>
      <nav className="flex gap-1 overflow-x-auto lg:flex-col">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const on = href === active;
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? "page" : undefined}
              className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                on ? "bg-brand text-white" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}