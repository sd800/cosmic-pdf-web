// Only an explicit saved choice changes the interface language.
(() => {
  let language = 'en';
  try { if (localStorage.getItem('cosmic-pdf-web-language') === 'zh') language = 'zh'; } catch {}
  document.documentElement.dataset.language = language;
  document.documentElement.lang = language === 'zh' ? 'zh-Hans' : 'en';
})();
