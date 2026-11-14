import React, { useState } from 'react';
import { Search, UserPlus, Eye, Calendar, Weight, ChevronRight, Filter, AlertTriangle, Mic } from 'lucide-react';
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

  const handleStartVisit = (beneficiary) => {
    if (onSelectBeneficiaryForVisit) {
      onSelectBeneficiaryForVisit(beneficiary);
    }
    onNavigate('voice');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 bg-health-offWhite text-health-charcoal">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-health-navy tracking-tight">Beneficiary Register</h1>
          <p className="text-xs sm:text-sm text-health-navyLight">
            Rampur Village Sector 2 • {beneficiaries.length} Registered Community Members
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="health-button-primary text-sm py-2.5 px-4 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Beneficiary</span>
        </button>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Beneficiary ID (e.g. BEN-102), Mother/Child Name, or Hamlet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-health-cardBorder rounded-xl text-sm text-health-navy placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-health-blueAccent/20 focus:border-health-blueAccent"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-health-blueAccent text-white shadow-sm'
                  : 'bg-white text-health-navyLight hover:text-health-navy border border-health-cardBorder'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Beneficiaries Count & List */}
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
              className="hover:shadow-card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-health-cardPale text-health-blueAccent font-bold text-base flex items-center justify-center shrink-0 border border-health-cardBorder">
                  {b.name.charAt(0)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-health-navy">{b.name}</span>
                    <Badge variant="default" size="sm">{b.id}</Badge>
                    {b.recentAlert && (
                      <Badge variant="danger" size="sm">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>Danger Sign Flagged</span>
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-health-navyLight mt-1.5">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {b.categoryDetail}
                    </span>
                    <span>{b.hamlet}</span>
                    <span className="flex items-center gap-1">
                      <Weight className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b.currentWeight} kg</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Last: {b.lastVisitDate}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={() => setActiveBeneficiaryModal(b)}
                  className="health-button-secondary text-xs py-2 px-3"
                  title="View past visits and history"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>History ({b.visits?.length || 0})</span>
                </button>
                <button
                  onClick={() => handleStartVisit(b)}
                  className="health-button-primary text-xs py-2 px-3.5"
                  title="Record Spoken Visit"
                >
                  <Mic className="w-3.5 h-3.5" />
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
