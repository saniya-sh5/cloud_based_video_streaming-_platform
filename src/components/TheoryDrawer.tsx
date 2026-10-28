import React from 'react';
import { X, BookOpen, Cpu, Layers, ShieldAlert, HardDrive, CheckCircle2 } from 'lucide-react';

interface TheoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TheoryDrawer: React.FC<TheoryDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
        <div>
          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">OS Concepts & Theory Guide</h3>
                <p className="text-xs text-slate-400">Problem 7: Cloud-Based Video Streaming OS</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="py-6 space-y-8 text-slate-300 text-sm">
            {/* Overview Card */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/50 space-y-2">
              <div className="font-semibold text-indigo-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Mini-Project Scope & OS Mapping</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                In a cloud video streaming platform (e.g. Netflix, YouTube, Twitch), streaming sessions compete for CPU time (transcoding), memory (segment caching), bounded buffer capacity (chunk streaming), and shared node resources (GPU accelerators, network sockets).
              </p>
            </div>

            {/* Module A */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-white border-b border-slate-800 pb-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <span>Module A — CPU Scheduling</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Determines the execution order of video tasks (fetching, decoding, encoding).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-300">FCFS (First-Come First-Served)</span>
                  <p className="text-slate-400">Non-preemptive. Simple FIFO queue. Convoy effect occurs when long transcoding jobs block short metadata queries.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-300">SJF (Shortest Job First)</span>
                  <p className="text-slate-400">Non-preemptive. Selects process with shortest burst time. Gives minimal average waiting time.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-300">Round Robin (RR)</span>
                  <p className="text-slate-400">Preemptive with time quantum Q. Fair time sharing for interactive video playback streams.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-300">Priority Scheduling & Aging</span>
                  <p className="text-slate-400">Executes highest priority stream tasks. Aging gradually increases priority of waiting tasks to prevent starvation.</p>
                </div>
              </div>

              {/* Formulas */}
              <div className="p-3 rounded-lg bg-slate-950/80 font-mono text-xs text-indigo-300 border border-slate-800 space-y-1">
                <div>Turnaround Time (TAT) = Completion Time - Arrival Time</div>
                <div>Waiting Time (WT) = Turnaround Time - Burst Time</div>
                <div>Response Time (RT) = First Execution Time - Arrival Time</div>
              </div>
            </section>

            {/* Module B */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-white border-b border-slate-800 pb-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <span>Module B — Producer–Consumer Video Buffer</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Models a bounded buffer storing H.264/AV1 video chunks before playback.
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-bold text-purple-300 mb-1">Semaphore Roles:</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono">
                    <li><strong className="text-white">mutex = 1:</strong> Binary semaphore enforcing mutual exclusion for buffer writes/reads.</li>
                    <li><strong className="text-white">empty = N:</strong> Counting semaphore tracking available empty buffer slots.</li>
                    <li><strong className="text-white">full = 0:</strong> Counting semaphore tracking populated video segment slots.</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-xs">
                  <span className="font-semibold text-white">OS Concept Note: </span>
                  Producer blocks when <code className="text-purple-300 font-mono">empty == 0</code> (buffer overflow protection). Consumer blocks when <code className="text-purple-300 font-mono">full == 0</code> (underflow / video stutter protection).
                </div>
              </div>
            </section>

            {/* Module C */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-white border-b border-slate-800 pb-2">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
                <span>Module C — Banker's Algorithm (Deadlock Avoidance)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ensures that admitting or granting a resource request (Transcoders, Storage Sockets, Network Slots) never leaves the cloud node in an unsafe deadlock state.
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="text-emerald-300 font-bold">Mathematical Model:</div>
                <div className="text-slate-300">Need[i][j] = Maximum[i][j] - Allocation[i][j]</div>
                <div className="text-slate-300">Work = Available vector</div>
                <div className="text-slate-400">Safety Check Loop: Find process i where Finish[i] == false AND Need[i] &lt;= Work. Reclaim Work = Work + Allocation[i].</div>
              </div>
            </section>

            {/* Module D */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-white border-b border-slate-800 pb-2">
                <HardDrive className="w-5 h-5 text-blue-400" />
                <span>Module D — Memory Management</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-bold text-blue-300">First Fit</div>
                  <div className="text-slate-400 text-[11px] mt-1">Allocates in first partition large enough. Fastest search.</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-bold text-blue-300">Best Fit</div>
                  <div className="text-slate-400 text-[11px] mt-1">Allocates smallest suitable partition. Minimizes wasted space per slot.</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-bold text-blue-300">Worst Fit</div>
                  <div className="text-slate-400 text-[11px] mt-1">Allocates largest partition. Leaves larger remaining fragments.</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div><strong className="text-white">Internal Fragmentation:</strong> Unused RAM inside an allocated fixed partition (<code className="font-mono text-blue-300">Partition Size - Requested Size</code>).</div>
                <div><strong className="text-white">External Fragmentation:</strong> Total free RAM is sufficient for request, but no single contiguous partition is large enough.</div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
