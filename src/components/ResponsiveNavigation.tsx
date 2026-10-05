import React from 'react';
import type { NavigationTab } from '@/types';
import { BottomNavigation } from './BottomNavigation';
import { Map, Car, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ResponsiveNavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  className?: string;
}

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  activeTab,
  onTabChange,
  className,
}) => {
  const tabs: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'map',
      label: 'Explore Map',
      icon: <Map className="w-4 h-4 stroke-[2]" />,
    },
    {
      id: 'parking',
      label: 'Available Spots',
      icon: <Car className="w-4 h-4 stroke-[2]" />,
    },
    {
      id: 'ai',
      label: 'AI Matcher',
      icon: <Sparkles className="w-4 h-4 stroke-[2]" />,
    },
  ];

  return (
    <>
      {/* Mobile Floating Bottom Bar */}
      <BottomNavigation activeTab={activeTab} onTabChange={onTabChange} className={className} />

      {/* Desktop / Tablet Inline Segmented Pill Navigation */}
      <nav
        className="hidden md:inline-flex items-center p-1 rounded-full bg-zinc-100 border border-zinc-200/80 shadow-2xs"
        aria-label="Desktop Primary Navigation"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900',
                isActive
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span>{tab.icon}</span>
              <span className="tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
