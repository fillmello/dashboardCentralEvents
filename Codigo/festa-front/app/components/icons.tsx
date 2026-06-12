type IconProps = { size?: number };
type ArrowProps = IconProps & { dir?: "right" | "left" | "up" | "down" };


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

export function IconSearch({ size = 16 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    >
      <circle cx="6.5" cy="6.5" r="4.5" />
      <line x1="10" y1="10" x2="14" y2="14" />
    </svg>
  );
}

export function IconEdit({ size = 14 }: IconProps) {
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
      <path d="M9.5 1.5 L12.5 4.5 L4.5 12.5 L1.5 12.5 L1.5 9.5 Z" />
      <line x1="7.5" y1="3.5" x2="10.5" y2="6.5" />
    </svg>
  );
}

export function IconTrash({ size = 14 }: IconProps) {
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
      <polyline points="4,3.5 4,2 10,2 10,3.5" />
      <line x1="1.5" y1="3.5" x2="12.5" y2="3.5" />
      <path d="M3 3.5 L3.5 12.5 L10.5 12.5 L11 3.5" />
      <line x1="5.5" y1="6" x2="5.5" y2="10.5" />
      <line x1="8.5" y1="6" x2="8.5" y2="10.5" />
    </svg>
  );
}

export function IconPlus({ size = 14 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <line x1="7" y1="1.5" x2="7" y2="12.5" />
      <line x1="1.5" y1="7" x2="12.5" y2="7" />
    </svg>
  );
}
