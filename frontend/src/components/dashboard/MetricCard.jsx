import React from 'react';
import Card from '../common/Card';

export default function MetricCard({ title, value, subtext, icon: Icon, badgeText, badgeColor = 'blue', onClick }) {
  const colorMap = {
    blue: 'bg-health-cardPale text-health-blueAccent border-health-cardBorder',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <Card onClick={onClick} className="flex flex-col justify-between hover:shadow-card-hover group">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-semibold text-health-navyLight">{title}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105 ${colorMap[badgeColor] || colorMap.blue}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-health-navy tracking-tight">{value}</span>
          {badgeText && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${colorMap[badgeColor]}`}>
              {badgeText}
            </span>
          )}
        </div>
        {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
      </div>
    </Card>
  );
}
