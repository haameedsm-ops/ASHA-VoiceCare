import React from 'react';
import { Mic, Square, Loader2, Volume2, Hand } from 'lucide-react';

export default function MicButton({ state, onClick, onInterrupt }) {
  // state can be: 'IDLE', 'LISTENING', 'PROCESSING', 'SPEAKING'

  if (state === 'SPEAKING') {
    return (
      <div className="flex flex-col items-center">
        <button
          onClick={onInterrupt}
          aria-label="Interrupt read-back"
          className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-amber-600 text-white shadow-lg shadow-amber-900/10 ring-8 ring-amber-100 transition-all duration-200 hover:bg-amber-700 active:scale-95 sm:h-32 sm:w-32"
        >
          <Hand className="h-9 w-9" />
          <span className="mt-1 text-[10px] font-bold uppercase tracking-wider">Interrupt</span>
        </button>
        <span className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-800">
          <Volume2 className="h-4 w-4" />
          <span>Visit read-back is active</span>
        </span>
      </div>
    );
  }

  if (state === 'PROCESSING') {
    return (
      <div className="flex flex-col items-center">
        <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-2 border-health-cardBorder bg-health-offWhite text-health-navyLight shadow-sm sm:h-32 sm:w-32">
          <Loader2 className="h-10 w-10 animate-spin text-health-deepGreen" />
          <span className="mt-2 text-[10px] font-bold uppercase tracking-wider">Processing</span>
        </div>
        <span className="mt-3 text-xs font-medium text-slate-600">Waiting for the visit service response…</span>
      </div>
    );
  }

  if (state === 'LISTENING') {
    return (
      <div className="flex flex-col items-center relative">
        <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-voice-ripple pointer-events-none scale-125"></div>
        <button
          onClick={onClick}
          aria-label="Stop Recording"
          className="relative z-10 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-rose-700 text-white shadow-lg shadow-rose-900/15 ring-8 ring-rose-100 transition-all duration-200 hover:bg-rose-800 active:scale-95 sm:h-32 sm:w-32"
        >
          <Square className="h-9 w-9 fill-current" />
          <span className="mt-1 text-[10px] font-bold uppercase tracking-wider">Tap to Stop</span>
        </button>
        <span className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-rose-600"></span>
          <span>Microphone recording active</span>
        </span>
      </div>
    );
  }

  // Default: IDLE
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onClick}
        aria-label="Start Voice Recording"
        className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-health-deepGreen text-white shadow-lg shadow-health-deepGreen/20 ring-8 ring-health-lightMint transition-all duration-200 hover:bg-health-darkNavy active:scale-95 sm:h-32 sm:w-32"
      >
        <Mic className="h-10 w-10" />
        <span className="mt-1 text-[10px] font-bold uppercase tracking-wider">Tap to Speak</span>
      </button>
      <span className="mt-3 text-xs font-medium text-health-navyLight">
        Speak visit notes in your selected language
      </span>
    </div>
  );
}
