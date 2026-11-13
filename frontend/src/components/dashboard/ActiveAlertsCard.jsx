import React from 'react';
import { AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function ActiveAlertsCard({ alerts, onNavigate }) {
  return (
    <Card className="space-y-4 border-l-4 border-l-rose-500">
      <div className="flex items-center justify-between pb-2 border-b border-health-cardBorder">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <h2 className="font-bold text-base text-health-navy">Active PHC Referral Flags</h2>
        </div>
        <Badge variant="danger" size="sm">{alerts.length} Pending Actions</Badge>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-rose-900">{alert.beneficiaryName}</span>
                <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-rose-200 text-rose-700">
                  {alert.beneficiaryId}
                </span>
              </div>
              <span className="text-[10px] font-bold text-rose-700 uppercase bg-rose-100 px-2 py-0.5 rounded">
                {alert.severity}
              </span>
            </div>

            <p className="text-xs font-semibold text-rose-950">{alert.triggerReason}</p>
            <p className="text-[11px] text-rose-800 leading-relaxed bg-white/70 p-2 rounded border border-rose-200/60">
              <strong>PHC Referral Guidance:</strong> {alert.guidance}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-2 flex justify-end">
        <button
          onClick={() => onNavigate('followups')}
          className="text-xs font-semibold text-health-blueAccent hover:underline flex items-center gap-1"
        >
          <span>Open Follow-Up & Referral Tracker</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
}
