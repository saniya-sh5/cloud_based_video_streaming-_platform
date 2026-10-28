import {
  IntegratedSessionTask,
  IntegratedTaskStage,
  ResourceType,
  BankerProcess,
  MemoryPartition,
  SemaphoreState,
  VideoSegment,
} from '../types';
import { runBankerSafetyAlgorithm } from './banker';

export const INITIAL_INTEGRATED_TASKS: IntegratedSessionTask[] = [
  {
    id: 'S1',
    sessionName: 'Movie Segment Fetcher',
    type: 'FETCH',
    stage: 'PRODUCED',
    segmentSizeMb: 12,
    memoryMb: 128,
    resourcesNeeded: [1, 1, 1], // [Transcoders, Storage, Network]
    cpuBurst: 5,
    cpuRemaining: 5,
    priority: 1,
    color: '#3b82f6',
    logs: ['Task created in stream queue.'],
  },
  {
    id: 'S2',
    sessionName: 'Live Video Transcoder (1080p -> 4K)',
    type: 'TRANSCODE',
    stage: 'PRODUCED',
    segmentSizeMb: 45,
    memoryMb: 256,
    resourcesNeeded: [2, 1, 2],
    cpuBurst: 8,
    cpuRemaining: 8,
    priority: 2,
    color: '#8b5cf6',
    logs: ['Task created in stream queue.'],
  },
  {
    id: 'S3',
    sessionName: 'Playback Video Decoder',
    type: 'DECODE',
    stage: 'PRODUCED',
    segmentSizeMb: 8,
    memoryMb: 64,
    resourcesNeeded: [0, 1, 1],
    cpuBurst: 4,
    cpuRemaining: 4,
    priority: 1,
    color: '#ec4899',
    logs: ['Task created in stream queue.'],
  },
  {
    id: 'S4',
    sessionName: 'Session Analytics & Metadata',
    type: 'METADATA',
    stage: 'PRODUCED',
    segmentSizeMb: 2,
    memoryMb: 100,
    resourcesNeeded: [0, 1, 0],
    cpuBurst: 3,
    cpuRemaining: 3,
    priority: 3,
    color: '#06b6d4',
    logs: ['Task created in stream queue.'],
  },
  {
    id: 'S5',
    sessionName: 'DRM License Authenticator',
    type: 'DRM',
    stage: 'PRODUCED',
    segmentSizeMb: 1,
    memoryMb: 48,
    resourcesNeeded: [0, 0, 1],
    cpuBurst: 2,
    cpuRemaining: 2,
    priority: 1,
    color: '#10b981',
    logs: ['Task created in stream queue.'],
  },
];

export interface IntegratedState {
  tasks: IntegratedSessionTask[];
  buffer: VideoSegment[];
  bufferSemaphores: SemaphoreState;
  resources: ResourceType[];
  memoryPartitions: MemoryPartition[];
  cpuTime: number;
  activeCpuTaskId: string | null;
  cpuQuantum: number;
  cpuQuantumRemaining: number;
  logs: string[];
}

/**
 * Initialize End-to-End Pipeline State
 */
export function createInitialIntegratedState(): IntegratedState {
  return {
    tasks: INITIAL_INTEGRATED_TASKS.map(t => ({ ...t, logs: [...t.logs] })),
    buffer: [],
    bufferSemaphores: {
      mutex: 1,
      empty: 6,
      full: 0,
      capacity: 6,
    },
    resources: [
      { id: 'R0', name: 'Transcoders', unit: 'Cores', total: 6, available: 6 },
      { id: 'R1', name: 'Storage Connections', unit: 'Sockets', total: 6, available: 6 },
      { id: 'R2', name: 'Network Sockets', unit: 'Gbps', total: 6, available: 6 },
    ],
    memoryPartitions: [
      { id: 'M1', startAddress: 0, size: 128, isFree: true },
      { id: 'M2', startAddress: 128, size: 256, isFree: true },
      { id: 'M3', startAddress: 384, size: 64, isFree: true },
      { id: 'M4', startAddress: 448, size: 512, isFree: true },
    ],
    cpuTime: 0,
    activeCpuTaskId: null,
    cpuQuantum: 2,
    cpuQuantumRemaining: 2,
    logs: ['System Pipeline Initialized. Ready for session tasks.'],
  };
}

/**
 * Step the Integrated Pipeline by 1 Tick
 */
export function stepIntegratedPipeline(state: IntegratedState): IntegratedState {
  let tasks = state.tasks.map(t => ({ ...t, logs: [...t.logs] }));
  let buffer = [...state.buffer];
  let semaphores = { ...state.bufferSemaphores };
  let resources = state.resources.map(r => ({ ...r }));
  let memoryPartitions = state.memoryPartitions.map(m => ({ ...m }));
  let cpuTime = state.cpuTime + 1;
  let activeCpuTaskId = state.activeCpuTaskId;
  let quantumRemaining = state.cpuQuantumRemaining;
  const globalLogs: string[] = [...state.logs];

  function addLog(taskId: string | null, msg: string) {
    const timeStr = `[T=${cpuTime}]`;
    globalLogs.unshift(`${timeStr} ${taskId ? `[${taskId}] ` : ''}${msg}`);
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task) task.logs.unshift(`${timeStr} ${msg}`);
    }
  }

  // 1. Step CPU Running Task
  if (activeCpuTaskId) {
    const cpuTask = tasks.find(t => t.id === activeCpuTaskId);
    if (cpuTask && cpuTask.stage === 'RUNNING_CPU') {
      cpuTask.cpuRemaining -= 1;
      quantumRemaining -= 1;
      addLog(cpuTask.id, `Executing on CPU... Remaining burst: ${cpuTask.cpuRemaining}`);

      if (cpuTask.cpuRemaining <= 0) {
        // COMPLETED! Release Memory and Shared Resources
        cpuTask.stage = 'COMPLETED';
        addLog(cpuTask.id, `CPU Burst Completed! Releasing resources.`);

        // Release Memory
        if (cpuTask.allocatedPartitionId) {
          const part = memoryPartitions.find(m => m.id === cpuTask.allocatedPartitionId);
          if (part) {
            part.isFree = true;
            part.allocatedProcessId = undefined;
            part.allocatedProcessName = undefined;
            addLog(cpuTask.id, `Freed ${part.size}MB RAM at Partition ${part.id}.`);
          }
          cpuTask.allocatedPartitionId = undefined;
        }

        // Release Banker Resources
        if (cpuTask.bankerAllocated) {
          resources.forEach((r, rIdx) => {
            r.available += cpuTask.resourcesNeeded[rIdx];
          });
          cpuTask.bankerAllocated = false;
          addLog(
            cpuTask.id,
            `Released shared resources [${cpuTask.resourcesNeeded.join(', ')}].`
          );
        }

        activeCpuTaskId = null;
        quantumRemaining = state.cpuQuantum;
      } else if (quantumRemaining <= 0) {
        // Round Robin Quantum Preemption
        cpuTask.stage = 'READY_CPU';
        addLog(cpuTask.id, `Quantum expired (${state.cpuQuantum}s). Re-entering CPU Ready Queue.`);
        activeCpuTaskId = null;
        quantumRemaining = state.cpuQuantum;
      }
    }
  }

  // 2. Advance Producer Stage (PRODUCED -> BUFFERED)
  for (const task of tasks) {
    if (task.stage === 'PRODUCED') {
      if (semaphores.empty > 0 && semaphores.mutex === 1) {
        semaphores.empty -= 1;
        semaphores.full += 1;

        const newSeg: VideoSegment = {
          id: `SEG-${task.id}`,
          title: task.sessionName,
          resolution: task.segmentSizeMb > 30 ? '4K HDR' : '1080p',
          bitrateMb: 12,
          codec: 'HEVC',
          sizeMb: task.segmentSizeMb,
          producedAt: Date.now(),
          color: task.color,
        };

        buffer.push(newSeg);
        task.stage = 'BUFFERED';
        task.bufferSlot = buffer.length - 1;
        addLog(task.id, `Produced & Buffer Pushed (Buffer occupancy: ${semaphores.full}/${semaphores.capacity}).`);
      } else {
        task.blockReason = 'Bounded Buffer FULL (waiting on Consumer)';
        addLog(task.id, `Blocked at Bounded Buffer stage (Buffer Full).`);
      }
    }
  }

  // 3. Advance Buffer Stage to Memory Stage (BUFFERED -> WAITING_MEM / Memory Allocated)
  for (const task of tasks) {
    if (task.stage === 'BUFFERED') {
      // Find free partition
      const freePart = memoryPartitions.find(m => m.isFree && m.size >= task.memoryMb);
      if (freePart) {
        freePart.isFree = false;
        freePart.allocatedProcessId = task.id;
        freePart.allocatedProcessName = task.sessionName;
        task.allocatedPartitionId = freePart.id;

        // Consume segment from buffer
        if (buffer.length > 0) {
          buffer.shift();
          semaphores.full -= 1;
          semaphores.empty += 1;
        }

        task.stage = 'WAITING_RES';
        task.blockReason = undefined;
        addLog(task.id, `Allocated ${task.memoryMb}MB RAM at Partition ${freePart.id}. Moving to Banker Safety check.`);
      } else {
        task.stage = 'WAITING_MEM';
        task.blockReason = `Insufficient RAM for ${task.memoryMb}MB request.`;
        addLog(task.id, `Blocked waiting for Memory (${task.memoryMb}MB needed).`);
      }
    } else if (task.stage === 'WAITING_MEM') {
      // Retry Memory Allocation
      const freePart = memoryPartitions.find(m => m.isFree && m.size >= task.memoryMb);
      if (freePart) {
        freePart.isFree = false;
        freePart.allocatedProcessId = task.id;
        freePart.allocatedProcessName = task.sessionName;
        task.allocatedPartitionId = freePart.id;
        task.stage = 'WAITING_RES';
        task.blockReason = undefined;
        addLog(task.id, `Memory became available! Allocated ${task.memoryMb}MB at ${freePart.id}.`);
      }
    }
  }

  // 4. Advance Memory Allocated to Resource Safety Check (WAITING_RES -> READY_CPU)
  for (const task of tasks) {
    if (task.stage === 'WAITING_RES') {
      // Check if resources are available
      const canFulfill = resources.every((r, rIdx) => r.available >= task.resourcesNeeded[rIdx]);
      if (canFulfill) {
        // Tentative Banker Safety check
        const bankerProcs: BankerProcess[] = tasks.map(t => ({
          id: t.id,
          name: t.sessionName,
          allocation: t.bankerAllocated ? t.resourcesNeeded : [0, 0, 0],
          max: t.resourcesNeeded,
          need: t.bankerAllocated ? [0, 0, 0] : t.resourcesNeeded,
          color: t.color,
        }));

        const safety = runBankerSafetyAlgorithm(resources, bankerProcs);
        if (safety.isSafe) {
          // Allocate Banker Resources
          resources.forEach((r, rIdx) => {
            r.available -= task.resourcesNeeded[rIdx];
          });
          task.bankerAllocated = true;
          task.stage = 'READY_CPU';
          task.blockReason = undefined;
          addLog(
            task.id,
            `Banker Safety PASS. Shared resources allocated [${task.resourcesNeeded.join(', ')}]. Ready for CPU execution.`
          );
        } else {
          task.blockReason = 'Banker Safety Check FAILED (Deadlock risk if allocated).';
          addLog(task.id, `Banker Safety rejected allocation to prevent deadlock.`);
        }
      } else {
        task.blockReason = 'Shared resources currently unavailable in pool.';
        addLog(task.id, `Blocked waiting for shared resources [${task.resourcesNeeded.join(', ')}].`);
      }
    }
  }

  // 5. Dispatch CPU Ready Task to RUNNING_CPU if CPU is free
  if (!activeCpuTaskId) {
    const readyTasks = tasks.filter(t => t.stage === 'READY_CPU');
    if (readyTasks.length > 0) {
      // Priority scheduling: sort by priority (1 = highest)
      readyTasks.sort((a, b) => a.priority - b.priority);
      const nextTask = readyTasks[0];

      nextTask.stage = 'RUNNING_CPU';
      activeCpuTaskId = nextTask.id;
      quantumRemaining = state.cpuQuantum;
      addLog(nextTask.id, `Dispatched to CPU core for execution.`);
    }
  }

  return {
    tasks,
    buffer,
    bufferSemaphores: semaphores,
    resources,
    memoryPartitions,
    cpuTime,
    activeCpuTaskId,
    cpuQuantum: state.cpuQuantum,
    cpuQuantumRemaining: quantumRemaining,
    logs: globalLogs.slice(0, 50),
  };
}
