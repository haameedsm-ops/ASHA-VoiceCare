import React from 'react';
import { CalendarClock, AlertTriangle, Syringe, CheckCircle2, CalendarDays, ShieldAlert } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

export default function FollowupPage({ alerts = [] }) {
  const followups = [
    {
      id: 'FUP-301',
      beneficiaryId: 'BEN-104',
      name: 'Baby of Sunita',
      dueDate: '2026-11-14',
      type: 'Weight Check & PHC Follow-up',
      status: 'pending',
      urgent: true,
      reason: 'Low Birth Weight (< 2.0 kg) evaluation',
    },
    {
      id: 'FUP-302',
      beneficiaryId: 'BEN-101',
      name: 'Meena Sharma',
      dueDate: '2026-11-20',
      type: 'ANC Checkup (36 Weeks)',
      status: 'pending',
      urgent: false,
      reason: 'Routine BP, weight and TT-2 verification',
    },
    {
      id: 'FUP-303',
      beneficiaryId: 'BEN-102',
      name: 'Baby of Meena',
      dueDate: '2026-12-15',
      type: 'Vaccination Follow-up',
      status: 'pending',
      urgent: false,
      reason: 'Pentavalent-1 & OPV-1 due at 6 weeks',
    },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex flex-col gap-4 border-b border-health-cardBorder pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-health-deepGreen">
            <CalendarClock className="h-4 w-4" />
            Continuing care
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-health-navy sm:text-3xl">Follow-ups & Safety Alerts</h1>
          <p className="mt-1.5 text-sm text-health-navyLight">
            Review upcoming care reminders and safety items available in this demonstration session.
          </p>
        </div>
        <Badge variant="neutral">Demonstration schedule</Badge>
      </div>

      <section className="space-y-4" aria-labelledby="safety-alerts-heading">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 id="safety-alerts-heading" className="font-semibold text-health-navy">Safety alerts</h2>
              <p className="mt-0.5 text-xs text-health-navyLight">Confirm clinical decisions with a qualified health professional.</p>
            </div>
          </div>
          <Badge variant={alerts.length ? 'danger' : 'success'} size="sm">{alerts.length} open</Badge>
        </div>
        {alerts.length === 0 ? (
          <Card className="border-dashed py-7 text-center">
            <p className="text-sm font-semibold text-health-navy">No safety alerts in this session</p>
            <p className="mt-1 text-xs text-health-navyLight">New items will appear here when available.</p>
          </Card>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {alerts.map((alert) => {
              const immediate = alert.severity === 'IMMEDIATE_PHC_REFERRAL';
              return (
                <article
                  key={alert.id}
                  className={`space-y-3 rounded-xl border bg-white p-4 shadow-card-subtle ${
                    immediate ? 'border-l-4 border-l-rose-600 border-rose-200' : 'border-l-4 border-l-amber-500 border-amber-200'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-health-navy">{alert.beneficiaryName}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-health-navyLight">{alert.beneficiaryId}</p>
                    </div>
                    <Badge variant={immediate ? 'danger' : 'warning'} size="sm">
                      {immediate ? 'Immediate referral' : 'Follow-up'}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium leading-5 text-health-charcoal">{alert.triggerReason}</p>
                  <div className={`rounded-lg p-3 text-xs leading-5 ${immediate ? 'bg-rose-50 text-rose-900' : 'bg-amber-50 text-amber-950'}`}>
                    <strong>Suggested next step:</strong> {alert.guidance}
                  </div>
                  <p className="text-[10px] text-health-navyLight">Rule reference: {alert.ruleId}</p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4" aria-labelledby="followups-heading">
        <div className="flex items-center justify-between gap-3 border-t border-health-cardBorder pt-5">
          <div>
            <h2 id="followups-heading" className="font-semibold text-health-navy">Follow-up schedule</h2>
            <p className="mt-0.5 text-xs text-health-navyLight">Upcoming visits and vaccination reminders</p>
          </div>
          <Badge variant="default">{followups.filter((item) => item.status === 'pending').length} pending</Badge>
        </div>
        <div className="grid gap-3">
          {followups.map((fup) => {
            const due = new Date(`${fup.dueDate}T00:00:00`);
            const dueState =
              fup.status !== 'pending'
                ? 'completed'
                : due < today
                ? 'overdue'
                : due.getTime() === today.getTime()
                ? 'today'
                : 'upcoming';
            const dueVariant = {
              overdue: 'danger',
              today: 'warning',
              completed: 'success',
              upcoming: 'default',
            }[dueState];
            const dueLabel = {
              overdue: 'Overdue',
              today: 'Due today',
              completed: 'Completed',
              upcoming: 'Upcoming',
            }[dueState];
            return (
              <Card key={fup.id} className={`space-y-4 border-l-4 ${fup.urgent ? 'border-l-rose-600' : 'border-l-health-deepGreen'}`}>
            <div className="flex flex-col justify-between gap-3 border-b border-health-cardBorder pb-3 sm:flex-row sm:items-start">
              <div className="flex min-w-0 items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${fup.urgent ? 'bg-rose-50 text-rose-700' : 'bg-health-lightMint text-health-deepGreen'}`}>
                  <Syringe className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base text-health-navy">{fup.name}</span>
                    <Badge variant="default" size="sm">{fup.beneficiaryId}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-health-navyLight">{fup.type}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Badge variant={dueVariant} size="sm">{dueLabel}</Badge>
                <span className="flex items-center gap-1.5 rounded-lg border border-health-cardBorder bg-health-offWhite px-2.5 py-1.5 text-xs font-semibold text-health-navy">
                  <CalendarDays className="h-3.5 w-3.5 text-health-deepGreen" />
                  {fup.dueDate}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className={`rounded-lg p-3 ${fup.urgent ? 'bg-rose-50' : 'bg-health-lightMint/50'}`}>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-health-navyLight">Reason</span>
                <p className="mt-1 text-xs leading-5 text-health-charcoal">{fup.reason}</p>
              </div>
            </div>

            {fup.urgent && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-5 text-rose-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Priority follow-up. Please confirm the care plan with a qualified health professional.</span>
              </div>
            )}

            <div className="flex justify-end border-t border-health-cardBorder pt-3">
              <button
                onClick={() => alert('Status update will be connected to PostgreSQL in Phase 5')}
                className="health-button-secondary py-2 text-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-health-deepGreen" />
                <span>Mark Completed</span>
              </button>
            </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
