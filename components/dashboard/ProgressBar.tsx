export default function ProgressBar({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      {label && (
        <div className="mb-1 flex justify-between text-xs font-medium text-muted">
          <span>{label}</span>
          <span>{v}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progreso"}
        className="h-2 w-full overflow-hidden rounded-full bg-black/10"
      >
        <div
          className="h-full rounded-full bg-gold"
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}