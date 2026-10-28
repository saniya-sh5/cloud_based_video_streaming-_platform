import { CpuProcess, CpuAlgorithm, CpuAlgorithmResult, GanttSegment } from '../types';

/**
 * Deep clone array of processes
 */
function cloneProcesses(processes: CpuProcess[]): CpuProcess[] {
  return processes.map(p => ({
    ...p,
    remainingTime: p.burstTime,
    currentPriority: p.priority,
  }));
}

/**
 * 1. First-Come, First-Served (FCFS)
 */
export function runFCFS(inputProcesses: CpuProcess[]): CpuAlgorithmResult {
  const processes = cloneProcesses(inputProcesses).sort((a, b) => a.arrivalTime - b.arrivalTime);
  const gantt: GanttSegment[] = [];
  let currentTime = 0;
  let totalBurst = 0;

  for (const p of processes) {
    if (currentTime < p.arrivalTime) {
      gantt.push({
        processId: 'IDLE',
        processName: 'CPU Idle',
        startTime: currentTime,
        endTime: p.arrivalTime,
        color: '#334155',
        isIdle: true,
      });
      currentTime = p.arrivalTime;
    }

    const startTime = currentTime;
    const endTime = startTime + p.burstTime;
    totalBurst += p.burstTime;

    p.startTime = startTime;
    p.completionTime = endTime;
    p.turnaroundTime = p.completionTime - p.arrivalTime;
    p.waitingTime = p.turnaroundTime - p.burstTime;
    p.responseTime = startTime - p.arrivalTime;

    gantt.push({
      processId: p.id,
      processName: p.name,
      startTime,
      endTime,
      color: p.color,
    });

    currentTime = endTime;
  }

  const avgWaiting = processes.reduce((acc, p) => acc + (p.waitingTime || 0), 0) / (processes.length || 1);
  const avgTurnaround = processes.reduce((acc, p) => acc + (p.turnaroundTime || 0), 0) / (processes.length || 1);
  const avgResponse = processes.reduce((acc, p) => acc + (p.responseTime || 0), 0) / (processes.length || 1);
  const cpuUtilization = currentTime > 0 ? (totalBurst / currentTime) * 100 : 0;

  return {
    algorithm: 'FCFS',
    algorithmName: 'First Come First Serve (FCFS)',
    gantt,
    processes,
    avgWaitingTime: Number(avgWaiting.toFixed(2)),
    avgTurnaroundTime: Number(avgTurnaround.toFixed(2)),
    avgResponseTime: Number(avgResponse.toFixed(2)),
    cpuUtilization: Number(cpuUtilization.toFixed(1)),
    totalTime: currentTime,
  };
}

/**
 * 2. Shortest Job First (SJF Non-Preemptive)
 */
export function runSJF(inputProcesses: CpuProcess[]): CpuAlgorithmResult {
  const processes = cloneProcesses(inputProcesses);
  const gantt: GanttSegment[] = [];
  const completed: CpuProcess[] = [];
  let currentTime = 0;
  let totalBurst = 0;

  while (completed.length < processes.length) {
    const available = processes.filter(
      p => p.arrivalTime <= currentTime && !completed.some(c => c.id === p.id)
    );

    if (available.length === 0) {
      // CPU Idle until next process arrives
      const uncompleted = processes.filter(p => !completed.some(c => c.id === p.id));
      const nextArrival = Math.min(...uncompleted.map(p => p.arrivalTime));

      gantt.push({
        processId: 'IDLE',
        processName: 'CPU Idle',
        startTime: currentTime,
        endTime: nextArrival,
        color: '#334155',
        isIdle: true,
      });
      currentTime = nextArrival;
      continue;
    }

    // Sort by burst time, tie break by arrival time
    available.sort((a, b) => {
      if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
      return a.arrivalTime - b.arrivalTime;
    });

    const currentProcess = available[0];
    const startTime = currentTime;
    const endTime = startTime + currentProcess.burstTime;
    totalBurst += currentProcess.burstTime;

    currentProcess.startTime = startTime;
    currentProcess.completionTime = endTime;
    currentProcess.turnaroundTime = endTime - currentProcess.arrivalTime;
    currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
    currentProcess.responseTime = startTime - currentProcess.arrivalTime;

    gantt.push({
      processId: currentProcess.id,
      processName: currentProcess.name,
      startTime,
      endTime,
      color: currentProcess.color,
    });

    completed.push(currentProcess);
    currentTime = endTime;
  }

  const avgWaiting = completed.reduce((acc, p) => acc + (p.waitingTime || 0), 0) / (completed.length || 1);
  const avgTurnaround = completed.reduce((acc, p) => acc + (p.turnaroundTime || 0), 0) / (completed.length || 1);
  const avgResponse = completed.reduce((acc, p) => acc + (p.responseTime || 0), 0) / (completed.length || 1);
  const cpuUtilization = currentTime > 0 ? (totalBurst / currentTime) * 100 : 0;

  return {
    algorithm: 'SJF',
    algorithmName: 'Shortest Job First (SJF)',
    gantt,
    processes: completed,
    avgWaitingTime: Number(avgWaiting.toFixed(2)),
    avgTurnaroundTime: Number(avgTurnaround.toFixed(2)),
    avgResponseTime: Number(avgResponse.toFixed(2)),
    cpuUtilization: Number(cpuUtilization.toFixed(1)),
    totalTime: currentTime,
  };
}

/**
 * 3. Round Robin (RR)
 */
export function runRoundRobin(inputProcesses: CpuProcess[], timeQuantum: number): CpuAlgorithmResult {
  const processes = cloneProcesses(inputProcesses).sort((a, b) => a.arrivalTime - b.arrivalTime);
  const gantt: GanttSegment[] = [];
  const readyQueue: CpuProcess[] = [];
  const completed: CpuProcess[] = [];
  const firstExecMap = new Map<string, number>();

  let currentTime = 0;
  let totalBurst = 0;
  const inQueue = new Set<string>();

  // Add initial arrived processes at time 0
  processes.forEach(p => {
    if (p.arrivalTime === 0) {
      readyQueue.push(p);
      inQueue.add(p.id);
    }
  });

  while (completed.length < processes.length) {
    if (readyQueue.length === 0) {
      const remaining = processes.filter(p => p.remainingTime > 0 && !inQueue.has(p.id));
      if (remaining.length === 0) break;

      const nextArrival = Math.min(...remaining.map(p => p.arrivalTime));
      if (currentTime < nextArrival) {
        gantt.push({
          processId: 'IDLE',
          processName: 'CPU Idle',
          startTime: currentTime,
          endTime: nextArrival,
          color: '#334155',
          isIdle: true,
        });
        currentTime = nextArrival;
      }

      processes.forEach(p => {
        if (p.remainingTime > 0 && p.arrivalTime <= currentTime && !inQueue.has(p.id)) {
          readyQueue.push(p);
          inQueue.add(p.id);
        }
      });
      continue;
    }

    const currentProcess = readyQueue.shift()!;
    inQueue.delete(currentProcess.id);

    if (!firstExecMap.has(currentProcess.id)) {
      firstExecMap.set(currentProcess.id, currentTime);
      currentProcess.startTime = currentTime;
    }

    const execTime = Math.min(currentProcess.remainingTime, timeQuantum);
    const startTime = currentTime;
    const endTime = startTime + execTime;
    totalBurst += execTime;

    currentProcess.remainingTime -= execTime;
    currentTime = endTime;

    // Merge adjacent Gantt segments if same process
    const lastGantt = gantt[gantt.length - 1];
    if (lastGantt && lastGantt.processId === currentProcess.id) {
      lastGantt.endTime = endTime;
    } else {
      gantt.push({
        processId: currentProcess.id,
        processName: currentProcess.name,
        startTime,
        endTime,
        color: currentProcess.color,
      });
    }

    // Add processes that arrived during this execution slot
    processes.forEach(p => {
      if (
        p.id !== currentProcess.id &&
        p.remainingTime > 0 &&
        p.arrivalTime <= currentTime &&
        !inQueue.has(p.id) &&
        !readyQueue.some(rq => rq.id === p.id)
      ) {
        readyQueue.push(p);
        inQueue.add(p.id);
      }
    });

    if (currentProcess.remainingTime > 0) {
      readyQueue.push(currentProcess);
      inQueue.add(currentProcess.id);
    } else {
      currentProcess.completionTime = currentTime;
      currentProcess.turnaroundTime = currentTime - currentProcess.arrivalTime;
      currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
      currentProcess.responseTime = (firstExecMap.get(currentProcess.id) ?? 0) - currentProcess.arrivalTime;
      completed.push(currentProcess);
    }
  }

  const avgWaiting = processes.reduce((acc, p) => acc + (p.waitingTime || 0), 0) / (processes.length || 1);
  const avgTurnaround = processes.reduce((acc, p) => acc + (p.turnaroundTime || 0), 0) / (processes.length || 1);
  const avgResponse = processes.reduce((acc, p) => acc + (p.responseTime || 0), 0) / (processes.length || 1);
  const cpuUtilization = currentTime > 0 ? (totalBurst / currentTime) * 100 : 0;

  return {
    algorithm: 'RR',
    algorithmName: `Round Robin (Quantum = ${timeQuantum})`,
    gantt,
    processes,
    avgWaitingTime: Number(avgWaiting.toFixed(2)),
    avgTurnaroundTime: Number(avgTurnaround.toFixed(2)),
    avgResponseTime: Number(avgResponse.toFixed(2)),
    cpuUtilization: Number(cpuUtilization.toFixed(1)),
    totalTime: currentTime,
  };
}

/**
 * 4. Priority Scheduling (Non-Preemptive & Preemptive, optional Aging)
 * Priority 1 = Highest Priority
 */
export function runPriority(
  inputProcesses: CpuProcess[],
  preemptive: boolean = false,
  enableAging: boolean = false
): CpuAlgorithmResult {
  const processes = cloneProcesses(inputProcesses);
  const gantt: GanttSegment[] = [];
  const completed: CpuProcess[] = [];
  const firstExecMap = new Map<string, number>();

  let currentTime = 0;
  let totalBurst = 0;
  let runningProcess: CpuProcess | null = null;
  const totalProcesses = processes.length;

  // Maximum time step check safety
  const maxSimTime = processes.reduce((sum, p) => sum + p.burstTime + p.arrivalTime, 0) + 100;

  while (completed.length < totalProcesses && currentTime < maxSimTime) {
    // Apply aging if enabled: processes waiting in ready pool get priority reduced (1 is highest)
    if (enableAging && currentTime > 0) {
      processes.forEach(p => {
        if (
          p.arrivalTime <= currentTime &&
          p.remainingTime > 0 &&
          (!runningProcess || p.id !== runningProcess.id)
        ) {
          // Every 3 time units of waiting, boost priority (decrease numerical value by 1 down to min 1)
          if ((currentTime - p.arrivalTime) % 3 === 0 && (p.currentPriority ?? p.priority) > 1) {
            p.currentPriority = Math.max(1, (p.currentPriority ?? p.priority) - 1);
          }
        }
      });
    }

    const available = processes.filter(
      p => p.arrivalTime <= currentTime && p.remainingTime > 0
    );

    if (available.length === 0) {
      const uncompleted = processes.filter(p => p.remainingTime > 0);
      if (uncompleted.length === 0) break;

      const nextArrival = Math.min(...uncompleted.map(p => p.arrivalTime));
      gantt.push({
        processId: 'IDLE',
        processName: 'CPU Idle',
        startTime: currentTime,
        endTime: nextArrival,
        color: '#334155',
        isIdle: true,
      });
      currentTime = nextArrival;
      runningProcess = null;
      continue;
    }

    // Sort by priority (1 is highest priority), tie-break by arrival time
    available.sort((a, b) => {
      const prioA = a.currentPriority ?? a.priority;
      const priob = b.currentPriority ?? b.priority;
      if (prioA !== priob) return prioA - priob;
      return a.arrivalTime - b.arrivalTime;
    });

    const highestPrioProc = available[0];

    if (!preemptive) {
      // Non-Preemptive
      const proc = highestPrioProc;
      if (!firstExecMap.has(proc.id)) {
        firstExecMap.set(proc.id, currentTime);
        proc.startTime = currentTime;
      }

      const startTime = currentTime;
      const endTime = startTime + proc.burstTime;
      totalBurst += proc.burstTime;

      proc.remainingTime = 0;
      proc.completionTime = endTime;
      proc.turnaroundTime = endTime - proc.arrivalTime;
      proc.waitingTime = proc.turnaroundTime - proc.burstTime;
      proc.responseTime = (firstExecMap.get(proc.id) ?? 0) - proc.arrivalTime;

      gantt.push({
        processId: proc.id,
        processName: proc.name,
        startTime,
        endTime,
        color: proc.color,
      });

      completed.push(proc);
      currentTime = endTime;
    } else {
      // Preemptive: run for 1 time unit tick
      runningProcess = highestPrioProc;
      if (!firstExecMap.has(runningProcess.id)) {
        firstExecMap.set(runningProcess.id, currentTime);
        runningProcess.startTime = currentTime;
      }

      const startTime = currentTime;
      const endTime = currentTime + 1;
      totalBurst += 1;
      runningProcess.remainingTime -= 1;
      currentTime = endTime;

      const lastGantt = gantt[gantt.length - 1];
      if (lastGantt && lastGantt.processId === runningProcess.id) {
        lastGantt.endTime = endTime;
      } else {
        gantt.push({
          processId: runningProcess.id,
          processName: runningProcess.name,
          startTime,
          endTime,
          color: runningProcess.color,
        });
      }

      if (runningProcess.remainingTime === 0) {
        runningProcess.completionTime = currentTime;
        runningProcess.turnaroundTime = currentTime - runningProcess.arrivalTime;
        runningProcess.waitingTime = runningProcess.turnaroundTime - runningProcess.burstTime;
        runningProcess.responseTime = (firstExecMap.get(runningProcess.id) ?? 0) - runningProcess.arrivalTime;
        completed.push(runningProcess);
        runningProcess = null;
      }
    }
  }

  const avgWaiting = processes.reduce((acc, p) => acc + (p.waitingTime || 0), 0) / (processes.length || 1);
  const avgTurnaround = processes.reduce((acc, p) => acc + (p.turnaroundTime || 0), 0) / (processes.length || 1);
  const avgResponse = processes.reduce((acc, p) => acc + (p.responseTime || 0), 0) / (processes.length || 1);
  const cpuUtilization = currentTime > 0 ? (totalBurst / currentTime) * 100 : 0;

  const modeStr = `${preemptive ? 'Preemptive' : 'Non-Preemptive'}${enableAging ? ' with Aging' : ''}`;

  return {
    algorithm: preemptive ? 'PRIORITY_P' : 'PRIORITY_NP',
    algorithmName: `Priority Scheduling (${modeStr})`,
    gantt,
    processes,
    avgWaitingTime: Number(avgWaiting.toFixed(2)),
    avgTurnaroundTime: Number(avgTurnaround.toFixed(2)),
    avgResponseTime: Number(avgResponse.toFixed(2)),
    cpuUtilization: Number(cpuUtilization.toFixed(1)),
    totalTime: currentTime,
  };
}

/**
 * Compare all CPU Scheduling Algorithms on same process set
 */
export function compareCpuAlgorithms(processes: CpuProcess[], quantum: number = 2): CpuAlgorithmResult[] {
  return [
    runFCFS(processes),
    runSJF(processes),
    runRoundRobin(processes, quantum),
    runPriority(processes, false, false),
    runPriority(processes, true, false),
    runPriority(processes, true, true),
  ];
}
