/**
 * First-Come, First-Served (FCFS) CPU Scheduling Algorithm with Context Switching
 * @param {Array} processes - Array of process objects containing { id, arrivalTime, burstTime }
 * @param {number} contextSwitch - Context switch overhead duration in ms
 * @returns {Object} { calculatedProcesses, ganttChart }
 */
export function computeFCFS(processes, contextSwitch = 0) {
  const sortedProcesses = [...processes].sort((a, b) => {
    if (a.arrivalTime === b.arrivalTime) {
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    }
    return a.arrivalTime - b.arrivalTime;
  });

  let currentTime = 0;
  let lastActiveProcessId = null;
  const ganttChart = [];
  const calculatedProcesses = [];

  sortedProcesses.forEach((proc) => {
    // 1. CPU enters Idle state if process hasn't arrived yet
    if (currentTime < proc.arrivalTime) {
      ganttChart.push({
        id: "Idle",
        start: currentTime,
        end: proc.arrivalTime,
      });
      lastActiveProcessId = null;
      currentTime = proc.arrivalTime;
    }

    // 2. Inject Context Switch block if switching execution contexts
    if (lastActiveProcessId !== null && contextSwitch > 0) {
      ganttChart.push({
        id: "CS",
        start: currentTime,
        end: currentTime + contextSwitch,
      });
      currentTime += contextSwitch;
    }

    const startTime = currentTime;
    const completionTime = startTime + proc.burstTime;
    const turnAroundTime = completionTime - proc.arrivalTime;
    const waitingTime = turnAroundTime - proc.burstTime;

    // 3. Append core execution block
    ganttChart.push({
      id: proc.id,
      start: startTime,
      end: completionTime,
    });

    calculatedProcesses.push({
      ...proc,
      completionTime,
      turnAroundTime,
      waitingTime,
    });

    currentTime = completionTime;
    lastActiveProcessId = proc.id;
  });

  // Keep display ordering pinned consistently by original ID namespaces
  calculatedProcesses.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  return { calculatedProcesses, ganttChart };
}