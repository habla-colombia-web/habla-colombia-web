import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  text: string;
  tone: string;
};

export default function FeatureCard({ icon: Icon, title, text, tone }: Props) {
  return (
    <div>
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}
      >
        <Icon size={22} aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-bold text-navy">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
    </div>
  );
}