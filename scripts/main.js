$(function() {
  try {
    // Check contract
    const hasApp = !!window.App;
    const hasInit = hasApp && typeof window.App.init === 'function';
    
    if (!hasApp || !hasInit) {
      console.error('App initialization failed: Missing window.App.init');
      return;
    }

    // Initialize
    window.App.init();
    
    // Initialize Lucide icons on initial load just in case
    if (window.lucide) window.lucide.createIcons();

  } catch (e) {
    console.error('Critical error during startup:', e);
    $('body').html('<div class="p-8 text-center text-red-600">Application failed to load. Please refresh.</div>');
  }
});