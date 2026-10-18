(function () {
  'use strict';
  var root = document.documentElement;
  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  var toggle = document.querySelector('.theme-toggle');
  function isDark() {
    return root.dataset.theme ? root.dataset.theme === 'dark' : systemTheme.matches;
  }
  function updateLabel() {
    if (toggle) toggle.setAttribute('aria-label', isDark() ? 'Activate light mode' : 'Activate dark mode');
  }
  if (toggle) {
    toggle.hidden = false;
    updateLabel();
    toggle.addEventListener('click', function () {
      var theme = isDark() ? 'light' : 'dark';
      root.dataset.theme = theme;
      try { localStorage.setItem('cloud-notes-theme', theme); } catch (_) {}
      updateLabel();
    });
    systemTheme.addEventListener('change', updateLabel);
    window.addEventListener('storage', function (event) {
      if (event.key !== 'cloud-notes-theme' && event.key !== null) return;
      if (event.newValue === 'light' || event.newValue === 'dark') root.dataset.theme = event.newValue;
      else delete root.dataset.theme;
      updateLabel();
    });
  }
  var toc = document.querySelector('.post-toc details');
  if (toc) {
    var wideScreen = window.matchMedia('(min-width: 1200px)');
    function positionToc() { toc.open = wideScreen.matches; }
    positionToc();
    wideScreen.addEventListener('change', positionToc);
  }
}());
