type PortalSlotMeterProps = {
  total: number;
  used: number;
  gifts: number;
  remaining: number;
  compact?: boolean;
};

/**
 * Visualizes the shared readable-license pool: each purchased title grants a
 * fixed number of slots, spent across PDF/EPUB downloads and gifts.
 */
export default function PortalSlotMeter({ total, used, gifts, remaining, compact = false }: PortalSlotMeterProps) {
  const safeTotal = Math.max(total, 0);
  const usePips = safeTotal > 0 && safeTotal <= 9;

  const pips = [] as ("used" | "gift" | "open")[];
  if (usePips) {
    for (let i = 0; i < used && pips.length < safeTotal; i += 1) pips.push("used");
    for (let i = 0; i < gifts && pips.length < safeTotal; i += 1) pips.push("gift");
    while (pips.length < safeTotal) pips.push("open");
  }

  const pct = safeTotal > 0 ? Math.min(100, Math.round(((used + gifts) / safeTotal) * 100)) : 0;

  return (
    <div>
      {usePips ? (
        <div className="flex flex-wrap gap-1.5" role="img" aria-label={`${remaining} of ${safeTotal} slots remaining`}>
          {pips.map((kind, i) => (
            <span
              key={i}
              className={`h-2.5 flex-1 rounded-full ${
                kind === "used" ? "bg-coral" : kind === "gift" ? "bg-teal" : "bg-tan/60"
              }`}
              style={{ minWidth: compact ? 18 : 28 }}
            />
          ))}
        </div>
      ) : (
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-tan/60" role="img" aria-label={`${remaining} slots remaining`}>
          <div className="h-full rounded-full bg-coral" style={{ width: `${pct}%` }} />
        </div>
      )}

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-ink/70">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-coral" /> {used} read
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-teal" /> {gifts} gifted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-tan/60" /> {Math.max(remaining, 0)} open
          </span>
        </div>
      )}
    </div>
  );
}
