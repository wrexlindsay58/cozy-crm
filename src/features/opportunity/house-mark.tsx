export function HouseMark({ className, color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <path
        d="M10 72V30L40 8l30 22v42H50V46H30v26H10Z"
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinejoin="miter"
      />
      <path
        d="M24 72V38l16-12 16 12v34H48V50H32v22H24Z"
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
