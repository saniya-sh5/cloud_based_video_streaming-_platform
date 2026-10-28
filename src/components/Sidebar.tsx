import React from 'react';
import { 
  Cpu, 
  Layers, 
  ShieldAlert, 
  HardDrive, 
  Activity, 
  BookOpen, 
  Tv, 
  Play
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onOpenDocs: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenDocs }) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: string; desc: string }[] = [
    {
      id: 'overview',
      label: 'System Overview',
      icon: <Tv className="w-5 h-5" />,
      desc: 'Platform Architecture & Stats',
    },
    {
      id: 'cpu-scheduling',
      label: 'CPU Scheduling',
      icon: <Cpu className="w-5 h-5" />,
      badge: 'Module A',
      desc: 'FCFS, SJF, RR, Priority & Aging',
    },
    {
      id: 'producer-consumer',
      label: 'Video Buffer',
      icon: <Layers className="w-5 h-5" />,
      badge: 'Module B',
      desc: 'Bounded Buffer & Semaphores',
    },
    {
      id: 'banker',
      label: "Banker's Safety",
      icon: <ShieldAlert className="w-5 h-5" />,
      badge: 'Module C',
      desc: 'Deadlock Avoidance & Vectors',
    },
    {
      id: 'memory',
      label: 'Memory Manager',
      icon: <HardDrive className="w-5 h-5" />,
      badge: 'Module D',
      desc: 'First, Best, Worst Fit & Frag',
    },
    {
      id: 'integrated',
      label: 'End-to-End Pipeline',
      icon: <Activity className="w-5 h-5 text-indigo-400" />,
      badge: 'Integrated',
      desc: 'Complete Cloud Pipeline Simulation',
    },
  ];

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div>
        {/* Brand Lockup */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Play className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              StreamOS
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Sim
              </span>
            </h1>
            <p className="text-xs text-slate-400">Cloud Video OS Visualizer</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            OS Modules & Pipeline
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-md shadow-indigo-900/30 font-medium'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`}>
                    {item.icon}
                  </span>
                  <div>
                    <div className="text-sm font-medium leading-tight">{item.label}</div>
                    <div className={`text-[11px] ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {item.desc}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info & Theory Docs Button */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60 space-y-3">
        <button
          onClick={onOpenDocs}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all text-xs font-medium flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>OS Concepts & Theory Guide</span>
        </button>

        <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5 font-mono">
          <span>Problem 7</span>
          <span>·</span>
          <span>College OS Mini-Project</span>
        </div>
      </div>
    </aside>
  );
};
