// src/pages/Documentation.jsx
import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Terminal, 
  Cpu, 
  Workflow, 
  BookMarked,
  Layers,
  ChevronRight,
  Code2
} from 'lucide-react';

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'An overview of how to build, compile, and simulate process workloads within the platform environment.',
      icon: <Cpu className="w-4 h-4" />,
      tags: ['Introduction', 'Core Engine'],
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Platform Orchestration Setup</h2>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              Welcome to the visual computing core system. This visualizer enables full-stack evaluation, Gantt chart mapping, and post-execution efficiency analytics for multi-threaded scheduling models.
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-primary">Simulation Workflow Sequence</h3>
            <ul className="space-y-2 text-xs text-muted-foreground list-decimal pl-4 leading-relaxed">
              <li><strong className="text-foreground">Initialize Workload Architecture:</strong> Use the ingestion panel on the visualizer deck or generate a batch profile using predefined random sets on the home landing vector.</li>
              <li><strong className="text-foreground">Calibrate Hardware Constants:</strong> Fine-tune execution mechanics by applying values for system context switch overhead or round-robin quantum allocations.</li>
              <li><strong className="text-foreground">Launch Runtime Engine:</strong> Trigger the active async loop execution frame to stream ready pipeline queues across continuous simulated absolute ticks.</li>
            </ul>
          </div>

          <div className="p-4 border border-border bg-muted/40 rounded-xl flex items-start gap-3">
            <BookMarked className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground block mb-0.5">Architectural Note</span>
              The execution driver utilizes synchronized reference loops across asynchronous intervals to guarantee clock stability even when fluid scaling parameters are shifting dynamically on-the-fly.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'algorithm-reference',
      title: 'Algorithm Reference',
      description: 'Mathematical and theoretical baselines for core scheduling priority mechanics and execution constraints.',
      icon: <Workflow className="w-4 h-4" />,
      tags: ['Math Logic', 'Metrics'],
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Theoretical Mathematical Proofs</h2>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              Schedulers evaluate continuous-time data using fixed evaluation metrics. The engine utilizes structural equations to derive absolute values down to precise floating points.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-primary">Core Mathematical Expressions</h3>
            
            {/* FIXED: Wrapped formula text strings inside JS expressions to bypass JSX compiler evaluation */}
            <div className="bg-background border border-border p-4 rounded-xl font-mono text-center space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest text-[10px]">Turnaround Time Formula</p>
              <p className="text-sm font-bold text-foreground">{"$$T_{tat} = T_{completion} - T_{arrival}$$"}</p>
            </div>

            <div className="bg-background border border-border p-4 rounded-xl font-mono text-center space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest text-[10px]">Waiting Time Formula</p>
              <p className="text-sm font-bold text-foreground">{"$$T_{waiting} = T_{tat} - T_{burst}$$"}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">Operational Processing Matrix</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Algorithms handle edge calculations uniquely. For instance, non-preemptive logic evaluates ready queues strictly upon active task exits, while preemptive strategies run micro-step index evaluations at every arriving interrupt vector tick.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'api-reference',
      title: 'API Reference Guide',
      description: 'Integrate the algorithmic computation core into decoupled architectures using payload endpoints.',
      icon: <Terminal className="w-4 h-4" />,
      tags: ['JSON Payload', 'REST Core'],
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">REST Integration Blueprint</h2>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              Ingest processed telemetry calculations and gantt data streams directly into separate client layers using structured request states.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded font-bold">POST</span>
              <span className="text-foreground font-semibold">/api/v1/scheduler/compute</span>
            </div>
            
            <div className="bg-background border border-border/80 rounded-xl p-4 overflow-x-auto shadow-inner">
              <pre className="text-[11px] font-mono text-muted-foreground leading-relaxed">
{`{
  "algorithm": "Round Robin (RR)",
  "timeQuantum": 2,
  "contextSwitch": 1,
  "processes": [
    { "id": "P1", "arrivalTime": 0, "burstTime": 8, "priority": 1 },
    { "id": "P2", "arrivalTime": 1, "burstTime": 4, "priority": 2 }
  ]
}`}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" /> Response Schema Parameters
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Returns full timeline maps array tracks featuring explicit decimal fractional start/end parameters along with derived standalone wait lists matched to each custom incoming PID.
            </p>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = sections.filter(sec => 
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeContentMatch = sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col transition-colors duration-300 select-none">
      <main className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12 space-y-8 flex-1 flex flex-col">

        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border/80">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground">
              <BookOpen className="w-7 h-7 text-primary" /> System Documentation
            </h1>
            <p className="text-muted-foreground text-xs font-mono">CORE FLUID SIMULATOR INTERFACE SPECIFICATIONS</p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3.5 text-muted-foreground pointer-events-none" />
            <input 
              type="text" 
              placeholder="Filter topics or labels..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner transition-all duration-200"
            />
          </div>
        </div>

        {/* Dynamic Split Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start flex-1 w-full">
          
          {/* Left Column Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground px-1 mb-2">Available Categories</p>
            {filteredSections.length === 0 ? (
              <div className="text-xs text-muted-foreground font-mono italic p-4 border border-dashed border-border rounded-xl bg-card/40 text-center">
                No matching reference points located.
              </div>
            ) : (
              filteredSections.map((sec) => {
                const isActive = sec.id === activeSection;
                return (
                  <div
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`p-4 border rounded-xl text-left transition-all duration-200 flex items-start gap-4 cursor-pointer relative group ${
                      isActive 
                        ? 'bg-card border-primary ring-1 ring-primary/30 shadow-md' 
                        : 'bg-card/60 border-border hover:bg-card hover:border-border-hover'
                    }`}
                  >
                    <div className={`p-2 rounded-lg border transition-colors ${
                      isActive ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border group-hover:text-primary group-hover:border-primary/40'
                    }`}>
                      {sec.icon}
                    </div>

                    <div className="space-y-1 pr-4">
                      <h3 className={`text-xs font-bold transition-colors ${isActive ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                        {sec.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                        {sec.description}
                      </p>
                      
                      <div className="flex gap-1.5 pt-1 flex-wrap">
                        {sec.tags.map((tag, idx) => (
                          <span key={idx} className="text-[9px] font-mono px-1.5 py-0.2 bg-muted border border-border text-foreground/80 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <ChevronRight className={`w-3.5 h-3.5 absolute right-3 top-4 text-muted-foreground/60 transition-transform ${
                      isActive ? 'translate-x-0.5 text-primary' : 'group-hover:translate-x-0.5'
                    }`} />
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column Content Display */}
          <div className="lg:col-span-8 bg-card border border-border rounded-xl p-6 md:p-8 shadow-2xl shadow-black/5 dark:shadow-black/40 min-h-[460px] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-primary/5 pointer-events-none select-none">
              <Layers className="w-32 h-32 tracking-tighter" />
            </div>

            {activeContentMatch ? (
              <div className="animate-fade-in duration-300">
                {activeContentMatch.content}
              </div>
            ) : (
              <div className="text-center py-20 text-xs text-muted-foreground font-mono italic">
                Select an engineering module template block from the navigation deck column index to examine raw system data.
              </div>
            )}

            {/* Footer Tracker */}
            <div className="mt-8 pt-4 border-t border-border/60 flex flex-wrap justify-between items-center text-[10px] font-mono text-muted-foreground gap-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                SYSTEM RUNTIME INDEX: PROD-v2.6.4
              </span>
              <span>READ STATE SECURE</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}