// coreflow/client/src/utils/schedulers/mlq.js
import { computeFCFS } from './fcfs';
import { computeRR } from './roundRobin';
import { computeSJF } from './sjf';
import { computeSRTF } from './srtf';
import { computePriority } from './priority';
import { computePreemptivePriority } from './preemptivePriority';

/**
 * Multi-Level Queue (MLQ) CPU Scheduling Algorithm with Layered Strategy Routing
 * @param {Array} processes - Array of processes containing { id, arrivalTime, burstTime, priority, queueNo }
 * @param {number} contextSwitch - Context switch overhead duration in ms
 * @param {Object} mlqAlgorithms - Map tracking internal queue configurations { q1, q2, q3 }
 * @param {number} globalTimeQuantum - Time slice for layers executing Round Robin configurations
 * @returns {Object} { calculatedProcesses, ganttChart }
 */
export function computeMLQ(processes, contextSwitch = 0, mlqAlgorithms = {}, globalTimeQuantum = 2) {
  const pool = processes.map(p => ({
    ...p,
    queueNo: p.queueNo ? parseInt(p.queueNo, 10) : 1,
    priority: p.priority ? parseInt(p.priority, 10) : 10,
    remBurstTime: p.burstTime,
    isCompleted: false,
    readyArrivalTime: p.arrivalTime
  }));

  let currentTime = 0;
  let lastActiveProcessId = null;
  const rawGanttChart = [];
  const calculatedProcesses = [];

  while (calculatedProcesses.length < processes.length) {
    const readyPool = pool.filter(p => !p.isCompleted && p.arrivalTime <= currentTime);

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

    const activeQueueTiers = readyPool.map(p => p.queueNo);
    const highestActiveTier = Math.min(...activeQueueTiers);

    const currentTierAlgo = mlqAlgorithms[`q${highestActiveTier}`] || 'First-Come, First-Served (FCFS)';
    const tierProcesses = pool.filter(p => p.queueNo === highestActiveTier && !p.isCompleted);

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

    const standardGanttBlocks = subSchedulerResult.ganttChart.filter(b => b.id !== 'Idle' && b.id !== 'CS');
    if (standardGanttBlocks.length === 0) break;

    const targetedBlock = standardGanttBlocks[0];
    const selectedProc = pool.find(p => p.id === targetedBlock.id);
    const intendedSubDuration = targetedBlock.end - targetedBlock.start;

    if (lastActiveProcessId !== null && lastActiveProcessId !== selectedProc.id && contextSwitch > 0) {
      const liveSnapshot = {};
      pool.forEach(p => { liveSnapshot[p.id] = p.queueNo; });
      rawGanttChart.push({ id: "CS", start: currentTime, end: currentTime + contextSwitch, queueSnapshot: liveSnapshot });
      currentTime += contextSwitch;
      lastActiveProcessId = selectedProc.id;
      continue;
    }

    let executionStepSize = intendedSubDuration;
    const unarrivedHigherPriorityJobs = pool.filter(p => !p.isCompleted && p.arrivalTime > currentTime && p.queueNo < selectedProc.queueNo);
    
    if (unarrivedHigherPriorityJobs.length > 0) {
      const nearestHigherArrival = Math.min(...unarrivedHigherPriorityJobs.map(p => p.arrivalTime));
      if (nearestHigherArrival < currentTime + executionStepSize) {
        executionStepSize = nearestHigherArrival - currentTime;
      }
    }

    const blockStart = currentTime;
    currentTime += executionStepSize;
    selectedProc.remBurstTime -= executionStepSize;

    // Capture snapshot of positions right at the execution point
    const liveSnapshot = {};
    pool.forEach(p => { liveSnapshot[p.id] = p.queueNo; });

    rawGanttChart.push({ id: selectedProc.id, start: blockStart, end: currentTime, queueSnapshot: liveSnapshot });

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
      selectedProc.readyArrivalTime = currentTime;
    }
    
    lastActiveProcessId = selectedProc.id;
  }

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
