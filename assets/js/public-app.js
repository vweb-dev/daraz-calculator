(function () {
  const { translations, defaults } = window.APP_CONFIG;
  const Storage = window.AppStorage;
  const Calc = window.AppCalc;

  let currentLang = Storage.getLanguage() || defaults.language;
  let settings = Storage.getSettings();

  // ---------- DOM HELPERS ----------

  function $(id) {
    return document.getElementById(id);
  }

  function qsa(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
  }

  function setHTML(id, value) {
    const el = $(id);
    if (el) el.innerHTML = value;
  }

  function setValue(id, value) {
    const el = $(id);
    if (el) el.value = value;
  }

  function getValue(id) {
    const el = $(id);
    return el ? el.value : "";
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // ---------- I18N ----------

  function t(key) {
    const langSet = translations[currentLang] || translations.en;
    return langSet[key] || translations.en[key] || key;
  }

  function applyTranslations() {
    document.documentElement.setAttribute("lang", currentLang === "ru" ? "ur" : "en");
    document.documentElement.setAttribute("data-lang", currentLang);

    qsa("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });

    qsa("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.setAttribute("placeholder", t(key));
    });

    const toggle = $("langToggle");
    if (toggle) {
      const items = toggle.querySelectorAll(".lang-toggle__item");
      if (items.length >= 2) {
        items[0].classList.toggle("lang-toggle__item--active", currentLang === "en");
        items[1].classList.toggle("lang-toggle__item--active", currentLang === "ru");
      }
    }
  }

  function applyTheme() {
    const theme = Storage.getTheme() || window.APP_CONFIG.defaults.theme || "light";
    document.body.classList.toggle("theme-dark", theme === "dark");
    const themeBtn = $("themeToggle");
    if (themeBtn) {
      themeBtn.innerHTML = theme === "dark" ? "☀️" : "🌙";
      themeBtn.title = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    }
  }

  function toggleTheme() {
    const theme = Storage.getTheme() || window.APP_CONFIG.defaults.theme || "light";
    const next = theme === "dark" ? "light" : "dark";
    Storage.setTheme(next);
    applyTheme();
  }

  function toggleLanguage() {
    currentLang = currentLang === "en" ? "ru" : "en";
    Storage.setLanguage(currentLang);
    applyTranslations();
    runCalculation();
    renderRecentProducts();
  }

  // ---------- FORM ----------

  function validateNumber(value, fieldName) {
    const num = Calc.toNumber(value);
    if (value && isNaN(num)) {
      return { valid: false, error: `${fieldName} must be a valid number` };
    }
    if (num < 0) {
      return { valid: false, error: `${fieldName} cannot be negative` };
    }
    return { valid: true, value: num };
  }

  function validateForm() {
    const data = getFormData();
    const errors = [];

    // Buying price is required
    if (!data.buyingPrice) {
      errors.push(currentLang === "ru" ? "Buying price zaroori hai" : "Buying price is required");
    } else {
      const result = validateNumber(data.buyingPrice, currentLang === "ru" ? "Buying price" : "Buying price");
      if (!result.valid) errors.push(result.error);
    }

    // Validate optional numeric fields
    const optionalFields = [
      { value: data.packagingCost, name: currentLang === "ru" ? "Packaging cost" : "Packaging cost" },
      { value: data.currentSellingPrice, name: currentLang === "ru" ? "Selling price" : "Selling price" },
      { value: data.competitorTotalPrice, name: currentLang === "ru" ? "Competitor price" : "Competitor price" },
      { value: data.competitorQty, name: currentLang === "ru" ? "Competitor qty" : "Competitor qty" }
    ];

    optionalFields.forEach(field => {
      if (field.value) {
        const result = validateNumber(field.value, field.name);
        if (!result.valid) errors.push(result.error);
      }
    });

    // Bundle qty must be positive integer
    const bundleQty = Calc.toNumber(data.bundleQty);
    if (bundleQty && (bundleQty < 1 || !Number.isInteger(bundleQty))) {
      errors.push(currentLang === "ru" ? "Bundle quantity must be a positive whole number" : "Bundle quantity must be a positive whole number");
    }

    return {
      valid: errors.length === 0,
      errors,
      data
    };
  }

  function showValidationErrors(errors) {
    const errorList = errors.map(err => `• ${err}`).join("\n");
    AppNotify.error(
      currentLang === "ru"
        ? "Please correct the following errors:\n" + errorList
        : "Please correct the following errors:\n" + errorList
    );
  }

  function getFormData() {
    return {
      sku: getValue("skuInput").trim(),
      tag: getValue("productTagInput").trim(),
      buyingPrice: getValue("buyingPriceInput"),
      packagingCost: getValue("packagingCostInput"),
      currentSellingPrice: getValue("currentSellingPriceInput"),
      bundleQty: getValue("bundleQtyInput"),
      competitorTotalPrice: getValue("competitorTotalPriceInput"),
      competitorQty: getValue("competitorQtyInput")
    };
  }

  function setFormData(data = {}) {
    setValue("skuInput", data.sku ?? "");
    setValue("productTagInput", data.tag ?? "");
    setValue("buyingPriceInput", data.buyingPrice ?? "");
    setValue("packagingCostInput", data.packagingCost ?? 0);
    setValue("currentSellingPriceInput", data.currentSellingPrice ?? "");
    setValue("bundleQtyInput", data.bundleQty ?? 12);
    setValue("competitorTotalPriceInput", data.competitorTotalPrice ?? "");
    setValue("competitorQtyInput", data.competitorQty ?? "");
  }

  function clearForm() {
    setFormData(defaults.quickForm);
    runCalculation();
  }

  // ---------- ASSUMPTIONS ----------

  function renderAssumptions() {
    settings = Storage.getSettings();

    setText("assumptionCommission", `${Calc.round2(settings.commissionRate).toFixed(2)}%`);
    setText("assumptionHandling", Calc.formatCurrency(settings.handlingFee));
    setText("assumptionShippingShortfall", Calc.formatCurrency(settings.shippingShortfall));
    setText("assumptionDiscount", `${Calc.round2(settings.defaultDiscountRate).toFixed(2)}%`);
  }

  function toggleAssumptions() {
    const box = $("assumptionsBox");
    if (!box) return;
    box.classList.toggle("hidden");
  }

  // ---------- HERO + RESULTS ----------

  function getStatusLabel(healthStatus) {
    if (!healthStatus) return t("status");

    if (currentLang === "ru") {
      return healthStatus.labelRu;
    }
    return healthStatus.labelEn;
  }

  function renderHero(result) {
    const badge = $("heroHealthBadge");
    if (badge) {
      badge.textContent = getStatusLabel(result.healthStatus);
      badge.className = `hero-status__badge badge ${result.healthStatus.className}`;
    }

    setText("heroProfitValue", result.formatted.profitLoss);
    setHTML(
      "heroRecommendation",
      `<span>${escapeHtml(result.recommendation.title)} — ${escapeHtml(result.recommendation.message)}</span>`
    );

    const whyListHtml = (result.reasons || [])
      .map((line) => `<li>${escapeHtml(line)}</li>`)
      .join("");

    setHTML("heroWhyBox", `<ul class="why-list">${whyListHtml}</ul>`);
  }

  function renderOverview(result) {
    setText("minimumPriceValue", result.formatted.minimumPrice);
    setText("recommendedPriceValue", result.formatted.recommendedPrice);
    setText("discountSafePriceValue", result.formatted.discountSafePrice);
    setText("bundleHintValue", result.bundleHint);

    setText("currentSellingPriceValue", result.formatted.currentSellingPrice || Calc.formatCurrency(result.currentSellingPrice));
    setText("profitLossValue", result.formatted.profitLoss);
    setText("marginPercentValue", result.formatted.marginPercent);
    setText("statusValue", getStatusLabel(result.healthStatus));

    setText("competitorPerPieceValue", result.formatted.competitorPerPiece);
    setText("yourPerPieceValue", result.formatted.yourPerPiece);
    setText("priceGapValue", result.formatted.priceGap);
    setText("marketPositionValue", result.marketPosition);
  }

  // ---------- RECENT PRODUCTS ----------

  function getRecentLimit() {
    return 5;
  }

  function mapProductToForm(product) {
    return {
      sku: product.sku || "",
      buyingPrice: product.buyingPrice ?? "",
      packagingCost: product.packagingCost ?? 0,
      currentSellingPrice: product.currentSellingPrice ?? "",
      bundleQty: product.bundleQty ?? 12,
      competitorTotalPrice: product.competitorTotalPrice ?? "",
      competitorQty: product.competitorQty ?? ""
    };
  }

  function loadProductIntoForm(productId) {
    const products = Storage.getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setFormData(mapProductToForm(product));
    runCalculation();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function renderRecentProducts() {
    const wrap = $("recentProductsList");
    if (!wrap) return;

    const products = Storage.getRecentProducts(getRecentLimit());

    if (!products.length) {
      wrap.innerHTML = `
        <article class="recent-card glass-soft">
          <div class="recent-card__top">
            <strong class="recent-card__name">${escapeHtml(t("recentProducts"))}</strong>
            <span class="badge badge--neutral">0</span>
          </div>
          <p class="recent-card__note">${currentLang === "ru" ? "Abhi koi saved product nahi." : "No saved products yet."}</p>
        </article>
      `;
      return;
    }

    wrap.innerHTML = products
      .map((product) => {
        const result = Calc.runPricingEngine({
          sku: product.sku,
          buyingPrice: product.buyingPrice,
          packagingCost: product.packagingCost,
          currentSellingPrice: product.currentSellingPrice,
          bundleQty: product.bundleQty,
          competitorTotalPrice: product.competitorTotalPrice,
          competitorQty: product.competitorQty,
          settings,
          lang: currentLang
        });

        return `
          <article class="recent-card glass-soft" data-product-id="${product.id}">
            <div class="recent-card__top">
              <strong class="recent-card__name">${escapeHtml(product.sku || "Unnamed Product")}</strong>
              <span class="badge ${result.healthStatus.className}">${escapeHtml(getStatusLabel(result.healthStatus))}</span>
            </div>

            <div class="recent-card__meta">
              <span>${escapeHtml(t("buyingPrice"))} ${Calc.formatCurrency(product.buyingPrice || 0)}</span>
              <span>${escapeHtml(t("profitLoss"))} ${result.formatted.profitLoss}</span>
            </div>

            <p class="recent-card__note">${escapeHtml(result.recommendation.message)}</p>
          </article>
        `;
      })
      .join("");

    qsa("[data-product-id]").forEach((card) => {
      card.addEventListener("click", () => {
        loadProductIntoForm(card.getAttribute("data-product-id"));
      });
    });
  }

  // ---------- SAVE PRODUCT ----------

  function saveCurrentProduct() {
    const validation = validateForm();
    
    if (!validation.valid) {
      showValidationErrors(validation.errors);
      return;
    }

    const data = validation.data;

    const result = Calc.runPricingEngine({
      ...data,
      settings,
      lang: currentLang
    });

    const product = {
      id: Storage.generateId(),
      sku: data.sku || "Unnamed Product",
      buyingPrice: Calc.toNumber(data.buyingPrice),
      packagingCost: Calc.toNumber(data.packagingCost),
      currentSellingPrice: Calc.toNumber(data.currentSellingPrice),
      bundleQty: Calc.toNumber(data.bundleQty),
      competitorTotalPrice: Calc.toNumber(data.competitorTotalPrice),
      competitorQty: Calc.toNumber(data.competitorQty),

      minimumPrice: result.minimumPrice,
      recommendedPrice: result.recommendedPrice,
      discountSafePrice: result.discountSafePrice,
      profitLoss: result.profitLoss,
      marginPercent: result.marginPercent,
      statusKey: result.healthStatus.key,
      statusLabel: getStatusLabel(result.healthStatus),
      recommendationTitle: result.recommendation.title,
      recommendationMessage: result.recommendation.message,
      savedAt: new Date().toISOString()
    };

    Storage.addProduct(product);
    renderRecentProducts();

    AppNotify.success(currentLang === "ru" ? "Product save ho gaya." : "Product saved.");
  }

  // ---------- QUICK ADD PRICE BUTTONS ----------

  function bindQuickAddButtons() {
    qsa("[data-add-price]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const addValue = Calc.toNumber(btn.getAttribute("data-add-price"));
        const current = Calc.toNumber(getValue("currentSellingPriceInput"));
        setValue("currentSellingPriceInput", Calc.round2(current + addValue));
        runCalculation();
      });
    });
  }

  // ---------- CHARTS (simple live) ----------

  function renderCharts() {
    const products = Storage.getRecentProducts(5);

    const profitChart = $("profitChart");
    const revenueChart = $("revenueChart");

    if (!profitChart || !revenueChart) return;

    if (!products.length) {
      profitChart.innerHTML = `
        <div class="chart-bar">
          <span class="chart-bar__label">No Data</span>
          <div class="chart-bar__track">
            <div class="chart-bar__fill chart-bar__fill--negative" style="width: 0%"></div>
          </div>
          <span class="chart-bar__value">0</span>
        </div>
      `;

      revenueChart.innerHTML = `
        <div class="chart-bar">
          <span class="chart-bar__label">No Data</span>
          <div class="chart-bar__track">
            <div class="chart-bar__fill chart-bar__fill--revenue" style="width: 0%"></div>
          </div>
          <span class="chart-bar__value">0</span>
        </div>
      `;
      return;
    }

    const recentResults = products.map((product) => {
      const result = Calc.runPricingEngine({
        sku: product.sku,
        buyingPrice: product.buyingPrice,
        packagingCost: product.packagingCost,
        currentSellingPrice: product.currentSellingPrice,
        bundleQty: product.bundleQty,
        competitorTotalPrice: product.competitorTotalPrice,
        competitorQty: product.competitorQty,
        settings,
        lang: currentLang
      });

      return {
        sku: product.sku || "Unnamed",
        profit: result.profitLoss,
        revenue: Calc.toNumber(product.currentSellingPrice)
      };
    });

    const maxProfitAbs = Math.max(
      1,
      ...recentResults.map((r) => Math.abs(r.profit))
    );

    const maxRevenue = Math.max(
      1,
      ...recentResults.map((r) => r.revenue)
    );

    profitChart.innerHTML = recentResults
      .map((item) => {
        const width = (Math.abs(item.profit) / maxProfitAbs) * 100;
        const fillClass =
          item.profit >= 0
            ? "chart-bar__fill chart-bar__fill--positive"
            : "chart-bar__fill chart-bar__fill--negative";

        return `
          <div class="chart-bar">
            <span class="chart-bar__label">${escapeHtml(item.sku)}</span>
            <div class="chart-bar__track">
              <div class="${fillClass}" style="width:${Math.max(width, 4)}%"></div>
            </div>
            <span class="chart-bar__value">${Calc.round2(item.profit)}</span>
          </div>
        `;
      })
      .join("");

    revenueChart.innerHTML = recentResults
      .map((item) => {
        const width = (item.revenue / maxRevenue) * 100;

        return `
          <div class="chart-bar">
            <span class="chart-bar__label">${escapeHtml(item.sku)}</span>
            <div class="chart-bar__track">
              <div class="chart-bar__fill chart-bar__fill--revenue" style="width:${Math.max(width, 4)}%"></div>
            </div>
            <span class="chart-bar__value">${Calc.round2(item.revenue)}</span>
          </div>
        `;
      })
      .join("");
  }

  // ---------- REPORT PREVIEW ----------

  function renderReportPreview() {
    const rows = Storage.getRecentProducts(2);
    const wrap = document.querySelector(".report-preview");

    if (!wrap) return;

    const head = `
      <div class="report-preview__row report-preview__row--head">
        <span>${escapeHtml(t("sku"))}</span>
        <span>${escapeHtml(t("price"))}</span>
        <span>${escapeHtml(t("profitLoss"))}</span>
        <span>${escapeHtml(t("status"))}</span>
      </div>
    `;

    if (!rows.length) {
      wrap.innerHTML =
        head +
        `
        <div class="report-preview__row">
          <span>—</span>
          <span>—</span>
          <span>—</span>
          <span>—</span>
        </div>
      `;
      return;
    }

    const body = rows
      .map((product) => {
        const result = Calc.runPricingEngine({
          sku: product.sku,
          buyingPrice: product.buyingPrice,
          packagingCost: product.packagingCost,
          currentSellingPrice: product.currentSellingPrice,
          bundleQty: product.bundleQty,
          competitorTotalPrice: product.competitorTotalPrice,
          competitorQty: product.competitorQty,
          settings,
          lang: currentLang
        });

        const textClass = result.profitLoss >= 0 ? "text-success" : "text-danger";

        return `
          <div class="report-preview__row">
            <span>${escapeHtml(product.sku || "Unnamed Product")}</span>
            <span>${Calc.formatCurrency(product.currentSellingPrice || 0)}</span>
            <span class="${textClass}">${result.formatted.profitLoss}</span>
            <span>${escapeHtml(getStatusLabel(result.healthStatus))}</span>
          </div>
        `;
      })
      .join("");

    wrap.innerHTML = head + body;
  }

  // ---------- MAIN CALCULATION ----------

  function runCalculation() {
    // Show loading state
    const calcBtn = $("calculateNowBtn");
    if (calcBtn) {
      calcBtn.classList.add("btn--loading");
      calcBtn.disabled = true;
    }

    settings = Storage.getSettings();

    const data = getFormData();

    const result = Calc.runPricingEngine({
      ...data,
      settings,
      lang: currentLang
    });

    // add formatted current selling price for convenience
    result.formatted.currentSellingPrice = Calc.formatCurrency(result.currentSellingPrice);

    renderAssumptions();
    renderHero(result);
    renderOverview(result);
    renderCharts();
    renderReportPreview();

    // Update bundle calculations
    calculateBundleScenarios();

    // Hide loading state
    setTimeout(() => {
      if (calcBtn) {
        calcBtn.classList.remove("btn--loading");
        calcBtn.disabled = false;
      }
    }, 300);

    return result;
  }

  // Expose runCalculation to global scope for event listeners
  window.runCalculation = runCalculation;

  // ---------- PRINT ----------

  function printReport() {
    window.print();
  }

  // ---------- COPY TO CLIPBOARD ----------

  async function copySkuToClipboard() {
    const sku = getValue("skuInput").trim();
    if (!sku) {
      AppNotify.warning(currentLang === "ru" ? "SKU khaali hai" : "SKU is empty");
      return;
    }

    try {
      await navigator.clipboard.writeText(sku);
      AppNotify.success(currentLang === "ru" ? "SKU clipboard mein copy ho gaya" : "SKU copied to clipboard");
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = sku;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      AppNotify.success(currentLang === "ru" ? "SKU copy ho gaya" : "SKU copied");
    }
  }

  // ---------- AUTO-SAVE DRAFT ----------

  let autoSaveEnabled = true;
  let autoSaveTimer = null;

  function toggleAutoSave() {
    autoSaveEnabled = !autoSaveEnabled;
    Storage.setAutoSave(autoSaveEnabled);
    updateAutoSaveButton();
    
    if (autoSaveEnabled) {
      AppNotify.success(currentLang === "ru" ? "Auto-save enabled" : "Auto-save enabled");
      saveDraft();
    } else {
      AppNotify.warning(currentLang === "ru" ? "Auto-save disabled" : "Auto-save disabled");
    }
  }

  function updateAutoSaveButton() {
    const btn = $("autoSaveToggle");
    if (!btn) return;
    
    btn.style.opacity = autoSaveEnabled ? "1" : "0.5";
    btn.title = autoSaveEnabled 
      ? (currentLang === "ru" ? "Auto-save enabled (Ctrl+S)" : "Auto-save enabled (Ctrl+S)")
      : (currentLang === "ru" ? "Auto-save disabled" : "Auto-save disabled");
  }

  function saveDraft() {
    if (!autoSaveEnabled) return;
    
    const data = getFormData();
    if (!data.buyingPrice && !data.sku) return; // Don't save empty drafts
    
    Storage.saveDraft(data);
    
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      AppNotify.success(currentLang === "ru" ? "Draft saved" : "Draft saved");
    }, 300);
  }

  function loadDraft() {
    const draft = Storage.getDraft();
    if (draft && draft.sku) {
      setFormData(draft);
      runCalculation();
    }
  }

  // ---------- TOAST NOTIFICATIONS ----------


  // ---------- QUICK PROFIT HINT ----------

  function updateQuickProfitHint() {
    const hintEl = $("quickProfitHint");
    if (!hintEl) return;

    const buyingPrice = Calc.toNumber(getValue("buyingPriceInput"));
    const sellingPrice = Calc.toNumber(getValue("currentSellingPriceInput"));
    const packagingCost = Calc.toNumber(getValue("packagingCostInput"));

    if (!buyingPrice || !sellingPrice) {
      hintEl.textContent = "";
      hintEl.className = "field-hint";
      return;
    }

    const quickProfit = sellingPrice - buyingPrice - packagingCost;
    const profitSign = quickProfit >= 0 ? "+" : "";
    
    hintEl.textContent = `${currentLang === "ru" ? "Quick profit" : "Quick profit"}: ${profitSign}${Calc.formatCurrency(quickProfit)}`;
    hintEl.className = `field-hint ${quickProfit >= 0 ? "profit-positive" : "profit-negative"}`;
  }

  // ---------- BUNDLE CALCULATOR ----------

  function calculateBundleScenarios() {
    const targetPrice = parseFloat(getValue("bundleTargetPriceInput")) || 0;
    const buyingPrice = parseFloat(getValue("buyingPriceInput")) || 0;
    const packagingCost = parseFloat(getValue("packagingCostInput")) || 0;

    if (!targetPrice || !buyingPrice) {
      // Reset bundle results
      [2, 5, 10].forEach(qty => {
        setText(`bundle${qty}Price`, "PKR 0.00");
        setText(`bundle${qty}Profit`, "PKR 0.00");
        setText(`bundle${qty}PerPiece`, "PKR 0.00/piece");
      });
      setText("bundleInsightText", currentLang === "ru"
        ? "Target bundle price enter karein aur dekhein kaise bundling se zyada profit ho sakta hai."
        : "Enter a target bundle price to see how bundling can increase your profits.");
      return;
    }

    const scenarios = [
      { qty: 2, element: "bundle2" },
      { qty: 5, element: "bundle5" },
      { qty: 10, element: "bundle10" }
    ];

    let bestProfit = 0;
    let bestQty = 2;

    scenarios.forEach(({ qty, element }) => {
      const totalBuying = buyingPrice * qty;
      const totalCost = totalBuying + packagingCost;

      // Calculate profit per bundle
      const profit = targetPrice - totalCost;

      // Calculate per piece price
      const perPiece = targetPrice / qty;

      setText(`${element}Price`, Calc.formatCurrency(targetPrice));
      setText(`${element}Profit`, Calc.formatCurrency(profit));
      setText(`${element}PerPiece`, `${Calc.formatCurrency(perPiece)}/piece`);

      if (profit > bestProfit) {
        bestProfit = profit;
        bestQty = qty;
      }
    });

    // Update insight
    const insightText = currentLang === "ru"
      ? `Best option: ${bestQty}x bundle - ${Calc.formatCurrency(bestProfit)} profit!`
      : `Best option: ${bestQty}x bundle - ${Calc.formatCurrency(bestProfit)} profit!`;
    setText("bundleInsightText", insightText);
  }

  function copyBundlePriceToClipboard() {
    const price = getValue("bundleTargetPriceInput");
    if (!price) {
      AppNotify.warning(currentLang === "ru" ? "Pehle price enter karein" : "Enter a price first");
      return;
    }

    navigator.clipboard.writeText(price).then(() => {
      AppNotify.success(currentLang === "ru" ? "Price copy ho gaya!" : "Price copied!");
    }).catch(() => {
      AppNotify.error(currentLang === "ru" ? "Copy nahi ho saka" : "Copy failed");
    });
  }

  function toggleBundleView() {
    const results = $("bundleResults");
    if (!results) return;

    const isGrid = results.style.display !== "none";
    results.style.display = isGrid ? "none" : "grid";

    const btn = $("toggleBundleViewBtn");
    if (btn) {
      btn.innerHTML = isGrid ? "📋" : "📊";
      btn.title = isGrid ? "Show list view" : "Show grid view";
    }
  }

  function selectBundleScenario(qty) {
    const targetPrice = parseFloat(getValue("bundleTargetPriceInput")) || 0;
    if (!targetPrice) return;

    // Update current selling price with bundle price
    setValue("currentSellingPriceInput", targetPrice.toString());

    // Update bundle quantity
    setValue("bundleQtyInput", qty);

    // Run calculation
    runCalculation();

    // Show notification
    AppNotify.success(currentLang === "ru"
      ? `${qty}x bundle select ho gaya!`
      : `${qty}x bundle selected!`);

    // Scroll to results
    const heroSection = $("heroStatusCard");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function showWelcomeBanner() {
    const banner = $("welcomeBanner");
    const hasSeenWelcome = Storage.getWelcomeSeen();

    if (!banner || hasSeenWelcome) return;

    banner.classList.remove("welcome-banner--hidden");

    const closeBtn = $("welcomeCloseBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        banner.classList.add("welcome-banner--hidden");
        Storage.setWelcomeSeen(true);
      });
    }

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (!banner.classList.contains("welcome-banner--hidden")) {
        banner.classList.add("welcome-banner--hidden");
        Storage.setWelcomeSeen(true);
      }
    }, 10000);
  }

  // ---------- INIT ----------

  function bindEvents() {
    const themeToggleBtn = $("themeToggle");
    if (themeToggleBtn) themeToggleBtn.addEventListener("click", toggleTheme);

    const langToggle = $("langToggle");
    if (langToggle) langToggle.addEventListener("click", toggleLanguage);

    const calcBtn = $("calculateNowBtn");
    if (calcBtn) calcBtn.addEventListener("click", runCalculation);

    const saveBtn = $("saveProductBtn");
    if (saveBtn) saveBtn.addEventListener("click", saveCurrentProduct);

    const clearBtn = $("clearFormBtn");
    if (clearBtn) clearBtn.addEventListener("click", clearForm);


    const showAssumptionsBtn = $("showAssumptionsBtn");
    if (showAssumptionsBtn) showAssumptionsBtn.addEventListener("click", toggleAssumptions);

    const topToggleBtn = $("toggleAssumptionsBtn");
    if (topToggleBtn) topToggleBtn.addEventListener("click", toggleAssumptions);

    const printBtn = $("printReportBtn");
    if (printBtn) printBtn.addEventListener("click", printReport);

    // Copy SKU button
    const copySkuBtn = $("copySkuBtn");
    if (copySkuBtn) copySkuBtn.addEventListener("click", copySkuToClipboard);

    // Auto-save toggle
    const autoSaveToggleBtn = $("autoSaveToggle");
    if (autoSaveToggleBtn) autoSaveToggleBtn.addEventListener("click", toggleAutoSave);

    // auto-calc on change
    [
      "skuInput",
      "buyingPriceInput",
      "packagingCostInput",
      "currentSellingPriceInput",
      "bundleQtyInput",
      "competitorTotalPriceInput",
      "competitorQtyInput"
    ].forEach((id) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener("input", () => {
        runCalculation();
        updateQuickProfitHint();
        // Debounced auto-save on input changes
        if (autoSaveEnabled) {
          clearTimeout(autoSaveTimer);
          autoSaveTimer = setTimeout(saveDraft, window.APP_CONFIG.debounce.autoSaveDelay);
        }
      });
      el.addEventListener("change", () => {
        runCalculation();
        updateQuickProfitHint();
      });
    });

    bindQuickAddButtons();

    // Bundle calculator events
    const bundleTargetPriceInput = $("bundleTargetPriceInput");
    if (bundleTargetPriceInput) {
      bundleTargetPriceInput.addEventListener("input", calculateBundleScenarios);
      bundleTargetPriceInput.addEventListener("change", calculateBundleScenarios);
    }

    const copyBundlePriceBtn = $("copyBundlePriceBtn");
    if (copyBundlePriceBtn) copyBundlePriceBtn.addEventListener("click", copyBundlePriceToClipboard);

    const toggleBundleViewBtn = $("toggleBundleViewBtn");
    if (toggleBundleViewBtn) toggleBundleViewBtn.addEventListener("click", toggleBundleView);

    // Bundle quick action buttons
    qsa("[data-bundle-price]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const price = e.target.dataset.bundlePrice;
        setValue("bundleTargetPriceInput", price);
        calculateBundleScenarios();
      });
    });

    // Bundle scenario click handlers
    qsa(".bundle-scenario").forEach(scenario => {
      scenario.addEventListener("click", (e) => {
        const qty = e.currentTarget.dataset.qty;
        selectBundleScenario(qty);
      });
    });

    // FAB event listeners
    const fabBtn = $("fabBtn");
    const fabContainer = $("fabContainer");
    const fabMenu = $("fabMenu");

    if (fabBtn && fabContainer) {
      fabBtn.addEventListener("click", () => {
        fabContainer.classList.toggle("fab-container--open");
      });

      // Close FAB when clicking outside
      document.addEventListener("click", (e) => {
        if (!fabContainer.contains(e.target)) {
          fabContainer.classList.remove("fab-container--open");
        }
      });
    }

    // FAB menu items
    const fabCalculate = $("fabCalculate");
    if (fabCalculate) fabCalculate.addEventListener("click", () => {
      runCalculation();
      fabContainer.classList.remove("fab-container--open");
      AppNotify.success(currentLang === "ru" ? "Calculation complete!" : "Calculation complete!");
    });

    const fabSave = $("fabSave");
    if (fabSave) fabSave.addEventListener("click", () => {
      saveCurrentProduct();
      fabContainer.classList.remove("fab-container--open");
    });

    const fabClear = $("fabClear");
    if (fabClear) fabClear.addEventListener("click", () => {
      clearForm();
      fabContainer.classList.remove("fab-container--open");
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Ctrl+S: Save product or toggle auto-save
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        if (autoSaveEnabled) {
          saveCurrentProduct();
        } else {
          toggleAutoSave();
        }
      }
      // Ctrl+C: Copy SKU when SKU field is focused
      if (e.ctrlKey && e.key === "c" && document.activeElement === $("skuInput")) {
        e.preventDefault();
        copySkuToClipboard();
      }
    });
  }

  function init() {
    applyTranslations();
    bindEvents();
    renderAssumptions();
    renderRecentProducts();
    renderCharts();
    renderReportPreview();

    // Load auto-save preference
    autoSaveEnabled = Storage.getAutoSave() ?? true;
    updateAutoSaveButton();

    // Load draft if exists
    loadDraft();

    // Show welcome banner for new users
    showWelcomeBanner();

    applyTheme();
    runCalculation();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
