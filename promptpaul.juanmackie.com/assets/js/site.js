const root = document.documentElement;
const themeToggle = document.querySelector('[data-theme-toggle]');
const nav = document.querySelector('[data-nav]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const menuLabel = document.querySelector('[data-menu-label]');
const navLinks = document.querySelector('[data-nav-links]');
const year = document.querySelector('[data-year]');

function syncThemeToggle(theme) {
  themeToggle.textContent = theme === 'dark' ? 'Dark' : 'Light';
  themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
}

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem('promptpaul-theme', theme);
  syncThemeToggle(theme);
}

function syncMenu(open) {
  nav.dataset.menuOpen = String(open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  menuLabel.textContent = open ? 'Close' : 'Menu';
}

themeToggle.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(next);
});

menuToggle.addEventListener('click', () => {
  syncMenu(nav.dataset.menuOpen !== 'true');
});

navLinks.addEventListener('click', (event) => {
  if (event.target.closest('a')) syncMenu(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') syncMenu(false);
});

window.addEventListener('resize', () => {
  if (window.matchMedia('(min-width: 1121px)').matches) syncMenu(false);
});

syncThemeToggle(root.dataset.theme);
syncMenu(false);
year.textContent = new Date().getFullYear();

document.querySelectorAll('[data-copy-target]').forEach((button) => {
  button.addEventListener('click', async () => {
    const source = document.getElementById(button.dataset.copyTarget);
    const status = button.parentElement.querySelector('[data-copy-status]');
    if (!source) return;

    try {
      await navigator.clipboard.writeText(source.textContent);
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = source.textContent;
      fallback.setAttribute('readonly', '');
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand('copy');
      fallback.remove();
    }

    button.textContent = 'Copied';
    status.textContent = 'Prompt copied to clipboard.';
    window.setTimeout(() => {
      button.textContent = 'Copy prompt';
      status.textContent = '';
    }, 2000);
  });
});
