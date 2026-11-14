import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';

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
    <header className="sticky top-0 z-40 border-b border-health-cardBorder bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <button
          type="button"
          onClick={() => onTabChange('dashboard')}
          className="group flex items-center gap-3 rounded-lg text-left"
          aria-label="ASHA VoiceCare dashboard"
        >
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-health-cardBorder bg-white p-0.5 shadow-sm transition-colors group-hover:border-health-deepGreen/40">
            <img src="/asha-voicecare-logo.png" alt="" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-health-navy sm:text-lg">ASHA VoiceCare</span>
              <span className="hidden rounded border border-health-cardBorder bg-health-lightMint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-health-deepGreen sm:inline-block">
                Field Register
              </span>
            </div>
            <p className="text-xs text-health-navyLight hidden sm:block">
              Community health field register · Demonstration
            </p>
          </div>
        </button>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Selector */}
          <label className="flex items-center gap-1.5 rounded-lg border border-health-cardBorder bg-health-offWhite px-2.5 py-1.5 text-xs text-health-navy">
            <Globe className="h-3.5 w-3.5 shrink-0 text-health-deepGreen" />
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              aria-label="Select language"
              className="cursor-pointer bg-transparent pr-1 text-xs font-medium focus:outline-none"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
            <ChevronDown className="hidden h-3 w-3 text-health-navyLight sm:block" />
          </label>

          {/* Sync / Status Indicator */}
          <div className="hidden items-center gap-1.5 rounded-lg border border-health-cardBorder bg-health-offWhite px-2.5 py-1.5 text-xs font-medium text-health-navyLight md:flex">
            <span className="h-2 w-2 rounded-full bg-health-deepGreen"></span>
            <span>Demonstration</span>
          </div>
        </div>
      </div>
    </header>
  );
}
