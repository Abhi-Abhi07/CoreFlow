// src/pages/Monitor.jsx
import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Activity, 
  Server, 
  Layers, 
  Box,
  Gauge,
  RefreshCw,
  ZapOff
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setGlobalProcesses } from '../redux/userSlice';

export default function Monitor() {
  const dispatch = useDispatch();
  
  // Read real data vectors from our global application state
  const globalProcesses = useSelector((state) => state.user.processes);
  const globalAlgorithm = useSelector((state) => state.user.algorithm);

  // Core system telemetry tracking states
  const [telemetry, setTelemetry] = useState({
    utilization: 62.4,
    loadAverage: 2.15,
    throughput: 14.2
  });

  // Hardware execution vector matrix states
  const [cores, setCores] = useState([
    { id: 1, status: 'idle', processId: 'None', executionTick: 0 },
    { id: 2, status: 'idle', processId: 'None', executionTick: 0 },
    { id: 3, status: 'idle', processId: 'None', executionTick: 0 },
    { id: 4, status: 'idle', processId: 'None', executionTick: 0 },
  ]);

  // Local active pipeline queue tracking arrays
  const [activeQueue, setActiveQueue] = useState([]);

  // Synchronization hook: populate our local tracking queue whenever global state shifts
  useEffect(() => {
    if (globalProcesses && globalProcesses.length > 0) {
      setActiveQueue(globalProcesses.map(p => p.id));
    } else {
      // Intelligent fallback layout baseline if zero items exist in global store
      setActiveQueue(['P1', 'P2', 'P3', 'P4', 'P5']);
    }
  }, [globalProcesses]);

  // Automated execution loop: simulates realistic core job processing shifts
  useEffect(() => {
    const schedulingTick = setInterval(() => {
      // 1. Step up hardware core metrics and tick calculations
      setCores(prevCores => {
        let activeCoreCount = 0;
        
        const nextCores = prevCores.map(core => {
          if (core.status === 'running') {
            const nextTick = core.executionTick + 1;
            // Simulate task completing after randomized runtime boundaries
            if (nextTick > Math.floor(Math.random() * 3) + 3) {
              return { ...core, status: 'idle', processId: 'None', executionTick: 0 };
            }
            activeCoreCount++;
            return { ...core, executionTick: nextTick };
          }
          return core;
        });

        // 2. Map available items from the moving pipeline into idle vectors
        let currentQueue = [...activeQueue];
        const updatedCores = nextCores.map(core => {
          if (core.status === 'idle' && currentQueue.length > 0) {
            const nextJobId = currentQueue.shift(); // Fetch according to FCFS base rules
            activeCoreCount++;
            return { ...core, status: 'running', processId: nextJobId, executionTick: 0 };
          }
          return core;
        });

        // Sync back shifted local tracking queues synchronously across execution steps
        if (currentQueue.length !== activeQueue.length) {
          setActiveQueue(currentQueue);
        }

        // 3. Dynamically adjust hardware diagnostic telemetry arrays relative to core loading coefficients
        setTelemetry(prev => {
          const loadCoefficient = activeCoreCount / updatedCores.length;
          const calculatedUtil = loadCoefficient * 100 + (Math.random() - 0.5) * 8;
          return {
            utilization: Math.min(100, Math.max(15, parseFloat(calculatedUtil.toFixed(1)))),
            loadAverage: Math.max(0.4, parseFloat((loadCoefficient * 4 + Math.random() * 0.5).toFixed(2))),
            throughput: Math.max(5, parseFloat((activeCoreCount * 4.2 + Math.random() * 2).toFixed(1)))
          };
        });

        return updatedCores;
      });

    }, 2000); // System cycle updates every 2000ms

    return () => clearInterval(schedulingTick);
  }, [activeQueue]);

  // Handler execution loop: resets all local processing blocks smoothly
  const handleFlushQueue = () => {
    setActiveQueue([]);
    setCores(prev => prev.map(c => ({ ...c, status: 'idle', processId: 'None', executionTick: 0 })));
    setTelemetry({ utilization: 0, loadAverage: 0.00, throughput: 0.0 });
  };

  // Handler execution loop: re-injects standard baseline processes back into tracking matrices
  const handleRegenerateWorkload = () => {
    const reseededPids = Array.from({ length: 6 }, (_, i) => `P${i + 1}`);
    setActiveQueue(reseededPids);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-between select-none p-6 md:p-12 max-w-7xl mx-auto w-full transition-colors duration-300">

      {/* Page Heading and Status Indicator */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-8 border-b border-border/60">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground">
            <Gauge className="w-7 h-7 text-primary" /> Live System Monitor
          </h1>
          <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">
            Active Workspace Strategy: <span className="text-primary font-bold">{globalAlgorithm}</span>
          </p>
        </div>
        
        <div className="inline-flex items-center space-x-2 bg-card px-3 py-1.5 rounded-full border border-border shadow-sm">
          <span className={`w-2 h-2 rounded-full ${telemetry.utilization > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
          <span className="text-[10px] font-mono font-bold tracking-widest text-foreground uppercase">
            {telemetry.utilization > 0 ? 'MATRIX PROCESSING RUNNING' : 'SYSTEM STANDBY CORE IDLE'}
          </span>
        </div>
      </div>

      {/* Dashboard Grid Workspace Area Layout */}
      <div className="grid lg:grid-cols-3 gap-8 py-8 flex-1 items-start">
        
        {/* Column 1: CPU Core Allocation Panel */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-2xl shadow-black/5 dark:shadow-black/40 flex flex-col justify-between min-h-[380px]">
          <div>
            <h3 className="text-sm font-mono tracking-widest text-muted-foreground uppercase mb-6 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" /> Dynamic Core Allocation
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {cores.map((core) => {
                const isRunning = core.status === 'running';
                return (
                  <div 
                    key={core.id} 
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      isRunning 
                        ? 'bg-primary/5 border-primary/40 shadow-sm shadow-primary/5' 
                        : 'bg-background border-border/50 opacity-60'
                    }`}
                  >
                    <span className="text-[9px] font-mono text-muted-foreground block mb-1">CORE INTEL_0{core.id}</span>
                    <p className={`text-xs font-bold transition-colors ${isRunning ? 'text-foreground' : 'text-muted-foreground font-mono italic'}`}>
                      {isRunning ? `Vector: ${core.processId}` : 'No Active Job'}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[9px] font-mono text-muted-foreground">
                        {isRunning ? `Cycle: t+${core.executionTick}` : 'Standby'}
                      </span>
                      <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isRunning ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]' : 'bg-muted-foreground/30'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-border/60">
            <div className="flex justify-between items-center text-xs font-mono text-muted-foreground">
              <span>Live Deployment Factor</span>
              <span className="text-foreground font-bold">{telemetry.utilization}%</span>
            </div>
            <div className="w-full bg-muted h-2 mt-2 rounded-full overflow-hidden border border-border/50 p-0.5">
              <div 
                style={{ width: `${telemetry.utilization}%` }} 
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
              />
            </div>
          </div>
        </div>

        {/* Column 2: Dynamic Diagnostic Metrics Panel */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-2xl shadow-black/5 dark:shadow-black/40 flex flex-col justify-between min-h-[380px]">
          <div>
            <h3 className="text-sm font-mono tracking-widest text-muted-foreground uppercase mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Core Diagnostics
            </h3>

            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-border/40 pb-4">
                <span className="text-xs text-muted-foreground font-semibold flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-primary" /> Active Duty Utilization
                </span>
                <span className="font-mono text-base font-bold text-foreground">{telemetry.utilization}%</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-border/40 pb-4">
                <span className="text-xs text-muted-foreground font-semibold flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-primary" /> Core Scheduling Pressure
                </span>
                <span className="font-mono text-base font-bold text-foreground">{telemetry.loadAverage}</span>
              </div>
              
              <div className="flex justify-between items-center pb-2">
                <span className="text-xs text-muted-foreground font-semibold flex items-center gap-2">
                  <Box className="w-3.5 h-3.5 text-primary" /> Calculated Throughput
                </span>
                <span className="font-mono text-base font-bold text-primary">{telemetry.throughput} p/s</span>
              </div>
            </div>
          </div>

          <div className="pt-6 text-[9px] text-muted-foreground font-mono border-t border-border/60 flex items-center justify-between">
            <span>ENGINE INTERVAL REF: 2000ms</span>
            <span className="text-primary animate-pulse">● LIVE BROADCASTING</span>
          </div>
        </div>

        {/* Column 3: Shifting Pipeline Queue Panel */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-2xl shadow-black/5 dark:shadow-black/40 flex flex-col justify-between min-h-[380px]">
          <div>
            <h3 className="text-sm font-mono tracking-widest text-muted-foreground uppercase mb-6 flex items-center gap-2">
              <Box className="w-4 h-4 text-primary" /> Moving Pipeline Queue
            </h3>
            
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Buffered memory indexes tracking processes awaiting execution allocation within the scheduler pipeline.
            </p>

            {/* Dynamic Queue Slots Container */}
            {activeQueue.length === 0 ? (
              <div className="p-6 border border-dashed border-border rounded-xl bg-background/50 flex flex-col items-center text-center justify-center space-y-2 mt-4">
                <ZapOff className="w-5 h-5 text-muted-foreground/60" />
                <p className="text-[11px] font-mono text-muted-foreground">Pipeline index cleared or drained.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-2 max-h-[160px] overflow-y-auto pr-1">
                {activeQueue.map((item, index) => (
                  <div 
                    key={index} 
                    className="px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono font-bold text-primary shadow-sm hover:border-primary/40 transition-all cursor-default animate-fade-in"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-border/60 flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-mono">
              Queue Latency Bounds: <b className="text-foreground">{activeQueue.length} units</b>
            </span>
            <div className="flex gap-3">
              {activeQueue.length === 0 && (
                <button 
                  onClick={handleRegenerateWorkload}
                  className="text-primary font-medium cursor-pointer hover:underline underline-offset-4 flex items-center gap-1 font-mono text-xs"
                >
                  <RefreshCw className="w-3 h-3" /> Reseed
                </button>
              )}
              <button 
                onClick={handleFlushQueue}
                className="text-rose-500 font-medium cursor-pointer hover:underline underline-offset-4 font-mono text-xs"
              >
                Flush Queue
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}