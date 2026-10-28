import { MemoryPartition, MemoryProcessRequest, MemoryPolicy, MemoryAllocationResult } from '../types';

export const DEFAULT_PARTITIONS: MemoryPartition[] = [
  { id: 'M1', startAddress: 0, size: 128, isFree: true },
  { id: 'M2', startAddress: 128, size: 256, isFree: true },
  { id: 'M3', startAddress: 384, size: 64, isFree: true },
  { id: 'M4', startAddress: 448, size: 512, isFree: true },
  { id: 'M5', startAddress: 960, size: 200, isFree: true },
];

export const DEFAULT_MEMORY_PROCESSES: MemoryProcessRequest[] = [
  { id: 'P1', name: '4K Transcoder Cache', requestedSize: 150, color: '#3b82f6' },
  { id: 'P2', name: 'Live Stream Buffer', requestedSize: 300, color: '#8b5cf6' },
  { id: 'P3', name: 'Audio Decoder RAM', requestedSize: 45, color: '#ec4899' },
  { id: 'P4', name: 'Metadata Cache Index', requestedSize: 400, color: '#06b6d4' },
];

/**
 * Run Memory Allocation Simulation
 */
export function runMemoryAllocation(
  initialPartitions: MemoryPartition[],
  processesToAllocate: MemoryProcessRequest[],
  policy: MemoryPolicy
): MemoryAllocationResult {
  // Deep copy partitions
  let partitions: MemoryPartition[] = initialPartitions.map(p => ({ ...p }));
  const allocatedProcesses: MemoryProcessRequest[] = [];
  const failedProcesses: MemoryProcessRequest[] = [];

  for (const proc of processesToAllocate) {
    const candidateIndices: number[] = [];

    // Find all free partitions where size >= requestedSize
    partitions.forEach((part, idx) => {
      if (part.isFree && part.size >= proc.requestedSize) {
        candidateIndices.push(idx);
      }
    });

    if (candidateIndices.length === 0) {
      failedProcesses.push(proc);
      continue;
    }

    let chosenIdx = -1;

    if (policy === 'FIRST_FIT') {
      // First partition in memory order that fits
      chosenIdx = candidateIndices[0];
    } else if (policy === 'BEST_FIT') {
      // Partition with minimum leftover space (smallest size >= requested)
      chosenIdx = candidateIndices.reduce((bestIdx, currentIdx) => {
        if (bestIdx === -1) return currentIdx;
        return partitions[currentIdx].size < partitions[bestIdx].size ? currentIdx : bestIdx;
      }, -1);
    } else if (policy === 'WORST_FIT') {
      // Partition with maximum leftover space (largest size >= requested)
      chosenIdx = candidateIndices.reduce((worstIdx, currentIdx) => {
        if (worstIdx === -1) return currentIdx;
        return partitions[currentIdx].size > partitions[worstIdx].size ? currentIdx : worstIdx;
      }, -1);
    }

    if (chosenIdx !== -1) {
      const targetPart = partitions[chosenIdx];
      const internalFrag = targetPart.size - proc.requestedSize;

      partitions[chosenIdx] = {
        ...targetPart,
        isFree: false,
        allocatedProcessId: proc.id,
        allocatedProcessName: proc.name,
        requestedSize: proc.requestedSize,
        internalFragmentation: internalFrag,
        color: proc.color,
      };

      allocatedProcesses.push({
        ...proc,
        allocatedPartitionId: targetPart.id,
      });
    } else {
      failedProcesses.push(proc);
    }
  }

  const totalMemory = partitions.reduce((sum, p) => sum + p.size, 0);
  const usedMemory = partitions
    .filter(p => !p.isFree)
    .reduce((sum, p) => sum + (p.requestedSize || p.size), 0);

  const freeMemory = totalMemory - usedMemory;

  const totalInternalFragmentation = partitions
    .filter(p => !p.isFree)
    .reduce((sum, p) => sum + (p.internalFragmentation || 0), 0);

  // External fragmentation occurs when processes fail despite total free memory >= requested
  let totalExternalFragmentation = 0;
  if (failedProcesses.length > 0) {
    totalExternalFragmentation = partitions
      .filter(p => p.isFree)
      .reduce((sum, p) => sum + p.size, 0);
  }

  const utilizationPercentage = totalMemory > 0 ? (usedMemory / totalMemory) * 100 : 0;

  return {
    partitions,
    allocatedProcesses,
    failedProcesses,
    totalMemory,
    usedMemory,
    freeMemory,
    totalInternalFragmentation,
    totalExternalFragmentation,
    utilizationPercentage: Number(utilizationPercentage.toFixed(1)),
  };
}

/**
 * Compare First Fit, Best Fit, and Worst Fit side-by-side
 */
export function compareMemoryPolicies(
  partitions: MemoryPartition[],
  processes: MemoryProcessRequest[]
): Record<MemoryPolicy, MemoryAllocationResult> {
  return {
    FIRST_FIT: runMemoryAllocation(partitions, processes, 'FIRST_FIT'),
    BEST_FIT: runMemoryAllocation(partitions, processes, 'BEST_FIT'),
    WORST_FIT: runMemoryAllocation(partitions, processes, 'WORST_FIT'),
  };
}
