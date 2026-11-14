import React, { useState } from 'react';
import { Search, UserPlus, Eye, CalendarDays, Weight, AlertTriangle, Mic, Users, MapPin } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import AddBeneficiaryModal from '../components/beneficiaries/AddBeneficiaryModal';
import BeneficiaryDetailModal from '../components/beneficiaries/BeneficiaryDetailModal';

export default function BeneficiaryPage({ beneficiaries, onAddBeneficiary, onSelectBeneficiaryForVisit, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeBeneficiaryModal, setActiveBeneficiaryModal] = useState(null);

  const categories = [
    { id: 'ALL', label: 'All Records' },
    { id: 'ANC', label: 'ANC (Pregnant)' },
    { id: 'Newborn', label: 'Newborns (0-28d)' },
    { id: 'PNC', label: 'PNC Mothers' },
    { id: 'Child', label: 'Children (1-5y)' },
  ];

  const filtered = beneficiaries.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.hamlet.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || b.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });
  const categoryCount = (category) =>
    category === 'ALL'
      ? beneficiaries.length
      : beneficiaries.filter((beneficiary) => beneficiary.category === category).length;

  const handleStartVisit = (beneficiary) => {
    if (onSelectBeneficiaryForVisit) {
      onSelectBeneficiaryForVisit(beneficiary);
    }
    onNavigate('voice');
  };

  return (
    <div className="space-y-6 pb-24 text-health-charcoal md:pb-6">
      <div className="flex flex-col gap-5 border-b border-health-cardBorder pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-health-deepGreen">
            <Users className="h-4 w-4" />
            Community records
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-health-navy sm:text-3xl">Beneficiary Register</h1>
          <p className="mt-1.5 text-sm text-health-navyLight">
            Find and review household records · {beneficiaries.length} people in this session
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="health-button-primary self-start px-4 py-2.5 text-sm sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Beneficiary</span>
        </button>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-health-navy">Search the register</h2>
          <p className="text-xs text-health-navyLight">Filter by name, beneficiary ID, or hamlet.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-health-navyLight" />
          <input
            type="text"
            placeholder="Search by Beneficiary ID (e.g. BEN-102), Mother/Child Name, or Hamlet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search beneficiaries"
            className="w-full rounded-lg border border-health-cardBorder bg-health-offWhite py-3 pl-10 pr-4 text-sm text-health-navy placeholder-slate-400 transition focus:border-health-deepGreen focus:bg-white focus:outline-none focus:ring-2 focus:ring-health-deepGreen/15"
          />
        </div>

        <div className="flex flex-wrap gap-2 border-t border-health-cardBorder pt-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              aria-pressed={selectedCategory === cat.id}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'border-health-deepGreen bg-health-deepGreen text-white shadow-sm'
                  : 'border-health-cardBorder bg-white text-health-navyLight hover:border-health-deepGreen/40 hover:text-health-navy'
              }`}
            >
              {cat.label}
              <span className={`rounded px-1.5 py-0.5 text-[10px] ${selectedCategory === cat.id ? 'bg-white/15 text-white' : 'bg-health-offWhite text-health-navyLight'}`}>
                {categoryCount(cat.id)}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-health-navy">Household records</h2>
          <p className="mt-0.5 text-xs text-health-navyLight">{filtered.length} matching {filtered.length === 1 ? 'record' : 'records'}</p>
        </div>
        <span className="hidden text-xs text-health-navyLight sm:inline">Select a record to review history or start a visit</span>
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <Card className="py-12 text-center">
            <p className="text-sm font-semibold text-slate-600">No beneficiaries found</p>
            <p className="text-xs text-slate-400 mt-1">Try refining your search term or filter category.</p>
          </Card>
        ) : (
          filtered.map((b) => (
            <Card
              key={b.id}
              className="group flex flex-col justify-between gap-4 border-l-4 border-l-transparent transition hover:border-l-health-deepGreen sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-health-cardBorder bg-health-lightMint text-lg font-bold text-health-deepGreen">
                  {b.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-health-navy sm:text-base">{b.name}</span>
                    <Badge variant="default" size="sm">{b.id}</Badge>
                    {b.recentAlert && (
                      <Badge variant="danger" size="sm">
                        <AlertTriangle className="h-3 w-3 text-rose-600" />
                        <span>Safety alert</span>
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-health-cardBorder bg-health-offWhite px-2 py-1 text-[11px] font-semibold text-health-navy">
                      {b.categoryDetail}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-health-navyLight sm:grid-cols-3">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-health-deepGreen" />
                      <span className="truncate">{b.hamlet}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Weight className="h-3.5 w-3.5 text-health-deepGreen" />
                      <span>{b.currentWeight} kg</span>
                    </span>
                    <span className="col-span-2 flex items-center gap-1.5 sm:col-span-1">
                      <CalendarDays className="h-3.5 w-3.5 text-health-deepGreen" />
                      <span>Last visit {b.lastVisitDate}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 border-t border-health-cardBorder pt-3 sm:border-0 sm:pt-0">
                <button
                  onClick={() => setActiveBeneficiaryModal(b)}
                  className="health-button-secondary py-2 text-xs"
                  title="View past visits and history"
                >
                  <Eye className="h-3.5 w-3.5 text-health-navyLight" />
                  <span>History ({b.visits?.length || 0})</span>
                </button>
                <button
                  onClick={() => handleStartVisit(b)}
                  className="health-button-primary py-2 text-xs"
                  title="Record Spoken Visit"
                >
                  <Mic className="h-3.5 w-3.5" />
                  <span>Record Visit</span>
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Beneficiary Modal */}
      <AddBeneficiaryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAddBeneficiary}
        existingCount={beneficiaries.length}
      />

      {/* Beneficiary Details Modal */}
      <BeneficiaryDetailModal
        beneficiary={activeBeneficiaryModal}
        isOpen={Boolean(activeBeneficiaryModal)}
        onClose={() => setActiveBeneficiaryModal(null)}
        onRecordVisit={handleStartVisit}
      />
    </div>
  );
}
