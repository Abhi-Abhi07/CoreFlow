/**
 * Shortest Remaining Time First (SRTF) CPU Scheduling Algorithm (Preemptive) with Context Switching
 * @param {Array} processes - Array of process objects containing { id, arrivalTime, burstTime }
 * @param {number} contextSwitch - Context switch overhead duration in ms
 * @returns {Object} { calculatedProcesses, ganttChart }
 */
export function computeSRTF(processes, contextSwitch = 0) {
  // Deep copy tracking properties to avoid modifying global state directly
  const pool = processes.map(p => ({
    ...p,
    remBurstTime: p.burstTime,
    isCompleted: false
  }));

  let currentTime = 0;
  let lastActiveProcessId = null;
  const rawGanttChart = [];
  const calculatedProcesses = [];

  while (calculatedProcesses.length < processes.length) {
    // Gather all processes that have arrived at the current timeline point and are incomplete
    const readyQueue = pool.filter(p => !p.isCompleted && p.arrivalTime <= currentTime);

    if (readyQueue.length === 0) {
      // Handle System Idle State if no jobs are ready yet
      const uncompletedJobs = pool.filter(p => !p.isCompleted);
      if (uncompletedJobs.length > 0) {
        const nextArrival = Math.min(...uncompletedJobs.map(p => p.arrivalTime));
        rawGanttChart.push({
          id: "Idle",
          start: currentTime,
          end: nextArrival,
        });
        currentTime = nextArrival;
        continue; 
      } else {
        break;
      }
    }

    // Sort Ready Queue based on SRTF Preemption Rules:
    // 1. Shortest Remaining Burst Time first
    // 2. Earliest Arrival Time (Tiebreaker 1)
    // 3. Alphanumeric PID sorting (Tiebreaker 2)
    readyQueue.sort((a, b) => {
      if (a.remBurstTime !== b.remBurstTime) {
        return a.remBurstTime - b.remBurstTime;
      }
      if (a.arrivalTime !== b.arrivalTime) {
        return a.arrivalTime - b.arrivalTime;
      }
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    });

    const nextProc = readyQueue[0];

    // Inject Context Switch block if switching from another active execution context
    if (lastActiveProcessId !== null && lastActiveProcessId !== nextProc.id && contextSwitch > 0) {
      rawGanttChart.push({
        id: "CS",
        start: currentTime,
        end: currentTime + contextSwitch,
      });
      currentTime += contextSwitch;
    }

    // Determine execution window duration until the next process arrives or current completes
    const currentBlockStart = currentTime;
    const unarrivedJobs = pool.filter(p => p.arrivalTime > currentTime);
    let nextEventTime = currentTime + nextProc.remBurstTime;

    if (unarrivedJobs.length > 0) {
      const nextArrival = Math.min(...unarrivedJobs.map(p => p.arrivalTime));
      if (nextArrival < nextEventTime) {
        nextEventTime = nextArrival;
      }
    }

    const execDuration = nextEventTime - currentTime;
    nextProc.remBurstTime -= execDuration;
    currentTime = nextEventTime;

    // Append raw process chunk
    rawGanttChart.push({
      id: nextProc.id,
      start: currentBlockStart,
      end: currentTime,
    });

    // If process finishes execution, compute turnaround and waiting metrics
    if (nextProc.remBurstTime === 0) {
      nextProc.isCompleted = true;
      const turnAroundTime = currentTime - nextProc.arrivalTime;
      const waitingTime = turnAroundTime - nextProc.burstTime;

      calculatedProcesses.push({
        ...processes.find(p => p.id === nextProc.id),
        completionTime: currentTime,
        turnAroundTime,
        waitingTime,
      });
    }

    lastActiveProcessId = nextProc.id;
  }

  // Compress adjacent timeline blocks of the same process for smooth UI rendering
  const compressedGantt = [];
  rawGanttChart.forEach((block) => {
    if (compressedGantt.length > 0 && compressedGantt[compressedGantt.length - 1].id === block.id) {
      compressedGantt[compressedGantt.length - 1].end = block.end;
    } else {
      compressedGantt.push({ ...block });
    }
  });

  // Pin output order consistently by original PID namespaces for stable table sorting
  calculatedProcesses.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  
  return { calculatedProcesses, ganttChart: compressedGantt };
}