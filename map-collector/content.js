(() => {
  if (window.top !== window) return;

  const state = { running: false, seen: new Set(), saved: 0, skipped: 0 };
  const panel = document.createElement('div');
  panel.style.cssText = 'position:fixed;z-index:2147483647;right:16px;bottom:16px;background:#111827;color:white;padding:12px;border-radius:10px;font:13px Arial;box-shadow:0 4px 20px #0006;width:240px';
  panel.innerHTML = '<b>Outreach collector</b><div id="dm-status" style="margin:8px 0">Ready. Run a Maps search first.</div><button id="dm-start" style="padding:6px 10px;border:0;border-radius:6px;background:#22c55e;color:#fff;cursor:pointer">Collect results</button>';
  document.body.appendChild(panel);

  const status = (text) => { panel.querySelector('#dm-status').textContent = text; };
  const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();
  const phoneFrom = (text) => (text.match(/(?:\+?\d[\d ()-]{8,}\d)/) || [])[0]?.replace(/[^\d+]/g, '') || '';

  function extractCards() {
    return [...document.querySelectorAll('a[href*="/maps/place/"]')].map((link) => {
      const card = link.closest('[role="article"]') || link.parentElement?.parentElement?.parentElement;
      const text = clean(card?.innerText || link.getAttribute('aria-label') || '');
      const website = [...(card?.querySelectorAll('a[href^="http"]') || [])]
        .map((a) => a.href).find((href) => !href.includes('google.com')) || '';
      const name = clean(link.getAttribute('aria-label') || link.textContent).replace(/\s+·.*$/, '');
      return { name, text, website, url: link.href, phone: phoneFrom(text) };
    }).filter((item) => item.name && item.url);
  }

  async function save(item) {
    const key = item.url || item.name;
    if (state.seen.has(key)) return;
    state.seen.add(key);
    const lead = {
      business_name: item.name,
      category: 'Google Maps result',
      location: item.text,
      website: item.website || null,
      phone: item.phone || null,
      whatsapp: item.phone || null,
      source_id: `google-maps:${key}`,
    };
    chrome.runtime.sendMessage({ type: 'SAVE_LEAD', lead }, (result) => {
      if (result?.ok) state.saved += 1;
      else state.skipped += 1;
      status(`Saved ${state.saved}; skipped ${state.skipped}`);
    });
  }

  async function collect() {
    state.running = true;
    const scrollBox = document.querySelector('[role="feed"]') || document.querySelector('.m6QErb[aria-label]');
    if (!scrollBox) { status('Open Google Maps search results first.'); state.running = false; return; }
    for (let i = 0; i < 40 && state.running; i += 1) {
      extractCards().forEach(save);
      scrollBox.scrollTop += Math.max(500, scrollBox.clientHeight * 0.8);
      status(`Scanning page ${i + 1}/40 · saved ${state.saved}`);
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
    state.running = false;
    status(`Finished. Saved ${state.saved}; skipped ${state.skipped}.`);
  }

  panel.querySelector('#dm-start').addEventListener('click', () => {
    if (state.running) { state.running = false; return; }
    state.saved = 0; state.skipped = 0; collect();
  });
})();
