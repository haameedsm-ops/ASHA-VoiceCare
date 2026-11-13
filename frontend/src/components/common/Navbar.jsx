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
      <nav className="hidden md:block bg-white border-b border-health-cardBorder">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  isActive
                    ? 'border-health-blueAccent text-health-blueAccent bg-health-cardPale/50'
                    : 'border-transparent text-health-navyLight hover:text-health-navy hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-health-blueAccent' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.primary && (
                  <span className="w-2 h-2 rounded-full bg-health-blueAccent"></span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Field worker optimized) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-health-cardBorder shadow-lg">
        <div className="grid grid-cols-6 items-center px-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.primary) {
              return (
                <div key={item.id} className="flex justify-center -mt-4">
                  <button
                    onClick={() => onTabChange(item.id)}
                    aria-label={item.label}
                    className={`w-13 h-13 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 ${
                      isActive
                        ? 'bg-health-blueAccent text-white ring-4 ring-health-blueLight'
                        : 'bg-health-navy text-white hover:bg-health-blueAccent'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 text-[10px] font-medium transition ${
                  isActive ? 'text-health-blueAccent font-semibold' : 'text-slate-500 hover:text-health-navy'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-health-blueAccent' : 'text-slate-400'}`} />
                <span className="truncate max-w-[50px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
