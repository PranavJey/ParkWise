import React from 'react';
import { Sparkles, ArrowRight, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AI_QUICK_PROMPTS } from '@/data/mockParking';

export interface AIActionCardProps {
  onPromptClick?: (prompt: string) => void;
  onExploreAI?: () => void;
  className?: string;
}

export const AIActionCard: React.FC<AIActionCardProps> = ({
  onPromptClick,
  onExploreAI,
  className,
}) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[28px] p-5 sm:p-6',
        'bg-zinc-950 text-white shadow-lg border border-zinc-800',
        'transition-all duration-300',
        className
      )}
    >
      {/* Subtle ambient gradient mesh in background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-emerald-500/10 via-indigo-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-48 h-48 bg-radial from-purple-500/10 via-transparent to-transparent rounded-full blur-xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>ParkWise Intelligence</span>
        </div>
        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
          Phase 1 Preview
        </span>
      </div>

      {/* Heading & Subtitle */}
      <div className="relative z-10 mb-4">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-1">
          ✨ Find your ideal spot in seconds
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
          AI continuously analyzes turnover patterns, walking distance, and EV bay availability.
        </p>
      </div>

      {/* Quick Prompt Pills */}
      <div className="relative z-10 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
        {AI_QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPromptClick?.(prompt)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
              'bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800',
              'border border-zinc-800 transition-all active:scale-95 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white'
            )}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Primary Action Button */}
      <div className="relative z-10 pt-1">
        <button
          type="button"
          onClick={onExploreAI}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 rounded-2xl',
            'bg-white text-zinc-950 hover:bg-zinc-100 font-semibold text-xs sm:text-sm',
            'transition-all duration-200 active:scale-[0.98] shadow-md cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
          )}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
              <Wand2 className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <span>Ask ParkWise to recommend</span>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-700" />
        </button>
      </div>
    </div>
  );
};
