import React, { useState, useMemo } from 'react';
import { 
  ResourceType, 
  BankerProcess, 
  BankerResult, 
  ResourceRequest 
} from '../types';
import { 
  DEFAULT_RESOURCES, 
  DEFAULT_PROCESSES, 
  calculateNeedMatrix, 
  calculateAvailableVector, 
  runBankerSafetyAlgorithm, 
  handleResourceRequest 
} from '../algorithms/banker';
import { 
  ShieldAlert, 
  ShieldCheck, 
  RotateCcw, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Sliders, 
  Plus, 
  Trash2,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export const BankerPage: React.FC = () => {
  const [resources, setResources] = useState<ResourceType[]>(DEFAULT_RESOURCES);
  const [processes, setProcesses] = useState<BankerProcess[]>(DEFAULT_PROCESSES);
  
  // Request Modal State
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [selectedProcessId, setSelectedProcessId] = useState<string>('P1');
  const [requestVectorInput, setRequestVectorInput] = useState<number[]>([1, 0, 2]);
  const [requestFeedback, setRequestFeedback] = useState<{
    message: string;
    granted: boolean;
  } | null>(null);

  // Compute updated Need Matrix and Available Vector
  const processesWithNeed = useMemo(() => calculateNeedMatrix(processes), [processes]);
  const currentAvailableResources = useMemo(
    () => calculateAvailableVector(resources, processesWithNeed),
    [resources, processesWithNeed]
  );

  // Compute Safety Check Result
  const safetyResult: BankerResult = useMemo(
    () => runBankerSafetyAlgorithm(currentAvailableResources, processesWithNeed),
    [currentAvailableResources, processesWithNeed]
  );

  const handleCellChange = (
    procId: string,
    matrixType: 'allocation' | 'max',
    resIdx: number,
    value: number
  ) => {
    const val = Math.max(0, value);
    setProcesses(prev =>
      prev.map(p => {
        if (p.id !== procId) return p;
        const newVec = [...p[matrixType]];
        newVec[resIdx] = val;

        // If allocation changes, adjust max if needed
        let newMax = [...p.max];
        let newAlloc = [...p.allocation];
        if (matrixType === 'allocation') {
          newAlloc[resIdx] = val;
          if (val > newMax[resIdx]) newMax[resIdx] = val;
        } else {
          newMax[resIdx] = val;
          if (newAlloc[resIdx] > val) newAlloc[resIdx] = val;
        }

        return {
          ...p,
          allocation: newAlloc,
          max: newMax,
        };
      })
    );
  };

  const handleResourceTotalChange = (resId: string, totalVal: number) => {
    const val = Math.max(0, totalVal);
    setResources(prev =>
      prev.map(r => (r.id === resId ? { ...r, total: val } : r))
    );
  };

  const handlePresetUnsafeTest = () => {
    // Modify P1's request to create an UNSAFE state
    setProcesses(prev =>
      prev.map(p => {
        if (p.id === 'P1') {
          return {
            ...p,
            allocation: [3, 2, 2], // Requesting more than available
            max: [8, 5, 5],
          };
        }
        return p;
      })
    );
    setRequestFeedback({
      granted: false,
      message: 'Unsafe Test Scenario Loaded! Notice how Available resources drop and the safety algorithm detects potential deadlock.',
    });
  };

  const handleResetDefaults = () => {
    setResources(DEFAULT_RESOURCES);
    setProcesses(DEFAULT_PROCESSES);
    setRequestFeedback(null);
  };

  const handleExecuteRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const req: ResourceRequest = {
      processId: selectedProcessId,
      requestVector: requestVectorInput,
    };

    const res = handleResourceRequest(currentAvailableResources, processesWithNeed, req);
    setRequestFeedback({
      granted: res.granted,
      message: res.message,
    });

    if (res.granted) {
      setProcesses(res.updatedProcesses);
      setResources(res.updatedResources);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Controls Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Banker's Algorithm Simulator</h2>
            <p className="text-xs text-slate-400">Deadlock avoidance & resource request safety verification engine</p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Simulate Resource Request</span>
          </button>

          <button
            onClick={handlePresetUnsafeTest}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Test Unsafe Scenario</span>
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

      {/* Safety Status Alert Banner */}
      <div
        className={`p-6 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-4 ${
          safetyResult.isSafe
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-100 shadow-xl shadow-emerald-950/20'
            : 'bg-red-950/50 border-red-800/80 text-red-100 shadow-xl shadow-red-950/30'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl ${
              safetyResult.isSafe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {safetyResult.isSafe ? <ShieldCheck className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight">
                SYSTEM STATUS: {safetyResult.isSafe ? 'SAFE STATE' : 'UNSAFE STATE (DEADLOCK RISK)'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {safetyResult.reason}
            </p>
          </div>
        </div>

        {/* Safe Sequence Visual Pill */}
        {safetyResult.isSafe && (
          <div className="bg-slate-950/80 px-4 py-3 rounded-xl border border-emerald-700/50 font-mono text-xs space-y-1">
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold block">
              Safe Execution Sequence:
            </span>
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              {safetyResult.safeSequence.map((pid, idx) => (
                <React.Fragment key={pid}>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {pid}
                  </span>
                  {idx < safetyResult.safeSequence.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resource Vector Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resources.map((res, rIdx) => {
          const avail = currentAvailableResources[rIdx]?.available ?? 0;
          return (
            <div key={res.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>{res.id}: {res.name}</span>
                <span className="text-slate-500">({res.unit})</span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-white font-mono">{avail}</span>
                  <span className="text-xs text-slate-500 font-mono"> / {res.total} Total</span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-400">Total Pool:</label>
                  <input
                    type="number"
                    min="0"
                    value={res.total}
                    onChange={e => handleResourceTotalChange(res.id, Number(e.target.value))}
                    className="w-14 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Matrices Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Resource Allocation & Claim Matrices</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Edit Allocation or Maximum Claim cells directly. Need Matrix updates automatically (<code className="font-mono text-indigo-400">Need = Max - Allocation</code>).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Process</th>
                {/* Allocation Header */}
                <th className="py-3 px-3 text-indigo-400 bg-indigo-950/20" colSpan={resources.length}>
                  Allocation Matrix
                </th>
                {/* Max Header */}
                <th className="py-3 px-3 text-purple-400 bg-purple-950/20" colSpan={resources.length}>
                  Maximum Need Matrix
                </th>
                {/* Calculated Need Header */}
                <th className="py-3 px-3 text-emerald-400 bg-emerald-950/20" colSpan={resources.length}>
                  Need Matrix (Max - Alloc)
                </th>
              </tr>

              <tr className="border-b border-slate-800 text-[10px] text-slate-500">
                <th className="py-1 px-3">PID / Task</th>
                {resources.map(r => (
                  <th key={`alloc-h-${r.id}`} className="py-1 px-2 text-center text-indigo-300 bg-indigo-950/10">
                    {r.id}
                  </th>
                ))}
                {resources.map(r => (
                  <th key={`max-h-${r.id}`} className="py-1 px-2 text-center text-purple-300 bg-purple-950/10">
                    {r.id}
                  </th>
                ))}
                {resources.map(r => (
                  <th key={`need-h-${r.id}`} className="py-1 px-2 text-center text-emerald-300 bg-emerald-950/10">
                    {r.id}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {processesWithNeed.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold font-sans flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span>{p.id}: {p.name}</span>
                  </td>

                  {/* Allocation Inputs */}
                  {resources.map((_, rIdx) => (
                    <td key={`alloc-${p.id}-${rIdx}`} className="py-2 px-2 text-center bg-indigo-950/10">
                      <input
                        type="number"
                        min="0"
                        value={p.allocation[rIdx] || 0}
                        onChange={e => handleCellChange(p.id, 'allocation', rIdx, Number(e.target.value))}
                        className="w-12 px-1.5 py-1 text-center rounded bg-slate-950 border border-slate-800 text-indigo-300 font-bold focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                  ))}

                  {/* Max Inputs */}
                  {resources.map((_, rIdx) => (
                    <td key={`max-${p.id}-${rIdx}`} className="py-2 px-2 text-center bg-purple-950/10">
                      <input
                        type="number"
                        min="0"
                        value={p.max[rIdx] || 0}
                        onChange={e => handleCellChange(p.id, 'max', rIdx, Number(e.target.value))}
                        className="w-12 px-1.5 py-1 text-center rounded bg-slate-950 border border-slate-800 text-purple-300 font-bold focus:outline-none focus:border-purple-500"
                      />
                    </td>
                  ))}

                  {/* Need Matrix (Readonly Calculated) */}
                  {resources.map((_, rIdx) => (
                    <td key={`need-${p.id}-${rIdx}`} className="py-2 px-2 text-center bg-emerald-950/10 font-bold text-emerald-400">
                      {p.need[rIdx]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Check Step-by-Step Trace Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Play className="w-4 h-4 text-emerald-400" />
          <span>Safety Algorithm Execution Trace</span>
        </h3>

        <div className="space-y-2">
          {safetyResult.steps.map(step => (
            <div
              key={step.stepIndex}
              className={`p-3.5 rounded-xl border font-mono text-xs ${
                step.canFinish
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                  : 'bg-red-950/30 border-red-800/50 text-red-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-white mb-1">
                <span>Step {step.stepIndex}: {step.processId} ({step.processName})</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  step.canFinish ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {step.canFinish ? 'PASSED' : 'BLOCKED'}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 leading-relaxed">
                {step.reason}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>Simulate Process Resource Request</span>
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteRequest} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Process:</label>
                <select
                  value={selectedProcessId}
                  onChange={e => setSelectedProcessId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                >
                  {processes.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.id}: {p.name} (Need: [{p.need.join(', ')}])
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Request Vector [R0, R1, R2]:</label>
                <div className="grid grid-cols-3 gap-3">
                  {resources.map((r, rIdx) => (
                    <div key={r.id}>
                      <span className="text-[11px] text-slate-400 font-mono block mb-1">{r.id} ({r.name}):</span>
                      <input
                        type="number"
                        min="0"
                        value={requestVectorInput[rIdx] ?? 0}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setRequestVectorInput(prev => {
                            const arr = [...prev];
                            arr[rIdx] = val;
                            return arr;
                          });
                        }}
                        className="w-full px-3 py-2 text-center rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {requestFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono ${
                    requestFeedback.granted
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                      : 'bg-red-950/40 border-red-800/60 text-red-200'
                  }`}
                >
                  {requestFeedback.message}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/20"
                >
                  Submit & Validate Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
