import React, { useState } from 'react';
import { X, UserPlus, Check, Sparkles } from 'lucide-react';
import Badge from '../common/Badge';

export default function AddBeneficiaryModal({ isOpen, onClose, onAdd, existingCount }) {
  const nextId = `BEN-${100 + existingCount + 1}`;
  
  const [formData, setFormData] = useState({
    id: nextId,
    name: '',
    age: '24',
    category: 'ANC',
    hamlet: 'Rampur - Main Basti',
    contact: '+91 98765 00000',
    currentWeight: '50.0',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Beneficiary Name is required';
    if (!formData.currentWeight || isNaN(formData.currentWeight) || Number(formData.currentWeight) <= 0) {
      errs.currentWeight = 'Valid initial weight is required';
    }
    if (formData.age === '' || isNaN(formData.age) || Number(formData.age) < 0) {
      errs.age = 'Valid age is required (0 for newborn)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newBeneficiary = {
      id: formData.id,
      name: formData.name.trim(),
      age: Number(formData.age),
      category: formData.category,
      categoryDetail: `${formData.category} Registration`,
      hamlet: formData.hamlet,
      contact: formData.contact,
      currentWeight: Number(formData.currentWeight),
      lastVisitDate: new Date().toISOString().split('T')[0],
      registeredDate: new Date().toISOString().split('T')[0],
      recentAlert: null,
      visits: []
    };

    onAdd(newBeneficiary);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-health-navy/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-health-cardBorder">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-health-cardBorder">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-health-cardPale text-health-blueAccent flex items-center justify-center border border-health-cardBorder">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-health-navy">Add New Beneficiary</h2>
              <p className="text-xs text-health-navyLight">Register mother or child for village register</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Auto-generated ID */}
          <div className="flex items-center justify-between bg-health-cardPale border border-health-cardBorder rounded-xl p-3">
            <div>
              <span className="text-xs font-semibold text-health-navyLight block">Assigned Synthetic ID</span>
              <span className="text-sm font-bold text-health-blueAccent font-mono">{formData.id}</span>
            </div>
            <Badge variant="royal" size="sm">Auto-Generated</Badge>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-health-navy mb-1">
              Full Beneficiary Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Geeta Devi or Baby of Geeta"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3.5 py-2.5 bg-health-bgSoft border rounded-xl text-sm text-health-navy focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-health-cardBorder focus:ring-health-blueAccent/20 focus:border-health-blueAccent'
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Category & Age */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-health-navy mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 bg-health-bgSoft border border-health-cardBorder rounded-xl text-sm text-health-navy focus:outline-none focus:ring-2 focus:ring-health-blueAccent/20"
              >
                <option value="ANC">ANC (Pregnant Woman)</option>
                <option value="Newborn">Newborn (0-28 days)</option>
                <option value="PNC">PNC (Postnatal Mother)</option>
                <option value="Child">Child (1-5 years)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-health-navy mb-1">
                Age (Years / 0 for Newborn) *
              </label>
              <input
                type="number"
                min="0"
                max="65"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-3 py-2.5 bg-health-bgSoft border border-health-cardBorder rounded-xl text-sm text-health-navy focus:outline-none focus:ring-2 focus:ring-health-blueAccent/20"
              />
              {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
            </div>
          </div>

          {/* Current Weight & Hamlet */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-health-navy mb-1">
                Current Weight (kg) *
              </label>
              <input
                type="number"
                step="0.05"
                placeholder="e.g. 2.80 or 52.0"
                value={formData.currentWeight}
                onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                className="w-full px-3 py-2.5 bg-health-bgSoft border border-health-cardBorder rounded-xl text-sm text-health-navy focus:outline-none focus:ring-2 focus:ring-health-blueAccent/20"
              />
              {errors.currentWeight && (
                <p className="text-xs text-red-500 mt-1">{errors.currentWeight}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-health-navy mb-1">
                Hamlet / Tola
              </label>
              <input
                type="text"
                value={formData.hamlet}
                onChange={(e) => setFormData({ ...formData, hamlet: e.target.value })}
                className="w-full px-3 py-2.5 bg-health-bgSoft border border-health-cardBorder rounded-xl text-sm text-health-navy focus:outline-none focus:ring-2 focus:ring-health-blueAccent/20"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-health-cardBorder">
            <button
              type="button"
              onClick={onClose}
              className="health-button-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="health-button-primary text-xs py-2 px-5"
            >
              <Check className="w-4 h-4" />
              <span>Save Beneficiary</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
