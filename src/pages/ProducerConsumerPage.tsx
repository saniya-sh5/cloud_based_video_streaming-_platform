import React, { useState, useEffect } from 'react';
import { VideoSegment, SemaphoreState, LogEntry } from '../types';
import { 
  createInitialBufferState, 
  produceSegmentToBuffer, 
  consumeSegmentFromBuffer 
} from '../algorithms/producerConsumer';
import { 
  Layers, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus, 
  Lock, 
  Unlock, 
  AlertOctagon, 
  CheckCircle2, 
  Video, 
  Tv, 
  Radio, 
  Gauge, 
  Activity,
  Sliders
} from 'lucide-react';

export const ProducerConsumerPage: React.FC = () => {
  const [capacity, setCapacity] = useState<number>(6);
  const [{ buffer, semaphores, logs }, setBufferState] = useState(() =>
    createInitialBufferState(6)
  );
  const [segmentCounter, setSegmentCounter] = useState<number>(1);
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);
  const [autoSpeedMs, setAutoSpeedMs] = useState<number>(1200);

  // Auto-run simulation interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoRunning) {
      timer = setInterval(() => {
        // Randomly produce or consume
        const action = Math.random() > 0.4 ? 'produce' : 'consume';
        if (action === 'produce') {
          handleProduce();
        } else {
          handleConsume();
        }
      }, autoSpeedMs);
    }
    return () => clearInterval(timer);
  }, [isAutoRunning, autoSpeedMs, buffer, semaphores, segmentCounter]);

  const handleProduce = () => {
    setSegmentCounter(prevCounter => {
      const res = produceSegmentToBuffer(buffer, semaphores, prevCounter);
      setBufferState(prev => ({
        buffer: res.newBuffer,
        semaphores: res.newSemaphores,
        logs: [res.log, ...prev.logs].slice(0, 50),
      }));
      return res.success ? prevCounter + 1 : prevCounter;
    });
  };

  const handleConsume = () => {
    const res = consumeSegmentFromBuffer(buffer, semaphores);
    setBufferState(prev => ({
      buffer: res.newBuffer,
      semaphores: res.newSemaphores,
      logs: [res.log, ...prev.logs].slice(0, 50),
    }));
  };

  const handleReset = () => {
    setIsAutoRunning(false);
    setSegmentCounter(1);
    setBufferState(createInitialBufferState(capacity));
  };

  const handleCapacityChange = (newCap: number) => {
    const validCap = Math.max(3, Math.min(12, newCap));
    setCapacity(validCap);
    setIsAutoRunning(false);
    setBufferState(createInitialBufferState(validCap));
  };

  const occupancyPercent = Math.round((buffer.length / semaphores.capacity) * 100);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Bounded Video Buffer Visualizer</h2>
            <p className="text-xs text-slate-400">Model chunk producer ingestion & video player consumption with semaphores</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleProduce}
            disabled={semaphores.empty <= 0}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 ${
              semaphores.empty > 0
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Produce Segment</span>
          </button>

          <button
            onClick={handleConsume}
            disabled={semaphores.full <= 0}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 ${
              semaphores.full > 0
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Minus className="w-4 h-4" />
            <span>Consume Segment</span>
          </button>

          <button
            onClick={() => setIsAutoRunning(!isAutoRunning)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              isAutoRunning
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isAutoRunning ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
            <span>{isAutoRunning ? 'Pause Auto-Run' : 'Auto-Run Stream'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Reset Buffer State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Semaphore & Buffer Capacity Tuner Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Mutex Semaphore */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-400 font-mono">Binary Semaphore</span>
            <div className="font-bold text-white text-sm">mutex</div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs flex items-center gap-1.5 ${
            semaphores.mutex === 1
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {semaphores.mutex === 1 ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>mutex = {semaphores.mutex}</span>
          </div>
        </div>

        {/* Empty Semaphore */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-400 font-mono">Counting Semaphore</span>
            <div className="font-bold text-white text-sm">empty slots</div>
          </div>
          <div className="text-xl font-extrabold text-purple-400 font-mono">
            {semaphores.empty}
          </div>
        </div>

        {/* Full Semaphore */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-400 font-mono">Counting Semaphore</span>
            <div className="font-bold text-white text-sm">full slots</div>
          </div>
          <div className="text-xl font-extrabold text-indigo-400 font-mono">
            {semaphores.full}
          </div>
        </div>

        {/* Capacity Tuner */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-400 font-mono">Buffer Capacity</span>
            <div className="font-bold text-white text-sm">{capacity} Slots</div>
          </div>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[4, 6, 8, 10].map(c => (
              <button
                key={c}
                onClick={() => handleCapacityChange(c)}
                className={`w-6 h-6 text-xs font-mono font-bold rounded transition-colors ${
                  capacity === c ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Bounded Buffer Visualization Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Bounded Buffer Video Queue</h3>
              <span className="text-xs font-mono text-purple-400 font-semibold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                {buffer.length} / {capacity} Segments ({occupancyPercent}%)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Producer (Encoder) appends chunks at tail; Consumer (Video Player) retrieves chunks from head.
            </p>
          </div>

          {/* Speed slider for auto run */}
          {isAutoRunning && (
            <div className="flex items-center gap-3 text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-300">Auto Speed:</span>
              <input
                type="range"
                min="400"
                max="2500"
                step="200"
                value={autoSpeedMs}
                onChange={e => setAutoSpeedMs(Number(e.target.value))}
                className="w-24 accent-purple-500 cursor-pointer"
              />
              <span className="font-mono text-slate-400 text-[11px]">{autoSpeedMs}ms</span>
            </div>
          )}
        </div>

        {/* Occupancy Progress Gauge Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 flex">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0% (Empty: Consumer Blocks)</span>
            <span>50% Occupancy</span>
            <span>100% (Full: Producer Blocks)</span>
          </div>
        </div>

        {/* Buffer Slot Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pt-2">
          {Array.from({ length: capacity }).map((_, slotIdx) => {
            const segment = buffer[slotIdx];
            const isHead = slotIdx === 0 && segment;
            const isTail = slotIdx === buffer.length - 1 && segment;

            return (
              <div
                key={slotIdx}
                className={`relative min-h-[140px] rounded-xl p-4 transition-all duration-300 border flex flex-col justify-between ${
                  segment
                    ? 'bg-slate-950/90 border-slate-700/80 shadow-lg shadow-purple-950/20'
                    : 'bg-slate-950/40 border-dashed border-slate-800'
                }`}
              >
                {/* Slot Number Label */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                    Slot #{slotIdx + 1}
                  </span>
                  {isHead && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      HEAD (Consumer)
                    </span>
                  )}
                  {isTail && !isHead && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      TAIL (Producer)
                    </span>
                  )}
                </div>

                {segment ? (
                  <div className="space-y-2 my-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="font-mono font-bold text-white text-xs truncate">
                        {segment.id}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 font-medium truncate">
                      {segment.title}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {segment.resolution}
                      </span>
                      <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {segment.codec}
                      </span>
                      <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">
                        {segment.sizeMb}MB
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="my-auto text-center py-4 text-slate-600 text-xs font-mono">
                    Empty Slot
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Log Console & Concept Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Log Console */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Semaphore & Buffer Event History</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">{logs.length} events logged</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-xs pr-1">
            {logs.map(log => (
              <div
                key={log.id}
                className={`p-3 rounded-xl border flex items-start gap-3 ${
                  log.type === 'producer'
                    ? 'bg-purple-950/20 border-purple-800/40 text-purple-200'
                    : log.type === 'consumer'
                    ? 'bg-indigo-950/20 border-indigo-800/40 text-indigo-200'
                    : log.type === 'blocked'
                    ? 'bg-red-950/30 border-red-800/50 text-red-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <span className="text-[10px] text-slate-500 shrink-0 mt-0.5">{log.timestamp}</span>
                <div className="flex-1 space-y-0.5">
                  <div className="leading-relaxed">{log.message}</div>
                </div>
                {log.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 shrink-0">
                    {log.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Operating System Theory Notes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>OS Semaphores vs Simulated Threads</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              In real operating systems (POSIX / Linux kernel), semaphores are atomic integer primitives maintained by kernel system calls (<code className="font-mono text-purple-300">sem_wait</code> and <code className="font-mono text-purple-300">sem_post</code>) to block and wake kernel threads without CPU busy-waiting.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-semibold text-white">Semaphore Definitions:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px]">
                <li><strong className="text-purple-300">mutex (1):</strong> Prevents race conditions during buffer array modifications.</li>
                <li><strong className="text-purple-300">empty (N):</strong> Blocks producer when 0 slots remain (prevents buffer overflow).</li>
                <li><strong className="text-purple-300">full (0):</strong> Blocks consumer when 0 chunks remain (prevents buffer underflow / stutter).</li>
              </ul>
            </div>

            <p className="text-slate-400">
              In this visualizer, JavaScript event loop timers simulate concurrent Producer (Video Ingestion) and Consumer (Player Decoder) threads while maintaining strict semaphore invariants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
