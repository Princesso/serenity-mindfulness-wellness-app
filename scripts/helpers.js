window.App = window.App || {};

(function() {
  // Format date helper
  function formatDate(dateString) {
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  // Generate ID
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Local Storage Wrapper
  const Storage = {
    get: (key, fallback) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      } catch (e) {
        console.error('Error reading from storage', e);
        return fallback;
      }
    },
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('Error writing to storage', e);
      }
    }
  };

  // Expose to App namespace
  window.App.Helpers = {
    formatDate,
    generateId,
    Storage
  };
})();