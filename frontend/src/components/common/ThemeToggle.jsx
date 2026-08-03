import { useEffect, useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { cn } from '@/utils/cn';

const STORAGE_KEY = 'online-chasmewala-theme';

/** Light-by-default colour-mode switcher that persists the shopper's choice. */
export function ThemeToggle({ className }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    const shouldUseDark = savedTheme === 'dark';
    document.documentElement.classList.toggle('dark', shouldUseDark);
    setIsDark(shouldUseDark);
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    document.documentElement.classList.toggle('dark', nextIsDark);
    window.localStorage.setItem(STORAGE_KEY, nextIsDark ? 'dark' : 'light');
    setIsDark(nextIsDark);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      title={isDark ? 'Light theme' : 'Dark theme'}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full text-navy-700 transition-colors hover:bg-navy-100 sm:h-10 sm:w-10',
        className
      )}
    >
      {isDark ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
    </button>
  );
}

export default ThemeToggle;
