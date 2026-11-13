import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md' }) {
  const variantStyles = {
    default: 'bg-health-cardPale text-health-blueAccent border-health-cardBorder',
    royal: 'bg-health-blueAccent text-white border-transparent',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs sm:text-sm px-2.5 py-1',
    lg: 'text-sm sm:text-base px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${
        variantStyles[variant] || variantStyles.default
      } ${sizeStyles[size] || sizeStyles.md}`}
    >
      {children}
    </span>
  );
}
