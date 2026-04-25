(function () {
  try {
    var stored = localStorage.getItem('matrix.theme');
    var theme = stored === 'light' || stored === 'dark' ? stored : null;
    if (!theme) {
      theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
    var storedStyle = localStorage.getItem('matrix.style');
    document.documentElement.setAttribute('data-style', storedStyle === 'atlas' ? 'atlas' : 'classic');
  } catch (e) {}
})();
