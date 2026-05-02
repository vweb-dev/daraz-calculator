(function () {
  const { translations, defaults } = window.APP_CONFIG;
  const Storage = window.AppStorage;
  const Calc = window.AppCalc;

  let currentLang = Storage.getLanguage() || defaults.language;
  let settings = Storage.getSettings();
  let allProducts = Storage.getProducts();
  let allCompetitors = Storage.getCompetitors() || [];

  // ---------- HELPERS ----------

  function $(id) {
    return document.getElementById(id);
  }

  function qsa(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function getValue(id) {
    const el = $(id);
    return el ? el.value : "";
  }

  function setValue(id, value) {
    const el = $(id);
    if (el) el.value = value;
  }

  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function t(key) {
    const langSet = translations[currentLang] || translations.en;
    return langSet[key] || translations.en[key] || key;
  }

  // ---------- I18N ----------

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
    renderAll();
  }

  // ---------- FILTERING ----------

  function getFilteredProducts() {
    const search = getValue("savedSearchInput").trim().toLowerCase();
    const statusFilter = getValue("savedStatusFilter");
    const sortFilter = getValue("savedSortFilter");

    let items = [...allProducts];

    if (search) {
      items = items.filter((p) =>
        String(p.sku || "").toLowerCase().includes(search)
      );
    }

    if (statusFilter !== "all") {
      items = items.filter((p) => p.statusKey === statusFilter);
    }

    if (sortFilter === "latest") {
      items.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    }

    if (sortFilter === "oldest") {
      items.sort((a, b) => new Date(a.savedAt) - new Date(b.savedAt));
    }

    if (sortFilter === "profitHigh") {
      items.sort((a, b) => (b.profitLoss || 0) - (a.profitLoss || 0));
    }

    if (sortFilter === "profitLow") {
      items.sort((a, b) => (a.profitLoss || 0) - (b.profitLoss || 0));
    }

    return items;
  }

  // ---------- SUMMARY ----------

  function renderSummary(products) {
    const total = products.length;
    const lossCount = products.filter((p) => (p.profitLoss || 0) < 0).length;
    const safeCount = products.filter((p) =>
      ["safe", "healthy"].includes(p.statusKey)
    ).length;

    const avg =
      total > 0
        ? products.reduce((sum, p) => sum + (p.profitLoss || 0), 0) / total
        : 0;

    setText("savedTotalCount", total);
    setText("savedLossCount", lossCount);
    setText("savedSafeCount", safeCount);
    setText("savedAvgProfit", Calc.formatCurrency(avg));
  }

  // ---------- LIST RENDER ----------

  function renderSavedProducts() {
    const wrap = $("savedProductsList");
    if (!wrap) return;

    const products = getFilteredProducts();
    renderSummary(products);

    if (!products.length) {
      wrap.innerHTML = `
        <article class="recent-card glass-soft">
          <div class="recent-card__top">
            <strong class="recent-card__name">${currentLang === "ru" ? "Koi product nahi mila" : "No products found"}</strong>
            <span class="badge badge--neutral">0</span>
          </div>
          <p class="recent-card__note">
            ${currentLang === "ru" ? "Search ya filter change karo." : "Try changing search or filter."}
          </p>
        </article>
      `;
      return;
    }

    wrap.innerHTML = products
      .map((product) => {
        const health = Calc.getHealthStatus(product.profitLoss || 0);
        const statusLabel =
          currentLang === "ru" ? health.labelRu : health.labelEn;

        return `
          <article class="recent-card glass-soft">
            <div class="recent-card__top">
              <strong class="recent-card__name">${escapeHtml(product.sku || "Unnamed Product")}</strong>
              <span class="badge ${health.className}">${escapeHtml(statusLabel)}</span>
            </div>

            <div class="recent-card__meta">
              <span>${escapeHtml(t("buyingPrice"))} ${Calc.formatCurrency(product.buyingPrice || 0)}</span>
              <span>${escapeHtml(t("profitLoss"))} ${Calc.formatCurrency(product.profitLoss || 0)}</span>
            </div>

            <p class="recent-card__note">${escapeHtml(product.recommendationMessage || "")}</p>

            <div class="action-row" style="margin-top:12px;">
              <button class="btn btn--ghost open-product-btn" type="button" data-id="${product.id}">
                ${currentLang === "ru" ? "Calculator Mein Kholain" : "Open in Calculator"}
              </button>

              <button class="btn btn--primary edit-product-btn" type="button" data-id="${product.id}">
                ${currentLang === "ru" ? "Edit" : "Edit"}
              </button>

              <button class="btn btn--ghost delete-product-btn" type="button" data-id="${product.id}">
                ${currentLang === "ru" ? "Delete" : "Delete"}
              </button>

              <button class="btn btn--ghost add-competitor-for-product-btn" type="button" data-id="${product.id}" title="Add competitor for this product">
                ${currentLang === "ru" ? "+ Competitor" : "+ Competitor"}
              </button>
            </div>
          </article>
        `;
      })
      .join("");

    bindProductActionButtons();
  }

  function bindProductActionButtons() {
    qsa(".open-product-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-id");
        openProductInCalculator(productId);
      });
    });

    qsa(".edit-product-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-id");
        openEditModal(productId);
      });
    });

    qsa(".delete-product-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-id");
        deleteProduct(productId);
      });
    });

    qsa(".add-competitor-for-product-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-id");
        openCompetitorModal(productId);
      });
    });
  }

  // ---------- OPEN IN CALCULATOR ----------

  function openProductInCalculator(productId) {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;

    Storage.setItem("daraz_calc_open_product_v1", {
      sku: product.sku || "",
      buyingPrice: product.buyingPrice || "",
      packagingCost: product.packagingCost || 0,
      currentSellingPrice: product.currentSellingPrice || "",
      bundleQty: product.bundleQty || 12,
      competitorTotalPrice: product.competitorTotalPrice || "",
      competitorQty: product.competitorQty || ""
    });

    window.location.href = "index.html";
  }

  // ---------- DELETE ----------

  function deleteProduct(productId) {
    const confirmText =
      currentLang === "ru"
        ? "Kya aap is product ko delete karna chahtay hain?"
        : "Do you want to delete this product?";

    if (!confirm(confirmText)) return;

    Storage.deleteProduct(productId);
    allProducts = Storage.getProducts();
    renderAll();
  }

  // ---------- EDIT MODAL ----------

  function openEditModal(productId) {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;

    setValue("editProductId", product.id);
    setValue("editSkuInput", product.sku || "");
    setValue("editBuyingPriceInput", product.buyingPrice || "");
    setValue("editPackagingCostInput", product.packagingCost || 0);
    setValue("editCurrentSellingPriceInput", product.currentSellingPrice || "");
    setValue("editBundleQtyInput", product.bundleQty || 12);
    setValue("editCompetitorTotalPriceInput", product.competitorTotalPrice || "");
    setValue("editCompetitorQtyInput", product.competitorQty || "");

    $("editModalBackdrop").classList.remove("hidden");
  }

  function closeEditModal() {
    $("editModalBackdrop").classList.add("hidden");
  }

  function saveEditedProduct() {
    const id = getValue("editProductId");
    if (!id) return;

    // Validate inputs before saving
    const sku = getValue("editSkuInput").trim();
    const buyingPriceRaw = getValue("editBuyingPriceInput");
    
    if (!buyingPriceRaw || !Calc.toNumber(buyingPriceRaw)) {
      AppNotify.warning(currentLang === "ru" 
        ? "Buying price zaroori hai" 
        : "Buying price is required"
      );
      return;
    }

    const updated = {
      sku: sku,
      buyingPrice: Calc.toNumber(buyingPriceRaw),
      packagingCost: Calc.toNumber(getValue("editPackagingCostInput")),
      currentSellingPrice: Calc.toNumber(getValue("editCurrentSellingPriceInput")),
      bundleQty: Calc.toNumber(getValue("editBundleQtyInput")),
      competitorTotalPrice: Calc.toNumber(getValue("editCompetitorTotalPriceInput")),
      competitorQty: Calc.toNumber(getValue("editCompetitorQtyInput"))
    };

    // Validate numeric fields are not negative
    if (updated.packagingCost < 0 || updated.currentSellingPrice < 0 || 
        updated.competitorTotalPrice < 0 || updated.competitorQty < 0) {
      AppNotify.warning(currentLang === "ru"
        ? "Values cannot be negative"
        : "Values cannot be negative"
      );
      return;
    }

    const result = Calc.runPricingEngine({
      ...updated,
      settings,
      lang: currentLang
    });

    Storage.updateProduct(id, {
      ...updated,
      minimumPrice: result.minimumPrice,
      recommendedPrice: result.recommendedPrice,
      discountSafePrice: result.discountSafePrice,
      profitLoss: result.profitLoss,
      marginPercent: result.marginPercent,
      statusKey: result.healthStatus.key,
      statusLabel: currentLang === "ru" ? result.healthStatus.labelRu : result.healthStatus.labelEn,
      recommendationTitle: result.recommendation.title,
      recommendationMessage: result.recommendation.message
    });

    allProducts = Storage.getProducts();
    closeEditModal();
    renderAll();
  }

  // ---------- COMPETITOR WATCHLIST ----------

  function openCompetitorModal(productId = null) {
    setValue("competitorId", "");
    setValue("competitorProductId", productId || "");
    setValue("competitorNameInput", "");
    setValue("competitorUrlInput", "");
    setValue("competitorPriceInput", "");
    setValue("competitorQuantityInput", "");
    setValue("competitorNotesInput", "");
    $("competitorModalBackdrop").classList.remove("hidden");
  }

  function openEditCompetitorModal(competitorId) {
    const competitor = allCompetitors.find((c) => c.id === competitorId);
    if (!competitor) return;

    setValue("competitorId", competitor.id);
    setValue("competitorProductId", competitor.productId || "");
    setValue("competitorNameInput", competitor.name || "");
    setValue("competitorUrlInput", competitor.url || "");
    setValue("competitorPriceInput", competitor.price || "");
    setValue("competitorQuantityInput", competitor.quantity || "");
    setValue("competitorNotesInput", competitor.notes || "");
    $("competitorModalBackdrop").classList.remove("hidden");
  }

  function closeCompetitorModal() {
    $("competitorModalBackdrop").classList.add("hidden");
  }

  function saveCompetitor() {
    const id = getValue("competitorId");
    const productId = getValue("competitorProductId");
    const name = getValue("competitorNameInput").trim();
    const price = Calc.toNumber(getValue("competitorPriceInput"));
    const quantity = Calc.toNumber(getValue("competitorQuantityInput"));

    if (!name) {
      AppNotify.warning(currentLang === "ru" ? "Competitor name zaroori hai" : "Competitor name is required");
      return;
    }

    if (!price || price <= 0) {
      AppNotify.warning(currentLang === "ru" ? "Price zaroori hai" : "Price is required");
      return;
    }

    if (!quantity || quantity <= 0) {
      AppNotify.warning(currentLang === "ru" ? "Quantity zaroori hai" : "Quantity is required");
      return;
    }

    const competitorData = {
      name: name,
      productId: productId,
      url: getValue("competitorUrlInput"),
      price: price,
      quantity: quantity,
      notes: getValue("competitorNotesInput"),
      perPiece: Calc.round2(price / quantity),
      updatedAt: new Date().toISOString()
    };

    if (id) {
      // Update existing
      Storage.updateCompetitor(id, competitorData);
    } else {
      // Add new
      competitorData.id = Storage.generateId();
      competitorData.createdAt = new Date().toISOString();
      Storage.addCompetitor(competitorData);
    }

    allCompetitors = Storage.getCompetitors() || [];
    closeCompetitorModal();
    renderCompetitorWatchlist();
  }

  function deleteCompetitor(competitorId) {
    const confirmText = currentLang === "ru"
      ? "Kya aap is competitor ko delete karna chahtay hain?"
      : "Do you want to delete this competitor?";

    if (!confirm(confirmText)) return;

    Storage.deleteCompetitor(competitorId);
    allCompetitors = Storage.getCompetitors() || [];
    renderCompetitorWatchlist();
  }

  function renderCompetitorWatchlist() {
    const wrap = $("competitorWatchlist");
    if (!wrap) return;

    if (!allCompetitors.length) {
      wrap.innerHTML = `
        <article class="recent-card glass-soft">
          <div class="recent-card__top">
            <strong class="recent-card__name">${currentLang === "ru" ? "Koi competitor nahi" : "No competitors tracked"}</strong>
          </div>
          <p class="recent-card__note">
            ${currentLang === "ru" ? "+ Add Competitor button dabayen" : "Click + Add Competitor to start tracking"}
          </p>
        </article>
      `;
      return;
    }

    wrap.innerHTML = allCompetitors
      .map((competitor) => {
        const productName = competitor.productId
          ? (allProducts.find(p => p.id === competitor.productId)?.sku || "Unknown Product")
          : "General";
        
        const yourProduct = competitor.productId ? allProducts.find(p => p.id === competitor.productId) : null;
        const yourPerPiece = yourProduct && yourProduct.currentSellingPrice && yourProduct.bundleQty
          ? Calc.round2(yourProduct.currentSellingPrice / yourProduct.bundleQty)
          : 0;
        
        const gap = yourPerPiece ? Calc.round2(yourPerPiece - competitor.perPiece) : 0;
        let positionClass = "badge--neutral";
        let positionText = "N/A";
        
        if (yourPerPiece) {
          if (gap > 0.5) {
            positionClass = "badge--danger";
            positionText = currentLang === "ru" ? "Aap mehngay ho" : "You're Expensive";
          } else if (gap < -0.5) {
            positionClass = "badge--success";
            positionText = currentLang === "ru" ? "Aap saste ho" : "You're Cheaper";
          } else {
            positionClass = "badge--warning";
            positionText = currentLang === "ru" ? "Barabar" : "Similar";
          }
        }

        return `
          <article class="recent-card glass-soft">
            <div class="recent-card__top">
              <strong class="recent-card__name">${escapeHtml(competitor.name)}</strong>
              <span class="badge ${positionClass}">${escapeHtml(positionText)}</span>
            </div>
            
            <div class="recent-card__meta">
              <span>Product: ${escapeHtml(productName)}</span>
              <span>${Calc.formatCurrency(competitor.price)} / ${competitor.quantity} pcs</span>
            </div>
            
            <div class="recent-card__meta" style="margin-top:8px;">
              <span>Per piece: ${Calc.formatCurrency(competitor.perPiece)}</span>
              ${yourPerPiece ? `<span>Gap: ${gap >= 0 ? '+' : ''}${Calc.formatCurrency(gap)}</span>` : ''}
            </div>
            
            ${competitor.notes ? `<p class="recent-card__note" style="margin-top:8px;">${escapeHtml(competitor.notes)}</p>` : ''}
            
            <div class="action-row" style="margin-top:12px;">
              <button class="btn btn--ghost edit-competitor-btn" type="button" data-id="${competitor.id}">
                ${currentLang === "ru" ? "Edit" : "Edit"}
              </button>
              
              <button class="btn btn--ghost delete-competitor-btn" type="button" data-id="${competitor.id}">
                ${currentLang === "ru" ? "Delete" : "Delete"}
              </button>
            </div>
          </article>
        `;
      })
      .join("");

    qsa(".edit-competitor-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        openEditCompetitorModal(btn.getAttribute("data-id"));
      });
    });

    qsa(".delete-competitor-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        deleteCompetitor(btn.getAttribute("data-id"));
      });
    });
  }

  // ---------- RENDER ----------

  function renderAll() {
    settings = Storage.getSettings();
    allProducts = Storage.getProducts();
    allCompetitors = Storage.getCompetitors() || [];
    renderSavedProducts();
    renderCompetitorWatchlist();
  }

  // ---------- INIT ----------

  function bindEvents() {
    const langToggle = $("langToggle");
    if (langToggle) langToggle.addEventListener("click", toggleLanguage);

    const search = $("savedSearchInput");
    if (search) search.addEventListener("input", renderSavedProducts);

    const status = $("savedStatusFilter");
    if (status) status.addEventListener("change", renderSavedProducts);

    const sort = $("savedSortFilter");
    if (sort) sort.addEventListener("change", renderSavedProducts);

    const exportBtn = $("exportDataBtn");
    if (exportBtn) exportBtn.addEventListener("click", () => Storage.downloadExport());

    const importInput = $("importFileInput");
    if (importInput) {
      importInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const result = Storage.importData(event.target.result);
          if (result.success) {
            AppNotify.success(currentLang === "ru" 
              ? `Import successful! ${result.count} products loaded.`
              : `Import successful! ${result.count} products loaded.`
            );
            allProducts = Storage.getProducts();
            renderAll();
          } else {
            AppNotify.warning(currentLang === "ru"
              ? `Import failed: ${result.error}`
              : `Import failed: ${result.error}`
            );
          }
        };
        reader.readAsText(file);
        e.target.value = ""; // reset for re-import
      });
    }

    const closeBtn = $("closeEditModalBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeEditModal);

    const cancelBtn = $("cancelEditBtn");
    if (cancelBtn) cancelBtn.addEventListener("click", closeEditModal);

    const saveBtn = $("saveEditedProductBtn");
    if (saveBtn) saveBtn.addEventListener("click", saveEditedProduct);

    const backdrop = $("editModalBackdrop");
    if (backdrop) {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) closeEditModal();
      });
    }

    // Competitor watchlist events
    const addCompetitorBtn = $("addCompetitorBtn");
    if (addCompetitorBtn) addCompetitorBtn.addEventListener("click", () => openCompetitorModal());

    const closeCompetitorModalBtn = $("closeCompetitorModalBtn");
    if (closeCompetitorModalBtn) closeCompetitorModalBtn.addEventListener("click", closeCompetitorModal);

    const cancelCompetitorBtn = $("cancelCompetitorBtn");
    if (cancelCompetitorBtn) cancelCompetitorBtn.addEventListener("click", closeCompetitorModal);

    const saveCompetitorBtn = $("saveCompetitorBtn");
    if (saveCompetitorBtn) saveCompetitorBtn.addEventListener("click", saveCompetitor);

    const competitorBackdrop = $("competitorModalBackdrop");
    if (competitorBackdrop) {
      competitorBackdrop.addEventListener("click", (e) => {
        if (e.target === competitorBackdrop) closeCompetitorModal();
      });
    }
  }

  function init() {
    applyTranslations();
    bindEvents();
    renderAll();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
