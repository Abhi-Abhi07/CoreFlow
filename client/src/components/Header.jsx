import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, LogOut, UserCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../utils/toastUtils';
import { setUser } from '../redux/userSlice';
import ThemeToggle from './ThemeToggle';
import { apiClient } from '@/services/apiClients.js';

export default function Header() {
  const { user } = useSelector(store => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await apiClient.post("/api/v1/user/logout", {});
      if (res.data.success) {
        dispatch(setUser(null));
        useToast.success(res.data.message);
        navigate("/");
      }
    } catch (error) {
      useToast.error(error.response?.data?.message || "Logged out locally");
    } finally {
      dispatch(setUser(null));
      localStorage.removeItem("accessToken");
      navigate("/login");
    }
  };

  return (
    <header className="px-6 md:px-12 py-4 flex items-center justify-between border-b border-border backdrop-blur-md sticky top-0 bg-background/80 z-50 transition-colors duration-300">
      
      {/* Brand Logo */}
      <Link to="/" className="flex items-center space-x-3 group">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-core-cyan to-core-purple flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
          <Cpu className="w-5 h-5 text-white animate-pulse" />
        </div>
        <span className="text-xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
          COREFLOW
        </span>
      </Link>

      {/* Center Navigation */}
      <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
        <Link to="/algorithms" className="hover:text-primary transition-colors">Algorithms</Link>
        <Link to="/simulation" className="hover:text-primary transition-colors">Simulation</Link>
        <Link to="/monitor" className="hover:text-primary transition-colors">Monitor</Link>
        <Link to="/docs" className="hover:text-primary transition-colors">Docs</Link>
      </nav>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {!user ? (
          <>
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link 
              to="/get-started" 
              className="px-5 py-2.5 text-xs font-bold bg-foreground text-background rounded-full hover:bg-primary hover:text-primary-foreground transition-all shadow-md hover:shadow-lg hover:shadow-primary/20"
            >
              Get Started
            </Link>
          </>
        ) : (
          <div className="flex items-center space-x-3">
            <Link 
              to={`/profile/${user._id}`} 
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-xs font-bold text-foreground hover:border-primary hover:text-primary transition-all shadow-sm"
            >
              <UserCircle className="w-4 h-4 text-primary" /> Profile
            </Link>
            <button 
              onClick={handleLogout}
              className="p-2 bg-card border border-border rounded-lg hover:border-destructive transition-colors text-foreground hover:text-destructive hover:bg-destructive/10 shadow-sm cursor-pointer"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button> 
          </div>
        )}
        
        {/* Theme Toggle Separator */}
        <div className="pl-2 ml-2 border-l border-border flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}