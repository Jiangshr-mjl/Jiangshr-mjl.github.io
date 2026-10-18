/* Run before styles paint. Storage may be disabled in private/restricted contexts. */
(function () {
  try {
    var preference = localStorage.getItem('cloud-notes-theme');
    if (preference === 'light' || preference === 'dark') {
      document.documentElement.dataset.theme = preference;
    }
  } catch (_) { /* CSS continues to follow the system preference. */ }
}());
