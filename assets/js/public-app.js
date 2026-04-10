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

  function toggleLanguage() {
    currentLang = currentLang === "en" ? "ru" : "en";
    Storage.setLanguage(currentLang);
    applyTranslations();
    runCalculation();
    renderRecentProducts();
  }

  // ---------- FORM ----------

  function getFormData() {
    return {
      sku: getValue("skuInput").trim(),
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
    const data = getFormData();

    if (!Calc.toNumber(data.buyingPrice)) {
      alert(currentLang === "ru" ? "Buying price enter karo." : "Please enter buying price.");
      return;
    }

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

    alert(currentLang === "ru" ? "Product save ho gaya." : "Product saved.");
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

    return result;
  }

  // ---------- PRINT ----------

  function printReport() {
    window.print();
  }

  // ---------- INIT ----------

  function bindEvents() {
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
      el.addEventListener("input", runCalculation);
      el.addEventListener("change", runCalculation);
    });

    bindQuickAddButtons();
  }

  function init() {
    applyTranslations();
    renderAssumptions();
    renderRecentProducts();
    renderCharts();
    renderReportPreview();
    runCalculation();
    bindEvents();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
