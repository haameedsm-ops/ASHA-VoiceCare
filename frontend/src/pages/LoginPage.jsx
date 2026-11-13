import React, { useState } from 'react';
import { Mic, Lock, User, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-health-blueAccent text-white flex items-center justify-center mx-auto shadow-lg shadow-health-blueAccent/25">
            <Mic className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-health-navy tracking-tight">ASHA VoiceCare</h1>
          <p className="text-xs sm:text-sm text-health-navyLight">
            AI-Powered Voice Field Register for Community Health Workers
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-5 border-2 border-health-cardBorder">
          <div className="flex items-center justify-between pb-3 border-b border-health-cardBorder">
            <span className="text-xs font-bold uppercase tracking-wider text-health-navyLight">Worker Login</span>
            <Badge variant="royal" size="sm">Field Mode</Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-health-navy mb-1.5">
                ASHA Worker ID / Mobile
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-health-bgSoft border border-health-cardBorder rounded-xl text-sm text-health-navy focus:outline-none focus:ring-2 focus:ring-health-blueAccent/20 focus:border-health-blueAccent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-health-navy mb-1.5">
                4-Digit Security PIN
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-health-bgSoft border border-health-cardBorder rounded-xl text-sm text-health-navy tracking-widest focus:outline-none focus:ring-2 focus:ring-health-blueAccent/20 focus:border-health-blueAccent"
                />
              </div>
            </div>

            <button
              type="submit"
              className="health-button-primary w-full text-sm font-semibold mt-2"
            >
              <span>Access Field Register</span>
            </button>
          </form>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Offline-Ready Healthcare Session</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
