async () => {
  // Run on the local built site's origin with Chrome DevTools evaluate_script
  // (format: function, sourcePath: this file). Test content is synthetic.
  if (!['127.0.0.1', 'localhost'].includes(location.hostname)) {
    throw new Error('Run layout verification on a local preview, not production.');
  }
  const sitemap = new DOMParser().parseFromString(await (await fetch('/sitemap.xml')).text(), 'application/xml');
  const paths = [...new Set([...sitemap.querySelectorAll('loc')].map(el => new URL(el.textContent).pathname))]
    .filter(path => !path.endsWith('.xml'));
  if (!paths.includes('/') || !paths.includes('/free-llm-tracker')) throw new Error('Sitemap did not reach the expected routes.');
  const frame = document.createElement('iframe');
  frame.title = 'Local layout verification';
  // Keep the frame painted: Chrome throttles animation callbacks in invisible
  // frames, including the callback that opens the real chat panel.
  frame.style.cssText = 'position:fixed;inset:0;border:0;max-width:none;z-index:1000;pointer-events:none;';
  document.body.append(frame);
  const failures = [];
  const checks = [];
  const assert = (ok, message) => { if (!ok) failures.push(message); };
  const load = async (path, width, height = 800) => {
    frame.style.width = `${width}px`;
    frame.style.height = `${height}px`;
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Load timed out: ${path}`)), 15000);
      frame.onload = () => { clearTimeout(timeout); resolve(); };
      frame.src = path;
    });
    await new Promise(resolve => setTimeout(resolve, 250));
    assert(frame.contentDocument.querySelector('main'), `${path}: missing main`);
    assert(frame.contentWindow.innerWidth === width, `${path}: viewport width was not applied`);
    return frame.contentDocument;
  };
  const isVisible = (el) => {
    const rect = el.getBoundingClientRect();
    const style = el.ownerDocument.defaultView.getComputedStyle(el);
    return !el.hidden && rect.width > 0 && rect.height > 0 &&
      style.visibility === 'visible' && Number(style.opacity) > 0;
  };
  const inspect = (doc, label) => {
    const win = doc.defaultView;
    const rail = doc.querySelector('main').getBoundingClientRect();
    // Decorative pseudo-elements and deliberately scrollable tables/code are not
    // failures. Visible text must fit its own box even when main clips overflow.
    for (const el of doc.querySelectorAll('main *')) {
      const style = win.getComputedStyle(el);
      // Screen-reader-only labels and the aria-hidden decorative canvas are
      // intentionally clipped; neither contains visible reading content.
      if (el.matches('.sr-only') || el.closest('.hero-wirefield[aria-hidden="true"]')) continue;
      if (!el.clientWidth || ['auto', 'scroll'].includes(style.overflowX)) continue;
      // Only this model-name preview deliberately truncates text horizontally.
      if (el.matches('.route-preview span:first-child') && style.textOverflow === 'ellipsis') continue;
      // Descendants of a horizontal scroller can extend beyond the rail.
      let ancestor = el.parentElement;
      let insideScroller = false;
      while (ancestor && ancestor !== doc.querySelector('main')) {
        if (['auto', 'scroll'].includes(win.getComputedStyle(ancestor).overflowX)) {
          insideScroller = true;
          break;
        }
        ancestor = ancestor.parentElement;
      }
      if (insideScroller) continue;
      const rect = el.getBoundingClientRect();
      if (el.scrollWidth > el.clientWidth + 2 || rect.right > rail.right + 2 || rect.left < rail.left - 2) {
        failures.push(`${label}: ${el.tagName}.${el.className} overflows (${el.clientWidth}/${el.scrollWidth})`);
      }
    }
    checks.push(label);
  };
  const longText = 'SyntheticLongIdentifier'.repeat(12);
  try {
    // Known-positive controls include direct text hidden by both clipping modes.
    let doc = await load('/', 320);
    const probe = doc.createElement('p');
    probe.textContent = longText;
    doc.querySelector('main').append(probe);
    for (const overflow of ['visible', 'hidden', 'clip']) {
      probe.style.cssText = `width:50px;white-space:nowrap;overflow:${overflow}`;
      const before = failures.length;
      inspect(doc, `detector-positive-control ${overflow}`);
      const reached = failures.slice(before).some(message => message.includes('P. overflows'));
      failures.splice(before);
      assert(reached, `Overflow detector missed its ${overflow} positive control`);
    }
    probe.remove();
    assert(!isVisible(doc.querySelector('[data-chat-panel]')), 'Visibility detector accepted the initially hidden chat panel');
    for (const width of [320, 768, 1440]) {
      for (const path of paths) {
        doc = await load(path, width);
        for (const theme of ['dark', 'light']) {
          doc.documentElement.dataset.theme = theme;
          inspect(doc, `${path} @ ${width} ${theme}`);
        }
      }
    }
    // Stress the real component markup without persisting fixture content.
    for (const path of ['/', '/library', '/now', '/work/prompt-paul', '/writing/our-agent-memory-stack-how-it-works']) {
      doc = await load(path, 320);
      for (const el of doc.querySelectorAll('h1, h2, h3, .library__list li > span:last-child, .case-meta dd, .featured-project__meta span, .listening-widget__status strong')) {
        el.textContent = longText;
      }
      if (path === '/now') {
        const track = doc.createElement('li');
        track.className = 'listening-widget__track';
        for (const tag of ['span', 'strong', 'em']) {
          const el = doc.createElement(tag);
          el.textContent = tag === 'span' ? '01' : longText;
          track.append(el);
        }
        doc.querySelector('.listening-widget__tracks').replaceChildren(track);
      }
      inspect(doc, `${path} long content @ 320`);
      if (path === '/now') {
        const title = doc.querySelector('.listening-widget__track strong').getBoundingClientRect();
        const artist = doc.querySelector('.listening-widget__track em').getBoundingClientRect();
        assert(Math.abs(title.left - artist.left) < 1, 'Artist is not in the track title column');
      }
    }
    for (const [width, height] of [[320, 640], [800, 320]]) {
      doc = await load('/', width, height);
      doc.querySelector('.site-nav__mobile > summary').click();
      doc.querySelector('[data-chat-toggle]').click();
      const panel = doc.querySelector('[data-chat-panel]');
      const chatIsOpen = () => isVisible(panel) && Number(doc.defaultView.getComputedStyle(panel).opacity) >= 0.99;
      const deadline = performance.now() + 5000;
      while (!chatIsOpen() && performance.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      assert(chatIsOpen(), 'Chat did not finish opening within five seconds');
      assert(doc.querySelector('.site-nav__mobile').open, 'Mobile menu did not open');
      assert(doc.querySelector('[data-chat-toggle]').getAttribute('aria-expanded') === 'true', 'Chat did not expand');
      for (const selector of ['.site-nav__mobile-links', '.chat-widget__panel']) {
        const el = doc.querySelector(selector);
        const rect = el.getBoundingClientRect();
        assert(isVisible(el), `${selector} did not become visible`);
        assert(rect.top >= 0 && rect.bottom <= height + 1, `${selector} outside ${width}x${height}`);
        if (el.scrollHeight > el.clientHeight + 1) {
          el.scrollTop = el.scrollHeight;
          assert(el.scrollTop > 0, `${selector} cannot scroll`);
        }
      }
      doc.querySelector('[data-chat-close]').click();
      assert(doc.querySelector('[data-chat-toggle]').getAttribute('aria-expanded') === 'false', 'Chat did not close');
      checks.push(`menu/chat @ ${width}x${height}`);
    }
    doc = await load('/library', 320);
    const search = doc.querySelector('#book-search');
    for (const query of ['zzzz-no-title-matches', '']) {
      search.value = query;
      search.dispatchEvent(new frame.contentWindow.Event('input', { bubbles: true }));
      assert(doc.querySelector('#book-empty').hidden === (query === ''), `Library empty state: ${query}`);
    }
    checks.push('library empty/reset');
    for (const path of ['/', '/library', '/free-llm-tracker']) {
      doc = await load(path, 800);
      doc.documentElement.style.fontSize = '200%';
      inspect(doc, `${path} @ 200% text`);
    }
    const result = { passed: failures.length === 0, routes: paths.length, checks: checks.length, failureCount: failures.length, failures: failures.slice(0, 30) };
    console.log(JSON.stringify(result));
    if (failures.length) throw new Error(JSON.stringify(result));
    return result;
  } finally {
    frame.remove();
  }
}
