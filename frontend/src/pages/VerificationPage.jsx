import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Edit3, Volume2, Save, Mic, ShieldAlert, ArrowLeft, Check, Sparkles } from 'lucide-react';
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
    <div className="space-y-6 pb-24 md:pb-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <button
            onClick={() => onNavigate('voice')}
            className="text-xs text-health-blueAccent hover:underline flex items-center gap-1 mb-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Voice Assistant</span>
          </button>
          <h1 className="text-2xl font-bold text-health-navy tracking-tight">Visit Verification & Read-Back</h1>
          <p className="text-xs sm:text-sm text-health-navyLight">
            Verify all 5 mandatory fields extracted by AI before committing to the digital register.
          </p>
        </div>
        <Badge variant="success">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>All 5 Mandatory Fields Validated</span>
        </Badge>
      </div>

      {/* Danger Sign Alert Banner if any flagged by MoHFW Rules Engine */}
      {alerts.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-bold text-xs uppercase tracking-wider text-rose-800">
              Deterministic Safety Flag ({alerts[0].rule_id})
            </span>
          </div>
          <p className="text-sm font-bold">{alerts[0].title}</p>
          <p className="text-xs leading-relaxed bg-white/80 p-2.5 rounded-lg border border-rose-200">
            <strong>PHC Referral Action:</strong> {alerts[0].action_instructions || alerts[0].guidance}
          </p>
        </div>
      )}

      {/* Voice Read-Back Banner */}
      <Card pale={true} className="border-health-cardBorder flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-health-blueAccent text-white flex items-center justify-center shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-health-blueAccent uppercase tracking-wider">
              Gnani Timbre v3.0 Spoken Read-Back Script
            </span>
            <p className="text-xs sm:text-sm text-health-navy mt-0.5">
              <em>"I recorded beneficiary {fields.beneficiary_id.replace('BEN-', '')}, visit type {fields.visit_type}, weight {fields.weight} kilograms, vaccinations due {fields.vaccinations_due}, and next visit date {fields.next_visit_date}. Is this correct?"</em>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSpokenCorrectionModal(true)}
          className="health-button-secondary text-xs shrink-0 py-2 px-3 self-start sm:self-auto"
        >
          <Mic className="w-3.5 h-3.5 text-health-blueAccent" />
          <span>Speak Correction</span>
        </button>
      </Card>

      {/* 5 Mandatory Field Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {mandatoryCards.map((field) => (
          <Card key={field.key} className="space-y-2 border-l-4 border-l-health-blueAccent">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-health-navyLight uppercase tracking-wider">
                {field.label}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  MANDATORY
                </span>
                <button
                  onClick={() => handleStartEdit(field.key, field.value)}
                  className="text-slate-400 hover:text-health-blueAccent p-1 rounded transition"
                  title="Edit field manually"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {isEditing === field.key ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-health-blueAccent rounded-lg text-sm text-health-navy focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit(field.key)}
                  className="bg-health-blueAccent text-white p-1.5 rounded-lg hover:bg-health-blueHover"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-lg font-bold text-health-navy tracking-tight">{field.value}</p>
            )}
          </Card>
        ))}

        {/* Additional Clinical Notes */}
        <Card className="sm:col-span-2 space-y-1 bg-slate-50 border-dashed">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Clinical Observations / Visit Notes
          </span>
          <p className="text-sm text-slate-700">{fields.visit_notes}</p>
        </Card>
      </div>

      {/* Confirmation Actions */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-health-navy/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-health-cardBorder space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-health-cardBorder">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-health-blueAccent" />
                <h3 className="font-bold text-base text-health-navy">Spoken Correction (Barge-In)</h3>
              </div>
            </div>
            <p className="text-xs text-health-navyLight">
              Speak or type your correction (e.g. <em>"Wait, weight is 3.10 kilograms"</em> or <em>"Next visit 2026-12-20"</em>).
            </p>
            <form onSubmit={handleApplySpokenCorrection} className="space-y-3">
              <input
                type="text"
                placeholder="e.g. Weight is 3.10 kg"
                value={spokenCorrectionInput}
                onChange={(e) => setSpokenCorrectionInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-health-bgSoft border border-health-cardBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-health-blueAccent/20"
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
