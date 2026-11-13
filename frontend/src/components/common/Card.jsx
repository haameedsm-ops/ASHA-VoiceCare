import React from 'react';

export default function Card({ children, className = '', pale = false, onClick = null }) {
  const baseClasses = pale ? 'health-card-pale' : 'health-card';
  const clickableClasses = onClick ? 'cursor-pointer hover:border-health-blueAccent/50' : '';

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} p-4 sm:p-6 ${clickableClasses} ${className}`}
    >
      {children}
    </div>
  );
}
