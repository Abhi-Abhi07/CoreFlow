/**
 * Shortest Job First (SJF) CPU Scheduling Algorithm (Non-Preemptive) with Context Switching
 * @param {Array} processes - Array of process objects containing { id, arrivalTime, burstTime }
 * @param {number} contextSwitch - Context switch overhead duration in ms
 * @returns {Object} { calculatedProcesses, ganttChart }
 */
export function computeSJF(processes, contextSwitch = 0) {
  // Deep copy tracking properties to avoid modifying global state directly
  const pool = processes.map(p => ({
    ...p,
    isCompleted: false
  }));

  let currentTime = 0;
  let lastActiveProcessId = null;
  const ganttChart = [];
  const calculatedProcesses = [];

  while (calculatedProcesses.length < processes.length) {
    // Gather all processes that have arrived at the current timeline point and are incomplete
    const readyQueue = pool.filter(p => !p.isCompleted && p.arrivalTime <= currentTime);

    if (readyQueue.length === 0) {
      // Handle System Idle State if no jobs are ready yet
      const uncompletedJobs = pool.filter(p => !p.isCompleted);
      if (uncompletedJobs.length > 0) {
        const nextArrival = Math.min(...uncompletedJobs.map(p => p.arrivalTime));
        ganttChart.push({
          id: "Idle",
          start: currentTime,
          end: nextArrival,
        });
        lastActiveProcessId = null;
        currentTime = nextArrival;
        continue; // Re-evaluate ready queue at the updated time jump
      } else {
        break;
      }
    }

    // Sort Ready Queue based on SJF Rules:
    // 1. Shortest Burst Time first
    // 2. Earliest Arrival Time (Tiebreaker 1)
    // 3. Alphanumeric PID sorting (Tiebreaker 2)
    readyQueue.sort((a, b) => {
      if (a.burstTime !== b.burstTime) {
        return a.burstTime - b.burstTime;
      }
      if (a.arrivalTime !== b.arrivalTime) {
        return a.arrivalTime - b.arrivalTime;
      }
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    });

    const currentProc = readyQueue[0];

    // Inject Context Switch block if switching from another active execution context
    if (lastActiveProcessId !== null && contextSwitch > 0) {
      ganttChart.push({
        id: "CS",
        start: currentTime,
        end: currentTime + contextSwitch,
      });
      currentTime += contextSwitch;
    }

    const startTime = currentTime;
    const completionTime = startTime + currentProc.burstTime;
    const turnAroundTime = completionTime - currentProc.arrivalTime;
    const waitingTime = turnAroundTime - currentProc.burstTime;

    // Append standard process execution block
    ganttChart.push({
      id: currentProc.id,
      start: startTime,
      end: completionTime,
    });

    calculatedProcesses.push({
      ...processes.find(p => p.id === currentProc.id),
      completionTime,
      turnAroundTime,
      waitingTime,
    });

    currentTime = completionTime;
    lastActiveProcessId = currentProc.id;

    // Mark completed inside engine tracking pool
    const poolIndex = pool.findIndex(p => p.id === currentProc.id);
    pool[poolIndex].isCompleted = true;
  }

  // Pin output order consistently by original PID namespaces for stable table sorting
  calculatedProcesses.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  return { calculatedProcesses, ganttChart };
}