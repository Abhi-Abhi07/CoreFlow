// // Header theme switcher for dark and light modes.

// import { Moon, Sun } from "lucide-react";
// import { useTheme } from "next-themes";
// import { Button } from "@/components/ui/button";

// /**
//  * Toggle button that switches application theme.
//  */
// const ThemeToggle = () => {
//   const { resolvedTheme, setTheme } = useTheme();
//   const isDark = resolvedTheme === "dark";

//   return (
//     <Button
//       variant="outline"
//       size="icon"
//       aria-label="Toggle theme"
//       onClick={() => setTheme(isDark ? "light" : "dark")}
//       className="rounded-full"
//     >
//       {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//     </Button>
//   );
// };

// export default ThemeToggle;


import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors border border-border"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}