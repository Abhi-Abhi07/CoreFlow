// coreflow/client/src/pages/Simulation.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  Cpu, 
  Play, 
  Pause,
  RotateCcw, 
  Plus, 
  Trash2, 
  Activity, 
  ChevronDown,
  Clock,
  Zap,
  Loader2,
  Pencil,
  Check,
  X,
  Timer,
  Gauge,
  CheckCircle2,
  BarChart3,
  Layers
} from 'lucide-react';
import { 
  setGlobalProcesses, 
  setGlobalAlgorithm, 
  setGlobalTimeQuantum, 
  setGlobalContextSwitch,
  setMlqQueueAlgorithm,
  setMlfqQueueAlgorithm 
} from '../redux/userSlice';
import { useSelector, useDispatch } from 'react-redux';
import { computeFCFS, computeRR, computeSJF, computeSRTF, computePriority, computePreemptivePriority, computeMLQ, computeMLFQ } from '../utils/schedulers/index';

export default function Simulate() {
  const dispatch = useDispatch();
  
  // Read state from Redux
  const processes = useSelector((state) => state.user.processes);
  const algorithm = useSelector((state) => state.user.algorithm);
  const timeQuantum = useSelector((state) => state.user.timeQuantum);
  const contextSwitch = useSelector((state) => state.user.contextSwitch);
  const mlqAlgorithms = useSelector((state) => state.user.mlqAlgorithms || {
    q1: 'Round Robin (RR)',
    q2: 'First-Come, First-Served (FCFS)',
    q3: 'Shortest Job First (SJF)'
  });

  const mlfqAlgorithms = useSelector((state) => state.user.mlfqAlgorithms || {
    q1: 'Round Robin (RR)',
    q2: 'First-Come, First-Served (FCFS)',
    q3: 'Shortest Job First (SJF)'
  });
  
  // Input states for adding new process
  const [newArrival, setNewArrival] = useState('');
  const [newBurst, setNewBurst] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [newQueueNo, setNewQueueNo] = useState('1');

  // Inline Row Editing States
  const [editingId, setEditingId] = useState(null);
  const [editIdText, setEditIdText] = useState('');
  const [editArrival, setEditArrival] = useState('');
  const [editBurst, setEditBurst] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editQueueNo, setEditQueueNo] = useState('1');

  // Playback Control States
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(100); 

  // Simulation Runtime Engine States
  const [runningProcessId, setRunningProcessId] = useState(null);
  const [runningProgress, setRunningProgress] = useState(0);
  const [simulationResults, setSimulationResults] = useState([]);
  const [ganttData, setGanttData] = useState([]);
  const [animationTotalDuration, setAnimationTotalDuration] = useState(0);
  const [currentVirtualClock, setCurrentVirtualClock] = useState(0);
  
  // Dynamic snapshot tracking hook for running workflows
  const [liveQueueMap, setLiveQueueMap] = useState({});

  // Synchronization references to anchor async loops cleanly across cycles
  const speedRef = useRef(speed);
  const isPausedRef = useRef(isPaused);
  const isSimulatingRef = useRef(isSimulating);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isSimulatingRef.current = isSimulating; }, [isSimulating]);

  const availableSubAlgos = [
    'First-Come, First-Served (FCFS)', 
    'Round Robin (RR)', 
    'Shortest Job First (SJF)', 
    'Shortest Remaining Time First (SRTF)', 
    'Priority', 
    'Preemptive Priority'
  ];

  // Configured Requirement Evaluators
  const isMlqAlgo = algorithm === "Multi Level Queue (MLQ)";
  const isMlfqAlgo = algorithm === "Multi Level Feedback Queue (MLFQ)";
  
  const isPriorityAlgo = algorithm.toLowerCase().includes('priority') || 
                        algorithm.toLowerCase().includes('mlq') || 
                        algorithm.toLowerCase().includes('mlfq') ||
                        (isMlqAlgo && Object.values(mlqAlgorithms).some(a => a.toLowerCase().includes('priority'))) ||
                        (isMlfqAlgo && Object.values(mlfqAlgorithms).some(a => a.toLowerCase().includes('priority')));

  const needsTimeQuantum = algorithm.toLowerCase().includes('round robin') || 
                           algorithm.toLowerCase().includes('feedback queue') || 
                           algorithm.toLowerCase().includes('mlfq') ||
                           (isMlqAlgo && Object.values(mlqAlgorithms).some(a => a.toLowerCase().includes('round robin')));

  // Helper evaluator to check if priority scheduling rules are active for a targeted queue layer
  const checkIsPriorityActiveForQueue = (qNo) => {
    if (!isMlqAlgo && !isMlfqAlgo) return algorithm.toLowerCase().includes('priority');
    const currentAlgoMap = isMlfqAlgo ? mlfqAlgorithms : mlqAlgorithms;
    const targetAlgo = currentAlgoMap[`q${qNo}`] || '';
    return targetAlgo.toLowerCase().includes('priority');
  };

  // Compute scale boundaries
  const totalDuration = ganttData.length > 0 ? ganttData[ganttData.length - 1].end : 0;

  // Deriving Ready Queue elements dynamically using continuous-time floats
  const readyQueueProcesses = processes.filter(p => {
    const hasArrived = p.arrivalTime <= currentVirtualClock;
    const pResults = simulationResults.find(sp => sp.id === p.id);
    const isCompleted = pResults !== undefined;
    const isCurrentlyRunning = runningProcessId === p.id;
    return hasArrived && !isCompleted && !isCurrentlyRunning;
  });

  // Calculate Core Performance Analytics Post-Simulation
  const totalProcessesCount = processes.length;
  const isSimulationComplete = !isSimulating && simulationResults.length === totalProcessesCount && totalProcessesCount > 0;

  const avgWaitingTime = isSimulationComplete
    ? (simulationResults.reduce((sum, p) => sum + p.waitingTime, 0) / totalProcessesCount).toFixed(2)
    : 0;

  const avgTurnaroundTime = isSimulationComplete
    ? (simulationResults.reduce((sum, p) => sum + p.turnAroundTime, 0) / totalProcessesCount).toFixed(2)
    : 0;

  const cpuEfficiency = isSimulationComplete && animationTotalDuration > 0
    ? ((processes.reduce((sum, p) => sum + p.burstTime, 0) / animationTotalDuration) * 100).toFixed(1)
    : 0;

  // Live CPU State Helper Evaluators
  const getLiveCPUStatusText = () => {
    if (!isSimulating && !isSimulationComplete) return "STANDBY";
    if (!isSimulating && isSimulationComplete) return "IDLE / FINISHED";
    if (isPaused) return "PAUSED";
    if (runningProcessId === 'Idle') return "IDLE (NO READY JOBS)";
    if (runningProcessId === 'CS') return "CONTEXT SWITCH OVERHEAD";
    return `EXECUTING WORKLOAD (${runningProcessId})`;
  };

  const getLiveCPUStatusColor = () => {
    if (!isSimulating && !isSimulationComplete) return "text-muted-foreground bg-muted/40 border-border";
    if (!isSimulating && isSimulationComplete) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (isPaused) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    if (runningProcessId === 'Idle') return "text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse";
    if (runningProcessId === 'CS') return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-primary bg-primary/10 border-primary/20";
  };

  // Add process handler
  const addProcess = (e) => {
    e.preventDefault();
    if (isSimulating) return;
    
    const qNo = (isMlqAlgo || isMlfqAlgo) ? parseInt(newQueueNo, 10) : 1;
    const priorityRequired = checkIsPriorityActiveForQueue(qNo);

    if (newArrival === '' || newBurst === '' || (priorityRequired && newPriority === '')) {
      alert("Please fill out all required fields."); 
      return;
    }

    const arrival = parseInt(newArrival, 10);
    const burst = parseInt(newBurst, 10);
    const priorityVal = priorityRequired ? parseInt(newPriority, 10) : undefined;

    if (arrival < 0 || burst <= 0) {
      alert("Arrival time must be ≥ 0 and Burst time must be > 0.");
      return;
    }
    if (priorityRequired && (priorityVal < 1 || priorityVal > 10)) {
      alert("Priority must be between 1 and 10.");
      return;
    }
    if ((isMlqAlgo || isMlfqAlgo) && (qNo < 1 || qNo > 3)) {
      alert("Queue identifier bounds must fall between 1 and 3.");
      return;
    }

    let maxIdNum = 0;
    processes.forEach(p => {
      const num = parseInt(p.id.substring(1), 10); 
      if (!isNaN(num) && num > maxIdNum) {
        maxIdNum = num;
      }
    });
    const nextId = `P${maxIdNum + 1}`;

    const newProcess = {
      id: nextId,
      arrivalTime: arrival,
      burstTime: burst,
      queueNo: qNo,
      ...(priorityRequired && { priority: priorityVal })
    };
    
    dispatch(setGlobalProcesses([...processes, newProcess]));
    resetSimulationMetrics();
    setNewArrival('');
    setNewBurst('');
    setNewPriority('');
  };

  const removeProcess = (id) => {
    if (isSimulating) return;
    const updatedList = processes.filter(p => p.id !== id);
    dispatch(setGlobalProcesses(updatedList));
    resetSimulationMetrics();
  };

  // Inline Editing Lifecycle Hooks
  const startEditing = (proc) => {
    if (isSimulating) return;
    setEditingId(proc.id);
    setEditIdText(proc.id);
    setEditArrival(proc.arrivalTime.toString());
    setEditBurst(proc.burstTime.toString());
    setEditPriority(proc.priority != null ? proc.priority.toString() : '');
    setEditQueueNo(proc.queueNo != null ? proc.queueNo.toString() : '1');
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEditedRow = (originalId) => {
    const qVal = (isMlqAlgo || isMlfqAlgo) ? parseInt(editQueueNo, 10) : 1;
    const priorityRequired = checkIsPriorityActiveForQueue(qVal);

    if (editIdText.trim() === '' || editArrival === '' || editBurst === '' || (priorityRequired && editPriority === '')) {
      alert("Fields cannot be empty during calculation updates.");
      return;
    }

    const arrival = parseInt(editArrival, 10);
    const burst = parseInt(editBurst, 10);
    const priorityVal = priorityRequired ? parseInt(editPriority, 10) : undefined;

    if (arrival < 0 || burst <= 0) {
      alert("Arrival must be ≥ 0 and Burst must be > 0.");
      return;
    }
    if (priorityRequired && (priorityVal < 1 || priorityVal > 10)) {
      alert("Priority bounds must fall between 1 and 10.");
      return;
    }
    if ((isMlqAlgo || isMlfqAlgo) && (qVal < 1 || qVal > 3)) {
      alert("Queue numbers must be between 1 and 3.");
      return;
    }

    const idCollision = processes.some(p => p.id === editIdText && p.id !== originalId);
    if (idCollision) {
      alert("A process with this custom PID already exists.");
      return;
    }

    const updatedList = processes.map(p => {
      if (p.id === originalId) {
        return {
          id: editIdText.trim(),
          arrivalTime: arrival,
          burstTime: burst,
          queueNo: qVal,
          ...(priorityRequired ? { priority: priorityVal } : {})
        };
      }
      return p;
    });

    dispatch(setGlobalProcesses(updatedList));
    setEditingId(null);
    resetSimulationMetrics();
  };

  const resetSimulationMetrics = () => {
    isSimulatingRef.current = false;
    isPausedRef.current = false;
    
    setSimulationResults([]); 
    setGanttData([]);        
    setRunningProcessId(null);
    setRunningProgress(0);
    setAnimationTotalDuration(0);
    setCurrentVirtualClock(0);
    setIsSimulating(false);
    setIsPaused(false);
    setLiveQueueMap({});
  };

  const handleStartSimulation = async () => {
    if (processes.length === 0) {
      alert("No processes to simulate!");
      return;
    }

    if (editingId) {
      alert("Please commit or discard pending modifications before starting execution.");
      return;
    }
    
    if (isPaused) {
      isPausedRef.current = false;
      setIsPaused(false);
      return;
    }
    
    let schedulerResult;

    if (algorithm === "First-Come, First-Served (FCFS)") {
      schedulerResult = computeFCFS(processes, contextSwitch);
    } else if (algorithm === "Round Robin (RR)") {
      schedulerResult = computeRR(processes, timeQuantum, contextSwitch);
    } else if (algorithm === "Shortest Job First (SJF)") {
      schedulerResult = computeSJF(processes, contextSwitch); 
    } else if (algorithm === "Shortest Remaining Time First (SRTF)") {
      schedulerResult = computeSRTF(processes, contextSwitch); 
    } else if (algorithm === "Priority") {
      schedulerResult = computePriority(processes, contextSwitch); 
    } else if (algorithm === "Preemptive Priority") {
      schedulerResult = computePreemptivePriority(processes, contextSwitch); 
    } else if (algorithm === "Multi Level Queue (MLQ)") {
      schedulerResult = computeMLQ(processes, contextSwitch, mlqAlgorithms, timeQuantum); 
    } else if (algorithm === "Multi Level Feedback Queue (MLFQ)") {
      schedulerResult = computeMLFQ(processes, contextSwitch, mlfqAlgorithms, timeQuantum); 
    }

    const { calculatedProcesses, ganttChart } = schedulerResult;
    if(!ganttChart || ganttChart.length === 0) return;
    
    const finalTimelineDuration = ganttChart[ganttChart.length - 1].end;
    
    isSimulatingRef.current = true;
    isPausedRef.current = false;
    
    setIsSimulating(true);
    setIsPaused(false);
    setGanttData([]);
    setSimulationResults([]);
    setAnimationTotalDuration(finalTimelineDuration);
    setCurrentVirtualClock(0);
    setLiveQueueMap({});

    let activeGanttTimeline = [];
    let completedProcessesAccumulator = [];
    const frameIntervalMs = 16; 

    for (let i = 0; i < ganttChart.length; i++) {
      if (!isSimulatingRef.current) return;
      
      const currentBlock = ganttChart[i];
      const executionDuration = currentBlock.end - currentBlock.start;

      let progressiveBlock = { ...currentBlock, end: currentBlock.start };
      activeGanttTimeline.push(progressiveBlock);
      setGanttData([...activeGanttTimeline]);

      let elapsedSimulatedTime = 0;

      while (elapsedSimulatedTime < executionDuration) {
        if (!isSimulatingRef.current) return;

        while (isPausedRef.current) {
          if (!isSimulatingRef.current) return;
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        const simulatedDelta = frameIntervalMs / speedRef.current;
        elapsedSimulatedTime = Math.min(executionDuration, elapsedSimulatedTime + simulatedDelta);
        
        const absoluteClockPosition = currentBlock.start + elapsedSimulatedTime;
        setCurrentVirtualClock(absoluteClockPosition);

        progressiveBlock.end = absoluteClockPosition;
        setGanttData([...activeGanttTimeline]);

        // Sync local queue snapshots during animation steps
        if (currentBlock.queueSnapshot) {
          setLiveQueueMap(currentBlock.queueSnapshot);
        }

        if (currentBlock.id !== 'Idle' && currentBlock.id !== 'CS') {
          setRunningProcessId(currentBlock.id);
          setRunningProgress(Math.round((elapsedSimulatedTime / executionDuration) * 100));
        } else {
          setRunningProcessId(currentBlock.id); 
          setRunningProgress(0);
        }

        await new Promise((resolve) => setTimeout(resolve, frameIntervalMs));
      }

      if (currentBlock.id !== 'Idle' && currentBlock.id !== 'CS') {
        const fullMetricsMatch = calculatedProcesses.find(p => p.id === currentBlock.id);
        if (fullMetricsMatch && Math.abs(currentBlock.end - fullMetricsMatch.completionTime) < 0.1) {
          completedProcessesAccumulator.push(fullMetricsMatch);
          setSimulationResults([...completedProcessesAccumulator]);
        }
      }
    }

    setRunningProcessId(null);
    setRunningProgress(0);
    setIsSimulating(false);
    setIsPaused(false);
    isSimulatingRef.current = false;
  };

  const handlePauseToggle = () => {
    const nextPauseState = !isPaused;
    isPausedRef.current = nextPauseState;
    setIsPaused(nextPauseState);
  };

  const displayList = processes.map(proc => {
    const runtimeMatch = simulationResults.find(r => r.id === proc.id);
    return runtimeMatch ? runtimeMatch : proc;
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-between select-none transition-colors duration-300">
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-10 space-y-8">
        
        {/* Top Split Layout Row */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Configuration Box */}
          <div className="lg:col-span-4 bg-card border border-border rounded-xl p-6 shadow-2xl shadow-black/5 dark:shadow-black/40 space-y-6">
            <div>
              <h2 className="text-sm font-mono tracking-widest text-muted-foreground uppercase mb-5 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Configuration
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Algorithm Selection</label>
                  <div className="relative mt-1.5">
                    <select 
                      disabled={isSimulating}
                      value={algorithm} 
                      onChange={(e) => dispatch(setGlobalAlgorithm(e.target.value))}
                      className="w-full text-xs p-3 bg-background border border-border rounded-lg text-foreground appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <option>First-Come, First-Served (FCFS)</option>
                      <option>Round Robin (RR)</option>
                      <option>Shortest Job First (SJF)</option>
                      <option>Shortest Remaining Time First (SRTF)</option>
                      <option>Priority</option>
                      <option>Preemptive Priority</option>
                      <option>Multi Level Queue (MLQ)</option>
                      <option>Multi Level Feedback Queue (MLFQ)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Strategy Mapper now binds correctly to either MLQ or MLFQ dependencies dynamically */}
                {(isMlqAlgo || isMlfqAlgo) && (
                  <div className="p-4 border border-border/80 bg-background/50 rounded-lg space-y-4 animate-fade-in">
                    <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-primary flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> Set Queue Strategies ({isMlfqAlgo ? 'MLFQ' : 'MLQ'})
                    </span>
                    {[1, 2, 3].map((num) => {
                      const activeMap = isMlfqAlgo ? mlfqAlgorithms : mlqAlgorithms;
                      return (
                        <div key={num}>
                          <label className="text-[9px] uppercase font-mono tracking-wide text-muted-foreground block mb-1">Queue {num} Strategy</label>
                          <div className="relative">
                            <select
                              disabled={isSimulating}
                              value={activeMap[`q${num}`]}
                              onChange={(e) => {
                                const actionPayload = { queueKey: `q${num}`, algo: e.target.value };
                                dispatch(isMlfqAlgo ? setMlfqQueueAlgorithm(actionPayload) : setMlqQueueAlgorithm(actionPayload));
                              }}
                              className="w-full text-[11px] p-2 bg-background border border-border rounded-md text-foreground appearance-none focus:outline-none focus:border-primary transition cursor-pointer"
                            >
                              {availableSubAlgos.map(opt => <option key={opt}>{opt}</option>)}
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-2.5 top-2.5 text-muted-foreground pointer-events-none" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {needsTimeQuantum && (
                  <div className="animate-fade-in">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Time Quantum (ms)</label>
                    <input 
                      type="number" 
                      min="1"
                      max="10"
                      disabled={isSimulating}
                      value={timeQuantum} 
                      onChange={(e) => {
                        let val = parseInt(e.target.value, 10);
                        if (isNaN(val)) val = 1; 
                        dispatch(setGlobalTimeQuantum(Math.min(10, Math.max(1, val))));
                      }}
                      className="w-full text-xs p-3 mt-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition shadow-sm disabled:opacity-50 font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Context Switch (ms)</label>
                  <input 
                    type="number" min="0" max="10" disabled={isSimulating} value={contextSwitch} 
                    onChange={(e) => {
                      let val = parseInt(e.target.value, 10);
                      if (isNaN(val)) val = 0; 
                      dispatch(setGlobalContextSwitch(Math.min(10, Math.max(0, val))));
                    }}
                    className="w-full text-xs p-3 mt-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition shadow-sm disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Live Playback Speed Control Slider */}
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>Simulation Speed Scale</span>
                <span className="text-primary font-bold">{speed} ms / unit</span>
              </div>
              <input 
                type="range" min="1" max="1000" value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[9px] font-mono text-muted-foreground mt-1">
                <span>1ms (Instant)</span>
                <span>1000ms (Fluid Slow-Mo)</span>
              </div>
            </div>
          </div>

          {/* Process Workload Section */}
          <div className="lg:col-span-8 bg-card border border-border rounded-xl p-6 shadow-2xl shadow-black/5 dark:shadow-black/40">
            <h3 className="text-sm font-mono tracking-widest text-muted-foreground uppercase mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Process Workload
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-muted-foreground border-collapse">
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th className="py-3 px-4 w-20">PID</th>
                    {(isMlqAlgo || isMlfqAlgo) && <th className="py-3 px-4 text-emerald-500 font-bold w-24">Queue No</th>}
                    {isPriorityAlgo && <th className="py-3 px-4 text-primary font-bold w-24">Priority</th>}
                    <th className="py-3 px-4 w-28">Arrival Time</th>
                    <th className="py-3 px-4 w-28">Burst Time</th>
                    <th className="py-3 px-4">Complete</th>
                    <th className="py-3 px-4">Turnaround</th>
                    <th className="py-3 px-4">Waiting</th>
                    <th className="py-3 px-4 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayList.map((proc) => {
                    const isEditing = proc.id === editingId;
                    const rowQueueNo = isEditing ? parseInt(editQueueNo, 10) : (proc.queueNo ?? 1);
                    const isPriorityActiveForRow = checkIsPriorityActiveForQueue(rowQueueNo);

                    // Dynamic runtime assignment mapping fallbacks
                    const currentLiveQueue = isSimulating 
                      ? (liveQueueMap[proc.id] ?? (isMlfqAlgo ? 1 : proc.queueNo ?? 1))
                      : (proc.queueNo ?? 1);

                    return (
                      <tr key={proc.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors h-14">
                        <td className="py-2 px-4 font-bold text-foreground">
                          {isEditing ? (
                            <input 
                              type="text" value={editIdText} onChange={(e) => setEditIdText(e.target.value)}
                              className="w-16 p-1 text-xs font-mono bg-background border border-primary rounded text-foreground focus:outline-none"
                            />
                          ) : proc.id}
                        </td>
                        
                        {(isMlqAlgo || isMlfqAlgo) && (
                          <td className="py-2 px-4 font-mono font-bold text-emerald-500">
                            {isEditing ? (
                              <select 
                                value={editQueueNo} onChange={(e) => setEditQueueNo(e.target.value)}
                                className="w-16 p-1 text-xs bg-background border border-primary rounded text-emerald-500 font-mono focus:outline-none"
                              >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                              </select>
                            ) : currentLiveQueue}
                          </td>
                        )}

                        {isPriorityAlgo && (
                          <td className="py-2 px-4 font-mono font-bold text-primary">
                            {isEditing ? (
                              isPriorityActiveForRow ? (
                                <input 
                                  type="number" min="1" max="10" value={editPriority} onChange={(e) => setEditPriority(e.target.value)}
                                  className="w-16 p-1 text-xs font-mono bg-background border border-primary rounded text-primary focus:outline-none"
                                />
                              ) : (
                                <span className="text-muted-foreground font-normal select-none px-2">-</span>
                              )
                            ) : (
                              isPriorityActiveForRow ? (proc.priority ?? '-') : '-'
                            )}
                          </td>
                        )}
                        
                        <td className="py-2 px-4">
                          {isEditing ? (
                            <input 
                              type="number" min="0" value={editArrival} onChange={(e) => setEditArrival(e.target.value)}
                              className="w-16 p-1 text-xs font-mono bg-background border border-primary rounded text-foreground focus:outline-none"
                            />
                          ) : `${proc.arrivalTime} ms`}
                        </td>
                        <td className="py-2 px-4">
                          {isEditing ? (
                            <input 
                              type="number" min="1" value={editBurst} onChange={(e) => setEditBurst(e.target.value)}
                              className="w-16 p-1 text-xs font-mono bg-background border border-primary rounded text-foreground focus:outline-none"
                            />
                          ) : `${proc.burstTime} ms`}
                        </td>
                        <td className="py-2 px-4 font-mono font-semibold text-foreground">
                          {isEditing ? '-' : (proc.completionTime != null ? `${proc.completionTime} ms` : '-')}
                        </td>
                        <td className="py-2 px-4 font-mono font-semibold text-foreground">
                          {isEditing ? '-' : (proc.turnAroundTime != null ? `${proc.turnAroundTime} ms` : '-')}
                        </td>
                        <td className="py-2 px-4 font-mono font-semibold text-foreground">
                          {isEditing ? '-' : (proc.waitingTime != null ? `${proc.waitingTime} ms` : '-')}
                        </td>
                        <td className="py-2 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isEditing ? (
                              <>
                                <button onClick={() => saveEditedRow(proc.id)} className="p-1 border border-green-500/40 rounded text-green-500 hover:bg-green-500/10"><Check className="w-3.5 h-3.5" /></button>
                                <button onClick={cancelEditing} className="p-1 border border-muted-foreground/30 rounded text-muted-foreground hover:bg-muted"><X className="w-3.5 h-3.5" /></button>
                              </>
                            ) : (
                              <>
                                <button disabled={isSimulating} onClick={() => startEditing(proc)} className="p-1.5 border border-border rounded hover:border-primary text-muted-foreground hover:text-primary disabled:opacity-40"><Pencil className="w-3.5 h-3.5" /></button>
                                <button disabled={isSimulating} onClick={() => removeProcess(proc.id)} className="p-1.5 border border-border rounded hover:border-destructive text-muted-foreground hover:text-destructive disabled:opacity-40"><Trash2 className="w-3.5 h-3.5" /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Ingestion Form */}
            <form onSubmit={addProcess} className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-border items-end">
              <div>
                <label className="text-[10px] uppercase text-muted-foreground font-mono block mb-1">Arrival Time</label>
                <input type="number" min="0" max="100" disabled={isSimulating} placeholder="0" value={newArrival} onChange={(e) => setNewArrival(e.target.value)} className="p-2.5 bg-background border border-border rounded-lg text-xs text-foreground w-32 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm disabled:opacity-50" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-muted-foreground font-mono block mb-1">Burst Time</label>
                <input type="number" min="1" max="100" disabled={isSimulating} placeholder="5" value={newBurst} onChange={(e) => setNewBurst(e.target.value)} className="p-2.5 bg-background border border-border rounded-lg text-xs text-foreground w-32 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm disabled:opacity-50" />
              </div>
              
              {(isMlqAlgo || isMlfqAlgo) && (
                <div className="animate-fade-in">
                  <label className="text-[10px] uppercase text-emerald-500 font-mono font-bold block mb-1">Queue No</label>
                  <select 
                    disabled={isSimulating} 
                    value={newQueueNo} 
                    onChange={(e) => setNewQueueNo(e.target.value)} 
                    className="p-2.5 bg-background border border-border rounded-lg text-xs text-emerald-500 font-mono font-bold w-32 focus:outline-none focus:border-primary shadow-sm disabled:opacity-50"
                  >
                    <option value="1">Queue 1</option>
                    <option value="2">Queue 2</option>
                    <option value="3">Queue 3</option>
                  </select>
                </div>
              )}

              {isPriorityAlgo && checkIsPriorityActiveForQueue((isMlqAlgo || isMlfqAlgo) ? parseInt(newQueueNo, 10) : 1) && (
                <div className="animate-fade-in">
                  <label className="text-[10px] uppercase text-primary font-mono font-bold block mb-1">Priority (1-10)</label>
                  <input type="number" min="1" max="10" disabled={isSimulating} placeholder="1" value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="p-2.5 bg-background border border-primary/50 text-primary focus:border-primary rounded-lg text-xs w-32 focus:outline-none ring-primary shadow-sm font-mono font-bold disabled:opacity-50" />
                </div>
              )}
              <button type="submit" disabled={isSimulating} className="px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer shadow-md disabled:cursor-not-allowed"><Plus className="w-4 h-4" /> Add Process</button>
            </form>
          </div>
        </div>

        {/* Post-Execution Analytics Cards Dashboard Block */}
        {isSimulationComplete && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full animate-fade-in">
            <div className="bg-card border border-border rounded-xl p-5 shadow-xl flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary"><Timer className="w-5 h-5" /></div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Avg Waiting Time</p>
                <p className="text-lg font-mono font-bold text-foreground">{avgWaitingTime} ms</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 shadow-xl flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary"><BarChart3 className="w-5 h-5" /></div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Avg Turnaround</p>
                <p className="text-lg font-mono font-bold text-foreground">{avgTurnaroundTime} ms</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 shadow-xl flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary"><Clock className="w-5 h-5" /></div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Total Execution</p>
                <p className="text-lg font-mono font-bold text-foreground">{animationTotalDuration} ms</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 shadow-xl flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500"><Gauge className="w-5 h-5" /></div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">CPU Efficiency</p>
                <p className="text-lg font-mono font-bold text-emerald-500">{cpuEfficiency}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Full-Width Layout Row */}
        <div className="grid grid-cols-1 gap-6 w-full">
          <div className="bg-card border border-border rounded-xl p-6 shadow-2xl shadow-black/5 dark:shadow-black/40 w-full">
            
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-border/60 pb-4">
              <h3 className="text-sm font-mono tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Live Scheduling Activity Visualizer
              </h3>
              
              <div className={`flex items-center gap-2 px-3 py-1 text-xs font-mono font-bold rounded-full border shadow-sm transition-all duration-300 ${getLiveCPUStatusColor()}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                STATUS: {getLiveCPUStatusText()}
              </div>
            </div>

            <div className="grid md:grid-cols-12 gap-8 items-center border-b border-border/60 pb-6 mb-6">
              
              {/* Left Side: Processor Active State Tracking Progress */}
              <div className="md:col-span-4 space-y-4 border-r border-border/40 pr-0 md:pr-8">
                <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Processor Active Execution State</p>
                {runningProcessId ? (
                  <div className="p-4 rounded-xl border border-border bg-background/50 space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="flex items-center gap-2 font-bold text-foreground">
                        <Cpu className={`w-4 h-4 ${runningProcessId === 'CS' ? 'text-amber-500' : 'text-primary'} ${runningProcessId !== 'Idle' && runningProcessId !== 'CS' && !isPaused ? 'animate-pulse' : ''}`} />
                        State Target: <span className={runningProcessId === 'CS' ? 'text-amber-500 font-mono font-bold' : 'text-primary font-mono'}>{runningProcessId === 'CS' ? 'Context Switch Overhead' : runningProcessId}</span>
                      </span>
                      <span className="text-muted-foreground font-semibold">
                        {isPaused ? 'Simulation Paused' : (runningProcessId === 'Idle' ? 'System Idle' : runningProcessId === 'CS' ? 'Swapping Vector' : `${runningProgress}% Computed`)}
                      </span>
                    </div>
                    <div className="w-full bg-muted h-3 rounded-full overflow-hidden border border-border/80 shadow-inner">
                      <div 
                        style={{ width: `${runningProcessId === 'Idle' || runningProcessId === 'CS' ? 100 : runningProgress}%` }}
                        className={`h-full transition-all duration-[16ms] linear ${isPaused ? 'bg-zinc-600' : runningProcessId === 'Idle' ? 'bg-muted-foreground/30' : runningProcessId === 'CS' ? 'bg-amber-500/80' : 'bg-primary'}`} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-xl bg-background/30 font-mono flex items-center justify-center gap-2">
                    {isSimulationComplete ? <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-bounce" /> : <Cpu className="w-4 h-4" />}
                    {isSimulationComplete ? "Execution cycle finished successfully." : "Processor core engine standing by..."}
                  </div>
                )}
              </div>

              {/* Right Side: Streaming Ready Queue Pipeline Stream */}
              <div className="md:col-span-8 space-y-3">
                <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                  Ready Queue Pipeline Stream ({readyQueueProcesses.length})
                </p>
                
                <div className="flex flex-col gap-2 bg-background/40 border border-border/60 rounded-xl p-3 shadow-inner">
                  {/* Render Multi-Lane Stream View for Layered Schedulers */}
                  {isMlqAlgo || isMlfqAlgo ? (
                    [1, 2, 3].map((qNum) => {
                      const processesInLane = readyQueueProcesses.filter(p => {
                        const calculatedQ = liveQueueMap[p.id] ?? (isMlfqAlgo ? 1 : p.queueNo ?? 1);
                        return calculatedQ === qNum;
                      });

                      return (
                        <div key={qNum} className="flex items-center gap-4 border-b border-border/30 last:border-none pb-2 last:pb-0 pt-1 first:pt-0">
                          <div className="w-24 font-mono text-[10px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10 whitespace-nowrap">
                            Queue {qNum}
                          </div>
                          <div className="flex items-center gap-2 overflow-x-auto py-1 min-h-[52px] flex-1 scrollbar-none">
                            {processesInLane.length === 0 ? (
                              <span className="text-[10px] text-muted-foreground/60 font-mono italic pl-1">Queue lane clear</span>
                            ) : (
                              processesInLane.map((p) => (
                                <div 
                                  key={p.id} 
                                  className="flex flex-col items-center justify-center py-1.5 px-4 bg-card border border-border/80 text-foreground font-mono text-xs font-bold rounded-lg shadow-sm border-l-2 border-l-emerald-500 whitespace-nowrap animate-fade-in"
                                >
                                  <span>{p.id}</span>
                                  <span className="text-[8px] text-muted-foreground font-normal mt-0.5">Arr: {p.arrivalTime}ms</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Default Fallback Single Lane Layout Row View */
                    <div className="flex items-center gap-2 overflow-x-auto py-2 min-h-[64px]">
                      {readyQueueProcesses.length === 0 ? (
                        <div className="text-xs text-muted-foreground font-mono italic pl-2">
                          {isSimulating ? "Ready queue empty (all arrived jobs executing/complete)" : isSimulationComplete ? "All jobs processed completely" : "No simulation running"}
                        </div>
                      ) : (
                        readyQueueProcesses.map((p) => (
                          <div 
                            key={p.id} 
                            className="flex flex-col items-center justify-center p-3 px-5 bg-background border-2 border-border text-foreground font-mono text-xs font-bold rounded-lg shadow-sm border-l-primary animate-fade-in whitespace-nowrap"
                          >
                            <span className="text-foreground">{p.id}</span>
                            <span className="text-[9px] text-muted-foreground font-normal mt-0.5">Arr: {p.arrivalTime}ms</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Gantt Chart sequence container row */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Gantt Chart Sequence Timeline</p>
                {isSimulating && (
                  <span className="text-xs font-mono text-primary flex items-center gap-1.5 bg-primary/10 px-2 py-0.5 rounded">
                    {isPaused ? (
                      <span className="text-amber-500 flex items-center gap-1.5"><Pause className="w-3 h-3" /> Playback Paused</span>
                    ) : (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" /> Stream Sync Active
                      </>
                    )}
                  </span>
                )}
              </div>
              
              {ganttData.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-12 font-mono border border-dashed border-border rounded-lg bg-background/50">
                  Click the "Start Simulation Execution" button control below to render real-time Gantt tracking models...
                </div>
              ) : (
                <div className="space-y-3 animate-fade-in">
                  <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
                    <div 
                      style={{ 
                        minWidth: `${Math.max(100, ganttData.length * 130)}px`, 
                        width: '100%' 
                      }}
                      className="bg-muted h-14 rounded-xl border border-border flex shadow-inner p-1 gap-0.5"
                    >
                      {ganttData.map((block, idx) => {
                        const blockDuration = block.end - block.start;
                        const activeTotalBounds = animationTotalDuration || totalDuration;
                        const widthPercent = activeTotalBounds > 0 ? (blockDuration / activeTotalBounds) * 100 : 0;
                        
                        const isIdle = block.id === 'Idle';
                        const isCS = block.id === 'CS';
                        
                        return (
                          <div
                            key={idx}
                            style={{ width: `${widthPercent}%` }}
                            className={`h-full flex flex-col justify-center items-center font-mono font-bold text-xs rounded-md transition-all duration-[16ms] linear overflow-hidden relative min-w-[50px] ${
                              isIdle 
                                ? 'bg-muted-foreground/10 text-muted-foreground border border-dashed border-border/80 bg-[linear-gradient(45deg,rgba(0,0,0,0.03)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.03)_50%,rgba(0,0,0,0.03)_75%,transparent_75%,transparent)] bg-[size:8px_8px]' 
                                : isCS
                                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 bg-[linear-gradient(45deg,rgba(245,158,11,0.05)_25%,transparent_25%,transparent_50%,rgba(245,158,11,0.05)_50%,rgba(245,158,11,0.05)_75%,transparent_75%,transparent)] bg-[size:8px_8px]'
                                : 'bg-primary text-primary-foreground shadow-md'
                            }`}
                            title={`${block.id} (${block.start.toFixed(1)}ms - ${block.end.toFixed(1)}ms)`}
                          >
                            <span className="truncate px-1 text-[11px]">{block.id}</span>
                            <span className="text-[9px] opacity-80 font-normal">{blockDuration.toFixed(1)}ms</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex w-full justify-between text-[10px] font-mono text-muted-foreground px-1">
                    <span>Clock Start: 0 ms</span>
                    <span className="text-foreground bg-muted border border-border px-2 py-0.5 rounded font-bold">Virtual Clock: {currentVirtualClock.toFixed(1)} ms</span>
                    <span className="text-primary font-bold">Target Max: {animationTotalDuration} ms</span>
                  </div>
                </div>
              )}
            </div>

            {/* Simulation Controls Footer Section */}
            <div className="flex justify-end gap-4 pt-8 mt-6 border-t border-border/60">
              {isSimulating && (
                <button
                  onClick={handlePauseToggle}
                  className={`flex items-center space-x-2 px-6 py-3 text-white rounded-lg transition-all cursor-pointer shadow-md font-bold text-xs ${
                    isPaused ? 'bg-amber-600 hover:bg-amber-500' : 'bg-zinc-700 hover:bg-zinc-600'
                  }`}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Resume Simulation</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 fill-white" />
                      <span>Pause Playback</span>
                    </>
                  )}
                </button>
              )}

              <button
                disabled={(isSimulating && !isPaused) || processes.length === 0}
                onClick={handleStartSimulation}
                className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg disabled:opacity-40 transition-all cursor-pointer shadow-md font-bold text-xs group disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 text-primary-foreground group-hover:scale-110 transition-transform" />
                <span>{isSimulating ? 'Simulating...' : 'Start Simulation Execution'}</span>
              </button>
              
              <button 
                onClick={resetSimulationMetrics}
                className="flex items-center space-x-2 px-6 py-3 bg-background border border-border rounded-lg hover:border-muted-foreground hover:bg-muted transition-all cursor-pointer shadow-sm text-xs font-bold text-foreground group"
              >
                <RotateCcw className="w-4 h-4 text-muted-foreground group-hover:rotate-180 transition-transform duration-500" />
                <span>Reset Space</span>
              </button>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}



COREFLOW/client/src/utils/schedulers/index.js
export { computeFCFS } from './fcfs';
export { computeRR } from './roundRobin';
export { computeSJF } from './sjf';
export { computeSRTF } from './srtf';
export { computePriority } from './priority';
export { computePreemptivePriority } from './preemptivePriority';
export { computeMLQ } from './mlq';
export { computeMLFQ } from './mlfq';



COREFLOW/client/src/utils/schedulers/fcfs.js
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



COREFLOW/client/src/utils/schedulers/roundRobin.js
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


COREFLOW/client/src/utils/schedulers/sjf.jsx
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


COREFLOW/client/src/utils/schedulers/srtf.js
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


COREFLOW/client/src/utils/schedulers/priority.js
/**
 * Priority CPU Scheduling Algorithm (Non-Preemptive) with Context Switching
 * @param {Array} processes - Array of process objects containing { id, arrivalTime, burstTime, priority }
 * @param {number} contextSwitch - Context switch overhead duration in ms
 * @returns {Object} { calculatedProcesses, ganttChart }
 */
export function computePriority(processes, contextSwitch = 0) {
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
        currentTime = nextArrival;
        continue; // Re-evaluate ready queue at the updated time jump
      } else {
        break;
      }
    }

    // Sort Ready Queue based on Priority Rules:
    // 1. Higher Priority first (Lower priority number = Higher priority rank)
    // 2. Earliest Arrival Time (Tiebreaker 1)
    // 3. Alphanumeric PID sorting (Tiebreaker 2)
    readyQueue.sort((a, b) => {
      const pA = a.priority ?? 10; // Fallback default rank
      const pB = b.priority ?? 10;
      
      if (pA !== pB) {
        return pA - pB; 
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


COREFLOW/client/src/utils/schedulers/preemptivePriority.js
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



// coreflow/client/src/utils/schedulers/mlfq.js
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




// coreflow/client/src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "User",
  initialState: {
    user: null,
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 8, priority: 2, queueNo: 1 },
      { id: 'P2', arrivalTime: 1, burstTime: 4, priority: 1, queueNo: 2 },
      { id: 'P3', arrivalTime: 2, burstTime: 9, priority: 3, queueNo: 3 },
    ],
    algorithm: 'Round Robin (RR)',
    timeQuantum: 2,
    contextSwitch: 1,
    mlqAlgorithms: {
      q1: 'Round Robin (RR)',
      q2: 'First-Come, First-Served (FCFS)',
      q3: 'Shortest Job First (SJF)'
    },
    mlfqAlgorithms: {
      q1: 'Round Robin (RR)',
      q2: 'First-Come, First-Served (FCFS)',
      q3: 'Shortest Job First (SJF)'
    }
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setGlobalProcesses: (state, action) => {
      state.processes = action.payload;
    },
    setGlobalAlgorithm: (state, action) => {
      const selectedAlgo = action.payload;
      state.algorithm = selectedAlgo;

      // Inject clean operational fallbacks for queue and priority metrics
      if (
        selectedAlgo.toLowerCase().includes("priority") || 
        selectedAlgo.toLowerCase().includes("queue") || 
        selectedAlgo.toLowerCase().includes("mlq") ||
        selectedAlgo.toLowerCase().includes("mlfq")
      ) {
        state.processes = state.processes.map(proc => ({
          ...proc,
          priority: proc.priority !== undefined ? proc.priority : Math.floor(Math.random() * 10) + 1,
          queueNo: proc.queueNo !== undefined ? proc.queueNo : 1
        }));
      }
    },
    setGlobalTimeQuantum: (state, action) => {
      state.timeQuantum = action.payload;
    },
    setGlobalContextSwitch: (state, action) => {
      state.contextSwitch = action.payload;
    },
    setMlqQueueAlgorithm: (state, action) => {
      const { queueKey, algo } = action.payload;
      if (!state.mlqAlgorithms) {
        state.mlqAlgorithms = { q1: 'Round Robin (RR)', q2: 'First-Come, First-Served (FCFS)', q3: 'Shortest Job First (SJF)' };
      }
      state.mlqAlgorithms[queueKey] = algo;
    },
    setMlfqQueueAlgorithm: (state, action) => {
      const { queueKey, algo } = action.payload;
      // FIX: Check and mutate mlfqAlgorithms instead of mlqAlgorithms
      if (!state.mlfqAlgorithms) {
        state.mlfqAlgorithms = { q1: 'Round Robin (RR)', q2: 'First-Come, First-Served (FCFS)', q3: 'Shortest Job First (SJF)' };
      }
      state.mlfqAlgorithms[queueKey] = algo;
    }
  }
});

export const { 
  setUser, 
  setGlobalProcesses, 
  setGlobalAlgorithm, 
  setGlobalTimeQuantum, 
  setGlobalContextSwitch,
  setMlqQueueAlgorithm,
  setMlfqQueueAlgorithm
} = userSlice.actions;
export default userSlice.reducer;

now see this screenshot firstly all the process are run for 10ms in fcfs which q1 after that they demotion q1 to q2 now they are follow rr but not work 