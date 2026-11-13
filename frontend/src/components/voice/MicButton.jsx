import React from 'react';
import { Mic, Square, Loader2, Volume2, Hand } from 'lucide-react';

export default function MicButton({ state, onClick, onInterrupt }) {
  // state can be: 'IDLE', 'LISTENING', 'PROCESSING', 'SPEAKING'

  if (state === 'SPEAKING') {
    return (
      <div className="flex flex-col items-center">
        <button
          onClick={onInterrupt}
          aria-label="Interrupt Agent (Barge-In)"
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-200 bg-amber-500 hover:bg-amber-600 text-white ring-8 ring-amber-100 shadow-xl shadow-amber-200 active:scale-95 animate-pulse"
        >
          <Hand className="w-9 h-9" />
          <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">Interrupt / Barge-In</span>
        </button>
        <span className="text-xs font-semibold text-amber-700 mt-3 flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 animate-bounce" />
          <span>Agent is reading back... Tap to correct</span>
        </span>
      </div>
    );
  }

  if (state === 'PROCESSING') {
    return (
      <div className="flex flex-col items-center">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center bg-slate-100 border-2 border-slate-300 text-slate-500 shadow-md">
          <Loader2 className="w-10 h-10 animate-spin text-health-blueAccent" />
          <span className="text-[10px] font-bold mt-2 uppercase tracking-wider">Extracting...</span>
        </div>
        <span className="text-xs text-slate-500 mt-3 font-medium">Extracting visit fields...</span>
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
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-200 bg-rose-600 hover:bg-rose-700 text-white ring-8 ring-rose-100 shadow-xl shadow-rose-200 active:scale-95 relative z-10"
        >
          <Square className="w-9 h-9 fill-current" />
          <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">Tap to Stop</span>
        </button>
        <span className="text-xs font-semibold text-rose-600 mt-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>Streaming audio to Gnani Prisma...</span>
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
        className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-200 bg-health-blueAccent hover:bg-health-blueHover text-white ring-8 ring-health-blueLight shadow-xl shadow-health-blueAccent/25 active:scale-95"
      >
        <Mic className="w-10 h-10" />
        <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">Tap to Speak</span>
      </button>
      <span className="text-xs text-health-navyLight mt-3 font-medium">
        Speak visit notes in Indic language with English code-mix
      </span>
    </div>
  );
}
