import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'aurora' | 'midnight';

/**
 * Aurora (light) / Midnight (dark) switch.
 *
 * Midnight is the default: the light palette still has unfinished utility
 * coverage, so the app opens in the theme it was designed in. The matching
 * default lives in the anti-FOUC bootstrap in index.html — change both together.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('theme') as Theme) || 'midnight';
    } catch {
      return 'midnight';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    try {
      if (theme === 'midnight') {
        root.classList.add('dark');
        localStorage.setItem('theme', 'midnight');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'aurora');
      }
    } catch {
      // Private-mode storage failures are non-fatal; the class still applies.
      if (theme === 'midnight') root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'aurora' ? 'midnight' : 'aurora'));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={toggleTheme}
        onKeyDown={handleKeyDown}
        aria-label={`Switch to ${theme === 'aurora' ? 'Midnight' : 'Aurora'} theme`}
        tabIndex={0}
        className="relative flex items-center justify-between w-14 h-7 bg-slate-200/80 dark:bg-slate-800/80 border border-slate-350/50 dark:border-slate-700/50 rounded-full p-1 cursor-pointer select-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
      >
        <Sun
          className={`h-3.5 w-3.5 z-10 transition-all duration-300 ${theme === 'aurora' ? 'text-amber-500 scale-100' : 'text-slate-500 scale-90 opacity-40'}`}
        />

        <Moon
          className={`h-3.5 w-3.5 z-10 transition-all duration-300 ${theme === 'midnight' ? 'text-indigo-400 scale-100' : 'text-slate-400 scale-90 opacity-40'}`}
        />

        <div
          className={`absolute w-5.5 h-5.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-700/40 shadow-sm transition-all duration-300 transform
            ${theme === 'midnight' ? 'translate-x-6.5' : 'translate-x-0'}
          `}
        />
      </button>

      <span className="absolute top-9 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-900 text-white text-[10px] px-2 py-1 rounded font-medium shadow-md pointer-events-none whitespace-nowrap z-50">
        {theme === 'aurora' ? 'Switch to Midnight' : 'Switch to Aurora'}
      </span>
    </div>
  );
}
