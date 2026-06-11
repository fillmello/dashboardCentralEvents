type IconProps = { size?: number };
type ArrowProps = IconProps & { dir?: "right" | "left" | "up" | "down" };

export function IconCart({ size = 16 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <path d="M2 3h2l1.5 8.5h7L14 5H5" />
      <circle cx="6" cy="14" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconClose({ size = 14 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <line x1="2" y1="2" x2="12" y2="12" />
      <line x1="12" y1="2" x2="2" y2="12" />
    </svg>
  );
}

export function IconArrow({ size = 14, dir = "right" }: ArrowProps) {
  const rot = { right: 0, left: 180, up: -90, down: 90 }[dir];
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <line x1="1" y1="7" x2="13" y2="7" />
      <polyline points="8,2 13,7 8,12" />
    </svg>
  );
}
