// HealthButton component – reusable styled button
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
  let variantClass = "";
  switch (variant) {
    case "secondary":
      variantClass = "health-button-secondary";
      break;
    case "danger":
      variantClass = "health-button-danger";
      break;
    case "primary":
    default:
      // Use new deepGreen palette for primary actions
      variantClass = "bg-health-deepGreen hover:bg-health-darkNavy text-white font-medium px-5 py-3 rounded-xl shadow-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2";
  }
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
