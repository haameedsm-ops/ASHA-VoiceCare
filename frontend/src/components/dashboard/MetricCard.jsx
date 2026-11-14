import React from 'react';
import Card from '../common/Card';

export default function MetricCard({ title, value, subtext, icon: Icon, badgeText, badgeColor = 'blue', onClick }) {
  const colorMap = {
    blue: 'bg-health-lightMint text-health-deepGreen border-health-cardBorder',
    success: 'bg-health-successSoft text-health-success border-health-cardBorder',
    warning: 'bg-health-warningSoft text-health-warning border-health-cardBorder',
    danger: 'bg-health-dangerSoft text-health-danger border-health-cardBorder',
    neutral: 'bg-health-offWhite text-health-navyLight border-health-cardBorder',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <Card onClick={onClick} className="group flex min-h-36 flex-col justify-between hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold leading-5 text-health-navyLight sm:text-sm">{title}</span>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105 ${colorMap[badgeColor] || colorMap.blue}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-health-navy sm:text-3xl">{value}</span>
          {badgeText && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${colorMap[badgeColor]}`}>
              {badgeText}
            </span>
          )}
        </div>
        {subtext && <p className="mt-1 text-xs leading-5 text-slate-500">{subtext}</p>}
      </div>
    </Card>
  );
}
