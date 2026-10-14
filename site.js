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
