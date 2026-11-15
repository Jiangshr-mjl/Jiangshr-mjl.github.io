(function () {
  'use strict';
  // Production builds may also be previewed locally; only count the real site.
  var loader = document.currentScript;
  if (!loader) return;
  var siteUrl = loader.getAttribute('data-site-url');
  if (!siteUrl) return;
  try {
    var site = new URL(siteUrl);
    if (site.protocol !== 'https:' || window.location.origin !== site.origin) return;
  } catch (_) {
    return;
  }
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
  // Busuanzi reveals its initially hidden containers only after data arrives.
  document.head.appendChild(script);
}());
