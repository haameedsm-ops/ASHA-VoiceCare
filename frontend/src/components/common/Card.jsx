import React from 'react';

export default function Card({ children, className = '', pale = false, onClick = null }) {
  const baseClasses = pale
    ? 'health-card-pale text-health-charcoal'
    : 'health-card text-health-charcoal';
  const clickableClasses = onClick
    ? 'cursor-pointer hover:-translate-y-0.5 hover:border-health-deepGreen/35 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-health-deepGreen'
    : '';
  const handleKeyDown = (event) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(event);
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`${baseClasses} p-4 sm:p-5 ${clickableClasses} ${className}`}
    >
      {children}
    </div>
  );
}
