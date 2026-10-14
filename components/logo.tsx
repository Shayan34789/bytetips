// ByteTips logo — a terminal prompt (>) with a sky dot, echoing the
// wordmark's trailing dot. Clean and minimal, like the rest of the site.
export default function Logo({
  size = 26,
  withWordmark = true,
}: {
  size?: number;
  withWordmark?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        role="img"
        aria-label="ByteTips logo"
      >
        <rect width="32" height="32" rx="7" fill="#0f172a" />
        <polyline
          points="10,10 18,16 10,22"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="23.5" cy="22" r="2.6" fill="#0284c7" />
      </svg>
      {withWordmark && (
        <span className="text-[19px] font-bold tracking-tight text-ink">
          ByteTips<span className="text-accent">.</span>
        </span>
      )}
    </span>
  );
}
