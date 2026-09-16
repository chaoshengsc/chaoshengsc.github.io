// Keep normal language URLs as a no-JavaScript fallback; enhance to an in-page swap.
(() => {
  const cache = new Map();
  let switching = false;
  const selector = '.profile-links a[hreflang]';
  const load = (url) => {
    if (!cache.has(url)) cache.set(url, fetch(url).then(response => {
      if (!response.ok) throw new Error('Language page unavailable');
      return response.text();
    }).catch(error => { cache.delete(url); throw error; }));
    return cache.get(url);
  };
  function prefetch() {
    const link = document.querySelector(selector);
    if (link) load(link.href).catch(() => {});
  }
  // Delegation survives replacement of the translated content.
  document.addEventListener('click', async event => {
    const link = event.target.closest(selector);
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (switching) return;
    switching = true;
    const url = link.href;
    try {
      const text = await load(url);
      const translated = new DOMParser().parseFromString(text, 'text/html');
      const main = document.querySelector('main');
      const next = translated.querySelector('main');
      if (!next) throw new Error('Missing translated content');
      const blocks = [...main.querySelectorAll('.profile-table, .project-entry')];
      const nextBlocks = [...next.querySelectorAll('.profile-table, .project-entry')];
      const anchorIndex = Math.max(0, blocks.findIndex(block => block.getBoundingClientRect().bottom > 0));
      const offset = blocks[anchorIndex].getBoundingClientRect().top;
      const atTop = window.scrollY < 2;
      const open = [...main.querySelectorAll('details')].map(item => item.open);
      next.querySelectorAll('details').forEach((item, i) => { item.open = open[i]; });
      // Preserve the space already occupied by each block when the other language is shorter.
      blocks.forEach((block, i) => {
        if (nextBlocks[i] && !(block.matches('.project-entry') && block.querySelector('details[open]'))) {
          nextBlocks[i].style.minHeight = `${block.getBoundingClientRect().height}px`;
        }
      });
      main.replaceChildren(...next.childNodes);
      const skip = document.querySelector('.skip-link');
      const nextSkip = translated.querySelector('.skip-link');
      if (skip && nextSkip) skip.textContent = nextSkip.textContent;
      document.documentElement.lang = translated.documentElement.lang;
      document.title = translated.title;
      document.querySelector('meta[name="description"]').content = translated.querySelector('meta[name="description"]').content;
      history.replaceState(null, '', new URL(url).pathname + location.hash);
      if (atTop) window.scrollTo(0, 0);
      else {
        const anchor = main.querySelectorAll('.profile-table, .project-entry')[anchorIndex];
        window.scrollBy(0, anchor.getBoundingClientRect().top - offset);
      }
      main.querySelector(selector)?.focus({ preventScroll: true });
      prefetch();
    } catch {
      window.location.assign(url);
    } finally { switching = false; }
  });
  prefetch();
})();
