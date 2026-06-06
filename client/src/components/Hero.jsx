// src/components/Hero.jsx
import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Play, 
  Pause, 
  ExternalLink,
  ChevronDown,
  Activity,
  Server,
  Layers
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Added routing hook
import { setGlobalProcesses, setGlobalAlgorithm } from '../redux/userSlice';

export default function Hero() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Navigation engine initialization
  
  // Read absolute state parameters from our centralized Redux store
  const processes = useSelector((state) => state.user.processes);
  const algorithm = useSelector((state) => state.user.algorithm);

  // Marketing Landing Metrics
  const [telemetry, setTelemetry] = useState({
    utilization: 91.4,
    loadAverage: 3.8,
    throughput: 18.4
  });

  // Miniature Preview Card Engine States
  const [isPreviewRunning, setIsPreviewRunning] = useState(true);
  const [previewClock, setPreviewClock] = useState(12.4);
  const [activePid, setActivePid] = useState('P1');
  const [activeProgress, setActiveProgress] = useState(65);

  // Fluctuating background telemetry metrics to create a "living" dashboard effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        utilization: parseFloat(Math.min(100, Math.max(75, prev.utilization + (Math.random() - 0.5) * 3)).toFixed(1)),
        loadAverage: parseFloat(Math.max(1.5, Math.min(8, prev.loadAverage + (Math.random() - 0.5) * 0.4)).toFixed(2)),
        throughput: parseFloat(Math.max(12, Math.min(28, prev.throughput + (Math.random() - 0.5) * 1.5)).toFixed(1))
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Self-driving miniature loop for the interactive visual preview card
  useEffect(() => {
    if (!isPreviewRunning) return;

    const engineTimer = setInterval(() => {
      setPreviewClock(prev => {
        const nextClock = prev + 0.4;
        if (nextClock > 32) return 0;
        
        if (nextClock < 10) {
          setActivePid('P1');
          setActiveProgress(Math.round((nextClock / 10) * 100));
        } else if (nextClock >= 10 && nextClock < 13) {
          setActivePid('CS'); 
          setActiveProgress(0);
        } else if (nextClock >= 13 && nextClock < 25) {
          setActivePid('P2');
          setActiveProgress(Math.round(((nextClock - 13) / 12) * 100));
        } else {
          setActivePid('Idle');
          setActiveProgress(0);
        }
        return nextClock;
      });
    }, 120);

    return () => clearInterval(engineTimer);
  }, [isPreviewRunning]);

  // Enhanced dynamic workload preset handler with Redux-aware conditional Priority logic
  const handleWorkloadPreset = (e) => {
    const count = parseInt(e.target.value, 10); 
    const isPriorityAlgo = algorithm.toLowerCase().includes('priority') || 
                        algorithm.toLowerCase().includes('mlfq');

    const generatedProcesses = Array.from({ length: count }, (_, index) => ({
      id: `P${index + 1}`,
      arrivalTime: Math.floor(Math.random() * 6), // Randomized 0 to 5ms
      burstTime: Math.floor(Math.random() * 10) + 1, // Randomized 1 to 10ms
      ...(isPriorityAlgo && { priority: Math.floor(Math.random() * 10) + 1 }) // Priority bounds 1 to 10
    }));

    dispatch(setGlobalProcesses(generatedProcesses));
  };

  const getPreviewBadgeStyles = () => {
    if (!isPreviewRunning) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    if (activePid === 'Idle') return "text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse";
    if (activePid === 'CS') return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-primary bg-primary/10 border-primary/20";
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-center select-none transition-colors duration-300">
      <main className="max-w-7xl mx-auto w-full px-6 md:px-12 py-16 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Core Value Proposition Statements */}
        <div className="lg:col-span-7 flex flex-col space-y-6 text-left">
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 w-fit shadow-sm">
            <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
            <span className="text-xs font-bold tracking-widest text-primary uppercase font-mono">Simulations & Analytics Engine</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground">
            Observe Processing Flow <br />
            <span className="text-primary">In True Real-Time.</span>
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
            Analyze complex process lifecycles, measure critical wait periods, and audit performance matrices with a high-fidelity scheduling dashboard designed for engineering transparency.
          </p>

          <div className="flex items-center space-x-4 pt-2">
            {/* Dynamic programmatic push handler routed safely toward your canvas view */}
            <button 
              onClick={() => navigate('/simulation')}
              className="px-6 py-3.5 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all flex items-center space-x-2 shadow-lg shadow-primary/20 cursor-pointer group"
            >
              <span>Launch Live Simulator</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/docs')}
              className="px-6 py-3.5 text-xs font-bold text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-all shadow-sm cursor-pointer"
            >
              View Source Documentation
            </button>
          </div>

          {/* Core Hardware Metrics Trackers */}
          <div className="grid grid-cols-3 gap-4 pt-10 border-t border-border/60 max-w-xl">
            <div>
              <p className="text-2xl md:text-3xl font-mono font-black text-foreground tracking-tight">{telemetry.utilization}%</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mt-1 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-primary" /> Core Duty Cycle
              </p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-mono font-black text-foreground tracking-tight">{telemetry.loadAverage}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mt-1 flex items-center gap-1.5">
                <Server className="w-3 h-3 text-primary" /> Load Index
              </p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-mono font-black text-foreground tracking-tight">{telemetry.throughput} p/s</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mt-1 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-primary" /> Velocity Output
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Advanced Component Panel Dashboard Widget */}
        <div className="lg:col-span-5 bg-card border border-border rounded-xl p-6 shadow-2xl shadow-black/5 dark:shadow-black/40 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-80 pointer-events-none" />
          
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-border/80">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-primary" /> Live Vector Preview
            </span>
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full border shadow-sm transition-all duration-300 ${getPreviewBadgeStyles()}`}>
              <span className="w-1 h-1 rounded-full bg-current" />
              {activePid === 'CS' ? 'CS OVERHEAD' : activePid === 'Idle' ? 'CORE IDLE' : `RUNNING: ${activePid}`}
            </div>
          </div>

          {/* Active Workload Simulation Bar Stack */}
          <div className="space-y-4 pt-6">
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-2">
                <span className="text-foreground font-bold flex items-center gap-1.5">
                  <Activity className={`w-3.5 h-3.5 text-primary ${isPreviewRunning && activePid !== 'Idle' && activePid !== 'CS' ? 'animate-pulse' : ''}`} /> 
                  Active Processor Pipeline
                </span>
                <span className="text-muted-foreground text-[11px]">
                  {activePid === 'Idle' ? '0% (Waiting)' : activePid === 'CS' ? 'Vector Swap' : `${activeProgress}% Tracked`}
                </span>
              </div>
              <div className="w-full bg-muted h-3 rounded-full overflow-hidden border border-border shadow-inner p-0.5">
                <div 
                  style={{ width: `${activePid === 'Idle' || activePid === 'CS' ? 100 : activeProgress}%` }}
                  className={`h-full rounded-full transition-all duration-150 ease-out ${
                    !isPreviewRunning ? 'bg-zinc-600' : activePid === 'Idle' ? 'bg-muted-foreground/20' : activePid === 'CS' ? 'bg-amber-500/80 animate-pulse' : 'bg-primary'
                  }`} 
                />
              </div>
            </div>
          </div>

          {/* Micro Mini Gantt Sequence Strip */}
          <div className="mt-6 p-3 rounded-lg bg-background/50 border border-border/60 space-y-2">
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Computed Timeline Layout Frame</p>
            <div className="w-full bg-muted h-10 rounded-md flex overflow-hidden p-0.5 gap-0.5">
              <div 
                className={`h-full rounded transition-all duration-300 ${activePid === 'P1' ? 'ring-2 ring-primary ring-offset-1 ring-offset-card' : ''} bg-primary text-primary-foreground font-mono font-bold text-[10px] flex items-center justify-center`}
                style={{ width: '35%' }}
              >
                P1
              </div>
              <div 
                className={`h-full rounded border border-amber-500/20 bg-[linear-gradient(45deg,rgba(245,158,11,0.05)_25%,transparent_25%,transparent_50%,rgba(245,158,11,0.05)_50%,rgba(245,158,11,0.05)_75%,transparent_75%,transparent)] bg-[size:6px_6px] ${activePid === 'CS' ? 'bg-amber-500/30' : ''}`} 
                style={{ width: '10%' }}
              />
              <div 
                className={`h-full rounded transition-all duration-300 ${activePid === 'P2' ? 'ring-2 ring-primary ring-offset-1 ring-offset-card' : ''} bg-primary/80 text-primary-foreground font-mono font-bold text-[10px] flex items-center justify-center`}
                style={{ width: '40%' }}
              >
                P2
              </div>
              <div 
                className={`h-full rounded border border-dashed border-border/80 bg-[linear-gradient(45deg,rgba(0,0,0,0.02)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.02)_50%,rgba(0,0,0,0.02)_75%,transparent_75%,transparent)] bg-[size:6px_6px] ${activePid === 'Idle' ? 'bg-muted-foreground/10' : ''}`} 
                style={{ width: '15%' }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] font-mono text-muted-foreground pt-1">
              <span>0.0 ms</span>
              <span className="text-foreground font-bold bg-background px-1.5 py-0.2 rounded border border-border">Preview Clock: {previewClock.toFixed(1)} ms</span>
              <span>32.0 ms</span>
            </div>
          </div>

          {/* Interactive Form Controller Bindings linked with Global Redux Slice Hooks */}
          <div className="pt-6 mt-6 border-t border-border space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-1 block">Selected Algorithm</label>
                <div className="relative">
                  <select 
                    value={algorithm}
                    onChange={(e) => dispatch(setGlobalAlgorithm(e.target.value))}
                    className="w-full text-xs p-2.5 bg-background border border-border rounded-lg text-foreground appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer shadow-sm transition"
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
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-3 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-1 block">Workload Matrix</label>
                <div className="relative">
                  <select 
                    onChange={handleWorkloadPreset} 
                    value={processes.length}
                    className="w-full text-xs p-2.5 bg-background border border-border rounded-lg text-foreground appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer shadow-sm transition"
                  >
                    {Array.from({ length: Math.max(10, processes.length) }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} Process{num > 1 ? 'es' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-3 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Simulated Miniature Control Switches */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <button 
                onClick={() => setIsPreviewRunning(!isPreviewRunning)}
                className="flex items-center justify-center space-x-2 p-2.5 bg-background border border-border rounded-lg hover:border-primary text-foreground hover:text-primary transition-all shadow-sm cursor-pointer group"
              >
                {isPreviewRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs font-bold font-mono">Freeze Engine</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-primary fill-primary group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold font-mono">Unfreeze Loop</span>
                  </>
                )}
              </button>
              <button 
                onClick={() => { setPreviewClock(0); setIsPreviewRunning(true); }}
                className="flex items-center justify-center space-x-2 p-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition-all shadow-md cursor-pointer text-xs font-bold font-mono"
              >
                <span>Cycle Simulation</span>
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
