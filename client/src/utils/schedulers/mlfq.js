import { computeFCFS } from './fcfs';
import { computeRR } from './roundRobin';
import { computeSJF } from './sjf';
import { computeSRTF } from './srtf';
import { computePriority } from './priority';
import { computePreemptivePriority } from './preemptivePriority';

/**
 * Multi-Level Feedback Queue (MLFQ) CPU Scheduling Algorithm
 * Implements a bidirectional feedback loop tracking 10ms execution milestones per tier.
 * @param {Array} processes - Array of processes containing { id, arrivalTime, burstTime, priority, queueNo }
 * @param {number} contextSwitch - Context switch overhead duration in ms
 * @param {Object} mlfqAlgorithms - Strategy map tracking internal queue configurations { q1, q2, q3 }
 * @param {number} globalTimeQuantum - Dynamic execution quantum limit for Round Robin layers
 * @returns {Object} { calculatedProcesses, ganttChart }
 */
export function computeMLFQ(processes, contextSwitch = 0, mlfqAlgorithms = {}, globalTimeQuantum = 2) {
  // 1. Initialize state pool with explicit direction and accumulation trackers
  const pool = processes.map(p => ({
    ...p,
    queueNo: 1,                     // All workloads initialize at Queue 1 at startup
    priority: p.priority ? parseInt(p.priority, 10) : 10,
    remBurstTime: p.burstTime,
    isCompleted: false,
    timeSpentInCurrentQueue: 0,     // Tracks execution run-time inside the active level
    queueDirection: 1,              // 1 means sinking down (1->2->3), -1 means rising up (3->2->1)
    readyArrivalTime: p.arrivalTime // Local clock proxy to anchor sub-scheduler order positioning
  }));

  let currentTime = 0;
  let lastActiveProcessId = null;
  const rawGanttChart = [];
  const calculatedProcesses = [];

  // 2. Main Simulation Lifecycle Engine Loop
  while (calculatedProcesses.length < processes.length) {
    // Filter incomplete tasks that have arrived on or before the current clock position
    const readyPool = pool.filter(p => !p.isCompleted && p.arrivalTime <= currentTime);

    // Handle System Idle State Gaps cleanly
    if (readyPool.length === 0) {
      const uncompletedJobs = pool.filter(p => !p.isCompleted);
      if (uncompletedJobs.length > 0) {
        const nextArrival = Math.min(...uncompletedJobs.map(p => p.arrivalTime));
        rawGanttChart.push({ id: "Idle", start: currentTime, end: nextArrival, queueSnapshot: {} });
        currentTime = nextArrival;
        lastActiveProcessId = null; 
        continue;
      } else {
        break;
      }
    }

    // 3. Locate the highest priority active queue tier occupied by ready workloads
    const activeQueueTiers = readyPool.map(p => p.queueNo);
    const highestActiveTier = Math.min(...activeQueueTiers);

    const currentTierAlgo = mlfqAlgorithms[`q${highestActiveTier}`] || 'First-Come, First-Served (FCFS)';
    const tierProcesses = pool.filter(p => p.queueNo === highestActiveTier && !p.isCompleted);

    // 4. Build sub-scheduler inputs using relative clock offsets to enforce strict lane sequencing
    const subSchedulerInput = tierProcesses.map(p => {
      const relativeArrival = p.arrivalTime <= currentTime ? p.readyArrivalTime - currentTime : p.arrivalTime - currentTime;
      return {
        id: p.id,
        arrivalTime: relativeArrival,
        burstTime: p.remBurstTime,
        priority: p.priority
      };
    });

    let subSchedulerResult;
    if (currentTierAlgo === 'First-Come, First-Served (FCFS)') {
      subSchedulerResult = computeFCFS(subSchedulerInput, 0);
    } else if (currentTierAlgo === 'Round Robin (RR)') {
      subSchedulerResult = computeRR(subSchedulerInput, globalTimeQuantum, 0);
    } else if (currentTierAlgo === 'Shortest Job First (SJF)') {
      subSchedulerResult = computeSJF(subSchedulerInput, 0);
    } else if (currentTierAlgo === 'Shortest Remaining Time First (SRTF)') {
      subSchedulerResult = computeSRTF(subSchedulerInput, 0);
    } else if (currentTierAlgo === 'Priority') {
      subSchedulerResult = computePriority(subSchedulerInput, 0);
    } else if (currentTierAlgo === 'Preemptive Priority') {
      subSchedulerResult = computePreemptivePriority(subSchedulerInput, 0);
    }

    // Extract execution fragments computed by the targeted strategy block
    const standardGanttBlocks = subSchedulerResult.ganttChart.filter(b => b.id !== 'Idle' && b.id !== 'CS');
    if (standardGanttBlocks.length === 0) break;

    const targetedBlock = standardGanttBlocks[0];
    const selectedProc = pool.find(p => p.id === targetedBlock.id);
    const intendedSubDuration = targetedBlock.end - targetedBlock.start;

    // 5. Context Switch Handling: Inject switch overhead blocks when swapping processing contexts
    if (lastActiveProcessId !== null && lastActiveProcessId !== selectedProc.id && contextSwitch > 0) {
      const liveSnapshot = {};
      pool.forEach(p => { liveSnapshot[p.id] = p.queueNo; });
      rawGanttChart.push({ id: "CS", start: currentTime, end: currentTime + contextSwitch, queueSnapshot: liveSnapshot });
      
      currentTime += contextSwitch;
      lastActiveProcessId = selectedProc.id; 
      continue;
    }

    // 6. Enforce MLFQ Step Boundaries: Intersect sub-durations with custom time constraints
    let executionStepSize = intendedSubDuration;

    // Constraint A: Intercept the exact time remaining before a mandatory 10ms feedback queue shift
    const timeToShift = 10 - selectedProc.timeSpentInCurrentQueue;
    executionStepSize = Math.min(executionStepSize, timeToShift);

    // Constraint B: Intercept high priority process arrivals that disrupt lower tier allocations
    const unarrivedHigherPriorityJobs = pool.filter(p => !p.isCompleted && p.arrivalTime > currentTime && p.queueNo < selectedProc.queueNo);
    if (unarrivedHigherPriorityJobs.length > 0) {
      const nearestHigherArrival = Math.min(...unarrivedHigherPriorityJobs.map(p => p.arrivalTime));
      if (nearestHigherArrival < currentTime + executionStepSize) {
        executionStepSize = nearestHigherArrival - currentTime;
      }
    }

    // Absolute fallback boundary parameter guard
    if (executionStepSize <= 0) executionStepSize = 0.1;

    // 7. Advance time metrics and accumulate execution markers
    const blockStart = currentTime;
    currentTime += executionStepSize;
    selectedProc.remBurstTime -= executionStepSize;
    selectedProc.timeSpentInCurrentQueue += executionStepSize;

    // Capture an explicit snapshot map of process positions for the 3-lane visualizer
    const liveSnapshot = {};
    pool.forEach(p => { liveSnapshot[p.id] = p.queueNo; });

    rawGanttChart.push({ id: selectedProc.id, start: blockStart, end: currentTime, queueSnapshot: liveSnapshot });

    // 8. Dynamic Bidirectional Feedback Loop Engine Lifecycle Evaluation
    if (selectedProc.remBurstTime <= 0) {
      selectedProc.isCompleted = true;
      const turnAroundTime = currentTime - selectedProc.arrivalTime;
      const waitingTime = turnAroundTime - selectedProc.burstTime;

      calculatedProcesses.push({
        ...processes.find(p => p.id === selectedProc.id),
        completionTime: currentTime,
        turnAroundTime,
        waitingTime,
        queueNo: selectedProc.queueNo,
        priority: selectedProc.priority
      });
    } else {
      // Evaluate if process has consumed its complete 10ms slice limit within the current tier
      if (selectedProc.timeSpentInCurrentQueue >= 10) {
        selectedProc.timeSpentInCurrentQueue = 0; // Clear execution tracking tokens for new tier
        
        if (selectedProc.queueDirection === 1) {
          // Sinking Path Downward: Queue 1 -> Queue 2 -> Queue 3
          if (selectedProc.queueNo === 1) {
            selectedProc.queueNo = 2;
          } else if (selectedProc.queueNo === 2) {
            selectedProc.queueNo = 3;
            selectedProc.queueDirection = -1; // Bounce directional tracking upward at lower bound
          }
        } else {
          // Rising Path Upward: Queue 3 -> Queue 2 -> Queue 1
          if (selectedProc.queueNo === 3) {
            selectedProc.queueNo = 2;
          } else if (selectedProc.queueNo === 2) {
            selectedProc.queueNo = 1;
            selectedProc.queueDirection = 1;  // Bounce directional tracking downward at upper bound
          }
        }
        selectedProc.readyArrivalTime = currentTime; // Push to back of newly assigned queue layer
      } else if (currentTierAlgo.includes('Round Robin') || currentTierAlgo.includes('RR')) {
        // Yield order precedence within same queue level if sub-scheduler quantum expires early
        selectedProc.readyArrivalTime = currentTime;
      }
    }
    
    lastActiveProcessId = selectedProc.id;
  }

  // 9. Compress linear chart layout fragments for smooth visual tracking rendering
  const compressedGantt = [];
  rawGanttChart.forEach((block) => {
    if (compressedGantt.length > 0 && compressedGantt[compressedGantt.length - 1].id === block.id) {
      compressedGantt[compressedGantt.length - 1].end = block.end;
      compressedGantt[compressedGantt.length - 1].queueSnapshot = block.queueSnapshot;
    } else {
      compressedGantt.push({ ...block });
    }
  });

  calculatedProcesses.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  return { calculatedProcesses, ganttChart: compressedGantt };
}