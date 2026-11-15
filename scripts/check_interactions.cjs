// Behavioral checks for system themes, persistence failures and responsive TOC.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = name => fs.readFileSync(path.join(__dirname, '../assets/js', name), 'utf8');

function boot({ saved, dark = false, wide = false, storageThrows = false } = {}) {
  const dataset = {};
  const events = {};
  const media = {};
  const button = { hidden: true, setAttribute(k, v) { this[k] = v; }, addEventListener(k, fn) { events[k] = fn; } };
  const toc = { open: true };
  const storage = {
    value: saved,
    getItem() { if (storageThrows) throw Error('Storage blocked'); return this.value; },
    setItem(k, v) { if (storageThrows) throw Error('Storage blocked'); this.value = v; }
  };
  const context = {
    document: { documentElement: { dataset }, querySelector: selector => selector === '.theme-toggle' ? button : toc },
    localStorage: storage,
    window: {
      matchMedia(query) { return media[query] = { matches: query.includes('color-scheme') ? dark : wide, addEventListener(_, fn) { this.change = fn; } }; },
      addEventListener(k, fn) { events[k] = fn; }
    }
  };
  vm.createContext(context);
  vm.runInContext(source('theme.js'), context);
  vm.runInContext(source('site.js'), context);
  return { dataset, button, toc, storage, events, media };
}

let app = boot({ dark: true });
assert.equal(app.dataset.theme, undefined, 'Default should continue following system');
assert.equal(app.button['aria-label'], 'Activate light mode');
assert.equal(app.button.hidden, false);
app.events.click();
assert.equal(app.dataset.theme, 'light');
assert.equal(app.storage.value, 'light');
assert.equal(boot({ saved: app.storage.value, dark: true }).button['aria-label'], 'Activate dark mode', 'Saved theme survives reload');

app = boot({ saved: 'invalid', dark: false });
assert.equal(app.dataset.theme, undefined, 'Ignore invalid saved theme');
app.media['(prefers-color-scheme: dark)'].matches = true;
app.media['(prefers-color-scheme: dark)'].change();
assert.equal(app.button['aria-label'], 'Activate light mode');
app.events.storage({ key: 'cloud-notes-theme', newValue: 'light' });
assert.equal(app.dataset.theme, 'light', 'Sync another tab');
app.events.storage({ key: null, newValue: null });
assert.equal(app.dataset.theme, undefined, 'Clearing storage restores system theme');

app = boot({ storageThrows: true });
assert.doesNotThrow(() => app.events.click());
assert.equal(app.dataset.theme, 'dark', 'Storage failure must not break current-page toggle');
assert.equal(app.toc.open, false, 'Mobile TOC starts collapsed');
app.media['(min-width: 1200px)'].matches = true;
app.media['(min-width: 1200px)'].change();
assert.equal(app.toc.open, true, 'Wide TOC opens on resize');
assert.equal(boot({ wide: true }).toc.open, true);
console.log('PASS: system theme, saved override, reload, invalid/blocked storage, cross-tab sync, responsive TOC.');

// Do not contact the live counter during tests or count preview traffic.
function bootPageviews({ siteUrl = 'https://example.com', origin = 'https://example.com', currentScript = true } = {}) {
  const scripts = [];
  const context = {
    URL,
    window: { location: { origin } },
    document: {
      currentScript: currentScript ? { getAttribute: () => siteUrl } : null,
      createElement(tag) { assert.equal(tag, 'script'); return {}; },
      head: { appendChild(script) { scripts.push(script); } }
    }
  };
  vm.runInNewContext(source('pageviews.js'), context);
  return scripts;
}

const trackers = bootPageviews();
assert.equal(trackers.length, 1, 'Load the counter once on the production origin');
assert.equal(trackers[0].async, true, 'The external script must not block parsing');
assert.equal(trackers[0].src, 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js');
for (const origin of ['http://localhost:4000', 'http://127.0.0.1:4000', 'https://preview.example.com', 'https://example.com:4000', 'http://example.com', 'null']) {
  assert.equal(bootPageviews({ origin }).length, 0, `Do not count preview origin: ${origin}`);
}
for (const siteUrl of ['', null, 'invalid', 'http://example.com']) {
  assert.equal(bootPageviews({ siteUrl }).length, 0, 'Invalid configuration must fail closed');
}
assert.equal(bootPageviews({ currentScript: false }).length, 0);
console.log('PASS: asynchronous pageviews, production-origin restriction, local/preview exclusion, invalid configuration.');
