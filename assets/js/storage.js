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

    // utils
    generateId,
    clearAllData
  };
})();
