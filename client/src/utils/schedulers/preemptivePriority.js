/**
 * Preemptive Priority CPU Scheduling Algorithm with Context Switching
 * @param {Array} processes - Array of process objects containing { id, arrivalTime, burstTime, priority }
 * @param {number} contextSwitch - Context switch overhead duration in ms
 * @returns {Object} { calculatedProcesses, ganttChart }
 */
export function computePreemptivePriority(processes, contextSwitch = 0) {
  // Deep copy tracking properties to avoid mutating global state
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
    // Gather all arrived, incomplete jobs at this tick position
    const readyQueue = pool.filter(p => !p.isCompleted && p.arrivalTime <= currentTime);

    if (readyQueue.length === 0) {
      // Handle System Idle Window
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

    // Sort Ready Queue based on Preemptive Priority Rules:
    // 1. Highest Priority first (Lower number value = Higher priority rank)
    // 2. Earliest Arrival Time (Tiebreaker 1)
    // 3. Alphanumeric PID sorting (Tiebreaker 2)
    readyQueue.sort((a, b) => {
      const pA = a.priority ?? 10;
      const pB = b.priority ?? 10;

      if (pA !== pB) {
        return pA - pB;
      }
      if (a.arrivalTime !== b.arrivalTime) {
        return a.arrivalTime - b.arrivalTime;
      }
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    });

    const nextProc = readyQueue[0];

    // Inject Context Switch overhead if swapping contexts between different jobs
    if (lastActiveProcessId !== null && lastActiveProcessId !== nextProc.id && contextSwitch > 0) {
      rawGanttChart.push({
        id: "CS",
        start: currentTime,
        end: currentTime + contextSwitch,
      });
      currentTime += contextSwitch;
    }

    // Determine slice window until a new process arrives or current completes
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

    // Log raw timeline chunk
    rawGanttChart.push({
      id: nextProc.id,
      start: currentBlockStart,
      end: currentTime,
    });

    // If fully executed, calculate lifecycle metrics
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

  // Compress contiguous runtime blocks belonging to the same process
  const compressedGantt = [];
  rawGanttChart.forEach((block) => {
    if (compressedGantt.length > 0 && compressedGantt[compressedGantt.length - 1].id === block.id) {
      compressedGantt[compressedGantt.length - 1].end = block.end;
    } else {
      compressedGantt.push({ ...block });
    }
  });

  // Pin output sort order by alphanumeric PIDs for display consistency
  calculatedProcesses.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  return { calculatedProcesses, ganttChart: compressedGantt };
}