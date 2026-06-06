import React from 'react';
import { 
  Cpu, 
  ArrowRight, 
  Info,
  Layers
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setGlobalAlgorithm } from '../redux/userSlice';

const ALGORITHM_DATA = [
  {
    name: "First-Come, First-Served (FCFS)",
    type: "Non-Preemptive",
    description: "The simplest scheduling logic. Processes are dispatched strictly in the order they arrive in the ready queue.",
    pros: "Simple, zero computation overhead",
    cons: "Convoy effect (short jobs wait for long ones)",
    metrics: { efficiency: 60, fairness: 90, response: 30 },
    objective: "Maximize simple execution",
    complexity: "O(1)"
  },
  {
    name: "Round Robin (RR)",
    type: "Preemptive",
    description: "Each process gets a fixed time quantum. If it doesn't finish, it gets preempted and pushed to the back of the queue.",
    pros: "Excellent response time, highly fair",
    cons: "High context switching overhead",
    metrics: { efficiency: 70, fairness: 100, response: 95 },
    objective: "Minimize response time",
    complexity: "O(1)"
  },
  {
    name: "Shortest Job First (SJF)",
    type: "Non-Preemptive",
    description: "Selects the process with the smallest burst time. Proven to yield the absolute lowest average wait time.",
    pros: "Optimal average waiting time",
    cons: "Low priority long job starvation",
    metrics: { efficiency: 90, fairness: 40, response: 50 },
    objective: "Minimize average waiting time",
    complexity: "O(log n)"
  },
  {
    name: "Shortest Remaining Time First (SRTF)",
    type: "Preemptive",
    description: "The preemptive counterpart of SJF. Preempts the running job if a newly arrived process has a shorter remaining burst.",
    pros: "Maximizes throughput velocity",
    cons: "Requires advanced burst knowledge",
    metrics: { efficiency: 95, fairness: 50, response: 85 },
    objective: "Optimize real-time throughput",
    complexity: "O(log n)"
  },
  {
    name: "Priority",
    type: "Non-Preemptive",
    description: "Allocates the CPU to the process with the highest priority rank number. Equal ranks fall back to arrival orders.",
    pros: "Critical background workflows execute first",
    cons: "Indefinite starvation for low priorities",
    metrics: { efficiency: 80, fairness: 30, response: 65 },
    objective: "Run mission-critical jobs first",
    complexity: "O(log n)"
  },
  {
    name: "Preemptive Priority",
    type: "Preemptive",
    description: "Instantly preempts the running process if a higher-priority task arrives in the execution pipeline.",
    pros: "Immediate response for urgent signals",
    cons: "Complex priority aging logic needed",
    metrics: { efficiency: 85, fairness: 25, response: 90 },
    objective: "Enforce strict runtime ranking",
    complexity: "O(log n)"
  },
  {
    name: "Multi Level Queue (MLQ)",
    type: "Preemptive / Mixed",
    description: "Partitions the ready queue into separate queues (e.g., Foreground / Background) with fixed allocation logic.",
    pros: "Efficiently isolates system tasks",
    cons: "Inflexible, processes cannot shift queues",
    metrics: { efficiency: 75, fairness: 60, response: 75 },
    objective: "Segregate platform workloads",
    complexity: "O(n)"
  },
  {
    name: "Multi Level Feedback Queue (MLFQ)",
    type: "Preemptive",
    description: "The ultimate adaptive scheduler. Moves processes dynamically between queues based on their past execution history.",
    pros: "Highly flexible and adaptive config",
    cons: "Complex configuration and parameter tuning",
    metrics: { efficiency: 88, fairness: 80, response: 92 },
    objective: "General purpose system balance",
    complexity: "O(n)"
  }
];

export default function Algorithms() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentGlobalAlgo = useSelector((state) => state.user.algorithm);

  const handleLaunch = (name) => {
    dispatch(setGlobalAlgorithm(name));
    navigate('/simulation');
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300 select-none">
      <main className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12 space-y-12">
        
        {/* Header Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <Info className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-widest text-primary uppercase font-mono">Algorithm Library</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground">
            Theory & Scheduling Logic
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Explore the structural mechanics of core operating system schedulers. Each strategy features distinct processing trade-offs affecting turnaround time, queue latency, and CPU duty cycles.
          </p>
        </div>

        {/* Algorithm Card Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALGORITHM_DATA.map((algo, index) => {
            const isCurrentlySelected = currentGlobalAlgo === algo.name;
            const isPreemptive = algo.type.includes('Preemptive');

            return (
              <div 
                key={index} 
                className={`group bg-card border rounded-xl p-6 shadow-xl transition-all flex flex-col justify-between ${
                  isCurrentlySelected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-primary/10 rounded-lg">
                      <Cpu className="w-5 h-5 text-primary" />
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded border ${
                      isPreemptive 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : algo.type === 'Non-Preemptive'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                    }`}>
                      {algo.type}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                      {algo.name}
                      {isCurrentlySelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" title="Active Engine Selection" />
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed min-h-[48px]">
                      {algo.description}
                    </p>
                  </div>

                  {/* Performance Stats Mini-Bars */}
                  <div className="space-y-3 pt-2">
                     <div className="space-y-1">
                       <div className="flex justify-between text-[9px] font-mono uppercase text-muted-foreground">
                          <span>Response Velocity</span>
                          <span className="text-foreground font-bold">{algo.metrics.response}%</span>
                       </div>
                       <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                          <div style={{ width: `${algo.metrics.response}%` }} className="h-full bg-primary" />
                       </div>
                     </div>
                     <div className="space-y-1">
                       <div className="flex justify-between text-[9px] font-mono uppercase text-muted-foreground">
                          <span>Processor Efficiency</span>
                          <span className="text-foreground font-bold">{algo.metrics.efficiency}%</span>
                       </div>
                       <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                          <div style={{ width: `${algo.metrics.efficiency}%` }} className="h-full bg-primary/60" />
                       </div>
                     </div>
                  </div>

                  {/* Trade-offs */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-wider">Pros</span>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-1 min-h-[24px]">{algo.pros}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-wider">Cons</span>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-1 min-h-[24px]">{algo.cons}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleLaunch(algo.name)}
                  className={`mt-6 w-full py-2.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2 group/btn cursor-pointer ${
                    isCurrentlySelected 
                      ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/10 hover:bg-primary/90' 
                      : 'bg-background border-border hover:border-primary hover:text-primary text-foreground'
                  }`}
                >
                  <span>{isCurrentlySelected ? 'Active in Workspace' : 'Launch Simulator'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Comparison Matrix Table */}
        <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-2xl shadow-black/5 dark:shadow-black/40">
          <div className="flex items-center gap-3 mb-6 border-b border-border/60 pb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Cross-Comparison Matrix</h2>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">Comprehensive theoretical baseline benchmarks</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-muted-foreground border-collapse">
              <thead>
                <tr className="border-b border-border text-foreground font-mono uppercase text-[10px] tracking-wider h-10">
                  <th className="py-2 px-4 w-1/4">Algorithm Strategy</th>
                  <th className="py-2 px-4 w-1/5">Preemption Mode</th>
                  <th className="py-2 px-4 w-1/3">Core Objective Function</th>
                  <th className="py-2 px-4 text-right w-1/6">Time Complexity</th>
                </tr>
              </thead>
              <tbody>
                {ALGORITHM_DATA.map((algo, index) => {
                  const mode = algo.type;
                  return (
                    <tr key={index} className="border-b border-border/40 hover:bg-muted/40 transition-colors h-12">
                      <td className="py-2 px-4 font-bold text-foreground font-sans">{algo.name}</td>
                      <td className="py-2 px-4 font-mono font-medium">
                        <span className={
                          mode.includes('Preemptive') 
                            ? 'text-emerald-500' 
                            : mode === 'Non-Preemptive' 
                            ? 'text-amber-500' 
                            : 'text-indigo-400'
                        }>
                          {mode}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-muted-foreground font-sans">{algo.objective}</td>
                      <td className="py-2 px-4 text-right font-mono font-bold text-primary">{algo.complexity}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}