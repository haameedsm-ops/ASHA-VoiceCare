import React from "react";

/**
 * Props:
 *   variant: "primary" | "secondary" | "danger"
 *   onClick: function
 *   disabled: boolean
 *   children: ReactNode
 *   className: additional Tailwind classes
 */
export default function HealthButton({
  variant = "primary",
  onClick,
  disabled = false,
  children,
  className = "",
  ...rest
}) {
  const variantClass = {
    secondary: "health-button-secondary",
    danger: "health-button-danger",
    primary: "health-button-primary",
  }[variant] || "health-button-primary";
  return (
    <button
      type="button"
      className={`${variantClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
