import React from 'react';
import { Calendar, ChevronRight, AlertTriangle, FileCheck2 } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function RecentVisitsCard({ visits, onNavigate }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-health-cardBorder">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-health-blueAccent" />
          <h2 className="font-bold text-base text-health-navy">Recent Field Visits</h2>
        </div>
        <button
          onClick={() => onNavigate('history')}
          className="text-xs font-semibold text-health-blueAccent hover:underline flex items-center gap-1"
        >
          <span>View All Register</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        {visits.slice(0, 4).map((v) => (
          <div
            key={v.visitId}
            onClick={() => onNavigate('history')}
            className="p-3 rounded-xl bg-slate-50/70 hover:bg-health-cardPale/50 border border-health-cardBorder/80 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-health-navy">{v.name}</span>
                <Badge variant="default" size="sm">{v.beneficiaryId}</Badge>
                {v.hasAlert && (
                  <Badge variant="danger" size="sm">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>Danger Sign</span>
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>{v.visitType}</span>
                <span>•</span>
                <span>Weight: <strong>{v.weight}</strong></span>
                <span>•</span>
                <span>Next: <strong className="text-health-blueAccent">{v.nextVisitDate}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{v.confirmedAt?.split(' ')[0] || v.date}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
