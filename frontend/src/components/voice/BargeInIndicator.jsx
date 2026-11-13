import React from 'react';
import { Volume2, Hand, Sparkles } from 'lucide-react';

export default function BargeInIndicator({ isSpeaking, onInterrupt }) {
  if (!isSpeaking) return null;

  return (
    <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 animate-pulse">
          <Volume2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Voice Read-Back Active
            </span>
            <span className="text-[10px] bg-amber-200 text-amber-800 font-bold px-1.5 py-0.2 rounded">
              Barge-In Enabled
            </span>
          </div>
          <p className="text-xs text-amber-800 mt-0.5">
            Agent is reciting the extracted fields. Say <em>"No, wait..."</em> or tap button to speak correction.
          </p>
        </div>
      </div>

      <button
        onClick={onInterrupt}
        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 shrink-0 shadow-sm transition active:scale-95"
      >
        <Hand className="w-3.5 h-3.5" />
        <span>Interrupt Playback</span>
      </button>
    </div>
  );
}
