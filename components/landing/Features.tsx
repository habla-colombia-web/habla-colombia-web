import { Globe, Laptop, MessageCircle, MessagesSquare, Users } from "lucide-react";
import FeatureCard from "./FeatureCard";

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Español colombiano y latinoamericano",
    text: "Aprende cómo realmente se habla en la calle, en el trabajo y en la vida diaria.",
    tone: "bg-blue-100 text-brand",
  },
  {
    icon: Users,
    title: "Profesores nativos y certificados",
    text: "Docentes colombianos con experiencia y pasión por enseñar.",
    tone: "bg-violet-100 text-violet-700",
  },
  {
    icon: MessagesSquare,
    title: "Conversaciones reales",
    text: "Practica con situaciones de la vida real: viajes, trabajo, compras, amistades y más.",
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: Laptop,
    title: "100% online y flexible",
    text: "Estudia a tu ritmo, desde cualquier lugar del mundo.",
    tone: "bg-orange-100 text-orange-700",
  },
  {
    icon: Globe,
    title: "Comunidad internacional",
    text: "Conoce personas de todo el mundo que, como tú, quieren aprender español y vivir en Colombia.",
    tone: "bg-pink-100 text-pink-700",
  },
];

export default function Features() {
  return (
    <section aria-label="Beneficios" className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
    </section>
  );
}