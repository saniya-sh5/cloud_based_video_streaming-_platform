import React, { useState, useMemo } from 'react';
import { 
  CpuProcess, 
  CpuAlgorithm, 
  CpuAlgorithmResult 
} from '../types';
import { 
  runFCFS, 
  runSJF, 
  runRoundRobin, 
  runPriority, 
  compareCpuAlgorithms 
} from '../algorithms/cpuScheduling';
import { GanttChart } from '../components/GanttChart';
import { 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw, 
  Cpu, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  BarChart3,
  Sliders,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export const INITIAL_CPU_PROCESSES: CpuProcess[] = [
  { id: 'P1', name: '4K Movie Transcode', arrivalTime: 0, burstTime: 8, priority: 2, remainingTime: 8, color: '#3b82f6' },
  { id: 'P2', name: 'Live Stream Segment', arrivalTime: 1, burstTime: 4, priority: 1, remainingTime: 4, color: '#8b5cf6' },
  { id: 'P3', name: 'Audio Decoder Stream', arrivalTime: 2, burstTime: 9, priority: 3, remainingTime: 9, color: '#ec4899' },
  { id: 'P4', name: 'Metadata Query', arrivalTime: 3, burstTime: 5, priority: 2, remainingTime: 5, color: '#06b6d4' },
  { id: 'P5', name: 'DRM Authentication', arrivalTime: 4, burstTime: 2, priority: 1, remainingTime: 2, color: '#10b981' },
];

const PRESET_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export const CpuSchedulingPage: React.FC = () => {
  const [processes, setProcesses] = useState<CpuProcess[]>(INITIAL_CPU_PROCESSES);
  const [algorithm, setAlgorithm] = useState<CpuAlgorithm>('RR');
  const [timeQuantum, setTimeQuantum] = useState<number>(2);
  const [preemptivePriority, setPreemptivePriority] = useState<boolean>(true);
  const [enableAging, setEnableAging] = useState<boolean>(true);
  
  // Step playhead state
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'scheduler' | 'comparison'>('scheduler');

  // New process input form
  const [newPid, setNewPid] = useState<string>('P6');
  const [newName, setNewName] = useState<string>('Subtitles Sync');
  const [newArrival, setNewArrival] = useState<number>(2);
  const [newBurst, setNewBurst] = useState<number>(4);
  const [newPriority, setNewPriority] = useState<number>(2);

  // Compute Active Algorithm Result
  const result: CpuAlgorithmResult = useMemo(() => {
    switch (algorithm) {
      case 'FCFS':
        return runFCFS(processes);
      case 'SJF':
        return runSJF(processes);
      case 'RR':
        return runRoundRobin(processes, timeQuantum);
      case 'PRIORITY_NP':
        return runPriority(processes, false, enableAging);
      case 'PRIORITY_P':
        return runPriority(processes, true, enableAging);
      default:
        return runRoundRobin(processes, timeQuantum);
    }
  }, [processes, algorithm, timeQuantum, enableAging]);

  // Compute Comparative Results
  const comparisonResults = useMemo(() => {
    return compareCpuAlgorithms(processes, timeQuantum);
  }, [processes, timeQuantum]);

  // Handle playback timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentPlaybackTime(prev => {
          if (prev >= result.totalTime) {
            setIsPlaying(false);
            return result.totalTime;
          }
          return prev + 1;
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPlaying, result.totalTime]);

  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPid.trim()) return;

    const proc: CpuProcess = {
      id: newPid.trim().toUpperCase(),
      name: newName.trim() || `Task ${newPid}`,
      arrivalTime: Math.max(0, newArrival),
      burstTime: Math.max(1, newBurst),
      priority: Math.max(1, newPriority),
      remainingTime: Math.max(1, newBurst),
      color: PRESET_COLORS[processes.length % PRESET_COLORS.length],
    };

    setProcesses(prev => [...prev, proc]);
    setNewPid(`P${processes.length + 2}`);
  };

  const handleDeleteProcess = (id: string) => {
    setProcesses(prev => prev.filter(p => p.id !== id));
  };

  const handleResetProcesses = () => {
    setProcesses(INITIAL_CPU_PROCESSES);
    setCurrentPlaybackTime(0);
    setIsPlaying(false);
  };

  // Find currently running process and ready queue at playback time
  const currentRunningSegment = result.gantt.find(
    g => currentPlaybackTime >= g.startTime && currentPlaybackTime < g.endTime
  );

  const readyQueueAtPlayback = useMemo(() => {
    return processes.filter(p => {
      // Arrived by currentPlaybackTime
      if (p.arrivalTime > currentPlaybackTime) return false;

      // Find if completed by currentPlaybackTime
      const resProc = result.processes.find(rp => rp.id === p.id);
      if (resProc && resProc.completionTime && resProc.completionTime <= currentPlaybackTime) {
        return false;
      }

      // If currently running, exclude from ready queue
      if (currentRunningSegment && currentRunningSegment.processId === p.id) {
        return false;
      }

      return true;
    });
  }, [processes, currentPlaybackTime, result, currentRunningSegment]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">CPU Scheduling Engine</h2>
            <p className="text-xs text-slate-400">Select algorithm and adjust quantum or priority parameters</p>
          </div>
        </div>

        {/* Algorithm Segmented Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { setAlgorithm('FCFS'); setCurrentPlaybackTime(0); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              algorithm === 'FCFS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            FCFS
          </button>
          <button
            onClick={() => { setAlgorithm('SJF'); setCurrentPlaybackTime(0); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              algorithm === 'SJF' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            SJF
          </button>
          <button
            onClick={() => { setAlgorithm('RR'); setCurrentPlaybackTime(0); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              algorithm === 'RR' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Round Robin
          </button>
          <button
            onClick={() => { 
              setAlgorithm(preemptivePriority ? 'PRIORITY_P' : 'PRIORITY_NP'); 
              setCurrentPlaybackTime(0); 
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              algorithm.startsWith('PRIORITY') ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Priority
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('scheduler')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors border ${
              activeTab === 'scheduler'
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Scheduler & Gantt
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors border flex items-center gap-1.5 ${
              activeTab === 'comparison'
                ? 'bg-indigo-900/40 text-indigo-300 border-indigo-700/50'
                : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Algorithm Comparison</span>
          </button>
        </div>
      </div>

      {/* Configuration Controls Bar */}
      {algorithm === 'RR' && (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-4 text-xs">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-white">Time Quantum (Q):</span>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map(q => (
              <button
                key={q}
                onClick={() => setTimeQuantum(q)}
                className={`w-7 h-7 rounded-lg font-mono font-bold transition-all ${
                  timeQuantum === q
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {q}
              </button>
            ))}
            <span className="text-slate-500">seconds per slice</span>
          </div>
        </div>
      )}

      {algorithm.startsWith('PRIORITY') && (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Priority Preemption Mode:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setPreemptivePriority(false); setAlgorithm('PRIORITY_NP'); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  !preemptivePriority ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Non-Preemptive
              </button>
              <button
                onClick={() => { setPreemptivePriority(true); setAlgorithm('PRIORITY_P'); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  preemptivePriority ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Preemptive
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={enableAging}
                onChange={e => setEnableAging(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium">Enable Aging (Starvation Prevention)</span>
            </label>
          </div>
        </div>
      )}

      {/* Main Tab Views */}
      {activeTab === 'scheduler' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Gantt Chart & Active Execution Telemetry */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gantt Chart Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{result.algorithmName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Animated CPU time slice allocation chart</p>
                </div>

                {/* Playback Step Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                    title={isPlaying ? 'Pause Simulation' : 'Play Timeline'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>
                  <button
                    onClick={() => setCurrentPlaybackTime(prev => Math.min(result.totalTime, prev + 1))}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono transition-colors"
                  >
                    Step +1s
                  </button>
                  <button
                    onClick={() => setCurrentPlaybackTime(0)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    title="Reset Timeline to t=0"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <GanttChart gantt={result.gantt} totalTime={result.totalTime} currentPlaybackTime={currentPlaybackTime} />

              {/* Ready Queue & Running State Snapshot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Currently Running */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center justify-between">
                    <span>CPU Core Status</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      t = {currentPlaybackTime}s
                    </span>
                  </div>
                  {currentRunningSegment ? (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-10 rounded-full"
                        style={{ backgroundColor: currentRunningSegment.color }}
                      />
                      <div>
                        <div className="font-bold text-white text-sm">
                          {currentRunningSegment.processId}: {currentRunningSegment.processName}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          Slot: {currentRunningSegment.startTime}s ➔ {currentRunningSegment.endTime}s
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 font-mono py-1">
                      CPU IDLE / No process running at t={currentPlaybackTime}
                    </div>
                  )}
                </div>

                {/* Ready Queue */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Ready Queue (Waiting for CPU)
                  </div>
                  {readyQueueAtPlayback.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {readyQueueAtPlayback.map(rq => (
                        <div
                          key={rq.id}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white flex items-center gap-1.5"
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rq.color }} />
                          <span>{rq.id}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 font-mono py-1">Ready queue is empty</div>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Summary Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400">Avg Waiting Time</div>
                <div className="text-xl font-extrabold text-indigo-400 font-mono">
                  {result.avgWaitingTime}s
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400">Avg Turnaround Time</div>
                <div className="text-xl font-extrabold text-purple-400 font-mono">
                  {result.avgTurnaroundTime}s
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400">Avg Response Time</div>
                <div className="text-xl font-extrabold text-cyan-400 font-mono">
                  {result.avgResponseTime}s
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400">CPU Utilization</div>
                <div className="text-xl font-extrabold text-emerald-400 font-mono">
                  {result.cpuUtilization}%
                </div>
              </div>
            </div>

            {/* Process Execution Results Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Calculated Metrics Table</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">PID</th>
                      <th className="py-2.5 px-3">Process Name</th>
                      <th className="py-2.5 px-3">Arrival</th>
                      <th className="py-2.5 px-3">Burst</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3 text-indigo-400">Completion</th>
                      <th className="py-2.5 px-3 text-purple-400">Turnaround</th>
                      <th className="py-2.5 px-3 text-cyan-400">Waiting</th>
                      <th className="py-2.5 px-3 text-emerald-400">Response</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {result.processes.map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-bold flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                          {p.id}
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-sans">{p.name}</td>
                        <td className="py-3 px-3">{p.arrivalTime}s</td>
                        <td className="py-3 px-3">{p.burstTime}s</td>
                        <td className="py-3 px-3 font-bold text-amber-400">{p.priority}</td>
                        <td className="py-3 px-3 font-bold text-indigo-400">{p.completionTime}s</td>
                        <td className="py-3 px-3 font-bold text-purple-400">{p.turnaroundTime}s</td>
                        <td className="py-3 px-3 font-bold text-cyan-400">{p.waitingTime}s</td>
                        <td className="py-3 px-3 font-bold text-emerald-400">{p.responseTime}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Aging Feature Explanation Card */}
            {enableAging && algorithm.startsWith('PRIORITY') && (
              <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 space-y-2">
                <div className="font-bold text-indigo-300 flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>Aging Feature Enabled (Starvation Prevention)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In pure Priority Scheduling, low-priority processes (e.g. metadata queries with Priority 4) can suffer from <strong>indefinite starvation</strong> if high-priority transcode jobs keep arriving. Aging dynamically boosts waiting processes' priority level over time (lowers priority number), ensuring every streaming task eventually receives CPU execution time.
                </p>
              </div>
            )}
          </div>

          {/* Right Col: Process Management Panel & Add Form */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Process Workload</h3>
                <button
                  onClick={handleResetProcesses}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
              </div>

              {/* Active Process List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {processes.map(p => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <div>
                        <div className="font-bold text-white">{p.id}: {p.name}</div>
                        <div className="text-[11px] text-slate-400 font-sans">
                          Arrival: {p.arrivalTime}s · Burst: {p.burstTime}s · Priority: {p.priority}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteProcess(p.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove Process"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Process Form */}
              <form onSubmit={handleAddProcess} className="pt-4 border-t border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Add Streaming Task
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Process ID</label>
                    <input
                      type="text"
                      value={newPid}
                      onChange={e => setNewPid(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Task Name</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Arrival Time (s)</label>
                    <input
                      type="number"
                      min="0"
                      value={newArrival}
                      onChange={e => setNewArrival(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Burst Time (s)</label>
                    <input
                      type="number"
                      min="1"
                      value={newBurst}
                      onChange={e => setNewBurst(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Priority (1 = Highest)</label>
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
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Process to Workload</span>
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
              <h3 className="text-base font-bold text-white">Algorithm Benchmark & Comparison</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluation of all CPU scheduling algorithms on the exact same process workload.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                  <th className="py-3 px-4">Algorithm</th>
                  <th className="py-3 px-4 text-indigo-400">Avg Waiting Time</th>
                  <th className="py-3 px-4 text-purple-400">Avg Turnaround Time</th>
                  <th className="py-3 px-4 text-cyan-400">Avg Response Time</th>
                  <th className="py-3 px-4 text-emerald-400">CPU Utilization</th>
                  <th className="py-3 px-4">Total Makespan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {comparisonResults.map(res => (
                  <tr key={res.algorithmName} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-white font-sans">{res.algorithmName}</td>
                    <td className="py-3.5 px-4 font-bold text-indigo-400">{res.avgWaitingTime}s</td>
                    <td className="py-3.5 px-4 font-bold text-purple-400">{res.avgTurnaroundTime}s</td>
                    <td className="py-3.5 px-4 font-bold text-cyan-400">{res.avgResponseTime}s</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">{res.cpuUtilization}%</td>
                    <td className="py-3.5 px-4 text-slate-300">{res.totalTime}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
