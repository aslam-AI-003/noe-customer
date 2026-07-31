// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ThemeScript — Inline script to prevent theme flash on load
// This runs BEFORE React hydrates, setting the correct class on <html>
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function ThemeScript() {
  // This script runs immediately in the browser before paint
  const themeScript = `
    (function() {
      try {
        var theme = localStorage.getItem('noe-theme') || 'light';
        var resolved = theme;
        if (theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.classList.add(resolved);
        document.documentElement.classList.remove(resolved === 'dark' ? 'light' : 'dark');
        if (resolved === 'dark') {
          document.documentElement.style.backgroundColor = '#0B0B0D';
          document.documentElement.style.colorScheme = 'dark';
        } else {
          document.documentElement.style.backgroundColor = '#FFFFFF';
          document.documentElement.style.colorScheme = 'light';
        }
      } catch(e) {}
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}
