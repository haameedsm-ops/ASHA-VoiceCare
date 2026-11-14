import React from 'react';
import { Users, FileCheck2, CalendarClock, AlertTriangle, ShieldCheck, ArrowRight, Mic, Activity } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import MetricCard from '../components/dashboard/MetricCard';
import RecentVisitsCard from '../components/dashboard/RecentVisitsCard';
import ActiveAlertsCard from '../components/dashboard/ActiveAlertsCard';

export default function DashboardPage({ onNavigate, beneficiaries, visits, alerts }) {
  const totalBeneficiaries = beneficiaries?.length ?? 0;
  const completedVisits = visits?.length ?? 0;
  const upcomingFollowups =
    alerts?.filter((alert) => alert.severity === 'VACCINATION_DUE').length ?? 0;
  const activeAlertsCount =
    alerts?.filter((alert) => alert.severity === 'IMMEDIATE_PHC_REFERRAL').length ?? 0;

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <section className="relative overflow-hidden rounded-xl border border-health-darkNavy bg-health-darkNavy p-6 text-white shadow-card-subtle sm:p-8">
        <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border-[32px] border-white/[0.04]" />
        <div className="absolute -bottom-28 right-24 h-52 w-52 rounded-full border-[24px] border-health-lightMint/[0.08]" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="royal" size="sm">Demonstration workspace</Badge>
            <span className="text-xs text-white/70">Rampur Sub-Centre</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Your field register, at a glance
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-200 sm:text-base">
            Review the records available in this demo session, capture a household visit,
            and keep track of follow-ups and safety alerts.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('voice')}
              className="inline-flex items-center gap-2 rounded-lg bg-health-deepGreen px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-health-lightMint hover:text-health-darkNavy active:scale-[0.98]"
            >
              <Mic className="h-4 w-4" />
              <span>Start Spoken Visit Note</span>
            </button>
            <button
              onClick={() => onNavigate('beneficiaries')}
              className="rounded-lg border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <span>Manage Beneficiaries ({totalBeneficiaries})</span>
            </button>
          </div>
        </div>
      </section>

      <section aria-label="Session overview" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          title="Total Beneficiaries"
          value={totalBeneficiaries}
          subtext="Current session records"
          icon={Users}
          badgeText="Session"
          badgeColor="blue"
          onClick={() => onNavigate('beneficiaries')}
        />
        <MetricCard
          title="Visits Completed"
          value={completedVisits}
          subtext="Current session records"
          icon={FileCheck2}
          badgeText="Session"
          badgeColor="neutral"
          onClick={() => onNavigate('history')}
        />
        <MetricCard
          title="Upcoming Follow-ups"
          value={upcomingFollowups}
          subtext="From current vaccination alerts"
          icon={CalendarClock}
          badgeText="Pending"
          badgeColor="amber"
          onClick={() => onNavigate('followups')}
        />
        <MetricCard
          title="Immediate Referral Flags"
          value={activeAlertsCount}
          subtext="From current safety alerts"
          icon={AlertTriangle}
          badgeText="Urgent"
          badgeColor="rose"
          onClick={() => onNavigate('followups')}
        />
      </section>

      <section aria-label="Recent activity and safety alerts" className="grid gap-4 lg:grid-cols-2">
        <RecentVisitsCard visits={visits} onNavigate={onNavigate} />
        <ActiveAlertsCard alerts={alerts} onNavigate={onNavigate} />
      </section>

      <Card pale={true}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-health-deepGreen text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-health-navy">Safety review</h3>
                <Badge variant="default" size="sm"><Activity className="h-3 w-3" /> Rule-based</Badge>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-health-navyLight">
                Review flagged observations against approved clinical guidance and referral protocols. Safety decisions should be confirmed by a qualified health professional.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('followups')}
            className="health-button-secondary shrink-0 self-start py-2 text-xs sm:self-auto"
          >
            <span>Review Guidelines & Alerts</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </Card>
    </div>
  );
}
