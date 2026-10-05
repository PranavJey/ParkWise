import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIActionProps {
  onOpen?: () => void;
  className?: string;
}

export const AIAction: React.FC<AIActionProps> = ({ onOpen, className }) => {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open AI parking assistant"
      className={cn(
        'w-full flex items-center justify-between gap-3',
        'px-5 py-4 rounded-3xl bg-zinc-950 text-white',
        'hover:bg-zinc-800 transition-colors cursor-pointer',
        'border border-zinc-800 shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-amber-300" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold tracking-tight text-white">Find best parking</p>
          <p className="text-xs text-zinc-400 font-medium">AI-powered recommendations</p>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
        <ArrowRight className="w-4 h-4 text-white" />
      </div>
    </button>
  );
};
