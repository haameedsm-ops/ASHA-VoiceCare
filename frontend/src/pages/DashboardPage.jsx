import React from 'react';
import { Users, FileCheck2, CalendarClock, AlertTriangle, ShieldCheck, ArrowRight, Mic, Sparkles } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import MetricCard from '../components/dashboard/MetricCard';
import RecentVisitsCard from '../components/dashboard/RecentVisitsCard';
import ActiveAlertsCard from '../components/dashboard/ActiveAlertsCard';

export default function DashboardPage({ onNavigate, beneficiaries, visits, alerts }) {
  const totalBeneficiaries = beneficiaries?.length || 48;
  const completedVisits = visits?.length || 14;
  const upcomingFollowups = 7;
  const activeAlertsCount = alerts?.length || 2;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Welcome Hero / Status */}
      <div className="bg-gradient-to-r from-health-navy via-slate-900 to-health-navy text-white rounded-2xl p-6 sm:p-8 shadow-card-subtle relative overflow-hidden border border-health-cardBorder/30">
        <div className="relative z-10 max-w-xl">
          <Badge variant="royal" size="sm">Rampur Sub-Centre • Shift Active</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2 text-white tracking-tight">
            Namaste, Sunita Devi
          </h1>
          <p className="text-sm sm:text-base text-slate-200 mt-2">
            Your voice-powered field register is online. Record home visits naturally in Hindi or your local language with Gnani Prisma speech recognition.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('voice')}
              className="bg-health-blueAccent hover:bg-health-blueHover text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>Start Spoken Visit Note</span>
            </button>
            <button
              onClick={() => onNavigate('beneficiaries')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              <span>Manage Beneficiaries ({totalBeneficiaries})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Beneficiaries"
          value={totalBeneficiaries}
          subtext="+3 registered this month"
          icon={Users}
          badgeText="Active"
          badgeColor="blue"
          onClick={() => onNavigate('beneficiaries')}
        />
        <MetricCard
          title="Visits Completed"
          value={completedVisits}
          subtext="Verified digital records"
          icon={FileCheck2}
          badgeText="Verified"
          badgeColor="emerald"
          onClick={() => onNavigate('history')}
        />
        <MetricCard
          title="Upcoming Follow-ups"
          value={upcomingFollowups}
          subtext="3 due tomorrow"
          icon={CalendarClock}
          badgeText="Pending"
          badgeColor="amber"
          onClick={() => onNavigate('followups')}
        />
        <MetricCard
          title="Active Referral Flags"
          value={activeAlertsCount}
          subtext="Immediate PHC evaluation"
          icon={AlertTriangle}
          badgeText="Urgent"
          badgeColor="rose"
          onClick={() => onNavigate('followups')}
        />
      </div>

      {/* Main Two-Column Dashboard Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Visits Feed */}
        <RecentVisitsCard visits={visits} onNavigate={onNavigate} />

        {/* Active Danger-Sign Alerts Feed */}
        <ActiveAlertsCard alerts={alerts} onNavigate={onNavigate} />
      </div>

      {/* Public Health Clinical Safety Architecture Note */}
      <Card pale={true} className="border-health-cardBorder">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-health-blueAccent text-white flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-health-navy">Deterministic HBNC / IMNCI Safety Engine</h3>
                <Badge variant="royal" size="sm">Rule-Based</Badge>
              </div>
              <p className="text-xs text-health-navyLight mt-1 leading-relaxed">
                ASHA VoiceCare screens every spoken observation against strict MoHFW clinical guidelines. Danger signs such as low birth weight (&lt;2.0 kg), feeding refusal, hypothermia, and maternal pre-eclampsia trigger instant referral guidance with full traceability.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('followups')}
            className="health-button-secondary text-xs shrink-0 self-start sm:self-auto py-2 px-3"
          >
            <span>Review Guidelines & Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </Card>
    </div>
  );
}
