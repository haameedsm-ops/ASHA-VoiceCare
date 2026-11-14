import React, { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-health-navy/55 p-3 backdrop-blur-sm sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl border border-health-cardBorder bg-white p-5 shadow-2xl sm:p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-health-cardBorder">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-health-cardBorder bg-health-lightMint text-health-deepGreen">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-health-navy">Add New Beneficiary</h2>
              <p className="text-xs text-health-navyLight">Add a mother or child to the session register.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-health-offWhite hover:text-health-navy"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Auto-generated ID */}
          <div className="flex items-center justify-between rounded-lg border border-health-cardBorder bg-health-lightMint/50 p-3">
            <div>
              <span className="block text-xs font-semibold text-health-navyLight">Assigned session ID</span>
              <span className="font-mono text-sm font-bold text-health-deepGreen">{formData.id}</span>
            </div>
            <Badge variant="royal" size="sm">Auto-Generated</Badge>
          </div>

          {/* Name */}
          <div>
            <label className="health-label">
              Full Beneficiary Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Geeta Devi or Baby of Geeta"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`health-input ${
                errors.name
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                  : ''
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Category & Age */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="health-label">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="health-input"
              >
                <option value="ANC">ANC (Pregnant Woman)</option>
                <option value="Newborn">Newborn (0-28 days)</option>
                <option value="PNC">PNC (Postnatal Mother)</option>
                <option value="Child">Child (1-5 years)</option>
              </select>
            </div>

            <div>
              <label className="health-label">
                Age (Years / 0 for Newborn) *
              </label>
              <input
                type="number"
                min="0"
                max="65"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="health-input"
              />
              {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
            </div>
          </div>

          {/* Current Weight & Hamlet */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="health-label">
                Current Weight (kg) *
              </label>
              <input
                type="number"
                step="0.05"
                placeholder="e.g. 2.80 or 52.0"
                value={formData.currentWeight}
                onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                className="health-input"
              />
              {errors.currentWeight && (
                <p className="text-xs text-red-500 mt-1">{errors.currentWeight}</p>
              )}
            </div>

            <div>
              <label className="health-label">
                Hamlet / Tola
              </label>
              <input
                type="text"
                value={formData.hamlet}
                onChange={(e) => setFormData({ ...formData, hamlet: e.target.value })}
                className="health-input"
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
              <Check className="h-4 w-4" />
              <span>Save Beneficiary</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
