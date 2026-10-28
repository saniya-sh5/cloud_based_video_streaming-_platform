import React, { useState, useEffect } from 'react';
import { 
  IntegratedSessionTask, 
  IntegratedState 
} from '../types';
import { 
  createInitialIntegratedState, 
  stepIntegratedPipeline 
} from '../algorithms/integrationEngine';
import { 
  Activity, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Cpu, 
  Layers, 
  ShieldAlert, 
  HardDrive, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertOctagon,
  Radio,
  Sliders
} from 'lucide-react';

export const IntegratedPipelinePage: React.FC = () => {
  const [pipelineState, setPipelineState] = useState<IntegratedState>(createInitialIntegratedState);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [tickSpeedMs, setTickSpeedMs] = useState<number>(1000);

  // New task form state
  const [newSessionName, setNewSessionName] = useState<string>('S6: 8K HDR Stream Chunk');
  const [newSegSize, setNewSegSize] = useState<number>(35);
  const [newRam, setNewRam] = useState<number>(128);
  const [newCpuBurst, setNewCpuBurst] = useState<number>(5);
  const [newPriority, setNewPriority] = useState<number>(1);

  // Auto-run simulation ticker
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setPipelineState((prev: IntegratedState) => stepIntegratedPipeline(prev));
      }, tickSpeedMs);
    }
    return () => clearInterval(timer);
  }, [isRunning, tickSpeedMs]);

  const handleStep = () => {
    setPipelineState((prev: IntegratedState) => stepIntegratedPipeline(prev));
  };

  const handleReset = () => {
    setIsRunning(false);
    setPipelineState(createInitialIntegratedState());
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `S${pipelineState.tasks.length + 1}`;
    const newTask: IntegratedSessionTask = {
      id: newId,
      sessionName: newSessionName.trim() || `Session ${newId}`,
      type: 'TRANSCODE',
      stage: 'PRODUCED',
      segmentSizeMb: newSegSize,
      memoryMb: newRam,
      resourcesNeeded: [1, 1, 1],
      cpuBurst: newCpuBurst,
      cpuRemaining: newCpuBurst,
      priority: newPriority,
      color: '#f59e0b',
      logs: ['Task added to streaming pipeline.'],
    };

    setPipelineState((prev: IntegratedState) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
      logs: [`[T=${prev.cpuTime}] Added session task ${newId}: ${newTask.sessionName}`, ...prev.logs],
    }));
  };

  // Helper stage color badges
  const getStageBadge = (stage: IntegratedSessionTask['stage']) => {
    switch (stage) {
      case 'PRODUCED':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'BUFFERED':
        return 'bg-purple-500/30 text-purple-200 border-purple-400/40';
      case 'WAITING_MEM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'WAITING_RES':
        return 'bg-amber-500/30 text-amber-200 border-amber-400/40';
      case 'READY_CPU':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'RUNNING_CPU':
        return 'bg-indigo-600 text-white font-bold animate-pulse border-indigo-400';
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'BLOCKED':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Activity className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>End-to-End Cloud Video Streaming Pipeline</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                Tick T = {pipelineState.cpuTime}s
              </span>
            </h2>
            <p className="text-xs text-slate-400">Unified pipeline connecting Ingestion Buffer ➔ Memory ➔ Banker Safety ➔ CPU Ready ➔ Execution</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleStep}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <span>Step +1 Tick</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isRunning ? 'Pause Engine' : 'Auto-Run Pipeline'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Reset Pipeline State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Speed Slider */}
      {isRunning && (
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">Pipeline Tick Speed:</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="300"
              max="2000"
              step="100"
              value={tickSpeedMs}
              onChange={e => setTickSpeedMs(Number(e.target.value))}
              className="w-48 accent-indigo-500 cursor-pointer"
            />
            <span className="font-mono text-indigo-300 font-bold w-16">{tickSpeedMs}ms</span>
          </div>
        </div>
      )}

      {/* Subsystem Telemetry Live Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Buffer Gauge */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-purple-400">
              <Layers className="w-4 h-4" /> Bounded Buffer
            </span>
            <span>{pipelineState.bufferSemaphores.full} / {pipelineState.bufferSemaphores.capacity}</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-purple-500 h-full transition-all duration-300"
              style={{
                width: `${(pipelineState.bufferSemaphores.full / pipelineState.bufferSemaphores.capacity) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Memory Gauge */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-blue-400">
              <HardDrive className="w-4 h-4" /> Memory Partitions
            </span>
            <span>
              {pipelineState.memoryPartitions.filter(m => !m.isFree).length} / {pipelineState.memoryPartitions.length} Occupied
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{
                width: `${
                  (pipelineState.memoryPartitions.filter(m => !m.isFree).length / pipelineState.memoryPartitions.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Banker Resources Gauge */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldAlert className="w-4 h-4" /> Banker Pool
            </span>
            <span>
              R0: {pipelineState.resources[0].available}/{pipelineState.resources[0].total} Avail
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{
                width: `${(pipelineState.resources[0].available / pipelineState.resources[0].total) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* CPU Core Active Status */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Cpu className="w-4 h-4" /> CPU Core
            </span>
            <span className="text-white font-bold">{pipelineState.activeCpuTaskId || 'IDLE'}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono truncate">
            {pipelineState.activeCpuTaskId
              ? `Quantum remaining: ${pipelineState.cpuQuantumRemaining}s`
              : 'CPU Core ready for dispatch'}
          </div>
        </div>
      </div>

      {/* Main Task Pipeline Flow Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Active Session Tasks State Machine</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Watch session tasks navigate through all 4 OS subsystems. Tasks block automatically if resources or memory are unavailable.
            </p>
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelineState.tasks.map((task: IntegratedSessionTask) => (
            <div
              key={task.id}
              className={`p-5 rounded-2xl border transition-all duration-300 space-y-3 ${
                task.stage === 'RUNNING_CPU'
                  ? 'bg-slate-950 border-indigo-500/80 ring-2 ring-indigo-500/20 shadow-xl shadow-indigo-950/30'
                  : task.stage === 'COMPLETED'
                  ? 'bg-slate-950/60 border-emerald-900/50 opacity-80'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: task.color }} />
                  <span className="font-mono font-bold text-white text-sm">{task.id}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${getStageBadge(task.stage)}`}>
                  {task.stage.replace('_', ' ')}
                </span>
              </div>

              {/* Title */}
              <div className="font-semibold text-slate-200 text-xs truncate">
                {task.sessionName}
              </div>

              {/* Requirements Specs */}
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[9px] text-slate-500 block">RAM</span>
                  <span className="text-white font-bold">{task.memoryMb}MB</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Burst</span>
                  <span className="text-white font-bold">{task.cpuRemaining}/{task.cpuBurst}s</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Priority</span>
                  <span className="text-amber-400 font-bold">{task.priority}</span>
                </div>
              </div>

              {/* Blocked Reason Callout */}
              {task.blockReason && (
                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-[11px] font-mono leading-tight">
                  ⚠️ {task.blockReason}
                </div>
              )}

              {/* Latest Task Event Log */}
              {task.logs.length > 0 && (
                <div className="text-[10px] text-slate-500 font-mono truncate border-t border-slate-800/80 pt-2">
                  {task.logs[0]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Add Custom Task Form & Global Log Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Session Task Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Inject Streaming Task</h3>

          <form onSubmit={handleAddTask} className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Session Task Name</label>
              <input
                type="text"
                value={newSessionName}
                onChange={e => setNewSessionName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">RAM (MB)</label>
                <input
                  type="number"
                  min="16"
                  value={newRam}
                  onChange={e => setNewRam(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">CPU Burst (s)</label>
                <input
                  type="number"
                  min="1"
                  value={newCpuBurst}
                  onChange={e => setNewCpuBurst(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-mono">Priority (1 = Highest)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newPriority}
                onChange={e => setNewPriority(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Inject into Pipeline</span>
            </button>
          </form>
        </div>

        {/* System Timeline Event History */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Pipeline Event Log</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">{pipelineState.logs.length} entries</span>
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto font-mono text-xs pr-1">
            {pipelineState.logs.map((log: string, idx: number) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed"
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
