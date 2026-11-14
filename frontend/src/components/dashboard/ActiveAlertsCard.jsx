import React from 'react';
import { AlertTriangle, ShieldAlert, ArrowRight, CircleAlert } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function ActiveAlertsCard({ alerts, onNavigate }) {
  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between gap-3 border-b border-health-cardBorder pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-health-navy">Current Safety Alerts</h2>
            <p className="mt-0.5 text-xs text-health-navyLight">Review referral and care reminders</p>
          </div>
        </div>
        <Badge variant={alerts.length ? 'danger' : 'success'} size="sm">{alerts.length} Open</Badge>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-health-cardBorder bg-health-offWhite px-4 py-8 text-center">
          <ShieldAlert className="mx-auto h-6 w-6 text-health-navyLight/60" />
          <p className="mt-2 text-sm font-semibold text-health-navy">No current alerts</p>
          <p className="mt-1 text-xs text-health-navyLight">New safety items will be listed here.</p>
        </div>
      ) : <div className="space-y-3">
        {alerts.map((alert) => {
          const immediate = alert.severity === 'IMMEDIATE_PHC_REFERRAL';
          return (
            <article
              key={alert.id}
              className={`space-y-3 rounded-lg border p-4 ${
                immediate
                  ? 'border-rose-200 bg-rose-50/70'
                  : 'border-amber-200 bg-amber-50/60'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <CircleAlert className={`mt-0.5 h-4 w-4 shrink-0 ${immediate ? 'text-rose-700' : 'text-amber-700'}`} />
                  <div>
                    <p className="font-semibold text-sm text-health-navy">{alert.beneficiaryName}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-health-navyLight">{alert.beneficiaryId}</p>
                  </div>
                </div>
                <Badge variant={immediate ? 'danger' : 'warning'} size="sm">
                  {immediate ? 'Immediate referral' : 'Follow-up'}
                </Badge>
              </div>

              <p className="text-sm font-medium leading-5 text-health-charcoal">{alert.triggerReason}</p>
              <div className="rounded-md border border-white/80 bg-white/80 p-3 text-xs leading-5 text-health-navyLight">
                <strong className="text-health-navy">Recommended next step:</strong> {alert.guidance}
              </div>
            </article>
          );
        })}
      </div>}

      <div className="flex justify-end border-t border-health-cardBorder pt-3">
        <button
          onClick={() => onNavigate('followups')}
          className="flex items-center gap-1 text-xs font-semibold text-health-deepGreen hover:underline"
        >
          <span>Open Follow-Up & Referral Tracker</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
}
