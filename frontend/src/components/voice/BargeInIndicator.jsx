import React from 'react';
import { Volume2, Hand } from 'lucide-react';

export default function BargeInIndicator({ isSpeaking, onInterrupt }) {
  if (!isSpeaking) return null;

  return (
    <div className="flex w-full items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white">
          <Volume2 className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Visit read-back active
            </span>
            <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
              Interrupt available
            </span>
          </div>
          <p className="mt-0.5 text-xs text-amber-800">
            Interrupt playback to review or correct a field.
          </p>
        </div>
      </div>

      <button
        onClick={onInterrupt}
        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-800 active:scale-95"
      >
        <Hand className="h-3.5 w-3.5" />
        <span>Interrupt</span>
      </button>
    </div>
  );
}
