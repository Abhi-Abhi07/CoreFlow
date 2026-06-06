import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Cpu, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { apiClient } from "@/services/apiClients.js";
import ThemeToggle from "@/components/ThemeToggle";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState(
    "Verifying your workspace environment...",
  );
  const navigate = useNavigate();

  // Cooldown states
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const hasCalled = useRef(false);

  // Timer Effect: Ticks down every second if countdown > 0
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const verifyEmail = async () => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    try {
      const res = await apiClient.post(
        `/api/v1/auth/verify`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success) {
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully.");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage(
        error.response?.data?.message || "Verification failed or expired.",
      );
    }
  };

  const handleResend = async () => {
    // Guard: Prevent execution if already loading or cooling down
    if (isResending || countdown > 0) return;

    setIsResending(true);
    try {
      const res = await apiClient.post(
        `/api/v1/auth/re-verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        setMessage("A new link has been dispatched to your inbox.");
        setCountdown(60); // Start the 60-second cooldown
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to resend.");
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (!hasCalled.current) {
      verifyEmail();
      hasCalled.current = true;
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-between select-none transition-colors duration-300">
      {/* Header */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between border-b border-border backdrop-blur-md bg-background">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-core-cyan to-core-purple flex items-center justify-center shadow-lg shadow-primary/20">
            <Cpu className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            COREFLOW
          </span>
        </Link>
        <div className="flex gap-4 justify-center items-center">
          <Link
            to="/login"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition"
          >
            Skip and Login
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full mx-auto text-center shadow-2xl shadow-black/5 dark:shadow-black/40">
          
          {/* Loading State */}
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4 py-4 animate-in fade-in zoom-in duration-500">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <h2 className="text-lg font-bold text-foreground">
                Verifying Workspace
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {message}
              </p>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="flex flex-col items-center space-y-4 py-4 animate-in fade-in zoom-in duration-500">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                Account Verified!
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {message}
              </p>
              <p className="text-[10px] text-muted-foreground mt-4 font-mono animate-pulse">
                Redirecting to Login...
              </p>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="flex flex-col items-center space-y-4 py-4 animate-in fade-in zoom-in duration-500">
              <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-2">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                Verification Failed
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto mb-2">
                {message}
              </p>

              <div className="pt-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-mono">
                  {countdown > 0
                    ? `Wait ${countdown}s to resend`
                    : "Link expired?"}
                </p>
                <button
                  onClick={handleResend}
                  disabled={isResending || countdown > 0}
                  className={`text-xs font-bold transition underline underline-offset-4 ${
                    isResending || countdown > 0
                      ? "text-muted-foreground/50 cursor-not-allowed no-underline"
                      : "text-primary hover:text-foreground cursor-pointer"
                  }`}
                >
                  {isResending
                    ? "Sending..."
                    : countdown > 0
                    ? "Email Sent"
                    : "Resend Verification Email"}
                </button>
              </div>

              <div className="flex flex-col w-full gap-3 mt-6">
                <Link
                  to="/get-started"
                  className="w-full py-3.5 bg-background border border-border text-foreground text-xs font-bold rounded-lg hover:border-primary transition-all text-center cursor-pointer shadow-sm"
                >
                  Back to Registration
                </Link>
                <Link
                  to="/login"
                  className="w-full py-3.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-all text-center cursor-pointer shadow-lg shadow-primary/20"
                >
                  Sign In
                </Link>
              </div>
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