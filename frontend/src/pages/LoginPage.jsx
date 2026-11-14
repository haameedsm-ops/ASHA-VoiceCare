import React, { useState } from 'react';
import { Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

export default function LoginPage({ onLogin }) {
  const [workerId, setWorkerId] = useState('ASHA-RMP-04');
  const [pin, setPin] = useState('1234');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ name: 'Sunita Devi', workerId, subCentre: 'Rampur Sub-Centre' });
  };

  return (
    <div className="relative flex min-h-[calc(100vh-68px)] items-center justify-center overflow-hidden bg-health-offWhite px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full border-[36px] border-health-lightMint/50" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full border-[40px] border-health-lightMint/40" />
      <div className="relative w-full max-w-md space-y-6">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-56 items-center justify-center">
            <img src="/asha-voicecare-logo.png" alt="ASHA VoiceCare" className="max-h-full max-w-full object-contain" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-health-deepGreen">Community health field register</p>
          <h1 className="text-2xl font-bold tracking-tight text-health-navy">Welcome to ASHA VoiceCare</h1>
          <p className="mx-auto max-w-sm text-sm leading-6 text-health-navyLight">
            Voice-assisted field register for community health workers
          </p>
        </div>

        <Card className="space-y-5 p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3 border-b border-health-cardBorder pb-4">
            <div>
              <h2 className="text-base font-bold text-health-navy">Worker access</h2>
              <p className="mt-0.5 text-xs text-health-navyLight">Enter your field register details.</p>
            </div>
            <Badge variant="default" size="sm">Demo access</Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="health-label">
                ASHA Worker ID / Mobile
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-health-navyLight" />
                <input
                  type="text"
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  required
                  className="health-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="health-label">
                4-Digit Security PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-health-navyLight" />
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  className="health-input pl-10 tracking-widest"
                />
              </div>
            </div>

            <button
              type="submit"
              className="health-button-primary mt-2 w-full text-sm"
            >
              <span>Access Field Register</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="flex items-center justify-center gap-1.5 border-t border-health-cardBorder pt-4 text-center text-[11px] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-health-deepGreen" />
            <span>Demonstration only · credentials are not verified</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
