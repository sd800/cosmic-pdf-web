// Restore explicit visitor choices before the stylesheet; otherwise use device appearance.
(() => {
  let language = 'en', theme = '';
  try {
    if (localStorage.getItem('cosmic-pdf-web-language') === 'zh') language = 'zh';
    const saved = localStorage.getItem('cosmic-pdf-web-theme');
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch {}
  const root = document.documentElement;
  root.dataset.language = language;
  root.lang = language === 'zh' ? 'zh-Hans' : 'en';
  if (theme) root.dataset.theme = theme;
  const dark = theme ? theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  document.querySelectorAll('meta[name="theme-color"]').forEach(meta => { meta.content = dark ? '#13171e' : '#f8f9fc'; });
  document.querySelector('meta[name="color-scheme"]').content = theme || 'light dark';
})();
