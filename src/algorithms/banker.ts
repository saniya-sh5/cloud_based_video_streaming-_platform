import { ResourceType, BankerProcess, BankerResult, BankerStep, ResourceRequest } from '../types';

export const DEFAULT_RESOURCES: ResourceType[] = [
  { id: 'R0', name: 'Transcoding Units', unit: 'Cores', total: 10, available: 3 },
  { id: 'R1', name: 'Storage Connections', unit: 'Sockets', total: 5, available: 3 },
  { id: 'R2', name: 'Network Processing Slots', unit: 'Gbps', total: 7, available: 2 },
];

export const DEFAULT_PROCESSES: BankerProcess[] = [
  {
    id: 'P0',
    name: 'S1: 4K Movie Transcode',
    allocation: [0, 1, 0],
    max: [7, 5, 3],
    need: [7, 4, 3],
    color: '#3b82f6',
  },
  {
    id: 'P1',
    name: 'S2: Live Stream Encoding',
    allocation: [2, 0, 0],
    max: [3, 2, 2],
    need: [1, 2, 2],
    color: '#8b5cf6',
  },
  {
    id: 'P2',
    name: 'S3: DRM License Verification',
    allocation: [3, 0, 2],
    max: [9, 0, 2],
    need: [6, 0, 0],
    color: '#ec4899',
  },
  {
    id: 'P3',
    name: 'S4: HLS Chunk Packager',
    allocation: [2, 1, 1],
    max: [2, 2, 2],
    need: [0, 1, 1],
    color: '#06b6d4',
  },
  {
    id: 'P4',
    name: 'S5: Metadata Ingestion',
    allocation: [0, 0, 2],
    max: [4, 3, 3],
    need: [4, 3, 1],
    color: '#10b981',
  },
];

/**
 * Calculate Need Matrix: Need[i][j] = Max[i][j] - Allocation[i][j]
 */
export function calculateNeedMatrix(processes: BankerProcess[]): BankerProcess[] {
  return processes.map(p => ({
    ...p,
    need: p.max.map((maxVal, colIdx) => Math.max(0, maxVal - (p.allocation[colIdx] || 0))),
  }));
}

/**
 * Recalculate Available Vector based on Total minus sum of Allocations
 */
export function calculateAvailableVector(
  resources: ResourceType[],
  processes: BankerProcess[]
): ResourceType[] {
  const numResources = resources.length;
  const allocSum = new Array(numResources).fill(0);

  for (const p of processes) {
    p.allocation.forEach((val, rIdx) => {
      allocSum[rIdx] += val;
    });
  }

  return resources.map((r, idx) => ({
    ...r,
    available: Math.max(0, r.total - allocSum[idx]),
  }));
}

/**
 * Banker's Safety Algorithm Execution
 */
export function runBankerSafetyAlgorithm(
  resources: ResourceType[],
  processesInput: BankerProcess[]
): BankerResult {
  const processes = calculateNeedMatrix(processesInput);
  const available = resources.map(r => r.available);
  const numResources = resources.length;
  const numProcesses = processes.length;

  let work = [...available];
  const finish = new Array(numProcesses).fill(false);
  const safeSequence: string[] = [];
  const steps: BankerStep[] = [];

  let count = 0;
  let stepIdx = 0;

  while (count < numProcesses) {
    let foundProcess = false;

    for (let i = 0; i < numProcesses; i++) {
      if (!finish[i]) {
        const p = processes[i];
        let canAllocate = true;

        for (let j = 0; j < numResources; j++) {
          if (p.need[j] > work[j]) {
            canAllocate = false;
            break;
          }
        }

        if (canAllocate) {
          stepIdx++;
          const workBefore = [...work];

          // Reclaim allocated resources upon process completion
          for (let j = 0; j < numResources; j++) {
            work[j] += p.allocation[j];
          }

          finish[i] = true;
          safeSequence.push(p.id);
          foundProcess = true;
          count++;

          steps.push({
            stepIndex: stepIdx,
            processId: p.id,
            processName: p.name,
            workBefore,
            need: [...p.need],
            allocation: [...p.allocation],
            workAfter: [...work],
            canFinish: true,
            reason: `Need [${p.need.join(', ')}] <= Work [${workBefore.join(', ')}]. Process ${p.id} executed and released allocation [${p.allocation.join(', ')}].`,
          });
        }
      }
    }

    if (!foundProcess) {
      // Unsafe condition detected!
      const blockedProcesses = processes.filter((_, idx) => !finish[idx]).map(p => p.id);
      steps.push({
        stepIndex: stepIdx + 1,
        processId: 'DEADLOCK_RISK',
        processName: 'System Deadlock Guard',
        workBefore: [...work],
        need: [],
        allocation: [],
        workAfter: [...work],
        canFinish: false,
        reason: `Deadlock risk! No uncompleted process (${blockedProcesses.join(', ')}) has Need <= Available Work [${work.join(', ')}].`,
      });

      return {
        isSafe: false,
        safeSequence: [],
        steps,
        reason: `UNSAFE STATE DETECTED! Remaining processes (${blockedProcesses.join(', ')}) cannot complete with available resources [${work.join(', ')}]. Potential deadlock!`,
      };
    }
  }

  return {
    isSafe: true,
    safeSequence,
    steps,
    reason: `SAFE STATE CONFIRMED! Valid execution order: < ${safeSequence.join(' ➔ ')} > guarantees deadlock-free execution.`,
  };
}

/**
 * Resource Request Algorithm (Tentative Allocation & Safety Check)
 */
export function handleResourceRequest(
  resources: ResourceType[],
  processes: BankerProcess[],
  request: ResourceRequest
): {
  granted: boolean;
  message: string;
  updatedResources: ResourceType[];
  updatedProcesses: BankerProcess[];
  safetyResult: BankerResult;
} {
  const pIdx = processes.findIndex(p => p.id === request.processId);
  if (pIdx === -1) {
    throw new Error(`Process ${request.processId} not found.`);
  }

  const targetProcess = processes[pIdx];
  const reqVec = request.requestVector;

  // Step 1: Request <= Need
  for (let j = 0; j < resources.length; j++) {
    if (reqVec[j] > targetProcess.need[j]) {
      return {
        granted: false,
        message: `REJECTED: Process ${targetProcess.id} requested ${reqVec[j]} units of ${resources[j].name}, exceeding its declared Maximum Need (${targetProcess.need[j]}).`,
        updatedResources: resources,
        updatedProcesses: processes,
        safetyResult: {
          isSafe: false,
          safeSequence: [],
          steps: [],
          reason: 'Request exceeds declared maximum need limit.',
        },
      };
    }
  }

  // Step 2: Request <= Available
  for (let j = 0; j < resources.length; j++) {
    if (reqVec[j] > resources[j].available) {
      return {
        granted: false,
        message: `WAITING: Process ${targetProcess.id} requested ${reqVec[j]} units of ${resources[j].name}, but only ${resources[j].available} units are currently available in the cloud pool.`,
        updatedResources: resources,
        updatedProcesses: processes,
        safetyResult: {
          isSafe: false,
          safeSequence: [],
          steps: [],
          reason: 'Insufficient available resources. Process must wait.',
        },
      };
    }
  }

  // Step 3: Tentative Allocation
  const tentativeProcesses = processes.map((p, idx) => {
    if (idx !== pIdx) return p;
    const newAlloc = p.allocation.map((val, col) => val + reqVec[col]);
    const newNeed = p.need.map((val, col) => val - reqVec[col]);
    return {
      ...p,
      allocation: newAlloc,
      need: newNeed,
    };
  });

  const tentativeResources = calculateAvailableVector(resources, tentativeProcesses);

  // Step 4: Run Safety Algorithm on tentative state
  const safetyResult = runBankerSafetyAlgorithm(tentativeResources, tentativeProcesses);

  if (safetyResult.isSafe) {
    return {
      granted: true,
      message: `GRANTED: Resource request for ${targetProcess.id} [${reqVec.join(', ')}] was granted. System remains in SAFE STATE with sequence: < ${safetyResult.safeSequence.join(' ➔ ')} >.`,
      updatedResources: tentativeResources,
      updatedProcesses: tentativeProcesses,
      safetyResult,
    };
  } else {
    return {
      granted: false,
      message: `REJECTED (DEADLOCK AVOIDANCE): Request for ${targetProcess.id} [${reqVec.join(', ')}] would put system in an UNSAFE STATE! Request denied and rolled back.`,
      updatedResources: resources,
      updatedProcesses: processes,
      safetyResult,
    };
  }
}
