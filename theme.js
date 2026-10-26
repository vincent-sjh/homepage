/* Resolve appearance before the first paint; unavailable storage stays harmless. */
(() => {
  let preference = 'system';
  try {
    const saved = localStorage.getItem('vincent-theme');
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch { /* Private or file-based browsing can disable storage. */ }
  const dark = preference === 'dark' || (preference === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.dataset.themePreference = preference;
})();
