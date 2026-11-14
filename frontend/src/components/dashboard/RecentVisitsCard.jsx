import React from 'react';
import { CalendarDays, ChevronRight, AlertTriangle, FileCheck2 } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function RecentVisitsCard({ visits, onNavigate }) {
  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between gap-3 border-b border-health-cardBorder pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-health-lightMint text-health-deepGreen">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-health-navy">Recent Field Visits</h2>
            <p className="mt-0.5 text-xs text-health-navyLight">Latest entries in the session register</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('history')}
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-health-deepGreen hover:underline"
        >
          <span>View All Register</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {visits.length === 0 ? (
        <div className="rounded-lg border border-dashed border-health-cardBorder bg-health-offWhite px-4 py-8 text-center">
          <FileCheck2 className="mx-auto h-6 w-6 text-health-navyLight/60" />
          <p className="mt-2 text-sm font-semibold text-health-navy">No visits in this session</p>
          <p className="mt-1 text-xs text-health-navyLight">Confirmed register entries will appear here.</p>
        </div>
      ) : <div className="space-y-3">
        {visits.slice(0, 4).map((v) => (
          <button
            key={v.visitId}
            onClick={() => onNavigate('history')}
            className="flex w-full cursor-pointer flex-col justify-between gap-3 rounded-lg border border-health-cardBorder bg-white p-3 text-left transition hover:border-health-deepGreen/35 hover:bg-health-offWhite sm:flex-row sm:items-center"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm text-health-navy">{v.name}</span>
                <Badge variant="default" size="sm">{v.beneficiaryId}</Badge>
                {v.hasAlert && (
                  <Badge variant="danger" size="sm">
                    <AlertTriangle className="h-3 w-3 text-rose-600" />
                    <span>Danger Sign</span>
                  </Badge>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>{v.visitType}</span>
                <span>Weight: <strong>{v.weight}</strong></span>
                <span>Next: <strong className="text-health-deepGreen">{v.nextVisitDate}</strong></span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start text-xs text-slate-500 sm:self-auto">
              <CalendarDays className="h-3.5 w-3.5 text-health-deepGreen" />
              <span>{v.confirmedAt?.split(' ')[0] || v.date}</span>
            </div>
          </button>
        ))}
      </div>}
    </Card>
  );
}
