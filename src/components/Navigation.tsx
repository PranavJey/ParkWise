import React from 'react';
import type { NavigationTab } from '@/types';
import { Map, Car, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  active: NavigationTab;
  onChange: (tab: NavigationTab) => void;
}

const TABS: { id: NavigationTab; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'map',     label: 'Map',     Icon: ({ className }) => <Map     className={className} /> },
  { id: 'parking', label: 'Parking', Icon: ({ className }) => <Car     className={className} /> },
  { id: 'ai',      label: 'Smart',   Icon: ({ className }) => <Sparkles className={className} /> },
];

export const BottomNav: React.FC<BottomNavProps> = ({ active, onChange }) => {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden"
    >
      <div className="flex items-center gap-1 p-1.5 rounded-full bg-white shadow-xl border border-[#E8E8E8]">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer',
                isActive
                  ? 'bg-zinc-950 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

interface SideNavProps {
  active: NavigationTab;
  onChange: (tab: NavigationTab) => void;
}

export const SideNav: React.FC<SideNavProps> = ({ active, onChange }) => {
  return (
    <div
      aria-label="Desktop navigation"
      className="hidden md:flex items-center gap-1 p-1 rounded-full bg-zinc-100 border border-zinc-200"
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer',
              isActive
                ? 'bg-zinc-950 text-white'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
