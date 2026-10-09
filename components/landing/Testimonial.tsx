import { User } from "lucide-react";

export default function Testimonial({
  quote,
  author,
}: {
  quote: string;
  author: string;
}) {
  return (
    <aside
      aria-label="Testimonio"
      className="flex flex-col justify-between rounded-2xl bg-navy p-6 text-white"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
        <User size={36} aria-hidden="true" />
      </div>
      <blockquote className="mt-6 text-lg italic leading-snug">{quote}</blockquote>
      <p className="mt-6 text-sm">
        <strong className="block">{author}</strong>
        <span className="text-white/70">Estudiante de Habla Colombia</span>
      </p>
    </aside>
  );
}