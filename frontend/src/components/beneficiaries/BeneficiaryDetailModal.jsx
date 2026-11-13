import React from 'react';
import { X, Calendar, Weight, Syringe, AlertTriangle, Mic, ShieldAlert, FileText } from 'lucide-react';
import Badge from '../common/Badge';
import Card from '../common/Card';

export default function BeneficiaryDetailModal({ beneficiary, isOpen, onClose, onRecordVisit }) {
  if (!isOpen || !beneficiary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-health-navy/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-health-cardBorder max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-health-cardBorder">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-health-cardPale text-health-blueAccent font-bold text-lg flex items-center justify-center border border-health-cardBorder">
              {beneficiary.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-health-navy">{beneficiary.name}</h2>
                <Badge variant="default" size="sm">{beneficiary.id}</Badge>
              </div>
              <p className="text-xs text-health-navyLight mt-0.5">
                {beneficiary.categoryDetail} • {beneficiary.hamlet} • Age: {beneficiary.age === 0 ? 'Newborn (<1 mo)' : `${beneficiary.age} yrs`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="overflow-y-auto flex-1 py-4 space-y-5 pr-1">
          {/* Active Safety Alert Banner if any */}
          {beneficiary.recentAlert && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="font-bold text-xs uppercase tracking-wider text-rose-700">
                  Active Clinical Safety Flag ({beneficiary.recentAlert.ruleId})
                </span>
              </div>
              <p className="text-sm font-semibold">{beneficiary.recentAlert.title}</p>
              <p className="text-xs text-rose-700 leading-relaxed">{beneficiary.recentAlert.detail}</p>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <Card pale={true} className="p-3 text-center">
              <span className="text-[11px] text-slate-500 font-medium block">Latest Weight</span>
              <span className="text-base font-bold text-health-navy">{beneficiary.currentWeight} kg</span>
            </Card>
            <Card pale={true} className="p-3 text-center">
              <span className="text-[11px] text-slate-500 font-medium block">Last Visit</span>
              <span className="text-base font-bold text-health-navy">{beneficiary.lastVisitDate}</span>
            </Card>
            <Card pale={true} className="p-3 text-center">
              <span className="text-[11px] text-slate-500 font-medium block">Total Visits</span>
              <span className="text-base font-bold text-health-blueAccent">{beneficiary.visits?.length || 0}</span>
            </Card>
          </div>

          {/* Previous Visit History Timeline */}
          <div>
            <h3 className="text-xs font-bold text-health-navy uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-health-blueAccent" />
              <span>Past Field Visit Records</span>
            </h3>

            {beneficiary.visits && beneficiary.visits.length > 0 ? (
              <div className="space-y-3">
                {beneficiary.visits.map((v) => (
                  <div
                    key={v.visitId}
                    className="p-3.5 rounded-xl border border-health-cardBorder bg-white shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-health-navy">{v.type}</span>
                        <Badge variant="neutral" size="sm">{v.visitId}</Badge>
                      </div>
                      <span className="text-slate-500">{v.date}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2 rounded-lg">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Weight</span>
                        <span className="font-semibold text-health-navy">{v.weight}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Vaccines Due</span>
                        <span className="font-semibold text-health-navy truncate block">{v.vaccinationsDue}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Next Visit</span>
                        <span className="font-semibold text-health-blueAccent">{v.nextVisitDate}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 italic">"{v.notes}"</p>

                    {v.hasAlert && (
                      <div className="text-[11px] text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{v.alertText}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">No past visits recorded yet.</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-health-cardBorder">
          <button
            onClick={onClose}
            className="health-button-secondary text-xs py-2 px-4"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onRecordVisit(beneficiary);
            }}
            className="health-button-primary text-xs py-2 px-4"
          >
            <Mic className="w-4 h-4" />
            <span>Record New Spoken Visit</span>
          </button>
        </div>
      </div>
    </div>
  );
}
