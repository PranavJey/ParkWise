import React, { useEffect } from 'react';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { AI_QUICK_PROMPTS } from '@/data/mockParking';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (p: string) => void;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, onSelectPrompt }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-modal-title"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg bg-zinc-950 text-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-zinc-800 overflow-hidden z-10">
        {/* Drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-zinc-800" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 id="ai-modal-title" className="text-base font-bold text-white">ParkWise AI</h2>
              <p className="text-xs text-zinc-400">Intelligent parking recommendations</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-zinc-900 text-zinc-400 flex items-center justify-center hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick prompts */}
        <div className="p-6 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Quick queries</p>
          {AI_QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => { onSelectPrompt(prompt); onClose(); }}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm font-semibold text-zinc-200 group-hover:text-white">{prompt}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-xs text-zinc-600 text-center">
            AI features require Phase 2 backend. Quick queries apply filters now.
          </p>
        </div>
      </div>
    </div>
  );
};
