import React from 'react';
import { Mic, Activity, Globe, Wifi } from 'lucide-react';

export default function Header({ selectedLanguage, onLanguageChange, activeTab, onTabChange }) {
  const languages = [
    { code: 'hi-IN', label: 'हिंदी (Hindi)' },
    { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'te-IN', label: 'తెలుగు (Telugu)' },
    { code: 'mr-IN', label: 'मराठी (Marathi)' },
    { code: 'ta-IN', label: 'தமிழ் (Tamil)' },
    { code: 'en-IN', label: 'English (India)' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-health-cardBorder">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div 
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-health-blueAccent flex items-center justify-center text-white shadow-sm group-hover:bg-health-blueHover transition">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-health-navy tracking-tight">ASHA VoiceCare</span>
              <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider bg-health-cardPale text-health-blueAccent px-2 py-0.5 rounded border border-health-cardBorder">
                Field Register
              </span>
            </div>
            <p className="text-xs text-health-navyLight hidden sm:block">
              Rampur Sub-Centre • Worker: Sunita Devi
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-health-cardPale border border-health-cardBorder rounded-lg px-2.5 py-1.5 text-xs text-health-navy">
            <Globe className="w-3.5 h-3.5 text-health-blueAccent shrink-0" />
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer text-xs pr-1"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sync / Status Indicator */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
