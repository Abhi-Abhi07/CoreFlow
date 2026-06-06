import React from 'react';
import { Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6 md:px-12 bg-background text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
        
        {/* Brand Section */}
        <div className="flex flex-col items-start">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-300">
              <Cpu className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-black tracking-widest text-foreground group-hover:text-primary transition-colors">
              COREFLOW
            </span>
          </Link>
          <p className="text-muted-foreground text-xs mt-4 leading-relaxed max-w-xs">
            MERN simulation, process diagnostics, and algorithmic visualization tailored for educational analysis.
          </p>
        </div>
        
        {/* Navigation Columns */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-5">Algorithms</h4>
          <ul className="space-y-3 text-xs text-muted-foreground">
            <li><Link to="/algorithms#fcfs" className="hover:text-primary transition-colors">First-Come, First-Served</Link></li>
            <li><Link to="/algorithms#sjf" className="hover:text-primary transition-colors">Shortest Job First</Link></li>
            <li><Link to="/algorithms#rr" className="hover:text-primary transition-colors">Round Robin</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-5">Developers</h4>
          <ul className="space-y-3 text-xs text-muted-foreground">
            <li><Link to="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
            <li><Link to="/monitor" className="hover:text-primary transition-colors">System Status</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-5">Connect</h4>
          <ul className="space-y-3 text-xs text-muted-foreground">
            <li><a href="#github" className="hover:text-primary transition-colors">GitHub Repo</a></li>
            <li><a href="#issues" className="hover:text-primary transition-colors">Report an Issue</a></li>
          </ul>
        </div>
      </div>
      
      {/* Bottom Bar with Status Indicator */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
        <p>© 2026 CoreFlow Team. All rights reserved.</p>
        
        <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-full border border-border shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gantt-running opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gantt-running"></span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-foreground">
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}