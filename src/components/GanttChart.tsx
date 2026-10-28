import React from 'react';
import { GanttSegment } from '../types';

interface GanttChartProps {
  gantt: GanttSegment[];
  totalTime: number;
  currentPlaybackTime?: number;
}

export const GanttChart: React.FC<GanttChartProps> = ({ gantt, totalTime, currentPlaybackTime }) => {
  if (gantt.length === 0 || totalTime === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
        No CPU execution timeline available. Add processes and run scheduler.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>Gantt Chart Execution Timeline (t = 0 to t = {totalTime})</span>
        {currentPlaybackTime !== undefined && (
          <span className="text-indigo-400 font-semibold">Active Playhead: t = {currentPlaybackTime}</span>
        )}
      </div>

      {/* Gantt Bar */}
      <div className="relative w-full h-16 bg-slate-950 rounded-xl p-1.5 border border-slate-800 flex overflow-x-auto">
        {gantt.map((segment, idx) => {
          const duration = segment.endTime - segment.startTime;
          const widthPercent = (duration / totalTime) * 100;
          const isCurrentActive =
            currentPlaybackTime !== undefined &&
            currentPlaybackTime >= segment.startTime &&
            currentPlaybackTime < segment.endTime;

          return (
            <div
              key={`${segment.processId}-${idx}`}
              style={{
                width: `${widthPercent}%`,
                minWidth: '40px',
              }}
              className="relative h-full flex flex-col justify-between p-2 rounded-lg transition-all duration-300 group hover:z-10 hover:scale-[1.02]"
            >
              <div
                className={`absolute inset-0 rounded-lg opacity-90 transition-opacity ${
                  segment.isIdle ? 'bg-slate-800 border border-slate-700/60' : ''
                }`}
                style={{
                  backgroundColor: segment.isIdle ? undefined : segment.color,
                }}
              />

              {/* Highlight border if active playhead */}
              {isCurrentActive && (
                <div className="absolute inset-0 rounded-lg border-2 border-white animate-pulse" />
              )}

              {/* Content */}
              <div className="relative z-10 flex items-center justify-between text-white font-mono text-xs font-bold truncate px-1">
                <span>{segment.processId}</span>
                <span className="text-[10px] opacity-75 font-normal">
                  {duration}s
                </span>
              </div>

              <div className="relative z-10 text-[10px] text-white/80 font-mono flex justify-between px-1">
                <span>{segment.startTime}</span>
                <span>{segment.endTime}</span>
              </div>

              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 w-48 p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 shadow-xl pointer-events-none">
                <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  {segment.processName} ({segment.processId})
                </div>
                <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                  <div>Start Time: {segment.startTime}s</div>
                  <div>End Time: {segment.endTime}s</div>
                  <div>Duration (Burst): {duration}s</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tick Marks Ruler */}
      <div className="flex justify-between text-[11px] font-mono text-slate-500 px-1">
        <span>t = 0</span>
        <span>t = {Math.round(totalTime / 2)}</span>
        <span>t = {totalTime}</span>
      </div>
    </div>
  );
};
