import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Mail, Lock, ArrowRight, ShieldCheck, Loader2, EyeOff, Eye } from 'lucide-react';
import { apiClient } from '@/services/apiClients.js';
import { useToast } from '../utils/toastUtils';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import ThemeToggle from '@/components/ThemeToggle';

export default function Login() { 
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

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
      const res = await apiClient.post(`/api/v1/auth/login`, formData);
      
      if (res.data.success) {
        localStorage.setItem("accessToken", res.data.accessToken);
        dispatch(setUser(res.data.user));
        useToast.success(res.data.message);
        navigate('/');
      }
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
      
      // Redirect logic for unverified accounts
      if (errorMessage === "Verify your account then login") {
        useToast.error("Please verify your email before logging in.");
        
        navigate('/verify', { state: { email: formData.email, triggerResend: true } });
        return;
      }
      useToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-between select-none transition-colors duration-300">
      
      {/* Header */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between border-b border-border backdrop-blur-md bg-background/80 sticky top-0 z-50">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-core-cyan to-core-purple flex items-center justify-center shadow-lg shadow-primary/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            COREFLOW
          </span>
        </Link>
        <div className='flex gap-4 justify-center items-center'>
          <Link to="/get-started" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition">
            New user? Register
          </Link>
          <ThemeToggle/>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-12 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left Column - Information */}
        <div className="flex flex-col space-y-6">
          <div className="inline-flex items-center space-x-2 bg-card px-4 py-2 rounded-full border border-border w-fit shadow-sm">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-widest text-primary uppercase">Secure Access</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground">
            Welcome Back to CoreFlow.
          </h1>
          
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            Sign in to access your previous runs, view performance analytics, and manage the scheduler workspace.
          </p>
        </div>

        {/* Right Column - Login Module */}
        <div className="bg-card text-card-foreground border border-border rounded-xl p-8 shadow-2xl shadow-black/5 dark:shadow-black/40 max-w-md w-full mx-auto md:mx-0">
          <h2 className="text-lg font-bold mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Email Address</label>
              <div className="relative mt-1">
                <input 
                  id='email'
                  name='email'
                  type="email" 
                  placeholder="name@company.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full text-xs p-3 pl-10 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition bg-background text-foreground" 
                />
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Password</label>
              <div className="relative mt-1">
                <input 
                  id='password'
                  name='password'
                  type={showPassword ? "text" : "password"}
                  placeholder="Your Password" 
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full text-xs p-3 pl-10 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition bg-background text-foreground`} 
                />
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                {showPassword ? (
                  <EyeOff onClick={() => setShowPassword(!showPassword)} className="w-4 h-4 text-muted-foreground absolute right-3 top-3.5 cursor-pointer hover:text-foreground transition" />
                ) : (
                  <Eye onClick={() => setShowPassword(!showPassword)} className="w-4 h-4 text-muted-foreground absolute right-3 top-3.5 cursor-pointer hover:text-foreground transition" />
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 cursor-pointer'}`}
            >
              {loading ? (
                <> 
                  <Loader2 className="w-4 h-4 animate-spin mr-2"/>  
                  <span>Authenticating....</span>
                </> 
              ) : ( 
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-[10px] text-muted-foreground mt-6 text-center leading-relaxed">
            Forgot your password? <Link to="/forgot-password" className="underline hover:text-foreground transition">Reset it here</Link>.
          </p>
        </div>
      </main>

      <footer className="border-t border-border py-8 px-6 md:px-12 bg-background text-center text-xs text-muted-foreground">
        © 2026 CoreFlow Team. All systems operational.
      </footer>
    </div>
  );
}