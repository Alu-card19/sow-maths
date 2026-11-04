/**
 * A thread of golden beads. One bead per question in the class deck;
 * a bead turns gold once its question has been called.
 */
export function BeadRail({ total, done }: { total: number; done: number }) {
  if (total === 0) return null;
  const size = total > 40 ? "size-3.5" : total > 24 ? "size-5" : "size-6";
  return (
    <div
      className="relative flex items-center justify-center"
      role="img"
      aria-label={`${Math.min(done, total)} of ${total} questions called`}
    >
      <div className="absolute inset-x-0 top-1/2 h-px bg-white/20" aria-hidden />
      <div className="relative flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`${size} rounded-full ${i < done ? "bead" : "bead-empty"}`}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
