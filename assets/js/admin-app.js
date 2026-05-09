(function () {
  const { translations, defaults, admin, storageKeys } = window.APP_CONFIG;
  const Storage = window.AppStorage;
  const Calc = window.AppCalc;

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
    AppNotify.success(currentLang === "ru" ? "Settings save ho gayi." : "Settings saved.");
  }

  
  // ---------- CALCULATION DETAILS ----------

  function toggleCalculationDetails() {
    const detailsPanel = $("calculationDetailsPanel");
    const settingsPanel = $("adminSettingsPanel");

    if (!detailsPanel || !settingsPanel) return;

    const isVisible = !detailsPanel.classList.contains("hidden");

    if (isVisible) {
      detailsPanel.classList.add("hidden");
      settingsPanel.classList.remove("hidden");
    } else {
      detailsPanel.classList.remove("hidden");
      settingsPanel.classList.add("hidden");
      refreshCalculationDetails();
    }
  }

  function refreshCalculationDetails() {
    const settings = Storage.getSettings();

    // Get test values
    const buyingPrice = toNumber(getValue("testBuyingPriceInput")) || 10;
    const packagingCost = toNumber(getValue("testPackagingCostInput")) || 0;
    const sellingPrice = toNumber(getValue("testSellingPriceInput")) || 35;

    // Update variable rate breakdown
    setText("calcCommissionRate", `${settings.commissionRate}%`);
    setText("calcPaymentFeeRate", `${settings.paymentFeeRate}%`);
    setText("calcFreeShippingRate", `${settings.freeShippingRate}%`);
    setText("calcCoinsRate", `${settings.coinsRate}%`);
    setText("calcVoucherRate", `${settings.voucherRate}%`);
    setText("calcIncomeTaxRate", `${settings.incomeTaxRate}%`);
    setText("calcSalesTaxRate", `${settings.salesTaxRate}%`);

    const totalVariableRate = (
      settings.commissionRate +
      settings.paymentFeeRate +
      settings.freeShippingRate +
      settings.coinsRate +
      settings.voucherRate +
      settings.incomeTaxRate +
      settings.salesTaxRate
    ) / 100;

    setText("calcTotalVariableRate", `${(totalVariableRate * 100).toFixed(2)}%`);

    // Update fixed costs breakdown
    setText("calcHandlingFee", `PKR ${settings.handlingFee.toFixed(2)}`);
    setText("calcShippingShortfall", `PKR ${settings.shippingShortfall.toFixed(2)}`);
    setText("calcPackagingCost", `PKR ${packagingCost.toFixed(2)}`);

    const totalFixedCosts = settings.handlingFee + settings.shippingShortfall + packagingCost;
    setText("calcTotalFixedCosts", `PKR ${totalFixedCosts.toFixed(2)}`);

    // Update price calculations
    setText("calcBuyingPrice", `PKR ${buyingPrice.toFixed(2)}`);

    const minimumPrice = (buyingPrice + totalFixedCosts) / (1 - totalVariableRate);
    const minimumFormula = `(${buyingPrice.toFixed(2)} + ${totalFixedCosts.toFixed(2)}) / (1 - ${(totalVariableRate).toFixed(4)}) = ${minimumPrice.toFixed(2)}`;
    setText("calcMinimumFormula", minimumFormula);
    setText("calcMinimumPrice", `PKR ${minimumPrice.toFixed(2)}`);

    const targetMarginRate = settings.defaultTargetMarginRate / 100;
    const recommendedPrice = (buyingPrice + totalFixedCosts) / (1 - totalVariableRate - targetMarginRate);
    setText("calcRecommendedPrice", `PKR ${recommendedPrice.toFixed(2)}`);

    const discountRate = settings.defaultDiscountRate / 100;
    const discountSafePrice = minimumPrice / (1 - discountRate);
    setText("calcDiscountSafePrice", `PKR ${discountSafePrice.toFixed(2)}`);

    // Update profit analysis
    setText("calcSellingPrice", `PKR ${sellingPrice.toFixed(2)}`);

    const variableDeductions = sellingPrice * totalVariableRate;
    setText("calcVariableDeductions", `PKR ${variableDeductions.toFixed(2)}`);

    setText("calcFixedCosts", `PKR ${totalFixedCosts.toFixed(2)}`);

    const totalCosts = buyingPrice + variableDeductions + totalFixedCosts;
    setText("calcTotalCosts", `PKR ${totalCosts.toFixed(2)}`);

    const profitLoss = sellingPrice - totalCosts;
    setText("calcProfitLoss", `PKR ${profitLoss.toFixed(2)}`);

    const marginPercent = totalCosts > 0 ? (profitLoss / sellingPrice) * 100 : 0;
    setText("calcMarginPercent", `${marginPercent.toFixed(2)}%`);

    // Update bundle analysis
    updateBundleAnalysis(buyingPrice, packagingCost, settings);
  }

  function updateBundleAnalysis(buyingPrice, packagingCost, settings) {
    const bundleGrid = $("bundleAnalysisGrid");
    if (!bundleGrid) return;

    const bundleOptions = settings.bundleQuantities || defaults.settings.bundleQuantities;
    bundleGrid.innerHTML = "";

    bundleOptions.forEach(qty => {
      if (qty > 20) return; // Limit to reasonable quantities

      const totalBuying = buyingPrice * qty;
      const minimumPrice = Calc.calculateMinimumPrice(totalBuying, packagingCost, settings);
      const recommendedPrice = Calc.calculateRecommendedPrice(totalBuying, packagingCost, settings);

      // Assume selling at recommended price for profit calculation
      const profit = recommendedPrice - totalBuying - Calc.getFixedCosts(settings, packagingCost) - (recommendedPrice * Calc.getVariableRate(settings));

      const bundleItem = document.createElement("div");
      bundleItem.className = "bundle-analysis-item";
      bundleItem.innerHTML = `
        <div class="bundle-analysis-header">
          <span class="bundle-analysis-qty">${qty}x Bundle</span>
          <span class="bundle-analysis-profit">PKR ${profit.toFixed(2)}</span>
        </div>
        <div class="bundle-analysis-details">
          <div class="bundle-analysis-detail">
            <span class="bundle-analysis-label">Min Price:</span>
            <span class="bundle-analysis-value">PKR ${minimumPrice.toFixed(2)}</span>
          </div>
          <div class="bundle-analysis-detail">
            <span class="bundle-analysis-label">Rec Price:</span>
            <span class="bundle-analysis-value">PKR ${recommendedPrice.toFixed(2)}</span>
          </div>
          <div class="bundle-analysis-detail">
            <span class="bundle-analysis-label">Per Piece:</span>
            <span class="bundle-analysis-value">PKR ${(recommendedPrice / qty).toFixed(2)}</span>
          </div>
          <div class="bundle-analysis-detail">
            <span class="bundle-analysis-label">Total Cost:</span>
            <span class="bundle-analysis-value">PKR ${totalBuying.toFixed(2)}</span>
          </div>
        </div>
      `;

      bundleGrid.appendChild(bundleItem);
    });
  }

  // ---------- INIT ----------

  function bindEvents() {
    const langToggle = $("langToggle");
    if (langToggle) langToggle.addEventListener("click", toggleLanguage);

    const saveBtn = $("saveAdminSettingsBtn");
    if (saveBtn) saveBtn.addEventListener("click", saveSettings);

    const resetBtn = $("resetAdminSettingsBtn");
    if (resetBtn) resetBtn.addEventListener("click", resetSettings);

    // Calculation details toggle
    const toggleDetailsBtn = $("toggleCalculationDetailsBtn");
    if (toggleDetailsBtn) toggleDetailsBtn.addEventListener("click", toggleCalculationDetails);

    // Refresh calculation details
    const refreshBtn = $("refreshCalculationDetailsBtn");
    if (refreshBtn) refreshBtn.addEventListener("click", refreshCalculationDetails);

    // Test calculation inputs
    const testInputs = ["testBuyingPriceInput", "testPackagingCostInput", "testSellingPriceInput"];
    testInputs.forEach(id => {
      const el = $(id);
      if (el) {
        el.addEventListener("input", refreshCalculationDetails);
        el.addEventListener("change", refreshCalculationDetails);
      }
    });

  }

  function init() {
    applyTranslations();
    fillSettingsForm();
    bindEvents();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
