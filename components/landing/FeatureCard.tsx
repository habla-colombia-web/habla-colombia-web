import type { LucideIcon } from "lucide-react";
import { bgImage } from "@/lib/progress";

type Props = {
  icon: LucideIcon;
  title: string;
  text: string;
  tone: string;
  image?: string;
};

export default function FeatureCard({ icon: Icon, title, text, tone, image }: Props) {
  const bg = bgImage(image);
  return (
    <div>
      {bg ? (
        <div
          aria-hidden="true"
          className="h-36 w-full rounded-xl bg-cover bg-center ring-1 ring-black/5"
          style={{ backgroundImage: bg }}
        />
      ) : (
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}
        >
          <Icon size={22} aria-hidden="true" />
        </div>
      )}
      <h3 className="mt-4 text-base font-bold text-navy">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
    </div>
  );
}