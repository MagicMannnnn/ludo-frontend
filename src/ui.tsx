import React from "react";

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const { variant = "primary", style, ...rest } = props;
  const base: React.CSSProperties = {
    borderRadius: 12,
    padding: "10px 14px",
    border: "1px solid rgba(0,0,0,0.12)",
    cursor: rest.disabled ? "not-allowed" : "pointer",
    fontWeight: 600,
    fontSize: 14,
    lineHeight: 1,
    opacity: rest.disabled ? 0.6 : 1,
    transition: "transform .06s ease",
  };
  const v: React.CSSProperties =
    variant === "primary"
      ? { background: "#111", color: "#fff", borderColor: "#111" }
      : { background: "transparent", color: "#111" };

  return (
    <button
      {...rest}
      style={{
        ...base,
        ...v,
        ...style,
      }}
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
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.10)",
        borderRadius: 18,
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
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
        borderRadius: 12,
        padding: "10px 12px",
        border: "1px solid rgba(0,0,0,0.15)",
        outline: "none",
        fontSize: 14,
      }}
    />
  );
}

export function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" }) {
  const bg = tone === "good" ? "#ECFDF5" : tone === "warn" ? "#FFF7ED" : "#F3F4F6";
  const fg = tone === "good" ? "#065F46" : tone === "warn" ? "#9A3412" : "#111827";
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
        fontWeight: 600,
        fontSize: 12,
      }}
    >
      {children}
    </span>
  );
}
