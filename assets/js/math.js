// Loaded only for posts that opt in with `math: true`.
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true
  },
  options: {
    // Do not typeset the navigation, code samples or other site chrome.
    ignoreHtmlClass: 'main-content',
    processHtmlClass: 'prose'
  }
};
