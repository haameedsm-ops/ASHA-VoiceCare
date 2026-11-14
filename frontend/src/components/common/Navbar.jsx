import React from 'react';
import { LayoutDashboard, Users, Mic, CheckCircle2, History, CalendarClock } from 'lucide-react';

export default function Navbar({ activeTab, onTabChange }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
    { id: 'voice', label: 'Voice Register', icon: Mic, primary: true },
    { id: 'verification', label: 'Verify Visit', icon: CheckCircle2 },
    { id: 'history', label: 'History', icon: History },
    { id: 'followups', label: 'Follow-ups', icon: CalendarClock },
  ];

  return (
    <>
      {/* Desktop Navigation Bar (Top sub-nav) */}
      <nav aria-label="Main navigation" className="sticky top-[65px] z-30 hidden border-b border-health-cardBorder bg-white/95 backdrop-blur md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 sm:px-6 lg:px-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  isActive
                    ? 'border-health-deepGreen bg-health-lightMint/50 text-health-deepGreen'
                    : 'border-transparent text-health-navyLight hover:bg-health-offWhite hover:text-health-navy'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-health-deepGreen' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.primary && (
                  <span className="h-1.5 w-1.5 rounded-full bg-health-deepGreen"></span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Field worker optimized) */}
      <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-health-cardBorder bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(23,50,77,0.07)] backdrop-blur md:hidden">
        <div className="grid grid-cols-6 items-center px-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.primary) {
              return (
                <div key={item.id} className="flex justify-center -mt-3">
                  <button
                    onClick={() => onTabChange(item.id)}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex h-12 w-12 flex-col items-center justify-center rounded-full shadow-md transition-transform active:scale-95 ${
                      isActive
                        ? 'bg-health-deepGreen text-white ring-4 ring-health-lightMint'
                        : 'bg-health-darkNavy text-white hover:bg-health-deepGreen'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </button>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-w-0 flex-col items-center justify-center px-1 py-2 text-[10px] font-medium transition ${
                  isActive ? 'font-semibold text-health-deepGreen' : 'text-slate-500 hover:text-health-navy'
                }`}
              >
                <Icon className={`mb-0.5 h-5 w-5 ${isActive ? 'text-health-deepGreen' : 'text-slate-400'}`} />
                <span className="truncate max-w-[50px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
