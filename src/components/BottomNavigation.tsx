import React from 'react';
import type { NavigationTab } from '@/types';
import { Map, Car, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BottomNavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  className,
}) => {
  const tabs: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'map',
      label: 'Map',
      icon: <Map className="w-5 h-5 stroke-[2.2]" />,
    },
    {
      id: 'parking',
      label: 'Spots',
      icon: <Car className="w-5 h-5 stroke-[2.2]" />,
    },
    {
      id: 'ai',
      label: 'Smart AI',
      icon: <Sparkles className="w-5 h-5 stroke-[2.2]" />,
    },
  ];

  return (
    <nav
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-40',
        'w-[calc(100%-2rem)] max-w-sm sm:max-w-md',
        'p-1.5 rounded-full bg-white/95 backdrop-blur-xl border border-zinc-200/90 shadow-xl',
        'transition-all duration-300 md:hidden',
        className
      )}
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-between gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer',
                'active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900',
                isActive
                  ? 'bg-zinc-950 text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={cn('transition-transform duration-200', isActive && 'scale-105')}>
                {tab.icon}
              </span>
              <span className="tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
