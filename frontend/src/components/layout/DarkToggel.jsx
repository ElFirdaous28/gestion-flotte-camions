import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DarkToggel() {
  const [theme, setTheme] = useState('light');

  const toggelTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
  }, []);

  return (
    <button
      aria-label="Dark Toggel"
      onClick={toggelTheme}
      className="rounded-full cursor-pointer text-text-muted hover:text-primary transition-all ease-in-out"
    >
      {theme === 'light' ? <Moon /> : <Sun />}
    </button>
  );
}
