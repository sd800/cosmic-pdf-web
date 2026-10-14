const root = document.documentElement;
const byId = id => document.getElementById(id);
const isChinese = () => root.dataset.language === 'zh';
const announce = (en, zh) => { byId('announcement').textContent = isChinese() ? zh : en; };
function updateLanguage() {
  const zh = isChinese();
  root.lang = zh ? 'zh-Hans' : 'en';
  document.title = zh ? 'Cosmic PDF — 少一点刺眼，多一分明白。' : 'Cosmic PDF — Less glare. More clarity.';
  document.querySelector('meta[name="description"]').content = zh
    ? '为 Chrome 打造的 PDF 阅读器。深色阅读、AI 解释和本地文字识别，让每一份文档更舒适、更好懂。'
    : 'Read PDFs in beautifully dark mode. Understand a word or a whole passage with Explain with AI. Local OCR, thoughtful tools, and privacy built in.';
  document.querySelectorAll('[data-language-toggle]').forEach(button => button.setAttribute('aria-label', zh ? 'Switch to English' : '切换到简体中文'));
  byId('close-explanation').setAttribute('aria-label', zh ? '关闭解释示例' : 'Close example explanation');
  document.querySelector('.main-nav').setAttribute('aria-label', zh ? '主导航' : 'Main navigation');
  document.querySelector('.reader-window').setAttribute('aria-label', zh ? '产品交互示意' : 'Interactive product illustration');
}
document.querySelectorAll('[data-language-toggle]').forEach(button => button.addEventListener('click', () => {
  root.dataset.language = isChinese() ? 'en' : 'zh';
  try { localStorage.setItem('cosmic-pdf-web-language', root.dataset.language); } catch {}
  updateLanguage();
}));
updateLanguage();
const preview = byId('explanation-preview');
const trigger = byId('explain-preview');
function setExplanation(open) {
  preview.hidden = !open;
  trigger.setAttribute('aria-expanded', String(open));
  document.querySelector('.reader-body').classList.toggle('show-explanation', open);
  if (open) announce('Example explanation opened.', '已打开解释示例。');
}
trigger.addEventListener('click', () => setExplanation(preview.hidden));
byId('close-explanation').addEventListener('click', () => { setExplanation(false); trigger.focus({preventScroll:true}); });
byId('example-followup').addEventListener('click', () => {
  const next = document.querySelector('.answer-followup');
  next.hidden = !next.hidden;
  document.querySelector('.answer-initial').hidden = !next.hidden;
  byId('example-followup').setAttribute('aria-pressed', String(!next.hidden));
  byId('example-followup').querySelector('[data-lang="en"]').textContent = next.hidden ? 'Show me an everyday example' : 'Back to the explanation';
  byId('example-followup').querySelector('[data-lang="zh"]').textContent = next.hidden ? '换一个日常生活中的例子' : '返回最初的解释';
  announce(next.hidden ? 'Initial explanation shown.' : 'Everyday example shown.', next.hidden ? '已显示最初的解释。' : '已显示生活中的例子。');
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !preview.hidden && document.activeElement?.closest('.reader-window')) {
    setExplanation(false); trigger.focus({preventScroll:true});
  }
});
let copyTimer;
byId('copy-extensions').addEventListener('click', async event => {
  const button = event.currentTarget;
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText('chrome://extensions');
    else {
      const input = document.createElement('textarea');
      input.value = 'chrome://extensions'; input.className = 'clipboard-helper'; document.body.append(input);
      input.select(); const success = document.execCommand('copy'); input.remove();
      if (!success) throw Error('copy');
    }
    button.classList.add('copied');
    announce('Address copied: chrome://extensions', '已复制地址：chrome://extensions');
    clearTimeout(copyTimer); copyTimer = setTimeout(() => button.classList.remove('copied'), 2500);
  } catch { announce('Select and copy chrome://extensions from the setup instructions.', '请选中并复制安装说明中的 chrome://extensions。'); }
});

// A short, eased journey for in-page links. The browser keeps ordinary history,
// modified clicks and reduced-motion behavior; there is no idle animation loop.
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = null;
  function cancel() {
    if (!active) return;
    cancelAnimationFrame(active.frame);
    active = null;
  }
  function focusTarget(target) {
    if (target === root) return;
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), {once:true});
    }
    target.focus({preventScroll:true});
  }
  function destination(target) {
    if (target === root) return 0;
    const padding = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    return Math.max(0, Math.min(target.getBoundingClientRect().top + scrollY - padding - margin,
      root.scrollHeight - innerHeight));
  }
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href^="#"]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const href = link.getAttribute('href');
    let target;
    try { target = href === '#' ? root : document.getElementById(decodeURIComponent(href.slice(1))); } catch { return; }
    if (!target) return;
    event.preventDefault();
    cancel();
    const hash = new URL(href, location.href).hash;
    if (location.hash !== hash) {
      try { history.pushState(null, '', href); }
      catch { location.hash = hash; return; }
    }
    const from = scrollY, to = destination(target), distance = Math.abs(to - from);
    if (motion.matches || distance < 2) {
      scrollTo({top:to, behavior:'instant'});
      focusTarget(target);
      return;
    }
    const duration = Math.min(1200, Math.max(650, Math.sqrt(distance) * 18));
    const job = {frame:0, started:performance.now(), target};
    active = job;
    function step(now) {
      if (active !== job) return;
      const progress = Math.min(1, Math.max(0, (now - job.started) / duration));
      const eased = progress * progress * (3 - 2 * progress);
      // Explicit instant placement avoids stacking native CSS smooth scrolls.
      scrollTo({top:from + (to - from) * eased, behavior:'instant'});
      if (progress < 1) job.frame = requestAnimationFrame(step);
      else { active = null; focusTarget(target); }
    }
    job.frame = requestAnimationFrame(step);
  });
  for (const name of ['wheel', 'touchstart', 'pointerdown']) addEventListener(name, cancel, {passive:true});
  for (const name of ['keydown', 'popstate', 'hashchange', 'pagehide', 'resize']) addEventListener(name, cancel);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
  motion.addEventListener('change', () => {
    if (!motion.matches || !active) return;
    const target = active.target;
    cancel(); scrollTo({top:destination(target), behavior:'instant'}); focusTarget(target);
  });
})();
