type WordmarkProps = { size?: number };

export function Wordmark({ size = 18 }: WordmarkProps) {
  return (
    <span
      className="display inline-flex items-baseline"
      style={{
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.01em",
        gap: "0.4em",
      }}
    >
      <span>BASTA</span>
      <span style={{ fontWeight: 400 }}>FABRIC</span>
    </span>
  );
}
