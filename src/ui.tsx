import React from "react";

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }
) {
  const { variant = "primary", style, ...rest } = props;

  const base: React.CSSProperties = {
    borderRadius: 14,
    padding: "11px 14px",
    border: "1px solid var(--border)",
    cursor: rest.disabled ? "not-allowed" : "pointer",
    fontWeight: 850,
    fontSize: 14,
    lineHeight: 1,
    opacity: rest.disabled ? 0.55 : 1,
    transition: "transform .08s ease, background .15s ease, border-color .15s ease",
    userSelect: "none",
    whiteSpace: "nowrap",
  };

  const v: React.CSSProperties =
    variant === "primary"
      ? { background: "rgba(255,255,255,0.10)", color: "var(--text)" }
      : { background: "transparent", color: "var(--text)" };

  return (
    <button
      {...rest}
      style={{ ...base, ...v, ...style }}
      onMouseDown={(e) => {
        if (!rest.disabled) (e.currentTarget.style.transform = "scale(0.98)");
        props.onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        props.onMouseUp?.(e);
      }}
    />
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        boxShadow: "var(--shadow2)",
        backdropFilter: "blur(10px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        borderRadius: 14,
        padding: "11px 12px",
        border: "1px solid var(--border)",
        outline: "none",
        fontSize: 14,
        background: "rgba(255,255,255,0.06)",
        color: "var(--text)",
      }}
    />
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn";
}) {
  const bg =
    tone === "good"
      ? "rgba(34,197,94,0.16)"
      : tone === "warn"
      ? "rgba(245,158,11,0.16)"
      : "rgba(255,255,255,0.08)";

  const fg =
    tone === "good"
      ? "rgba(34,197,94,0.95)"
      : tone === "warn"
      ? "rgba(245,158,11,0.95)"
      : "var(--text)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        background: bg,
        color: fg,
        fontWeight: 850,
        fontSize: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
