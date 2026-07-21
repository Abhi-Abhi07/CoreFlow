/**
 * Round Robin (RR) CPU Scheduling Algorithm with Preemption and Context Switching
 * @param {Array} processes - Array of process objects containing { id, arrivalTime, burstTime }
 * @param {number} timeQuantum - Maximum execution time slice per cycle
 * @param {number} contextSwitch - Context switch overhead duration in ms
 * @returns {Object} { calculatedProcesses, ganttChart }
 */
export function computeRR(processes, timeQuantum, contextSwitch = 0) {
  // 1. Deep copy processes to track remaining burst time without mutating global state
  const pool = processes.map(p => ({
    ...p,
    remBurstTime: p.burstTime,
    hasArrived: false
  })).sort((a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id, undefined, { numeric: true }));

  let currentTime = 0;
  let lastActiveProcessId = null;
  const readyQueue = [];
  const ganttChart = [];
  const calculatedProcesses = [];

  // Helper function to dynamically check and queue arrived processes
  const checkArrivals = () => {
    pool.forEach(p => {
      if (!p.hasArrived && p.arrivalTime <= currentTime) {
        p.hasArrived = true;
        readyQueue.push(p);
      }
    });
  };

  // 2. Process Lifecycle Loop
  while (calculatedProcesses.length < processes.length) {
    checkArrivals();

    // Handle System Idle State
    if (readyQueue.length === 0) {
      const nextArrivalProc = pool.find(p => !p.hasArrived);
      if (nextArrivalProc) {
        ganttChart.push({
          id: "Idle",
          start: currentTime,
          end: nextArrivalProc.arrivalTime
        });
        lastActiveProcessId = null;
        currentTime = nextArrivalProc.arrivalTime;
        checkArrivals();
      } else {
        break; 
      }
    }

    const currentProc = readyQueue.shift();

    // 3. Inject Context Switch block if switching execution contexts
    if (lastActiveProcessId !== null && lastActiveProcessId !== currentProc.id && contextSwitch > 0) {
      ganttChart.push({
        id: "CS",
        start: currentTime,
        end: currentTime + contextSwitch
      });
      currentTime += contextSwitch;
      
      // Check if any process arrived *during* the context switch overhead window
      checkArrivals();
    }

    // 4. Time Slice Computation
    const startTime = currentTime;
    const execTime = Math.min(currentProc.remBurstTime, timeQuantum);
    
    currentProc.remBurstTime -= execTime;
    currentTime += execTime;

    ganttChart.push({
      id: currentProc.id,
      start: startTime,
      end: currentTime
    });

    // CRITICAL RR RULE: Check for arrivals *during* execution before re-enqueueing the current process
    checkArrivals();

    if (currentProc.remBurstTime > 0) {
      // Preempted process goes to the back of the queue
      readyQueue.push(currentProc);
    } else {
      // Process Finished: Compute metrics
      const turnAroundTime = currentTime - currentProc.arrivalTime;
      const waitingTime = turnAroundTime - currentProc.burstTime;

      calculatedProcesses.push({
        id: currentProc.id,
        arrivalTime: currentProc.arrivalTime,
        burstTime: currentProc.burstTime,
        priority: currentProc.priority,
        completionTime: currentTime,
        turnAroundTime,
        waitingTime
      });
    }

    lastActiveProcessId = currentProc.id;
  }

  // Pin ordering to match standard display namespaces
  calculatedProcesses.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  return { calculatedProcesses, ganttChart };
}