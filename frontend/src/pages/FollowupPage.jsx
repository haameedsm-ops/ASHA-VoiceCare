import React from 'react';
import { CalendarClock, AlertTriangle, Syringe, CheckCircle2 } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

export default function FollowupPage() {
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

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-health-navy tracking-tight">Follow-Up & Vaccination Schedule</h1>
          <p className="text-xs sm:text-sm text-health-navyLight">
            Upcoming village visits, pending immunisation deadlines, and active referral tracking.
          </p>
        </div>
        <Badge variant="warning">3 Pending Follow-ups</Badge>
      </div>

      <div className="grid gap-4">
        {followups.map((fup) => (
          <Card key={fup.id} className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-health-cardBorder pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-health-navy">{fup.name}</span>
                <Badge variant="default" size="sm">{fup.beneficiaryId}</Badge>
                {fup.urgent && (
                  <Badge variant="danger" size="sm">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>Urgent PHC Review</span>
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-health-blueAccent bg-health-cardPale px-2.5 py-1 rounded-md border border-health-cardBorder">
                  Due: {fup.dueDate}
                </span>
              </div>
            </div>

            <div className="text-xs text-health-navyLight space-y-1">
              <p><strong className="text-health-navy">Type:</strong> {fup.type}</p>
              <p><strong className="text-health-navy">Instruction:</strong> {fup.reason}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => alert('Status update will be connected to PostgreSQL in Phase 5')}
                className="health-button-secondary text-xs py-1.5 px-3"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark Completed</span>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
