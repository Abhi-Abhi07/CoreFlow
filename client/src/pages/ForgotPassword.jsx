import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Mail, Lock, ArrowRight, ShieldCheck, Loader2, KeyRound, CheckCircle2, EyeOff, Eye } from 'lucide-react';
import { apiClient } from '@/services/apiClients.js';
import { useToast } from '../utils/toastUtils';
import ThemeToggle from '@/components/ThemeToggle';

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  // State for multi-step form
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form Data
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // STEP 1: Request OTP
  const handleSendOTP = async (e) => {
    e?.preventDefault();
    if (!email) return useToast.error("Email is required");
    
    setLoading(true);
    try {
      const res = await apiClient.post(`/api/v1/auth/forgot-password`, { email });
      if (res.data.success) {
        useToast.success(res.data.message || "OTP sent to your email.");
        setStep(2);
      }
    } catch (error) {
      useToast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return useToast.error("Please enter a valid 6-digit OTP");

    setLoading(true);
    try {
      // Backend expects email in req.params and otp in req.body
      const res = await apiClient.post(`/api/v1/auth/verify-otp/${email}`, { otp });
      if (res.data.success) {
        useToast.success("OTP Verified Successfully!");
        setStep(3);
      }
    } catch (error) {
      useToast.error(error.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return useToast.error("Passwords do not match!");
    }
    if (passwords.newPassword.length < 6) {
      return useToast.error("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      // Backend expects email in req.params and passwords in req.body
      const res = await apiClient.post(`/api/v1/auth/change-password/${email}`, {
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword
      });
      
      if (res.data.success) {
        useToast.success("Password reset successful! Please log in.");
        navigate('/login');
      }
    } catch (error) {
      useToast.error(error.response?.data?.message || "Failed to reset password.");
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
          <Link to="/login" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition">
            Back to Login
          </Link>
          <ThemeToggle/>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full mx-auto shadow-2xl shadow-black/5 dark:shadow-black/40 relative overflow-hidden">
          
          {/* Progress Indicator */}
          <div className="absolute top-0 left-0 w-full h-1 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 w-fit mb-6">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-widest text-primary uppercase">Account Recovery</span>
          </div>

          {/* STEP 1: Email Input */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-foreground mb-2">Forgot Password?</h2>
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                Enter the email address associated with your workspace and we'll send you a 6-digit verification code.
              </p>

              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Email Address</label>
                  <div className="relative mt-1">
                    <input 
                      type="email" 
                      placeholder="name@company.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full text-xs p-3 pl-10 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition bg-background text-foreground" 
                    />
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-3.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 cursor-pointer'}`}
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2"/><span>Sending OTP...</span></> : <span>Send Recovery Code</span>}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-foreground mb-2">Check Your Inbox</h2>
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                We've sent a secure OTP to <span className="text-foreground font-bold">{email}</span>. It expires in 10 minutes.
              </p>

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">6-Digit OTP</label>
                  <div className="relative mt-1">
                    <input 
                      type="text" 
                      maxLength="6"
                      placeholder="••••••" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Numbers only
                      required
                      className="w-full text-center text-2xl tracking-[1em] p-3 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition bg-background text-foreground font-mono" 
                    />
                    <KeyRound className="w-5 h-5 text-muted-foreground absolute left-3 top-4 pointer-events-none" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || otp.length < 6}
                  className={`w-full py-3.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-6 ${loading || otp.length < 6 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90 cursor-pointer'}`}
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2"/><span>Verifying...</span></> : <span>Verify OTP</span>}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => handleSendOTP()} 
                  disabled={loading}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition underline underline-offset-4"
                >
                  Didn't receive it? Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Reset Password */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-foreground mb-2">Create New Password</h2>
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                Your identity has been verified. Please choose a strong, new password for your account.
              </p>

              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">New Password</label>
                  <div className="relative mt-1">
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters" 
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                      required
                      className="w-full text-xs p-3 pl-10 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition bg-background text-foreground" 
                    />
                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                    {showPassword ? (
                      <EyeOff onClick={() => setShowPassword(!showPassword)} className="w-4 h-4 text-muted-foreground hover:text-foreground absolute right-3 top-3.5 cursor-pointer transition" />
                    ) : (
                      <Eye onClick={() => setShowPassword(!showPassword)} className="w-4 h-4 text-muted-foreground hover:text-foreground absolute right-3 top-3.5 cursor-pointer transition" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Confirm Password</label>
                  <div className="relative mt-1">
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Repeat new password" 
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                      required
                      className="w-full text-xs p-3 pl-10 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition bg-background text-foreground" 
                    />
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-3.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 cursor-pointer'}`}
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2"/><span>Updating...</span></> : <span>Update Password</span>}
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 md:px-12 bg-background text-center text-xs text-muted-foreground">
        © 2026 CoreFlow Team. All systems operational.
      </footer>
    </div>
  );
}