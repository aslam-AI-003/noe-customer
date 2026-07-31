// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THEME SYSTEM — Dark & Light mode with system preference
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type Theme = 'dark' | 'light' | 'system';

/**
 * Get the resolved theme (dark or light) based on system preference
 */
export function getResolvedTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'system') {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light'; // SSR default
  }
  return theme;
}

/**
 * Apply theme class to document
 */
export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  
  const resolved = getResolvedTheme(theme);
  const root = document.documentElement;
  
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }

  // Update meta theme-color for mobile browser chrome
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', resolved === 'dark' ? '#0B0B0D' : '#FFFFFF');
  }
}

/**
 * Get stored theme preference
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('noe-theme') as Theme) || 'light';
}

/**
 * Store theme preference
 */
export function storeTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('noe-theme', theme);
}
