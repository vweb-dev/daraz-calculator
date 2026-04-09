(() => {
    const { defaultProduct } = window.APP_CONFIG;
    const {
        clone,
        uid,
        loadSettings,
        saveSettings,
        loadProducts,
        saveProducts
    } = window.StorageUtils;

    const {
        num,
        money,
        round2,
        escapeHtml,
        t,
        calculateProduct,
        getHealth,
        getHealthLabel,
        getRecommendation,
        planOffer
    } = window.CalcUtils;

    let settings = loadSettings();
    let products = loadProducts();
    let selectedProductId = null;
    let lastQuickResult = null;

    function qs(id) {
        return document.getElementById(id);
    }

    function persist() {
        saveSettings(settings);
        saveProducts(products);
    }

    function syncLanguageButtons() {
        const isEn = (settings.defaultLanguage || "en") === "en";
        qs("langEnBtn").classList.toggle("active", isEn);
        qs("langRuBtn").classList.toggle("active", !isEn);
    }

    function setLanguage(lang) {
        settings.defaultLanguage = lang;
        persist();
        applyStaticTranslations();
        renderAll();
    }

    function getBundleQuantities(maxQty) {
        const cap = Math.max(1, Math.min(12, parseInt(maxQty, 10) || 12));
        const preferred = [1, 2, 3, 4, 5, 6, 8, 10, 12];
        return preferred.filter(q => q <= cap);
    }

    function getCompetitorPerPiece(totalPrice, qty) {
        const total = num(totalPrice);
        const quantity = Math.max(0, parseInt(qty, 10) || 0);
        if (!total || !quantity) return 0;
        return total / quantity;
    }

    function getYourPerPiece(currentSellingPrice) {
        return num(currentSellingPrice);
    }

    function getCompetitorStrategy(product, result, competitorPerPiece) {
        const cpp = num(competitorPerPiece);
        if (!cpp) return "-";

        const minimum = num(result.minimumPrice);
        const recommended = num(result.recommendedPrice);
        const current = num(product.currentSellingPrice);
        const isEn = (settings.defaultLanguage || "en") === "en";

        if (cpp < minimum) {
            if (current > cpp) {
                return isEn
                    ? "Do Not Match. Better as Bundle."
                    : "Match mat karo. Bundle better hai.";
            }
            return isEn
                ? "Do Not Match Competitor."
                : "Competitor ko match mat karo.";
        }

        if (cpp >= minimum && cpp < recommended) {
            return isEn
                ? "Can compete, but risky."
                : "Compete ho sakta hai, lekin risky hai.";
        }

        if (cpp >= recommended) {
            return isEn
                ? "Healthy price position."
                : "Price position healthy hai.";
        }

        if (current < cpp) {
            return isEn
                ? "Already below competitor."
                : "Tum already competitor se neeche ho.";
        }

        return isEn
            ? "Compete with value, not price."
            : "Price ke bajaye value par compete karo.";
    }

    function buildBundleComparison(product, maxQty) {
        const quantities = getBundleQuantities(maxQty);

        return quantities.map(qty => {
            const bundleProduct = {
                ...product,
                buyingPrice: num(product.buyingPrice) * qty,
                currentSellingPrice: num(product.currentSellingPrice) * qty
            };

            const result = calculateProduct(bundleProduct, settings);

            return {
                qty,
                price: bundleProduct.currentSellingPrice,
                profit: result.estimatedProfit,
                margin: result.estimatedMarginPercent
            };
        });
    }

    function badgeClassFromHealth(healthKey) {
        if (healthKey === "unsafe") return "badge danger";
        if (healthKey === "borderline") return "badge warning";
        return "badge success";
    }

    function badgeClassFromRecommendation(recommendationText) {
        const text = String(recommendationText || "").toLowerCase();
        if (
            text.includes("do not sell") ||
            text.includes("mat becho") ||
            text.includes("raise price") ||
            text.includes("price barhao")
        ) return "badge danger";

        if (
            text.includes("risky") ||
            text.includes("bundle")
        ) return "badge warning";

        return "badge success";
    }

    function applyStaticTranslations() {
        const isEn = (settings.defaultLanguage || "en") === "en";

        qs("appTitle").textContent = t(settings, "appTitle");
        qs("appSubtitle").textContent = isEn
            ? "Enter buying price and instantly understand safe selling prices, current loss, competitor pressure, and bundle potential."
            : "Buying price dalo aur foran samjho safe selling prices, current nuksan, competitor pressure, aur bundle potential.";

        qs("adminLink").textContent = t(settings, "admin");
        qs("printBtn").textContent = t(settings, "printReport");

        qs("quickCalculatorTitle").textContent = isEn ? "Quick Calculator" : "Quick Calculator";
        qs("quickCalculatorSubtitle").textContent = isEn
            ? "Enter buying price and instantly see safe prices, current loss, competitor per-piece gap, and bundle result."
            : "Buying price dalo aur foran dekh lo safe prices, current nuksan, competitor per-piece gap, aur bundle result.";

        qs("quickSkuLabel").textContent = t(settings, "sku");
        qs("quickBuyingPriceLabel").textContent = t(settings, "buyingPrice");
        qs("quickPackagingCostLabel").textContent = t(settings, "packagingCost");
        qs("quickCurrentSellingPriceLabel").textContent = t(settings, "currentSellingPrice");
        qs("quickBundleMaxQtyLabel").textContent = isEn ? "Max Bundle Qty" : "Max Bundle Qty";
        qs("quickCompetitorTotalPriceLabel").textContent = isEn ? "Competitor Total Price" : "Competitor Total Price";
        qs("quickCompetitorQtyLabel").textContent = isEn ? "Competitor Quantity" : "Competitor Quantity";

        qs("quickCalculateBtn").textContent = isEn ? "Calculate Now" : "Abhi Hisaab Karo";
        qs("quickSaveBtn").textContent = isEn ? "Save Product" : "Product Save Karo";
        qs("quickClearBtn").textContent = isEn ? "Clear" : "Clear";

        qs("priceStrategyGroupTitle").textContent = isEn ? "Price Strategy" : "Price Strategy";
        qs("minimumPriceLabel").textContent = t(settings, "minimumPrice");
        qs("recommendedPriceLabel").textContent = t(settings, "recommendedPrice");
        qs("discountSafePriceLabel").textContent = t(settings, "discountSafePrice");

        qs("currentRealityGroupTitle").textContent = isEn ? "Current Reality" : "Current Reality";
        qs("currentPriceResultLabel").textContent = t(settings, "currentSellingPrice");
        qs("profitLossLabel").textContent = t(settings, "profitLoss");
        qs("marginResultLabel").textContent = t(settings, "margin");

        qs("competitorGroupTitle").textContent = isEn ? "Competitor View" : "Competitor View";
        qs("competitorPerPieceLabel").textContent = isEn ? "Competitor Per Piece" : "Competitor Per Piece";
        qs("yourPerPieceLabel").textContent = isEn ? "Your Per Piece" : "Your Per Piece";
        qs("priceGapLabel").textContent = isEn ? "Per Piece Gap" : "Per Piece Gap";
        qs("competitorStrategyLabel").textContent = isEn ? "Suggested Action" : "Suggested Action";

        qs("statusGroupTitle").textContent = isEn ? "Decision" : "Decision";
        qs("healthStatusLabel").textContent = isEn ? "Health Status" : "Health Status";
        qs("recommendationLabel").textContent = t(settings, "recommendation");

        qs("bundleGroupTitle").textContent = t(settings, "bundleComparison");
        qs("bundleThQty").textContent = isEn ? "Bundle" : "Bundle";
        qs("bundleThPrice").textContent = isEn ? "Price" : "Price";
        qs("bundleThProfit").textContent = t(settings, "profitLoss");
        qs("bundleThStatus").textContent = isEn ? "Status" : "Status";

        qs("labelTotalProducts").textContent = t(settings, "totalProducts");
        qs("labelLossProducts").textContent = isEn ? "Loss Products" : "Loss Products";
        qs("labelAvgMargin").textContent = t(settings, "avgMargin");
        qs("labelBestSku").textContent = t(settings, "bestSku");

        qs("productsTitle").textContent = isEn ? "Saved Products" : "Saved Products";
        qs("productsSubtitle").textContent = isEn
            ? "Search, filter, and review all saved pricing decisions."
            : "Search, filter, aur saved pricing decisions review karo.";

        qs("searchInput").placeholder = isEn ? "Search SKU or note" : "SKU ya note search karo";

        const filterSelect = qs("filterSelect");
        filterSelect.options[0].text = isEn ? "All" : "Sab";
        filterSelect.options[1].text = isEn ? "Loss" : "Loss";
        filterSelect.options[2].text = isEn ? "Safe" : "Safe";
        filterSelect.options[3].text = isEn ? "Bundle Candidates" : "Bundle Candidates";

        qs("exportBtn").textContent = t(settings, "exportCsv");

        qs("thSku").textContent = "SKU";
        qs("thBuyingPrice").textContent = t(settings, "buyingPrice");
        qs("thCurrentPrice").textContent = isEn ? "Current Price" : "Current Price";
        qs("thMinimumPrice").textContent = t(settings, "minimumPrice");
        qs("thRecommendedPrice").textContent = t(settings, "recommendedPrice");
        qs("thProfitLoss").textContent = t(settings, "profitLoss");
        qs("thStatus").textContent = isEn ? "Status" : "Status";
        qs("thRecommendation").textContent = t(settings, "recommendation");
        qs("thActions").textContent = isEn ? "Actions" : "Actions";

        qs("advancedToolsTitle").textContent = isEn ? "Advanced Tools" : "Advanced Tools";
        qs("advancedToolsSubtitle").textContent = isEn
            ? "Optional tools for offers, bulk entry, charts, and reporting."
            : "Offers, bulk entry, charts, aur reporting ke optional tools.";

        qs("bulkTabBtn").textContent = isEn ? "Bulk Import" : "Bulk Import";
        qs("offerTabBtn").textContent = isEn ? "Offer Planner" : "Offer Planner";
        qs("chartsTabBtn").textContent = t(settings, "charts");
        qs("reportTabBtn").textContent = isEn ? "Report" : "Report";

        qs("bulkPasteLabel").textContent = isEn
            ? "Paste rows: SKU, Buying Price, Current Selling Price, Packaging, Shipping Shortfall, Notes"
            : "Rows paste karo: SKU, Buying Price, Current Selling Price, Packaging, Shipping Shortfall, Notes";

        qs("bulkImportBtn").textContent = isEn ? "Import Rows" : "Rows Import Karo";
        qs("clearBulkBtn").textContent = isEn ? "Clear" : "Clear";

        qs("offerBasePriceLabel").textContent = isEn ? "Base Price" : "Base Price";
        qs("offerDiscountLabel").textContent = isEn ? "Discount %" : "Discount %";
        qs("offerVoucherLabel").textContent = isEn ? "Extra Voucher %" : "Extra Voucher %";
        qs("offerCoinsLabel").textContent = isEn ? "Coins %" : "Coins %";
        qs("offerBuyingPriceLabel").textContent = t(settings, "buyingPrice");
        qs("offerPackagingLabel").textContent = isEn ? "Packaging" : "Packaging";
        qs("offerCalcBtn").textContent = t(settings, "planOffer");

        if (!qs("offerResult").dataset.filled) {
            qs("offerResult").textContent = t(settings, "noOfferCalcYet");
        }

        qs("profitChartTitle").textContent = isEn ? "Profit / Loss by SKU" : "SKU ke hisab se Munafa / Nuksan";
        qs("revenueChartTitle").textContent = isEn ? "Revenue by SKU" : "SKU ke hisab se Revenue";

        qs("reportThSku").textContent = "SKU";
        qs("reportThRevenue").textContent = t(settings, "revenueBase");
        qs("reportThProfitLoss").textContent = t(settings, "profitLoss");
        qs("reportThMargin").textContent = t(settings, "margin");
        qs("reportThHealth").textContent = isEn ? "Health" : "Status";
        qs("reportThRecommendation").textContent = t(settings, "recommendation");
        qs("reportThNotes").textContent = t(settings, "notes");

        qs("footerPoweredBy").textContent = t(settings, "poweredBy");

        syncLanguageButtons();
    }

    function resetQuickCalculator() {
        qs("quickSku").value = "";
        qs("quickBuyingPrice").value = "";
        qs("quickPackagingCost").value = "0";
        qs("quickCurrentSellingPrice").value = "";
        qs("quickCompetitorTotalPrice").value = "";
        qs("quickCompetitorQty").value = "";
        qs("quickBundleMaxQty").value = "12";
        lastQuickResult = null;
        renderQuickResults();
    }

    function getQuickProduct() {
        const p = clone(defaultProduct);
        p.id = uid();
        p.mode = "pricing";
        p.sku = qs("quickSku").value.trim();
        p.buyingPrice = num(qs("quickBuyingPrice").value);
        p.packagingCost = num(qs("quickPackagingCost").value);
        p.currentSellingPrice = num(qs("quickCurrentSellingPrice").value);
        p.competitorTotalPrice = num(qs("quickCompetitorTotalPrice").value);
        p.competitorQty = parseInt(qs("quickCompetitorQty").value, 10) || 0;
        p.bundleMaxQty = parseInt(qs("quickBundleMaxQty").value, 10) || 12;
        p.discountRate = settings.defaultDiscountRate;
        p.targetMarginRate = settings.defaultTargetMarginRate;
        return p;
    }

    function calculateQuick() {
        const product = getQuickProduct();

        if (!product.buyingPrice) {
            alert(
                settings.defaultLanguage === "en"
                    ? "Please enter buying price."
                    : "Please buying price enter karo."
            );
            return;
        }

        const result = calculateProduct(product, settings);
        const health = getHealth(result.estimatedProfit);
        const recommendation = getRecommendation(product, result, settings);

        lastQuickResult = {
            product,
            result,
            health,
            recommendation
        };

        renderQuickResults();
    }

    function renderQuickBundle(product) {
        const tbody = qs("quickBundleBody");

        if (!product || !product.currentSellingPrice) {
            tbody.innerHTML = `
        <tr>
          <td>1x</td>
          <td>PKR 0.00</td>
          <td>PKR 0.00</td>
          <td>-</td>
        </tr>
      `;
            return;
        }

        const rows = buildBundleComparison(product, product.bundleMaxQty || 12);

        tbody.innerHTML = rows.map(r => {
            const h = getHealth(r.profit);
            return `
        <tr>
          <td>${r.qty}x</td>
          <td>${money(r.price)}</td>
          <td class="${r.profit >= 0 ? "good" : "bad"}">${money(r.profit)}</td>
          <td><span class="${badgeClassFromHealth(h.key)}">${getHealthLabel(settings, h.key)}</span></td>
        </tr>
      `;
        }).join("");
    }

    function renderQuickResults() {
        if (!lastQuickResult) {
            qs("quickMinimumPrice").textContent = "PKR 0.00";
            qs("quickRecommendedPrice").textContent = "PKR 0.00";
            qs("quickDiscountSafePrice").textContent = "PKR 0.00";
            qs("quickCurrentPriceResult").textContent = "PKR 0.00";
            qs("quickProfitLoss").textContent = "PKR 0.00";
            qs("quickMargin").textContent = "0.00%";
            qs("quickCompetitorPerPiece").textContent = "PKR 0.00";
            qs("quickYourPerPiece").textContent = "PKR 0.00";
            qs("quickPriceGap").textContent = "PKR 0.00";
            qs("quickCompetitorStrategy").textContent = "-";
            qs("quickHealthStatus").textContent = "-";
            qs("quickRecommendation").textContent = "-";

            qs("quickProfitLoss").className = "stat-value";
            qs("quickPriceGap").className = "stat-value";
            qs("quickHealthStatus").className = "stat-value";
            qs("quickRecommendation").className = "stat-value";
            qs("quickCompetitorStrategy").className = "stat-value";

            renderQuickBundle(null);
            return;
        }

        const { product, result, health, recommendation } = lastQuickResult;
        const competitorPerPiece = getCompetitorPerPiece(
            product.competitorTotalPrice,
            product.competitorQty
        );
        const yourPerPiece = getYourPerPiece(product.currentSellingPrice);
        const gap = competitorPerPiece ? (yourPerPiece - competitorPerPiece) : 0;
        const competitorStrategy = getCompetitorStrategy(product, result, competitorPerPiece);

        qs("quickMinimumPrice").textContent = money(result.minimumPrice);
        qs("quickRecommendedPrice").textContent = money(result.recommendedPrice);
        qs("quickDiscountSafePrice").textContent = money(result.discountSafePrice);

        qs("quickCurrentPriceResult").textContent = money(product.currentSellingPrice || 0);
        qs("quickProfitLoss").textContent = money(result.estimatedProfit);
        qs("quickProfitLoss").className = `stat-value ${result.estimatedProfit >= 0 ? "good" : "bad"}`;
        qs("quickMargin").textContent = `${round2(result.estimatedMarginPercent).toFixed(2)}%`;

        qs("quickCompetitorPerPiece").textContent = competitorPerPiece ? money(competitorPerPiece) : "-";
        qs("quickYourPerPiece").textContent = yourPerPiece ? money(yourPerPiece) : "-";
        qs("quickPriceGap").textContent = competitorPerPiece ? money(gap) : "-";
        qs("quickPriceGap").className = `stat-value ${competitorPerPiece ? (gap <= 0 ? "good" : "risky") : ""}`;

        qs("quickCompetitorStrategy").textContent = competitorStrategy;
        qs("quickCompetitorStrategy").className = "stat-value";

        qs("quickHealthStatus").innerHTML = `<span class="${badgeClassFromHealth(health.key)}">${getHealthLabel(settings, health.key)}</span>`;
        qs("quickRecommendation").innerHTML = `<span class="${badgeClassFromRecommendation(recommendation)}">${recommendation}</span>`;

        renderQuickBundle(product);
    }

    function saveQuickProduct() {
        if (!lastQuickResult) {
            calculateQuick();
            if (!lastQuickResult) return;
        }

        products.unshift(lastQuickResult.product);
        persist();
        renderAll();
        resetQuickCalculator();
    }

    function getFilteredProducts() {
        const q = (qs("searchInput").value || "").trim().toLowerCase();
        const filter = qs("filterSelect").value || "all";

        return products.filter(product => {
            const result = calculateProduct(product, settings);
            const recommendation = getRecommendation(product, result, settings).toLowerCase();
            const hay = `${product.sku || ""} ${product.notes || ""}`.toLowerCase();

            const searchOk = !q || hay.includes(q);

            const filterOk =
                filter === "all" ||
                (filter === "loss" && result.estimatedProfit < 0) ||
                (filter === "safe" && result.estimatedProfit >= 0) ||
                (filter === "bundle" && recommendation.includes("bundle"));

            return searchOk && filterOk;
        });
    }

    function renderSummary() {
        let lossCount = 0;
        let marginSum = 0;
        let bestSku = "-";
        let bestProfit = -Infinity;

        products.forEach(product => {
            const result = calculateProduct(product, settings);
            marginSum += result.estimatedMarginPercent || 0;
            if (result.estimatedProfit < 0) lossCount++;
            if (result.estimatedProfit > bestProfit) {
                bestProfit = result.estimatedProfit;
                bestSku = product.sku || "-";
            }
        });

        const avgMargin = products.length ? marginSum / products.length : 0;

        qs("summaryProducts").textContent = products.length;
        qs("summaryLossCount").textContent = lossCount;
        qs("summaryAvgMargin").textContent = `${round2(avgMargin).toFixed(2)}%`;
        qs("summaryBestSku").textContent = bestSku;
    }

    function renderProductsTable() {
        const tbody = qs("productsTableBody");
        const list = getFilteredProducts();

        if (!list.length) {
            tbody.innerHTML = `
        <tr>
          <td colspan="9">${settings.defaultLanguage === "en" ? "No matching products found." : "Koi matching product nahi mila."}</td>
        </tr>
      `;
            return;
        }

        tbody.innerHTML = list.map(product => {
            const result = calculateProduct(product, settings);
            const health = getHealth(result.estimatedProfit);
            const healthText = getHealthLabel(settings, health.key);
            const recommendation = getRecommendation(product, result, settings);

            return `
        <tr class="clickable-row" data-row-id="${product.id}">
          <td>${escapeHtml(product.sku || "-")}</td>
          <td>${money(product.buyingPrice || 0)}</td>
          <td>${money(product.currentSellingPrice || 0)}</td>
          <td>${money(result.minimumPrice || 0)}</td>
          <td>${money(result.recommendedPrice || 0)}</td>
          <td class="${result.estimatedProfit >= 0 ? "good" : "bad"}">${money(result.estimatedProfit || 0)}</td>
          <td><span class="${badgeClassFromHealth(health.key)}">${healthText}</span></td>
          <td><span class="${badgeClassFromRecommendation(recommendation)}">${recommendation}</span></td>
          <td class="no-print">
            <div class="table-actions">
              <button class="btn ghost btn-xs" data-action="view" data-id="${product.id}">View</button>
              <button class="btn ghost btn-xs" data-action="duplicate" data-id="${product.id}">${t(settings, "duplicate")}</button>
              <button class="btn danger btn-xs" data-action="delete" data-id="${product.id}">${t(settings, "delete")}</button>
            </div>
          </td>
        </tr>
      `;
        }).join("");

        tbody.querySelectorAll("tr[data-row-id]").forEach(row => {
            row.addEventListener("click", (e) => {
                const target = e.target;
                if (target.closest("button")) return;
                selectedProductId = row.dataset.rowId;
                renderProductDetailArea();
            });
        });

        tbody.querySelectorAll("[data-action='view']").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                selectedProductId = btn.dataset.id;
                renderProductDetailArea();
            });
        });

        tbody.querySelectorAll("[data-action='duplicate']").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                duplicateProduct(btn.dataset.id);
            });
        });

        tbody.querySelectorAll("[data-action='delete']").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                deleteProduct(btn.dataset.id);
            });
        });
    }

    function duplicateProduct(id) {
        const found = products.find(x => x.id === id);
        if (!found) return;

        const copy = clone(found);
        copy.id = uid();
        copy.sku = (copy.sku || "Product") + " Copy";

        products.unshift(copy);
        persist();
        renderAll();
    }

    function closeDrawer() {
        selectedProductId = null;
        renderProductDetailArea();
    }

    function deleteProduct(id) {
        if (products.length === 1) {
            alert(
                settings.defaultLanguage === "en"
                    ? "At least one product should remain."
                    : "Kam az kam aik product rehna chahiye."
            );
            return;
        }

        products = products.filter(x => x.id !== id);
        if (selectedProductId === id) selectedProductId = null;
        persist();
        renderAll();
    }

    function renderProductDetailArea() {
        const area = qs("productDetailArea");

        if (!selectedProductId) {
            area.innerHTML = "";
            return;
        }

        const product = products.find(x => x.id === selectedProductId);
        if (!product) {
            area.innerHTML = "";
            return;
        }

        const result = calculateProduct(product, settings);
        const recommendation = getRecommendation(product, result, settings);
        const competitorPerPiece = getCompetitorPerPiece(product.competitorTotalPrice, product.competitorQty);
        const bundles = buildBundleComparison(product, product.bundleMaxQty || 12);

        area.innerHTML = `
      <div class="drawer-backdrop" id="drawerBackdrop"></div>
      <div class="detail-card">
        <div class="detail-head">
          <h3>${escapeHtml(product.sku || "-")}</h3>
          <div class="detail-actions">
            <button class="btn success btn-sm" id="detailSaveBtn" type="button">${settings.defaultLanguage === "en" ? "Save Changes" : "Changes Save Karo"}</button>
            <button class="btn ghost btn-sm" id="detailCloseBtn" type="button">Close</button>
          </div>
        </div>

        <div class="form-grid three">
          <div>
            <label>${t(settings, "sku")}</label>
            <input id="detailSku" value="${escapeHtml(product.sku || "")}" />
          </div>
          <div>
            <label>${t(settings, "buyingPrice")}</label>
            <input id="detailBuyingPrice" type="number" step="0.01" value="${product.buyingPrice}" />
          </div>
          <div>
            <label>${t(settings, "packagingCost")}</label>
            <input id="detailPackagingCost" type="number" step="0.01" value="${product.packagingCost}" />
          </div>
          <div>
            <label>${t(settings, "currentSellingPrice")}</label>
            <input id="detailCurrentSellingPrice" type="number" step="0.01" value="${product.currentSellingPrice}" />
          </div>
          <div>
            <label>Competitor Total Price</label>
            <input id="detailCompetitorTotalPrice" type="number" step="0.01" value="${product.competitorTotalPrice || ""}" />
          </div>
          <div>
            <label>Competitor Quantity</label>
            <input id="detailCompetitorQty" type="number" step="1" value="${product.competitorQty || ""}" />
          </div>
          <div>
            <label>Max Bundle Qty</label>
            <select id="detailBundleMaxQty">
              <option value="5" ${String(product.bundleMaxQty) === "5" ? "selected" : ""}>5x</option>
              <option value="6" ${String(product.bundleMaxQty) === "6" ? "selected" : ""}>6x</option>
              <option value="8" ${String(product.bundleMaxQty) === "8" ? "selected" : ""}>8x</option>
              <option value="10" ${String(product.bundleMaxQty) === "10" ? "selected" : ""}>10x</option>
              <option value="12" ${String(product.bundleMaxQty || 12) === "12" ? "selected" : ""}>12x</option>
            </select>
          </div>
          <div>
            <label>Shipping Shortfall</label>
            <input id="detailShippingShortfall" type="number" step="0.01" value="${product.shippingShortfall}" />
          </div>
          <div>
            <label>${t(settings, "notes")}</label>
            <input id="detailNotes" value="${escapeHtml(product.notes || "")}" />
          </div>
        </div>

        <div class="detail-summary">
          <div><strong>${t(settings, "minimumPrice")}:</strong> ${money(result.minimumPrice)}</div>
          <div><strong>${t(settings, "recommendedPrice")}:</strong> ${money(result.recommendedPrice)}</div>
          <div><strong>${t(settings, "discountSafePrice")}:</strong> ${money(result.discountSafePrice)}</div>
          <div><strong>${t(settings, "profitLoss")}:</strong> <span class="${result.estimatedProfit >= 0 ? "good" : "bad"}">${money(result.estimatedProfit)}</span></div>
          <div><strong>${t(settings, "recommendation")}:</strong> <span class="${badgeClassFromRecommendation(recommendation)}">${recommendation}</span></div>
          <div><strong>Competitor Per Piece:</strong> ${competitorPerPiece ? money(competitorPerPiece) : "-"}</div>
        </div>

        <div class="tool-result">
          <strong>${t(settings, "bundleComparison")}:</strong><br>
          ${bundles.map(r => `${r.qty}x = ${money(r.price)} | ${t(settings, "profitLoss")}: ${money(r.profit)}`).join("<br>")}
        </div>
      </div>
    `;

        qs("detailCloseBtn").addEventListener("click", closeDrawer);
        qs("drawerBackdrop").addEventListener("click", closeDrawer);

        qs("detailSaveBtn").addEventListener("click", () => {
            const idx = products.findIndex(x => x.id === selectedProductId);
            if (idx === -1) return;

            products[idx] = {
                ...products[idx],
                sku: qs("detailSku").value.trim(),
                buyingPrice: num(qs("detailBuyingPrice").value),
                packagingCost: num(qs("detailPackagingCost").value),
                currentSellingPrice: num(qs("detailCurrentSellingPrice").value),
                competitorTotalPrice: num(qs("detailCompetitorTotalPrice").value),
                competitorQty: parseInt(qs("detailCompetitorQty").value, 10) || 0,
                bundleMaxQty: parseInt(qs("detailBundleMaxQty").value, 10) || 12,
                shippingShortfall: qs("detailShippingShortfall").value,
                notes: qs("detailNotes").value
            };

            persist();
            renderAll();
        });
    }

    function renderCharts() {
        const list = getFilteredProducts().map(product => ({
            sku: product.sku || "-",
            result: calculateProduct(product, settings)
        }));

        const profitChart = qs("profitChart");
        const revenueChart = qs("revenueChart");

        if (!list.length) {
            const msg = settings.defaultLanguage === "en" ? "No chart data." : "Chart data nahi mili.";
            profitChart.innerHTML = `<div class="empty">${msg}</div>`;
            revenueChart.innerHTML = `<div class="empty">${msg}</div>`;
            return;
        }

        const maxAbsProfit = Math.max(1, ...list.map(x => Math.abs(x.result.estimatedProfit || 0)));
        const maxRevenue = Math.max(1, ...list.map(x => x.result.revenueBase || 0));

        profitChart.innerHTML = list.map(item => {
            const profit = item.result.estimatedProfit || 0;
            const width = Math.max(3, (Math.abs(profit) / maxAbsProfit) * 100);
            const cls = profit >= 0 ? "positive" : "negative";

            return `
        <div class="chart-row">
          <div class="chart-label">${escapeHtml(item.sku)}</div>
          <div class="bar-track">
            <div class="bar-fill ${cls}" style="width:${width}%"></div>
          </div>
          <div class="chart-value">${money(profit)}</div>
        </div>
      `;
        }).join("");

        revenueChart.innerHTML = list.map(item => {
            const revenue = item.result.revenueBase || 0;
            const width = Math.max(3, (revenue / maxRevenue) * 100);

            return `
        <div class="chart-row">
          <div class="chart-label">${escapeHtml(item.sku)}</div>
          <div class="bar-track">
            <div class="bar-fill revenue" style="width:${width}%"></div>
          </div>
          <div class="chart-value">${money(revenue)}</div>
        </div>
      `;
        }).join("");
    }

    function renderReportTable() {
        const tbody = qs("reportTableBody");
        const list = getFilteredProducts();

        if (!list.length) {
            tbody.innerHTML = `
        <tr>
          <td colspan="7">${settings.defaultLanguage === "en" ? "No matching products found." : "Koi matching product nahi mila."}</td>
        </tr>
      `;
            return;
        }

        tbody.innerHTML = list.map(product => {
            const result = calculateProduct(product, settings);
            const health = getHealth(result.estimatedProfit);
            const healthText = getHealthLabel(settings, health.key);
            const recommendation = getRecommendation(product, result, settings);

            return `
        <tr>
          <td>${escapeHtml(product.sku || "-")}</td>
          <td>${money(result.revenueBase || 0)}</td>
          <td class="${result.estimatedProfit >= 0 ? "good" : "bad"}">${money(result.estimatedProfit)}</td>
          <td>${round2(result.estimatedMarginPercent).toFixed(2)}%</td>
          <td><span class="${badgeClassFromHealth(health.key)}">${healthText}</span></td>
          <td><span class="${badgeClassFromRecommendation(recommendation)}">${recommendation}</span></td>
          <td>${escapeHtml(product.notes || "")}</td>
        </tr>
      `;
        }).join("");
    }

    function bulkImport() {
        const raw = qs("bulkPaste").value.trim();

        if (!raw) {
            alert(
                settings.defaultLanguage === "en"
                    ? "Paste some rows first."
                    : "Pehle kuch rows paste karo."
            );
            return;
        }

        const lines = raw.split(/\r?\n/).filter(Boolean);

        const imported = lines.map(line => {
            const parts = line.split(",");

            const p = clone(defaultProduct);
            p.id = uid();
            p.mode = "pricing";
            p.sku = (parts[0] || "").trim();
            p.buyingPrice = num(parts[1]);
            p.currentSellingPrice = num(parts[2]);
            p.packagingCost = num(parts[3]);
            p.shippingShortfall = parts[4] !== undefined ? String(num(parts[4])) : "";
            p.notes = (parts[5] || "").trim();
            p.discountRate = settings.defaultDiscountRate;
            p.targetMarginRate = settings.defaultTargetMarginRate;
            p.bundleMaxQty = 12;

            return p;
        });

        products = [...imported, ...products];
        qs("bulkPaste").value = "";
        persist();
        renderAll();
    }

    function clearBulk() {
        qs("bulkPaste").value = "";
    }

    function runOfferPlanner() {
        const result = planOffer(
            {
                basePrice: num(qs("offerBasePrice").value),
                discountPercent: num(qs("offerDiscount").value),
                extraVoucherPercent: num(qs("offerVoucher").value),
                coinsPercent: num(qs("offerCoins").value),
                buyingPrice: num(qs("offerBuyingPrice").value),
                packagingCost: num(qs("offerPackaging").value)
            },
            settings
        );

        qs("offerResult").dataset.filled = "1";
        qs("offerResult").innerHTML = `
      Final sale price: <strong>${money(result.finalSalePrice)}</strong><br>
      Voucher impact: <strong>${money(result.voucherImpact)}</strong><br>
      Coins impact: <strong>${money(result.coinsImpact)}</strong><br>
      Profit after promo impact:
      <strong class="${result.finalProfitAfterPromo >= 0 ? "good" : "bad"}">${money(result.finalProfitAfterPromo)}</strong>
    `;
    }

    function exportCSV() {
        const rows = [[
            "SKU",
            "Buying Price",
            "Current Price",
            "Competitor Total Price",
            "Competitor Qty",
            "Minimum Price",
            "Recommended Price",
            "Profit/Loss",
            "Margin %",
            "Notes"
        ]];

        products.forEach(product => {
            const result = calculateProduct(product, settings);
            rows.push([
                product.sku || "Product",
                round2(product.buyingPrice),
                round2(product.currentSellingPrice),
                round2(product.competitorTotalPrice || 0),
                product.competitorQty || 0,
                round2(result.minimumPrice || 0),
                round2(result.recommendedPrice || 0),
                round2(result.estimatedProfit || 0),
                round2(result.estimatedMarginPercent || 0),
                product.notes || ""
            ]);
        });

        const csv = rows
            .map(row => row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "daraz_calculator_export.csv";
        a.click();
        URL.revokeObjectURL(url);
    }

    function printReport() {
        renderAll();
        window.print();
    }

    function bindTabs() {
        const buttons = document.querySelectorAll(".tab-btn");
        const panels = document.querySelectorAll(".tab-panel");

        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                const target = btn.dataset.tab;
                buttons.forEach(b => b.classList.remove("active"));
                panels.forEach(p => p.classList.remove("active"));
                btn.classList.add("active");
                qs(target).classList.add("active");
            });
        });
    }

    function renderAll() {
        applyStaticTranslations();
        renderQuickResults();
        renderSummary();
        renderProductsTable();
        renderProductDetailArea();
        renderCharts();
        renderReportTable();
    }

    function bindEvents() {
        qs("langEnBtn").addEventListener("click", () => setLanguage("en"));
        qs("langRuBtn").addEventListener("click", () => setLanguage("ru"));

        qs("quickCalculateBtn").addEventListener("click", calculateQuick);
        qs("quickSaveBtn").addEventListener("click", saveQuickProduct);
        qs("quickClearBtn").addEventListener("click", resetQuickCalculator);

        qs("printBtn").addEventListener("click", printReport);
        qs("exportBtn").addEventListener("click", exportCSV);

        qs("searchInput").addEventListener("input", () => {
            renderProductsTable();
            renderCharts();
            renderReportTable();
        });

        qs("filterSelect").addEventListener("change", () => {
            renderProductsTable();
            renderCharts();
            renderReportTable();
        });

        qs("bulkImportBtn").addEventListener("click", bulkImport);
        qs("clearBulkBtn").addEventListener("click", clearBulk);
        qs("offerCalcBtn").addEventListener("click", runOfferPlanner);
    }

    bindEvents();
    bindTabs();
    applyStaticTranslations();
    resetQuickCalculator();
    renderAll();
})();