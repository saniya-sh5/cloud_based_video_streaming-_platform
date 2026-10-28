import React, { useState, useMemo } from 'react';
import { 
  MemoryPartition, 
  MemoryProcessRequest, 
  MemoryPolicy, 
  MemoryAllocationResult 
} from '../types';
import { 
  DEFAULT_PARTITIONS, 
  DEFAULT_MEMORY_PROCESSES, 
  runMemoryAllocation, 
  compareMemoryPolicies 
} from '../algorithms/memoryManagement';
import { 
  HardDrive, 
  RotateCcw, 
  Plus, 
  Trash2, 
  BarChart3, 
  Sliders, 
  AlertCircle, 
  CheckCircle2,
  PieChart,
  Layers
} from 'lucide-react';

const PRESET_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#6366f1'];

export const MemoryPage: React.FC = () => {
  const [partitions, setPartitions] = useState<MemoryPartition[]>(DEFAULT_PARTITIONS);
  const [processes, setProcesses] = useState<MemoryProcessRequest[]>(DEFAULT_MEMORY_PROCESSES);
  const [policy, setPolicy] = useState<MemoryPolicy>('BEST_FIT');
  const [activeTab, setActiveTab] = useState<'simulator' | 'comparison'>('simulator');

  // Input forms
  const [newPartSize, setNewPartSize] = useState<number>(128);
  const [newProcName, setNewProcName] = useState<string>('DRM Key Cache');
  const [newProcSize, setNewProcSize] = useState<number>(90);

  // Compute Allocation Result for active policy
  const activeResult: MemoryAllocationResult = useMemo(
    () => runMemoryAllocation(partitions, processes, policy),
    [partitions, processes, policy]
  );

  // Compute Benchmark Comparison across all 3 policies
  const comparisonResults = useMemo(
    () => compareMemoryPolicies(partitions, processes),
    [partitions, processes]
  );

  const handleAddPartition = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPartSize <= 0) return;

    const totalCurrentAddr = partitions.reduce((sum, p) => sum + p.size, 0);
    const newPart: MemoryPartition = {
      id: `M${partitions.length + 1}`,
      startAddress: totalCurrentAddr,
      size: newPartSize,
      isFree: true,
    };

    setPartitions(prev => [...prev, newPart]);
    setNewPartSize(128);
  };

  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProcSize <= 0) return;

    const newProc: MemoryProcessRequest = {
      id: `P${processes.length + 1}`,
      name: newProcName.trim() || `Process P${processes.length + 1}`,
      requestedSize: newProcSize,
      color: PRESET_COLORS[processes.length % PRESET_COLORS.length],
    };

    setProcesses(prev => [...prev, newProc]);
    setNewProcSize(100);
  };

  const handleDeleteProcess = (id: string) => {
    setProcesses(prev => prev.filter(p => p.id !== id));
  };

  const handleDeletePartition = (id: string) => {
    setPartitions(prev => prev.filter(p => p.id !== id));
  };

  const handleResetDefaults = () => {
    setPartitions(DEFAULT_PARTITIONS);
    setProcesses(DEFAULT_MEMORY_PROCESSES);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Controls Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Memory Management Engine</h2>
            <p className="text-xs text-slate-400">Partition allocation strategy visualizer (First, Best, Worst Fit)</p>
          </div>
        </div>

        {/* Policy Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setPolicy('FIRST_FIT')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              policy === 'FIRST_FIT' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            First Fit
          </button>
          <button
            onClick={() => setPolicy('BEST_FIT')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              policy === 'BEST_FIT' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Best Fit
          </button>
          <button
            onClick={() => setPolicy('WORST_FIT')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              policy === 'WORST_FIT' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Worst Fit
          </button>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors border ${
              activeTab === 'simulator'
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Memory Map
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors border flex items-center gap-1.5 ${
              activeTab === 'comparison'
                ? 'bg-blue-900/40 text-blue-300 border-blue-700/50'
                : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Policy Comparison</span>
          </button>
          <button
            onClick={handleResetDefaults}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Reset Default Example"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeTab === 'simulator' ? (
        <div className="space-y-8">
          {/* Visual Memory Map Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Physical Memory Allocation Map</span>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Policy: {policy.replace('_', ' ')}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Total Capacity: {activeResult.totalMemory} MB · Used: {activeResult.usedMemory} MB ({activeResult.utilizationPercentage}%) · Free: {activeResult.freeMemory} MB
                </p>
              </div>
            </div>

            {/* Horizontal Partition Bar */}
            <div className="relative w-full h-20 bg-slate-950 rounded-xl p-2 border border-slate-800 flex gap-1.5 overflow-x-auto">
              {activeResult.partitions.map(part => {
                const widthPercent = (part.size / activeResult.totalMemory) * 100;
                return (
                  <div
                    key={part.id}
                    style={{ width: `${widthPercent}%`, minWidth: '80px' }}
                    className={`relative h-full rounded-lg p-2.5 transition-all flex flex-col justify-between border ${
                      part.isFree
                        ? 'bg-slate-900/60 border-dashed border-slate-700 text-slate-400'
                        : 'bg-slate-900 border-slate-700/80 shadow-md'
                    }`}
                  >
                    {!part.isFree && part.color && (
                      <div
                        className="absolute inset-0 rounded-lg opacity-25 pointer-events-none"
                        style={{ backgroundColor: part.color }}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-between font-mono text-xs font-bold">
                      <span className="text-white">{part.id}</span>
                      <span className="text-[10px] text-slate-400">{part.size} MB</span>
                    </div>

                    {!part.isFree ? (
                      <div className="relative z-10 space-y-0.5">
                        <div className="font-bold text-xs truncate" style={{ color: part.color }}>
                          {part.allocatedProcessId}: {part.allocatedProcessName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Req: {part.requestedSize}MB (Wasted: {part.internalFragmentation}MB)
                        </div>
                      </div>
                    ) : (
                      <div className="relative z-10 text-[11px] text-slate-500 font-mono italic">
                        FREE
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Total Free RAM</div>
              <div className="text-xl font-extrabold text-blue-400 font-mono">
                {activeResult.freeMemory} MB
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Memory Utilization</div>
              <div className="text-xl font-extrabold text-emerald-400 font-mono">
                {activeResult.utilizationPercentage}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Internal Fragmentation</div>
              <div className="text-xl font-extrabold text-amber-400 font-mono">
                {activeResult.totalInternalFragmentation} MB
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Failed Allocations</div>
              <div className="text-xl font-extrabold text-red-400 font-mono">
                {activeResult.failedProcesses.length} Tasks
              </div>
            </div>
          </div>

          {/* Allocation Failures Callout if any */}
          {activeResult.failedProcesses.length > 0 && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-mono space-y-1">
              <div className="font-bold text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>Memory Allocation Failures Detected!</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                The following processes failed allocation under {policy.replace('_', ' ')}: {' '}
                <strong>{activeResult.failedProcesses.map(p => `${p.id} (${p.requestedSize}MB)`).join(', ')}</strong>.
                Total External Fragmentation: {activeResult.totalExternalFragmentation} MB.
              </p>
            </div>
          )}

          {/* Management Panels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Partitions Manager */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Memory Partitions</h3>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {partitions.map(part => (
                  <div
                    key={part.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="font-bold text-white">{part.id} · Size: {part.size} MB</div>
                      <div className="text-[11px] text-slate-400">Address Range: {part.startAddress} ➔ {part.startAddress + part.size}</div>
                    </div>

                    <button
                      onClick={() => handleDeletePartition(part.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Partition Form */}
              <form onSubmit={handleAddPartition} className="pt-3 border-t border-slate-800 flex items-center gap-3">
                <input
                  type="number"
                  min="16"
                  placeholder="Partition Size (MB)"
                  value={newPartSize}
                  onChange={e => setNewPartSize(Number(e.target.value))}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Partition</span>
                </button>
              </form>
            </div>

            {/* Processes Workload Manager */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Memory Allocation Requests</h3>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {processes.map(p => {
                  const isAllocated = activeResult.allocatedProcesses.some(ap => ap.id === p.id);
                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <div>
                          <div className="font-bold text-white">{p.id}: {p.name}</div>
                          <div className="text-[11px] text-slate-400">Requested: {p.requestedSize} MB</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isAllocated
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {isAllocated ? 'ALLOCATED' : 'FAILED'}
                        </span>

                        <button
                          onClick={() => handleDeleteProcess(p.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Process Form */}
              <form onSubmit={handleAddProcess} className="pt-3 border-t border-slate-800 flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Task Name"
                  value={newProcName}
                  onChange={e => setNewProcName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Size (MB)"
                  value={newProcSize}
                  onChange={e => setNewProcSize(Number(e.target.value))}
                  className="w-24 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Request RAM</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Comparison Tab */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Placement Policy Side-by-Side Comparison</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluation of First Fit vs Best Fit vs Worst Fit on identical process requests.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['FIRST_FIT', 'BEST_FIT', 'WORST_FIT'] as MemoryPolicy[]).map(pol => {
              const res = comparisonResults[pol];
              return (
                <div key={pol} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{pol.replace('_', ' ')}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{res.utilizationPercentage}% Utilization</span>
                  </div>

                  <div className="space-y-1.5 font-mono text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span>Used RAM:</span>
                      <span className="text-white font-bold">{res.usedMemory} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Internal Fragmentation:</span>
                      <span className="text-amber-400 font-bold">{res.totalInternalFragmentation} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Allocated Tasks:</span>
                      <span className="text-emerald-400 font-bold">{res.allocatedProcesses.length} / {processes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed Tasks:</span>
                      <span className="text-red-400 font-bold">{res.failedProcesses.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
