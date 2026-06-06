import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cpu, Mail, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { apiClient } from '@/services/apiClients.js';
import { useToast } from '../utils/toastUtils';
import ThemeToggle from '@/components/ThemeToggle';

export default function Verify() {
  const location = useLocation();
  const email = location.state?.email; 
  const triggerResend = location.state?.triggerResend; // Flag from Login page

  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Guard to ensure the auto-send only happens exactly once
  const autoSendAttempted = useRef(false);

  // Timer Effect for the resend button cooldown
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOpenEmail = () => {
    window.location.href = "mailto:"; // Opens the default mail client
  };

  const handleResend = async () => {
    if (isResending || !email) return;

    setIsResending(true);
    try {
      const res = await apiClient.post(`/api/v1/auth/re-verify`, { email });
      
      if (res.data.success) {
        useToast.success(res.data.message || "A new verification link has been sent!");
        setCountdown(60); 
      }
    } catch (error) {
      useToast.error(error.response?.data?.message || "Failed to resend link.");
    } finally {
      setIsResending(false);
    }
  };

  // Auto-trigger the resend if coming from a failed login
  useEffect(() => {
    if (email && triggerResend && !autoSendAttempted.current) {
      autoSendAttempted.current = true;
      handleResend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, triggerResend]); 

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-between select-none transition-colors duration-300">
      {/* Header */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between border-b border-border backdrop-blur-md bg-background">
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
            Existing account? Sign In
          </Link>
          <ThemeToggle/>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full mx-auto text-center shadow-2xl shadow-black/5 dark:shadow-black/40">
          <div className="inline-flex items-center space-x-2 bg-background px-4 py-2 rounded-full border border-border w-fit mb-6 animate-bounce">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-widest text-primary uppercase">Action Required</span>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-3">Check Your Email</h2>
          
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto mb-8">
            We have sent an activation link to {email ? <span className="font-bold text-foreground">{email}</span> : "your email address"}. Please check your inbox and verify your workspace.
          </p>

          <div className="space-y-3">
            <button 
              onClick={handleOpenEmail}
              className="w-full py-3.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Open Email Client</span>
            </button>

            <Link 
              to="/login" 
              className="w-full py-3.5 bg-background border border-border text-muted-foreground text-xs font-bold rounded-lg hover:text-foreground hover:border-primary transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Skip to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Conditional Resend Button - Only shows if email is present */}
          {email && (
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-[10px] text-muted-foreground mb-3">
                {countdown > 0 ? `Wait ${countdown}s to request a new link` : "Didn't receive the email or link expired?"}
              </p>
              <button
                onClick={handleResend}
                disabled={isResending || countdown > 0}
                className={`text-xs font-bold flex items-center justify-center mx-auto gap-2 transition ${
                  isResending || countdown > 0 
                    ? "text-muted-foreground/50 cursor-not-allowed" 
                    : "text-primary hover:text-foreground cursor-pointer underline underline-offset-4"
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`} />
                {isResending ? "Sending..." : countdown > 0 ? "Email Sent" : "Resend Verification Email"}
              </button>
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