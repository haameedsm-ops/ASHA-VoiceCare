import React, { useState } from 'react';
import { History, Calendar, CheckCircle, AlertTriangle, Search, Filter } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

export default function HistoryPage({ onNavigate }) {
  const [filterId, setFilterId] = useState('');

  const historyRecords = [
    {
      visitId: 'VIS-901',
      beneficiaryId: 'BEN-102',
      name: 'Baby of Meena',
      visitType: 'Newborn Home Visit',
      weight: '2.80 kg',
      vaccinationsDue: 'BCG, OPV-0',
      nextVisitDate: '2026-12-15',
      confirmedAt: '2026-11-12 10:45 AM',
      hasAlert: false,
    },
    {
      visitId: 'VIS-902',
      beneficiaryId: 'BEN-104',
      name: 'Baby of Sunita',
      visitType: 'Newborn Home Visit (Day 3)',
      weight: '1.95 kg',
      vaccinationsDue: 'Hepatitis B-0',
      nextVisitDate: '2026-11-14',
      confirmedAt: '2026-11-11 02:15 PM',
      hasAlert: true,
      alertText: 'Low Birth Weight (< 2.0 kg) - Immediate PHC Referral Flagged',
    },
    {
      visitId: 'VIS-903',
      beneficiaryId: 'BEN-101',
      name: 'Meena Sharma',
      visitType: 'ANC Visit (3rd Trimester)',
      weight: '54.5 kg',
      vaccinationsDue: 'TT-2 Booster',
      nextVisitDate: '2026-11-20',
      confirmedAt: '2026-11-04 11:30 AM',
      hasAlert: false,
    },
  ];

  const filtered = historyRecords.filter(
    (r) =>
      r.beneficiaryId.toLowerCase().includes(filterId.toLowerCase()) ||
      r.name.toLowerCase().includes(filterId.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-health-navy tracking-tight">Visit History & Digital Register</h1>
          <p className="text-xs sm:text-sm text-health-navyLight">
            Audit trail of confirmed spoken records persisted into PostgreSQL/Supabase.
          </p>
        </div>
        <Badge variant="neutral">3 Verified Records</Badge>
      </div>

      {/* Filter bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by Beneficiary ID or Name..."
          value={filterId}
          onChange={(e) => setFilterId(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-health-cardBorder rounded-xl text-sm text-health-navy focus:outline-none focus:ring-2 focus:ring-health-blueAccent/20"
        />
      </div>

      {/* List */}
      <div className="grid gap-4">
        {filtered.map((record) => (
          <Card key={record.visitId} className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-health-cardBorder pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-health-navy">{record.name}</span>
                <Badge variant="default" size="sm">{record.beneficiaryId}</Badge>
                <Badge variant="neutral" size="sm">{record.visitId}</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Recorded: {record.confirmedAt}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Visit Type</span>
                <span className="font-semibold text-health-navy">{record.visitType}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Weight</span>
                <span className="font-semibold text-health-navy">{record.weight}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Vaccinations Due</span>
                <span className="font-semibold text-health-navy">{record.vaccinationsDue}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Next Visit Date</span>
                <span className="font-semibold text-health-blueAccent">{record.nextVisitDate}</span>
              </div>
            </div>

            {record.hasAlert && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{record.alertText}</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
