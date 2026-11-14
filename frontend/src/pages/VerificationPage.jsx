import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Edit3, Volume2, Save, Mic, ShieldAlert, ArrowLeft, Check, ClipboardCheck } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { saveVerifiedVisit } from '../services/api';

export default function VerificationPage({ onNavigate, visitData, onVisitConfirmed }) {
  // Use passed data from voice session or fallback to default
  const initialFields = visitData?.extracted || {
    beneficiary_id: 'BEN-102',
    visit_type: 'Newborn Home Visit (HBNC)',
    weight: 2.80,
    vaccinations_due: 'BCG, OPV-0',
    next_visit_date: '2026-12-15',
    visit_notes: 'Baby feeding well at breast, no fever, umbilical cord clean and dry.'
  };

  const [fields, setFields] = useState(initialFields);
  const [isEditing, setIsEditing] = useState(null); // Key of field being edited
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [spokenCorrectionInput, setSpokenCorrectionInput] = useState('');
  const [showSpokenCorrectionModal, setShowSpokenCorrectionModal] = useState(false);

  const alerts = visitData?.alerts || [];

  const mandatoryCards = [
    { key: 'beneficiary_id', label: '1. Beneficiary ID', value: fields.beneficiary_id },
    { key: 'visit_type', label: '2. Visit Type', value: fields.visit_type },
    { key: 'weight', label: '3. Weight (kg)', value: `${fields.weight} kg` },
    { key: 'vaccinations_due', label: '4. Vaccinations Due', value: fields.vaccinations_due },
    { key: 'next_visit_date', label: '5. Next Visit Date', value: fields.next_visit_date },
  ];

  const handleStartEdit = (key, currentVal) => {
    setIsEditing(key);
    setEditValue(String(currentVal).replace(' kg', ''));
  };

  const handleSaveEdit = (key) => {
    if (key === 'weight') {
      setFields({ ...fields, [key]: parseFloat(editValue) || fields.weight });
    } else {
      setFields({ ...fields, [key]: editValue });
    }
    setIsEditing(null);
  };

  const handleApplySpokenCorrection = (e) => {
    e.preventDefault();
    if (!spokenCorrectionInput.trim()) return;

    // Check if correction modifies weight
    const weightMatch = spokenCorrectionInput.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:kg|kgs|kilograms?|किलो)?/i);
    if (weightMatch) {
      setFields(prev => ({ ...prev, weight: parseFloat(weightMatch[1]) }));
    }

    // Check if correction modifies date
    const dateMatch = spokenCorrectionInput.match(/(202[5-9]-[0-1][0-9]-[0-3][0-9])/);
    if (dateMatch) {
      setFields(prev => ({ ...prev, next_visit_date: dateMatch[1] }));
    }

    setShowSpokenCorrectionModal(false);
    setSpokenCorrectionInput('');
  };

  const handleConfirmAndSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        beneficiary_id: fields.beneficiary_id,
        visit_type: fields.visit_type,
        weight: Number(fields.weight),
        vaccinations_due: fields.vaccinations_due,
        next_visit_date: fields.next_visit_date,
        visit_notes: fields.visit_notes || 'Confirmed field visit notes.',
        transcript: visitData?.transcript || `Visit for ${fields.beneficiary_id}, weight ${fields.weight} kg.`,
        confirmation_status: 'confirmed'
      };

      const result = await saveVerifiedVisit(payload);

      if (onVisitConfirmed) {
        onVisitConfirmed({
          ...result,
          name: `Beneficiary ${fields.beneficiary_id}`,
          hasAlert: alerts.length > 0,
          confirmedAt: new Date().toISOString()
        });
      }

      alert('Visit record verified and committed to database!');
      onNavigate('history');
    } catch (err) {
      console.warn('API save fallback for offline demonstration:', err);
      if (onVisitConfirmed) {
        onVisitConfirmed({
          visit_id: `VIS-${Math.floor(100 + Math.random() * 900)}`,
          beneficiary_id: fields.beneficiary_id,
          name: `Beneficiary ${fields.beneficiary_id}`,
          visit_type: fields.visit_type,
          weight: `${fields.weight} kg`,
          vaccinations_due: fields.vaccinations_due,
          next_visit_date: fields.next_visit_date,
          confirmedAt: new Date().toLocaleString(),
          hasAlert: alerts.length > 0
        });
      }
      onNavigate('history');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24 md:pb-6">
      <div className="flex flex-col gap-4 border-b border-health-cardBorder pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            onClick={() => onNavigate('voice')}
            className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-health-deepGreen hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Voice Assistant</span>
          </button>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-health-deepGreen">
            <ClipboardCheck className="h-4 w-4" />
            Visit workflow · Step 2 of 2
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-health-navy sm:text-3xl">Visit Verification</h1>
          <p className="mt-1.5 text-sm text-health-navyLight">
            Review and correct the captured visit fields before saving the register entry.
          </p>
        </div>
        <Badge variant="warning">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Review required fields</span>
        </Badge>
      </div>

      {/* Danger Sign Alert Banner if any flagged by MoHFW Rules Engine */}
      {alerts.length > 0 && (
        <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 shrink-0 text-rose-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Safety alert for review ({alerts[0].rule_id})
            </span>
          </div>
          <p className="text-sm font-bold">{alerts[0].title}</p>
          <p className="rounded-lg border border-rose-200 bg-white/80 p-3 text-xs leading-relaxed">
            <strong>Suggested referral action:</strong> {alerts[0].action_instructions || alerts[0].guidance}
          </p>
          <p className="text-[11px] leading-5 text-rose-800">Confirm any safety concern and referral decision with a qualified health professional.</p>
        </div>
      )}

      <Card pale={true} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-health-deepGreen text-white">
            <Volume2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-health-deepGreen">
              Visit summary read-back
            </span>
            <p className="mt-1 text-xs leading-5 text-health-navy sm:text-sm">
              <em>"I recorded beneficiary {fields.beneficiary_id.replace('BEN-', '')}, visit type {fields.visit_type}, weight {fields.weight} kilograms, vaccinations due {fields.vaccinations_due}, and next visit date {fields.next_visit_date}. Is this correct?"</em>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSpokenCorrectionModal(true)}
          className="health-button-secondary self-start py-2 text-xs sm:self-auto"
        >
          <Mic className="h-3.5 w-3.5 text-health-deepGreen" />
          <span>Speak Correction</span>
        </button>
      </Card>

      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold text-health-navy">Visit details</h2>
          <p className="mt-0.5 text-xs text-health-navyLight">Edit any field that needs correction before saving.</p>
        </div>
        <span className="hidden text-xs text-health-navyLight sm:block">Required fields are marked</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {mandatoryCards.map((field) => (
          <Card key={field.key} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-health-navyLight">
                {field.label}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="rounded border border-health-cardBorder bg-health-offWhite px-2 py-0.5 text-[10px] font-bold text-health-navyLight">
                  REQUIRED
                </span>
                <button
                  onClick={() => handleStartEdit(field.key, field.value)}
                  className="rounded-md p-1.5 text-health-navyLight transition hover:bg-health-lightMint hover:text-health-deepGreen"
                  title="Edit field manually"
                  aria-label={`Edit ${field.label}`}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {isEditing === field.key ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  aria-label={`Correct ${field.label}`}
                  className="min-w-0 flex-1 rounded-lg border border-health-deepGreen bg-health-offWhite px-3 py-2 text-sm text-health-navy focus:outline-none focus:ring-2 focus:ring-health-deepGreen/15"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit(field.key)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-health-deepGreen text-white transition hover:bg-health-darkNavy"
                  aria-label={`Save ${field.label} correction`}
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="break-words text-base font-semibold leading-6 text-health-navy">{field.value}</p>
            )}
          </Card>
        ))}

        <Card pale={true} className="space-y-2 sm:col-span-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-health-navyLight">
            Clinical Observations / Visit Notes
          </span>
          <p className="text-sm leading-6 text-health-charcoal">{fields.visit_notes || 'No visit notes available.'}</p>
        </Card>
      </div>

      <div className="flex flex-col-reverse items-center justify-end gap-3 border-t border-health-cardBorder pt-5 sm:flex-row">
        <button
          onClick={() => onNavigate('voice')}
          className="health-button-secondary w-full sm:w-auto text-sm"
        >
          <span>Cancel & Re-record</span>
        </button>
        <button
          onClick={handleConfirmAndSave}
          disabled={isSaving}
          className="health-button-primary w-full sm:w-auto text-sm"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving to Database...' : 'Confirm & Save Visit Record'}</span>
        </button>
      </div>

      {/* Spoken Correction Modal */}
      {showSpokenCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-health-navy/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-health-cardBorder bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-health-cardBorder">
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-health-deepGreen" />
                <h3 className="font-bold text-base text-health-navy">Correction</h3>
              </div>
            </div>
            <p className="text-xs leading-5 text-health-navyLight">
            Enter a correction, such as a new weight in kilograms or a date in YYYY-MM-DD format.
            </p>
            <form onSubmit={handleApplySpokenCorrection} className="space-y-3">
              <input
                type="text"
                placeholder="e.g. Weight is 3.10 kg"
                value={spokenCorrectionInput}
                onChange={(e) => setSpokenCorrectionInput(e.target.value)}
                aria-label="Correction details"
                className="w-full rounded-lg border border-health-cardBorder bg-health-offWhite px-3.5 py-2.5 text-sm focus:border-health-deepGreen focus:outline-none focus:ring-2 focus:ring-health-deepGreen/15"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSpokenCorrectionModal(false)}
                  className="health-button-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="health-button-primary text-xs py-2 px-4"
                >
                  <span>Apply Correction</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
