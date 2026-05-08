// ========== STORAGE & NOTIFICATIONS MODULE ==========

(function () {
  const { storageKeys, defaults } = window.APP_CONFIG;

  // ---------- BASIC LOCAL STORAGE WRAPPER ----------

  function setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("Storage set error:", err);
    }
  }

  function getItem(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.error("Storage get error:", err);
      return fallback;
    }
  }

  function removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error("Storage remove error:", err);
    }
  }

  // ---------- LANGUAGE ----------

  function getLanguage() {
    return getItem(storageKeys.language, defaults.language);
  }

  function setLanguage(lang) {
    setItem(storageKeys.language, lang);
  }

  // ---------- SETTINGS ----------

  function getSettings() {
    const saved = getItem(storageKeys.settings);
    if (!saved) {
      setItem(storageKeys.settings, defaults.settings);
      return defaults.settings;
    }
    return { ...defaults.settings, ...saved };
  }

  function saveSettings(settings) {
    setItem(storageKeys.settings, settings);
  }

  function resetSettings() {
    setItem(storageKeys.settings, defaults.settings);
    return defaults.settings;
  }

  // ---------- PRODUCTS ----------

  function getProducts() {
    return getItem(storageKeys.products, []);
  }

  function saveProducts(products) {
    setItem(storageKeys.products, products);
  }

  function addProduct(product) {
    const products = getProducts();
    products.unshift(product); // latest on top
    saveProducts(products);
  }

  function updateProduct(id, updatedData) {
    const products = getProducts();
    const updated = products.map((p) =>
      p.id === id ? { ...p, ...updatedData } : p
    );
    saveProducts(updated);
  }

  function deleteProduct(id) {
    const products = getProducts().filter((p) => p.id !== id);
    saveProducts(products);
  }

  function getRecentProducts(limit = 5) {
    const products = getProducts();
    return products.slice(0, limit);
  }

  // ---------- COMPETITORS ----------

  function getCompetitors() {
    return getItem(storageKeys.competitors, []);
  }

  function saveCompetitors(competitors) {
    setItem(storageKeys.competitors, competitors);
  }

  function addCompetitor(competitor) {
    const competitors = getCompetitors();
    competitors.unshift(competitor);
    saveCompetitors(competitors);
  }

  function updateCompetitor(id, updatedData) {
    const competitors = getCompetitors();
    const updated = competitors.map((c) =>
      c.id === id ? { ...c, ...updatedData } : c
    );
    saveCompetitors(updated);
  }

  function deleteCompetitor(id) {
    const competitors = getCompetitors().filter((c) => c.id !== id);
    saveCompetitors(competitors);
  }

  // ---------- UTIL ----------

  function generateId() {
    return "p_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  }

  function clearAllData() {
    removeItem(storageKeys.products);
    removeItem(storageKeys.settings);
    removeItem(storageKeys.language);
    removeItem(storageKeys.adminAuth);
  }

  // ---------- DRAFT (AUTO-SAVE) ----------

  function saveDraft(data) {
    setItem(storageKeys.draft, {
      ...data,
      savedAt: new Date().toISOString()
    });
  }

  function getDraft() {
    return getItem(storageKeys.draft, null);
  }

  function clearDraft() {
    removeItem(storageKeys.draft);
  }

  // ---------- AUTO-SAVE PREFERENCE ----------

  function getAutoSave() {
    return getItem(storageKeys.autoSave, true);
  }

  function setAutoSave(enabled) {
    setItem(storageKeys.autoSave, enabled);
  }

  // ---------- THEME ----------

  function getTheme() {
    return getItem(storageKeys.theme, defaults.theme || "light");
  }

  function setTheme(theme) {
    setItem(storageKeys.theme, theme);
  }

  // ---------- WELCOME BANNER ----------

  function getWelcomeSeen() {
    return getItem(storageKeys.welcomeSeen, false);
  }

  function setWelcomeSeen(seen) {
    setItem(storageKeys.welcomeSeen, seen);
  }

  // ---------- EXPORT / IMPORT ----------

  function exportData() {
    const data = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      products: getProducts(),
      competitors: getCompetitors(),
      settings: getSettings(),
      language: getLanguage()
    };
    return JSON.stringify(data, null, 2);
  }

  function importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      if (!data.version || !data.products || !Array.isArray(data.products)) {
        throw new Error("Invalid data format");
      }

      saveProducts(data.products);

      if (data.competitors && Array.isArray(data.competitors)) {
        saveCompetitors(data.competitors);
      }

      if (data.settings) {
        saveSettings(data.settings);
      }

      if (data.language) {
        setLanguage(data.language);
      }

      return {
        success: true,
        count: data.products.length,
        competitorCount: data.competitors ? data.competitors.length : 0,
        message: `Imported ${data.products.length} products and ${data.competitors ? data.competitors.length : 0} competitors`
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Failed to import data"
      };
    }
  }

  function downloadExport() {
    const jsonData = exportData();
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daraz-calculator-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ---------- NOTIFICATIONS ----------

  const TOAST_DURATION = 3000;

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

  // ---------- EXPORT GLOBAL ----------

  window.AppStorage = {
    // basic
    setItem,
    getItem,
    removeItem,

    // language
    getLanguage,
    setLanguage,

    // settings
    getSettings,
    saveSettings,
    resetSettings,

    // products
    getProducts,
    saveProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getRecentProducts,

    // competitors
    getCompetitors,
    saveCompetitors,
    addCompetitor,
    updateCompetitor,
    deleteCompetitor,

    // draft (auto-save)
    saveDraft,
    getDraft,
    clearDraft,

    // auto-save preference
    getAutoSave,
    setAutoSave,

    // welcome banner
    getWelcomeSeen,
    setWelcomeSeen,

    // utils
    generateId,
    clearAllData,

    // export/import
    exportData,
    importData,
    downloadExport
  };

  window.AppNotify = {
    show,
    success,
    error,
    warning,
    info
  };
})();