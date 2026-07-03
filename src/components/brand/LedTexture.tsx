export function LedTexture({ className = "", color = "var(--korum-cyan)" }: { className?: string; color?: string }) {
  return (
    <div
      className={className}
      style={{
        backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1.5px)`,
        backgroundSize: "6px 6px",
        backgroundPosition: "0 0",
      }}
      aria-hidden
    />
  );
}