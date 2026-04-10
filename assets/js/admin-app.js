(function () {
  const { translations, defaults, admin, storageKeys } = window.APP_CONFIG;
  const Storage = window.AppStorage;

  let currentLang = Storage.getLanguage() || defaults.language;

  // ---------- DOM HELPERS ----------

  function $(id) {
    return document.getElementById(id);
  }

  function qsa(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function setValue(id, value) {
    const el = $(id);
    if (el) el.value = value;
  }

  function getValue(id) {
    const el = $(id);
    return el ? el.value : "";
  }

  function toNumber(value) {
    const n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  }

  // ---------- I18N ----------

  function t(key) {
    const langSet = translations[currentLang] || translations.en;
    return langSet[key] || translations.en[key] || key;
  }

  function applyTranslations() {
    document.documentElement.setAttribute("lang", currentLang === "ru" ? "ur" : "en");
    document.documentElement.setAttribute("data-lang", currentLang);

    const toggle = $("langToggle");
    if (toggle) {
      const items = toggle.querySelectorAll(".lang-toggle__item");
      if (items.length >= 2) {
        items[0].classList.toggle("lang-toggle__item--active", currentLang === "en");
        items[1].classList.toggle("lang-toggle__item--active", currentLang === "ru");
      }
    }
  }

  function toggleLanguage() {
    currentLang = currentLang === "en" ? "ru" : "en";
    Storage.setLanguage(currentLang);
    applyTranslations();
  }

  // ---------- ADMIN AUTH ----------

  function isAdminUnlocked() {
    const raw = Storage.getItem(storageKeys.adminAuth, false);
    return !!raw;
  }

  function unlockAdmin() {
    const pass = getValue("adminPasswordInput");

    if (pass === admin.password) {
      Storage.setItem(storageKeys.adminAuth, true);
      renderAuthState();
    } else {
      alert(currentLang === "ru" ? "Ghalat password." : "Incorrect password.");
    }
  }

  function lockAdmin() {
    Storage.removeItem(storageKeys.adminAuth);
    renderAuthState();
  }

  function renderAuthState() {
    const unlocked = isAdminUnlocked();

    const loginPanel = $("adminLoginPanel");
    const settingsPanel = $("adminSettingsPanel");

    if (loginPanel) loginPanel.classList.toggle("hidden", unlocked);
    if (settingsPanel) settingsPanel.classList.toggle("hidden", !unlocked);

    if (unlocked) {
      fillSettingsForm();
    }
  }

  // ---------- SETTINGS FORM ----------

  function fillSettingsForm() {
    const settings = Storage.getSettings();

    setValue("commissionRateInput", settings.commissionRate);
    setValue("paymentFeeRateInput", settings.paymentFeeRate);
    setValue("freeShippingRateInput", settings.freeShippingRate);
    setValue("coinsRateInput", settings.coinsRate);
    setValue("voucherRateInput", settings.voucherRate);
    setValue("incomeTaxRateInput", settings.incomeTaxRate);
    setValue("salesTaxRateInput", settings.salesTaxRate);
    setValue("handlingFeeInput", settings.handlingFee);
    setValue("shippingShortfallInput", settings.shippingShortfall);
    setValue("defaultDiscountRateInput", settings.defaultDiscountRate);
    setValue("defaultTargetMarginRateInput", settings.defaultTargetMarginRate);
    setValue(
      "bundleQuantitiesInput",
      Array.isArray(settings.bundleQuantities)
        ? settings.bundleQuantities.join(",")
        : defaults.settings.bundleQuantities.join(",")
    );
  }

  function readSettingsForm() {
    const bundleText = getValue("bundleQuantitiesInput");
    const bundleQuantities = bundleText
      .split(",")
      .map((item) => parseInt(item.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

    return {
      commissionRate: toNumber(getValue("commissionRateInput")),
      paymentFeeRate: toNumber(getValue("paymentFeeRateInput")),
      freeShippingRate: toNumber(getValue("freeShippingRateInput")),
      coinsRate: toNumber(getValue("coinsRateInput")),
      voucherRate: toNumber(getValue("voucherRateInput")),
      incomeTaxRate: toNumber(getValue("incomeTaxRateInput")),
      salesTaxRate: toNumber(getValue("salesTaxRateInput")),
      handlingFee: toNumber(getValue("handlingFeeInput")),
      shippingShortfall: toNumber(getValue("shippingShortfallInput")),
      defaultDiscountRate: toNumber(getValue("defaultDiscountRateInput")),
      defaultTargetMarginRate: toNumber(getValue("defaultTargetMarginRateInput")),
      bundleQuantities: bundleQuantities.length
        ? bundleQuantities
        : defaults.settings.bundleQuantities
    };
  }

  function saveSettings() {
    const settings = readSettingsForm();
    Storage.saveSettings(settings);
    alert(currentLang === "ru" ? "Settings save ho gayi." : "Settings saved.");
  }

  function resetSettings() {
    const confirmText =
      currentLang === "ru"
        ? "Kya aap default settings restore karna chahtay hain?"
        : "Do you want to restore default settings?";

    if (!confirm(confirmText)) return;

    const restored = Storage.resetSettings();
    fillSettingsForm(restored);

    alert(
      currentLang === "ru"
        ? "Default settings restore ho gayi."
        : "Default settings restored."
    );
  }

  // ---------- INIT ----------

  function bindEvents() {
    const langToggle = $("langToggle");
    if (langToggle) langToggle.addEventListener("click", toggleLanguage);

    const loginBtn = $("adminLoginBtn");
    if (loginBtn) loginBtn.addEventListener("click", unlockAdmin);

    const saveBtn = $("saveAdminSettingsBtn");
    if (saveBtn) saveBtn.addEventListener("click", saveSettings);

    const resetBtn = $("resetAdminSettingsBtn");
    if (resetBtn) resetBtn.addEventListener("click", resetSettings);

    const logoutBtn = $("adminLogoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", lockAdmin);

    const passwordInput = $("adminPasswordInput");
    if (passwordInput) {
      passwordInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          unlockAdmin();
        }
      });
    }
  }

  function init() {
    applyTranslations();
    renderAuthState();
    bindEvents();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
