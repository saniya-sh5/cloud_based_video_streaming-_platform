import React from 'react';
import { RotateCcw, HelpCircle, Activity, Sparkles } from 'lucide-react';
import { NavigationTab } from '../types';

interface HeaderProps {
  activeTab: NavigationTab;
  onResetAll: () => void;
  onOpenDocs: () => void;
}

const TAB_TITLES: Record<NavigationTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Cloud Streaming OS Architecture',
    subtitle: 'Real-time telemetry and resource topology across all 4 operating system modules.',
  },
  'cpu-scheduling': {
    title: 'Module A — CPU Scheduling Visualizer',
    subtitle: 'Simulate CPU allocation for video streaming tasks using FCFS, SJF, RR, Priority & Aging.',
  },
  'producer-consumer': {
    title: 'Module B — Bounded Video Buffer (Producer–Consumer)',
    subtitle: 'Model bounded segment buffering with mutex, empty, and full semaphores.',
  },
  banker: {
    title: "Module C — Banker's Deadlock Avoidance Algorithm",
    subtitle: 'Safe sequence calculation & resource request validation for cloud streaming nodes.',
  },
  memory: {
    title: 'Module D — Memory Management Simulator',
    subtitle: 'Partition allocation using First Fit, Best Fit, and Worst Fit algorithms.',
  },
  integrated: {
    title: 'End-to-End Cloud Video Pipeline',
    subtitle: 'Unified streaming pipeline connecting Producer Buffer -> Memory -> Banker -> CPU Scheduler.',
  },
  docs: {
    title: 'OS Concepts & Presentation Guide',
    subtitle: 'Detailed mathematical formulas, streaming analogies, and college presentation guide.',
  },
};

export const Header: React.FC<HeaderProps> = ({ activeTab, onResetAll, onOpenDocs }) => {
  const currentInfo = TAB_TITLES[activeTab] || TAB_TITLES.overview;

  return (
    <header className="px-8 py-5 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-6">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white tracking-tight">{currentInfo.title}</h2>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Problem 7: Video Platform
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">{currentInfo.subtitle}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenDocs}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-medium transition-all flex items-center gap-2 border border-slate-700"
          title="Open OS Theory & Formula Documentation"
        >
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          <span>Theory & Formulas</span>
        </button>

        <button
          onClick={onResetAll}
          className="px-3.5 py-2 rounded-xl bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-200 text-xs font-medium transition-all flex items-center gap-2 border border-indigo-700/50"
          title="Restore Default Example Datasets"
        >
          <RotateCcw className="w-4 h-4 text-indigo-400" />
          <span>Restore Examples</span>
        </button>
      </div>
    </header>
  );
};
