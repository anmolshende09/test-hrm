import React from "react";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-primary text-white hover:bg-primary-focus disabled:bg-ink-muted48/40",
  secondary: "bg-transparent text-primary border border-primary hover:bg-primary/5",
  dark: "bg-ink text-white rounded-sm hover:bg-black",
  ghost: "bg-transparent text-ink hover:bg-black/5",
  danger: "bg-danger text-white hover:bg-danger/90",
};

const SIZES = {
  sm: "text-caption h-9 px-4 min-w-fit whitespace-nowrap",
  md: "text-body h-11 px-6 min-w-fit whitespace-nowrap",
  lg: "text-button-large h-12 px-8 min-w-fit whitespace-nowrap",
};

/**
 * Button — implements component.button-primary / button-secondary-pill /
 * button-dark-utility from the design system. Full-pill radius is reserved
 * for actionable primary/secondary buttons; `dark` variant uses rounded-sm
 * per the source spec (nav/utility actions).
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
  type = "button",
  ...props
}) {
  const isPill = variant !== "dark";
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`press-active inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap font-medium
        ${isPill ? "rounded-pill" : ""}
        ${VARIANTS[variant]} ${SIZES[size]}
        transition-colors duration-150
        disabled:cursor-not-allowed disabled:opacity-60
        ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
}
