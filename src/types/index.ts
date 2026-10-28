/**
 * StreamOS - Core Data Types
 */

export type NavigationTab = 
  | 'overview'
  | 'cpu-scheduling'
  | 'producer-consumer'
  | 'banker'
  | 'memory'
  | 'integrated'
  | 'docs';

// CPU Scheduling Types
export type CpuAlgorithm = 'FCFS' | 'SJF' | 'RR' | 'PRIORITY_NP' | 'PRIORITY_P';

export interface CpuProcess {
  id: string; // e.g. "P1" or "S1"
  name: string; // e.g. "4K Transcoder"
  arrivalTime: number;
  burstTime: number;
  priority: number; // 1 = Highest Priority
  remainingTime: number;
  color: string;
  // Dynamic metrics computed after schedule execution
  completionTime?: number;
  turnaroundTime?: number;
  waitingTime?: number;
  responseTime?: number;
  startTime?: number;
  currentPriority?: number; // for aging
}

export interface GanttSegment {
  processId: string;
  processName: string;
  startTime: number;
  endTime: number;
  color: string;
  isIdle?: boolean;
}

export interface CpuAlgorithmResult {
  algorithm: CpuAlgorithm;
  algorithmName: string;
  gantt: GanttSegment[];
  processes: CpuProcess[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  cpuUtilization: number;
  totalTime: number;
}

// Producer Consumer Types
export interface VideoSegment {
  id: string;
  title: string;
  resolution: '720p' | '1080p' | '4K HDR' | '8K Ultra';
  bitrateMb: number;
  codec: 'H.264' | 'HEVC' | 'AV1' | 'VP9';
  sizeMb: number;
  producedAt: number;
  consumedAt?: number;
  color: string;
}

export interface SemaphoreState {
  mutex: 0 | 1;
  empty: number;
  full: number;
  capacity: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'producer' | 'consumer' | 'system' | 'blocked';
  message: string;
  badge?: string;
}

// Banker's Algorithm Types
export interface ResourceType {
  id: string;
  name: string;
  unit: string;
  total: number;
  available: number;
}

export interface BankerProcess {
  id: string; // P0, P1, etc.
  name: string; // "Stream Fetcher", "Transcoder worker", etc.
  allocation: number[]; // size = number of resource types
  max: number[];
  need: number[];
  color: string;
}

export interface BankerStep {
  stepIndex: number;
  processId: string;
  processName: string;
  workBefore: number[];
  need: number[];
  allocation: number[];
  workAfter: number[];
  canFinish: boolean;
  reason: string;
}

export interface BankerResult {
  isSafe: boolean;
  safeSequence: string[];
  steps: BankerStep[];
  reason: string;
}

export interface ResourceRequest {
  processId: string;
  requestVector: number[];
}

// Memory Management Types
export type MemoryPolicy = 'FIRST_FIT' | 'BEST_FIT' | 'WORST_FIT';

export interface MemoryPartition {
  id: string;
  startAddress: number;
  size: number;
  isFree: boolean;
  allocatedProcessId?: string;
  allocatedProcessName?: string;
  requestedSize?: number;
  internalFragmentation?: number;
  color?: string;
}

export interface MemoryProcessRequest {
  id: string;
  name: string;
  requestedSize: number;
  allocatedPartitionId?: string;
  color: string;
}

export interface MemoryAllocationResult {
  partitions: MemoryPartition[];
  allocatedProcesses: MemoryProcessRequest[];
  failedProcesses: MemoryProcessRequest[];
  totalMemory: number;
  usedMemory: number;
  freeMemory: number;
  totalInternalFragmentation: number;
  totalExternalFragmentation: number;
  utilizationPercentage: number;
}

// Integrated Pipeline Types
export type IntegratedTaskStage = 
  | 'PRODUCED'
  | 'BUFFERED'
  | 'WAITING_MEM'
  | 'WAITING_RES'
  | 'READY_CPU'
  | 'RUNNING_CPU'
  | 'COMPLETED'
  | 'BLOCKED';

export interface IntegratedSessionTask {
  id: string;
  sessionName: string; // e.g., "S1: Movie Fetching"
  type: 'FETCH' | 'TRANSCODE' | 'DECODE' | 'METADATA' | 'DRM';
  stage: IntegratedTaskStage;
  // Resource requirements
  segmentSizeMb: number;
  memoryMb: number;
  resourcesNeeded: number[]; // [Transcoders, Storage, Network]
  cpuBurst: number;
  cpuRemaining: number;
  priority: number;
  // Allocated IDs
  bufferSlot?: number;
  allocatedPartitionId?: string;
  bankerAllocated?: boolean;
  blockReason?: string;
  color: string;
  logs: string[];
}

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
