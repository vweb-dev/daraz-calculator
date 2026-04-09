window.StorageUtils = (() => {
    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function uid() {
        return "p_" + Math.random().toString(36).slice(2, 10);
    }

    function loadJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return clone(fallback);
            return JSON.parse(raw);
        } catch (err) {
            console.error("Storage load error:", err);
            return clone(fallback);
        }
    }

    function saveJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (err) {
            console.error("Storage save error:", err);
            return false;
        }
    }

    function remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (err) {
            console.error("Storage remove error:", err);
            return false;
        }
    }

    function loadSettings() {
        return loadJSON(
            window.APP_CONFIG.settingsKey,
            window.APP_CONFIG.defaultSettings
        );
    }

    function saveSettings(settings) {
        return saveJSON(window.APP_CONFIG.settingsKey, settings);
    }

    function loadProducts() {
        return loadJSON(
            window.APP_CONFIG.productsKey,
            window.APP_CONFIG.defaultProducts
        );
    }

    function saveProducts(products) {
        return saveJSON(window.APP_CONFIG.productsKey, products);
    }

    function loadAuth() {
        return localStorage.getItem(window.APP_CONFIG.authKey) === "1";
    }

    function saveAuth(isUnlocked) {
        if (isUnlocked) {
            localStorage.setItem(window.APP_CONFIG.authKey, "1");
        } else {
            localStorage.removeItem(window.APP_CONFIG.authKey);
        }
    }

    function resetAllAppData() {
        remove(window.APP_CONFIG.settingsKey);
        remove(window.APP_CONFIG.productsKey);
        remove(window.APP_CONFIG.authKey);
    }

    return {
        clone,
        uid,
        loadJSON,
        saveJSON,
        remove,
        loadSettings,
        saveSettings,
        loadProducts,
        saveProducts,
        loadAuth,
        saveAuth,
        resetAllAppData
    };
})();