import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, EyeOff, Eye, Loader2 } from 'lucide-react';
import { useToast } from '../utils/toastUtils.js'
import { apiClient } from '@/services/apiClients.js';
import ThemeToggle from '@/components/ThemeToggle.jsx';

export default function GetStarted() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((pre) => ({
      ...pre,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post(`/api/v1/auth/register`, formData, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (res.data.success) {
        useToast.success(res.data.message);
        navigate('/verify');
      }
    } catch (error) {
      console.log(error);
      useToast.error(error.response?.data?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-between select-none transition-colors duration-300">
      {/* Mini Onboarding Header */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between border-b border-border backdrop-blur-md">
        <div>
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-core-cyan to-core-purple flex items-center justify-center shadow-lg shadow-primary/20">
              <Cpu className="w-5 h-5 animate-pulse text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              COREFLOW
            </span>
          </Link>
        </div>
        <div className="flex gap-4 justify-center items-center">
          <Link to="/" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition">
            Exit Setup
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-12 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Value Proposition and Onboarding Steps */}
        <div className="flex flex-col space-y-6">
          <div className="inline-flex items-center space-x-2 bg-card px-4 py-2 rounded-full border border-border w-fit shadow-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-widest text-primary uppercase">New Workspace Setup</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground">
            Bring Your Processes to Life.
          </h1>
          
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            Connect to your diagnostic workspace to run and simulate multiple processes across multiple CPU cores.
          </p>

          <div className="space-y-4 pt-6 border-t border-border max-w-md">
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">01</div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Create your environment</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Register a free analytical environment for the MERN stack.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">02</div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Run simulations</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Compare multiple algorithms and estimate waiting intervals.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Module */}
        <div className="bg-card text-card-foreground border border-border rounded-xl p-8 shadow-2xl shadow-black/5 dark:shadow-black/40 max-w-md w-full mx-auto md:mx-0">
          <h2 className="text-lg font-bold mb-6">Get Started</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">First Name</label>
                <div className="relative mt-1">
                  <input 
                    id="firstName"
                    name="firstName"
                    type="text" 
                    placeholder="Abhi" 
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full text-xs p-3 pl-10 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" 
                  />
                  <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Last Name</label>
                <div className="relative mt-1">
                  <input 
                    id="lastName"
                    name="lastName"
                    type="text" 
                    placeholder="Gurjar" 
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full text-xs p-3 pl-10 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" 
                  />
                  <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Email Address</label>
              <div className="relative mt-1">
                <input 
                  id="email"
                  name="email"
                  type="email" 
                  placeholder="name@company.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full text-xs p-3 pl-10 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" 
                />
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Password</label>
              <div className="relative mt-1">
                <input 
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password..." 
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full text-xs p-3 pl-10 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" 
                />
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                {
                  showPassword ?
                  <EyeOff onClick={() => setShowPassword(!showPassword)} className="w-4 h-4 text-muted-foreground absolute right-3 top-3.5 cursor-pointer hover:text-foreground transition" /> : 
                  <Eye onClick={() => setShowPassword(!showPassword)} className="w-4 h-4 text-muted-foreground absolute right-3 top-3.5 cursor-pointer hover:text-foreground transition" />
                }
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 cursor-pointer'}`}
            >
              {
                loading ? (
                <> 
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />  
                  <span>Setting up workspace...</span>
                </> 
                ) : ( 
                <>
                  <span>Initialize Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-[10px] text-muted-foreground mt-6 text-center leading-relaxed">
            By initializing you agree to our <a href="#terms" className="underline hover:text-foreground transition">Terms of Service</a>.
          </p>
        </div>
      </main>

      {/* Streamlined Footer */}
      <footer className="border-t border-border py-8 px-6 md:px-12 bg-background text-center text-xs text-muted-foreground">
        © 2026 CoreFlow Team. All systems operational.
      </footer>
    </div>
  );
}