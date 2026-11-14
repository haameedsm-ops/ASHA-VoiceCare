import React, { useState } from 'react';
import { CalendarDays, CheckCircle2, AlertTriangle, Search, FileText } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

export default function HistoryPage({ onNavigate, visits = [] }) {
  const [filterId, setFilterId] = useState('');

  const filtered = visits.filter(
    (r) =>
      r.beneficiaryId.toLowerCase().includes(filterId.toLowerCase()) ||
      r.name.toLowerCase().includes(filterId.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex flex-col gap-4 border-b border-health-cardBorder pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-health-deepGreen">
            <FileText className="h-4 w-4" />
            Visit records
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-health-navy sm:text-3xl">Visit History</h1>
          <p className="mt-1.5 text-sm text-health-navyLight">
            Confirmed visit records from the current demonstration session.
          </p>
        </div>
        <Badge variant="default">{visits.length} session records</Badge>
      </div>

      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-health-lightMint text-health-deepGreen">
          <Search className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <label htmlFor="visit-search" className="mb-1 block text-xs font-semibold text-health-navy">Find a register entry</label>
        <input
          id="visit-search"
          type="text"
          placeholder="Filter by Beneficiary ID or Name..."
          value={filterId}
          onChange={(e) => setFilterId(e.target.value)}
          className="w-full rounded-lg border border-health-cardBorder bg-health-offWhite px-3.5 py-2.5 text-sm text-health-navy transition focus:border-health-deepGreen focus:bg-white focus:outline-none focus:ring-2 focus:ring-health-deepGreen/15"
        />
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-health-navy">Register entries</h2>
          <p className="mt-0.5 text-xs text-health-navyLight">{filtered.length} matching {filtered.length === 1 ? 'visit' : 'visits'}</p>
        </div>
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <Card className="py-12 text-center">
            <p className="text-sm font-semibold text-slate-600">
              {filterId ? 'No matching visit records' : 'No visit records in this session'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Confirmed visits will appear here.
            </p>
          </Card>
        ) : filtered.map((record) => (
          <Card key={record.visitId} className="space-y-4">
            <div className="flex flex-col justify-between gap-3 border-b border-health-cardBorder pb-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-health-lightMint text-health-deepGreen">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base text-health-navy">{record.name}</span>
                    <Badge variant="default" size="sm">{record.beneficiaryId}</Badge>
                  </div>
                  <span className="mt-1 block font-mono text-[11px] text-health-navyLight">{record.visitId}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Badge variant="success" size="sm">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Confirmed
                </Badge>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <CalendarDays className="h-3.5 w-3.5 text-health-deepGreen" />
                  {record.confirmedAt}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-health-offWhite p-3">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-health-navyLight">Visit Type</span>
                <span className="mt-1 block text-xs font-semibold leading-5 text-health-navy">{record.visitType}</span>
              </div>
              <div className="rounded-lg bg-health-offWhite p-3">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-health-navyLight">Weight</span>
                <span className="mt-1 block text-xs font-semibold text-health-navy">{record.weight}</span>
              </div>
              <div className="rounded-lg bg-health-offWhite p-3">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-health-navyLight">Vaccinations Due</span>
                <span className="mt-1 block text-xs font-semibold leading-5 text-health-navy">{record.vaccinationsDue}</span>
              </div>
              <div className="rounded-lg bg-health-lightMint/60 p-3">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-health-navyLight">Next Visit Date</span>
                <span className="mt-1 block text-xs font-semibold text-health-deepGreen">{record.nextVisitDate}</span>
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
