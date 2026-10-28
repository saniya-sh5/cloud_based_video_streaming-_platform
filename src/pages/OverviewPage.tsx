import React from 'react';
import { 
  Cpu, 
  Layers, 
  ShieldAlert, 
  HardDrive, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Radio, 
  Zap,
  Server
} from 'lucide-react';
import { NavigationTab } from '../types';

interface OverviewPageProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-8 border border-indigo-800/40 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30">
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Problem 7: Cloud-Based Video Streaming OS Architecture</span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            StreamOS Simulator
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            Simulate a high-concurrency cloud streaming infrastructure where active video sessions compete for CPU scheduling time, bounded segment buffers, shared hardware resources, and physical memory.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('integrated')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              <span>Launch Integrated Pipeline Simulation</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('cpu-scheduling')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 transition-all flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Explore CPU Scheduling</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* OS Modules Grid */}
      <div>
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" />
          <span>Core Operating System Modules</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Module A Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                  Module A
                </span>
                <h3 className="text-base font-bold text-white">CPU Scheduling</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                FCFS, SJF, Round Robin with configurable quantum, Priority Scheduling, and Aging. Includes Gantt chart & metrics comparison.
              </p>
            </div>
            <button
              onClick={() => onNavigate('cpu-scheduling')}
              className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center justify-between"
            >
              <span>Open Module A</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Module B Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-purple-500/50 transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-semibold">
                  Module B
                </span>
                <h3 className="text-base font-bold text-white">Video Buffer</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bounded buffer storing 1080p/4K video segments. Demonstrates producer/consumer blocking and mutex/empty/full semaphores.
              </p>
            </div>
            <button
              onClick={() => onNavigate('producer-consumer')}
              className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center justify-between"
            >
              <span>Open Module B</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Module C Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/50 transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Module C
                </span>
                <h3 className="text-base font-bold text-white">Banker's Safety</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deadlock avoidance engine. Calculates Need matrices, executes safety check sequences, and validates tentative resource allocations.
              </p>
            </div>
            <button
              onClick={() => onNavigate('banker')}
              className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center justify-between"
            >
              <span>Open Module C</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Module D Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
                  Module D
                </span>
                <h3 className="text-base font-bold text-white">Memory Manager</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Partition allocation strategies: First Fit, Best Fit, and Worst Fit. Visual memory maps, fragmentation metrics, and policy benchmarks.
              </p>
            </div>
            <button
              onClick={() => onNavigate('memory')}
              className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center justify-between"
            >
              <span>Open Module D</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Architecture Topology Flow */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Integrated Cloud Video Streaming Pipeline Topology</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              How streaming sessions move through the 4 OS subsystems.
            </p>
          </div>
          <button
            onClick={() => onNavigate('integrated')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>Live Interactive View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pipeline Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
            <div className="text-[10px] font-mono font-bold text-indigo-400 uppercase">Stage 1</div>
            <div className="text-xs font-bold text-white">Segment Generation</div>
            <div className="text-[11px] text-slate-400">Producer generates chunk (e.g. 1080p HEVC)</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
            <div className="text-[10px] font-mono font-bold text-purple-400 uppercase">Stage 2</div>
            <div className="text-xs font-bold text-white">Bounded Buffer</div>
            <div className="text-[11px] text-slate-400">Pushed to chunk buffer (bounded by empty/full semaphores)</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
            <div className="text-[10px] font-mono font-bold text-blue-400 uppercase">Stage 3</div>
            <div className="text-xs font-bold text-white">Memory Allocation</div>
            <div className="text-[11px] text-slate-400">Partition allocated via First/Best/Worst Fit</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
            <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Stage 4</div>
            <div className="text-xs font-bold text-white">Banker Safety</div>
            <div className="text-[11px] text-slate-400">Shared hardware checked for deadlock avoidance</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
            <div className="text-[10px] font-mono font-bold text-amber-400 uppercase">Stage 5</div>
            <div className="text-xs font-bold text-white">CPU Scheduling</div>
            <div className="text-[11px] text-slate-400">Dispatched to CPU ready queue and executed</div>
          </div>
        </div>
      </div>
    </div>
  );
};
