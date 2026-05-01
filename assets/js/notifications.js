/**
 * Daraz Calculator Pro - Notifications Module
 * Provides toast notifications instead of alert() dialogs
 */
(function () {
  const TOAST_DURATION = 3000;
  const TOAST_POSITION = 'top-center';
  
  function createToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }
  
  function show(message, type = 'info', duration = TOAST_DURATION) {
    const container = createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__message">${escapeHtml(message)}</span>
      <button class="toast__close" aria-label="Close">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Auto-remove
    const timer = setTimeout(() => removeToast(toast), duration);
    
    // Close button
    toast.querySelector('.toast__close').addEventListener('click', () => {
      clearTimeout(timer);
      removeToast(toast);
    });
  }
  
  function removeToast(toast) {
    toast.classList.add('toast--hiding');
    setTimeout(() => toast.remove(), 300);
  }
  
  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  
  function success(message) {
    show(message, 'success');
  }
  
  function error(message) {
    show(message, 'error');
  }
  
  function warning(message) {
    show(message, 'warning');
  }
  
  function info(message) {
    show(message, 'info');
  }
  
  window.AppNotify = {
    show,
    success,
    error,
    warning,
    info
  };
})();
