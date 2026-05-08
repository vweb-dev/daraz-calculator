// ========== CONFIG & CALCULATIONS MODULE ==========

window.APP_CONFIG = {
  version: "1.1.0",

  storageKeys: {
    settings: "daraz_calc_settings_v1",
    products: "daraz_calc_products_v1",
    language: "daraz_calc_lang_v1",
    theme: "daraz_calc_theme_v1",
    adminAuth: "daraz_calc_admin_auth_v1",
    competitors: "daraz_calc_competitors_v1",
    draft: "daraz_calc_draft_v1",
    autoSave: "daraz_calc_autosave_v1",
    welcomeSeen: "daraz_calc_welcome_seen_v1"
  },

  limits: {
    maxProducts: 1000,
    maxCompetitors: 200,
    maxSkuLength: 120,
    maxImportFileSize: 5 * 1024 * 1024
  },

  debounce: {
    inputDelay: 300,
    autoSaveDelay: 1000
  },

  admin: {},

  defaults: {
    language: "en",

    quickForm: {
      sku: "",
      buyingPrice: "",
      packagingCost: 0,
      currentSellingPrice: "",
      bundleQty: 1,
      competitorTotalPrice: "",
      competitorQty: ""
    },

    settings: {
      // Daraz Settings
      mode: "daraz",
      commissionRate: 23.20,
      paymentFeeRate: 2.62,
      freeShippingRate: 6.96,
      coinsRate: 2.83,
      voucherRate: 2.00,
      incomeTaxRate: 2.36,
      salesTaxRate: 2.70,
      handlingFee: 11.60,
      shippingShortfall: 16.87,
      defaultDiscountRate: 10.00,
      defaultTargetMarginRate: 10.00,
      bundleQuantities: [1, 2, 3, 5, 10, 12],

      // Website/Direct Sales Settings
      codFeeSameCity: 150,
      codFeeOtherCities: 250,
      monthlyHostingCost: 10000,
      expectedMonthlyOrders: 30,
      paymentGatewayFeeWebsite: 2,
      deliveryLocation: "same-city",
      websiteSalesTaxRate: 0
    },
    theme: "light"
  },

  recommendationLabels: {
    en: {
      doNotSell: "Do Not Sell",
      raisePrice: "Raise Price",
      risky: "Risky",
      safe: "Safe",
      healthy: "Healthy",
      betterAsBundle: "Better as Bundle"
    },
    ru: {
      doNotSell: "Mat Becho",
      raisePrice: "Price Barhao",
      risky: "Risky",
      safe: "Safe",
      healthy: "Healthy",
      betterAsBundle: "Bundle Better Hai"
    }
  },

  healthThresholds: {
    doNotSellMaxProfit: -0.01,
    riskyMinProfit: 0,
    riskyMaxProfit: 9.99,
    safeMinProfit: 10,
    healthyMinProfit: 25
  },

  translations: {
    en: {
      appTitle: "Daraz Listing Calculator Pro",
      appSubtitle: "Enter buying price and instantly understand what to sell, at what price, and whether your current price is causing loss.",
      welcomeTitle: "Welcome to Daraz Calculator Pro!",
      welcomeMessage: "Enter your buying price below and get instant pricing recommendations, bundle suggestions, and profit analysis.",
      quickCalculatorTitle: "Quick Calculator",
      quickCalculatorSubtitle: "Enter buying price and instantly see safe prices, current loss, competitor gap, and bundle result.",
      calculateNow: "Calculate Now",
      saveProduct: "Save Product",
      clear: "Clear",
      skuProductName: "SKU / Product Name",
      skuPlaceholder: "e.g. pc silver nosepin",
      buyingPrice: "Buying Price *",
      buyingPricePlaceholder: "e.g. 10",
      packagingCost: "Packaging Cost",
      currentSellingPrice: "Current Selling Price",
      sellingPricePlaceholder: "e.g. 35",
      maxBundleQty: "Bundle Qty",
      showAssumptions: "Show all fee & cost assumptions",
      commissionRate: "Commission Rate",
      handlingFee: "Handling Fee",
      shippingShortfall: "Shipping Shortfall",
      defaultDiscount: "Default Discount",
      competitorPricingTitle: "Competitor Pricing",
      competitorPricingSubtitle: "Compare your listing with competitor total price and per-item quantity.",
      competitorTotalPrice: "Competitor Total Price",
      competitorTotalPlaceholder: "e.g. 180",
      competitorQty: "Competitor Quantity",
      competitorQtyPlaceholder: "e.g. 6",
      competitorPerPiece: "Competitor Per Piece",
      yourPerPiece: "Your Per Piece",
      priceGap: "Gap",
      marketPosition: "Market Position",
      bundleCalculatorTitle: "Bundle Calculator",
      bundleCalculatorSubtitle: "Same price, more quantity - discover how bundling increases your profits while keeping customers happy.",
      bundleTargetPrice: "Target Bundle Price",
      resultOverview: "Result Overview",
      resultOverviewSubtitle: "Instantly understand pricing strategy, current reality, competitor view, and bundle potential.",
      priceStrategy: "Price Strategy",
      minimumPrice: "Minimum Price",
      recommendedPrice: "Recommended Price",
      discountSafePrice: "10% Discount-Safe Price",
      bundleHint: "Bundle Hint",
      currentReality: "Current Reality",
      profitLoss: "Profit / Loss",
      marginPercent: "Margin %",
      status: "Status",
      chartInsights: "Chart Insights",
      chartInsightsSubtitle: "Quick visual understanding of profit, revenue, and pricing performance.",
      profitLossBySku: "Profit / Loss by SKU",
      revenueBySku: "Revenue by SKU",
      reportPreview: "Report Preview",
      reportPreviewSubtitle: "Print-friendly summary of current pricing decisions.",
      printReport: "Print Report",
      recentProducts: "Recent Products",
      recentProductsSubtitle: "Review your latest saved products quickly. Open full Saved page for all items.",
      viewAllSaved: "View All",
      navCalculator: "Calculator",
      navSaved: "Saved",
      navAdmin: "Admin",
      poweredBy: "Powered by",
      fabCalculate: "Calculate",
      fabSave: "Save",
      fabClear: "Clear",
      heroStatusLabel: "Live Decision"
    },
    ru: {
      appTitle: "داراز کیلکولیٹر پرو",
      appSubtitle: "خریداری کی قیمت درج کریں اور فوری طور پر سمجھیں کہ کیا بیچیں، کس قیمت پر، اور کیا آپ کی موجودہ قیمت نقصان کا سبب بن رہی ہے۔",
      welcomeTitle: "داراز کیلکولیٹر پرو میں خوش آمدید!",
      welcomeMessage: "نیچے اپنی خریداری کی قیمت درج کریں اور فوری قیمت کی سفارشات، بنڈل تجاویز اور منافع کا تجزیہ حاصل کریں۔",
      quickCalculatorTitle: "فوری کیلکولیٹر",
      quickCalculatorSubtitle: "خریداری کی قیمت درج کریں اور فوری طور پر محفوظ قیمتیں، موجودہ نقصان، مقابلہ کا فرق اور بنڈل کا نتیجہ دیکھیں۔",
      calculateNow: "اب کیلکولیٹ کریں",
      saveProduct: "پروڈکٹ محفوظ کریں",
      clear: "صاف کریں",
      skuProductName: "SKU / پروڈکٹ کا نام",
      skuPlaceholder: "مثال کے طور پر پی سی سلور نو سپن",
      buyingPrice: "خریداری کی قیمت *",
      buyingPricePlaceholder: "مثال کے طور پر 10",
      packagingCost: "پیکیجنگ لاگت",
      currentSellingPrice: "موجودہ فروخت کی قیمت",
      sellingPricePlaceholder: "مثال کے طور پر 35",
      maxBundleQty: "بنڈل مقدار",
      showAssumptions: "تمام فیس اور لاگت کی مفروضات دکھائیں",
      commissionRate: "کمیشن ریٹ",
      handlingFee: "ہینڈلنگ فیس",
      shippingShortfall: "شپنگ شارٹ فال",
      defaultDiscount: "ڈیفالٹ ڈسکاؤنٹ",
      competitorPricingTitle: "مقابلہ کی قیمت",
      competitorPricingSubtitle: "اپنی لسٹنگ کو مقابلہ کی کل قیمت اور فی آئٹم مقدار سے موازنہ کریں۔",
      competitorTotalPrice: "مقابلہ کی کل قیمت",
      competitorTotalPlaceholder: "مثال کے طور پر 180",
      competitorQty: "مقابلہ کی مقدار",
      competitorQtyPlaceholder: "مثال کے طور پر 6",
      competitorPerPiece: "مقابلہ فی پیس",
      yourPerPiece: "آپ فی پیس",
      priceGap: "فرق",
      marketPosition: "مارکیٹ پوزیشن",
      bundleCalculatorTitle: "بنڈل کیلکولیٹر",
      bundleCalculatorSubtitle: "اسی قیمت پر زیادہ مقدار - دریافت کریں کہ بنڈلنگ آپ کے منافع کو کیسے بڑھاتا ہے جبکہ صارفین کو خوش رکھتا ہے۔",
      bundleTargetPrice: "ٹارگٹ بنڈل قیمت",
      resultOverview: "نتیجہ کا جائزہ",
      resultOverviewSubtitle: "قیمت کی حکمت عملی، موجودہ حقیقت، مقابلہ کا نقطہ نظر اور بنڈل کی صلاحیت فوری طور پر سمجھیں۔",
      priceStrategy: "قیمت کی حکمت عملی",
      minimumPrice: "کم از کم قیمت",
      recommendedPrice: "سفارش کردہ قیمت",
      discountSafePrice: "10% ڈسکاؤنٹ-محفوظ قیمت",
      bundleHint: "بنڈل اشارہ",
      currentReality: "موجودہ حقیقت",
      profitLoss: "منافع / نقصان",
      marginPercent: "مارجن %",
      status: "سٹیٹس",
      chartInsights: "چارٹ انسائٹس",
      chartInsightsSubtitle: "منافع، آمدنی اور قیمت کی کارکردگی کی فوری بصری تفہیم۔",
      profitLossBySku: "SKU کے مطابق منافع / نقصان",
      revenueBySku: "SKU کے مطابق آمدنی",
      reportPreview: "رپورٹ کا پیش نظارہ",
      reportPreviewSubtitle: "موجودہ قیمت کے فیصلوں کا پرنٹ دوستانہ خلاصہ۔",
      printReport: "رپورٹ پرنٹ کریں",
      recentProducts: "حالیہ پروڈکٹس",
      recentProductsSubtitle: "اپنی تازہ ترین محفوظ کردہ پروڈکٹس کا فوری جائزہ لیں۔ تمام آئٹمز کے لیے مکمل محفوظ صفحہ کھولیں۔",
      viewAllSaved: "تمام دیکھیں",
      navCalculator: "کیلکولیٹر",
      navSaved: "محفوظ کردہ",
      navAdmin: "ایڈمن",
      poweredBy: "پاورڈ بائے",
      fabCalculate: "کیلکولیٹ",
      fabSave: "محفوظ",
      fabClear: "صاف",
      heroStatusLabel: "لائیو ڈیسیژن"
    }
  }
};

(function () {
  const {
    defaults,
    healthThresholds,
    recommendationLabels
  } = window.APP_CONFIG;

  // ---------- HELPERS ----------

  function toNumber(value) {
    const n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  }

  function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function formatCurrency(value) {
    return `PKR ${round2(value).toFixed(2)}`;
  }

  function formatPercent(value) {
    return `${round2(value).toFixed(2)}%`;
  }

  function safeDivide(a, b) {
    if (!b || b === 0) return 0;
    return a / b;
  }

  function getRecommendationSet(lang = "en") {
    return recommendationLabels[lang] || recommendationLabels.en;
  }

  // ---------- SETTINGS LOGIC ----------

  function getVariableRate(settings) {
    return (
      toNumber(settings.commissionRate) / 100 +
      toNumber(settings.paymentFeeRate) / 100 +
      toNumber(settings.freeShippingRate) / 100 +
      toNumber(settings.coinsRate) / 100 +
      toNumber(settings.voucherRate) / 100 +
      toNumber(settings.incomeTaxRate) / 100 +
      toNumber(settings.salesTaxRate) / 100
    );
  }

  function getFixedCosts(settings, packagingCost = 0) {
    return (
      toNumber(settings.handlingFee) +
      toNumber(settings.shippingShortfall) +
      toNumber(packagingCost)
    );
  }

  function getWebsiteVariableRate(settings) {
    const paymentGatewayFee = toNumber(settings.paymentGatewayFeeWebsite) / 100;
    const websiteTax = toNumber(settings.websiteSalesTaxRate) / 100;
    return paymentGatewayFee + websiteTax;
  }

  function getWebsiteFixedCosts(settings, packagingCost = 0) {
    const codFee = settings.deliveryLocation === "other-cities"
      ? toNumber(settings.codFeeOtherCities)
      : toNumber(settings.codFeeSameCity);

    const hostingPerOrder = toNumber(settings.monthlyHostingCost) /
                            toNumber(settings.expectedMonthlyOrders);

    return (
      codFee +
      hostingPerOrder +
      toNumber(packagingCost)
    );
  }

  // ---------- CORE PRICE CALCULATIONS ----------

  function calculateMinimumPrice(buyingPrice, packagingCost, settings) {
    const buy = toNumber(buyingPrice);
    const variableRate = getVariableRate(settings);
    const fixedCosts = getFixedCosts(settings, packagingCost);

    if (variableRate >= 1) return 0;

    const result = (buy + fixedCosts) / (1 - variableRate);
    return round2(result);
  }

  function calculateMinimumPriceWebsite(buyingPrice, packagingCost, settings) {
    const buy = toNumber(buyingPrice);
    const variableRate = getWebsiteVariableRate(settings);
    const fixedCosts = getWebsiteFixedCosts(settings, packagingCost);

    if (variableRate >= 1) return 0;

    const result = (buy + fixedCosts) / (1 - variableRate);
    return round2(result);
  }

  function calculateRecommendedPrice(buyingPrice, packagingCost, settings) {
    const buy = toNumber(buyingPrice);
    const variableRate = getVariableRate(settings);
    const targetMarginRate = toNumber(settings.defaultTargetMarginRate) / 100;
    const fixedCosts = getFixedCosts(settings, packagingCost);

    if ((1 - variableRate - targetMarginRate) <= 0) return 0;

    const result = (buy + fixedCosts) / (1 - variableRate - targetMarginRate);
    return round2(result);
  }

  function calculateRecommendedPriceWebsite(buyingPrice, packagingCost, settings) {
    const buy = toNumber(buyingPrice);
    const variableRate = getWebsiteVariableRate(settings);
    const targetMarginRate = toNumber(settings.defaultTargetMarginRate) / 100;
    const fixedCosts = getWebsiteFixedCosts(settings, packagingCost);

    if ((1 - variableRate - targetMarginRate) <= 0) return 0;

    const result = (buy + fixedCosts) / (1 - variableRate - targetMarginRate);
    return round2(result);
  }

  function calculateDiscountSafePrice(minimumPrice, settings) {
    const discountRate = toNumber(settings.defaultDiscountRate) / 100;
    if ((1 - discountRate) <= 0) return 0;

    const result = toNumber(minimumPrice) / (1 - discountRate);
    return round2(result);
  }

  // ---------- CURRENT SELLING PRICE ANALYSIS ----------

  function calculateCurrentProfitLoss(currentSellingPrice, buyingPrice, packagingCost, settings) {
    const sell = toNumber(currentSellingPrice);
    const buy = toNumber(buyingPrice);
    const variableRate = getVariableRate(settings);
    const fixedCosts = getFixedCosts(settings, packagingCost);

    const variableDeduction = sell * variableRate;
    const profit = sell - buy - variableDeduction - fixedCosts;

    return round2(profit);
  }

  function calculateCurrentProfitLossWebsite(currentSellingPrice, buyingPrice, packagingCost, settings) {
    const sell = toNumber(currentSellingPrice);
    const buy = toNumber(buyingPrice);
    const variableRate = getWebsiteVariableRate(settings);
    const fixedCosts = getWebsiteFixedCosts(settings, packagingCost);

    const variableDeduction = sell * variableRate;
    const profit = sell - buy - variableDeduction - fixedCosts;

    return round2(profit);
  }

  function calculateMarginPercent(currentSellingPrice, profitLoss) {
    const sell = toNumber(currentSellingPrice);
    if (!sell) return 0;
    return round2((profitLoss / sell) * 100);
  }

  // ---------- HEALTH STATUS ----------

  function getHealthStatus(profit) {
    const p = toNumber(profit);

    if (p <= healthThresholds.doNotSellMaxProfit) {
      return {
        key: "doNotSell",
        labelEn: "Do Not Sell",
        labelRu: "Mat Becho",
        className: "badge--danger"
      };
    }

    if (p >= healthThresholds.riskyMinProfit && p <= healthThresholds.riskyMaxProfit) {
      return {
        key: "risky",
        labelEn: "Risky",
        labelRu: "Risky",
        className: "badge--warning"
      };
    }

    if (p >= healthThresholds.safeMinProfit && p < healthThresholds.healthyMinProfit) {
      return {
        key: "safe",
        labelEn: "Safe",
        labelRu: "Safe",
        className: "badge--neutral"
      };
    }

    return {
      key: "healthy",
      labelEn: "Healthy",
      labelRu: "Healthy",
      className: "badge--success"
    };
  }

  // ---------- COMPETITOR ANALYSIS ----------

  function calculateCompetitorPerPiece(totalPrice, quantity) {
    const total = toNumber(totalPrice);
    const qty = toNumber(quantity);
    if (!qty) return 0;
    return round2(total / qty);
  }

  function calculateYourPerPiece(currentSellingPrice, bundleQty) {
    const sell = toNumber(currentSellingPrice);
    const qty = toNumber(bundleQty);
    if (!qty) return 0;
    return round2(sell / qty);
  }

  function calculatePriceGap(yourPerPiece, competitorPerPiece) {
    return round2(yourPerPiece - competitorPerPiece);
  }

  function getMarketPosition(gap, lang = "en") {
    const g = toNumber(gap);

    if (Math.abs(g) < 0.01) {
      return lang === "ru" ? "Lagbhag same" : "Almost Same";
    }

    if (g > 0) {
      return lang === "ru" ? "Aap mehngay ho" : "You Are Expensive";
    }

    return lang === "ru" ? "Aap saste ho" : "You Are Cheaper";
  }

  // ---------- BUNDLE COMPARISON ----------

  function calculateBundleScenarios(buyingPrice, packagingCost, settings, maxQty = 12) {
    const bundleOptions = settings.bundleQuantities || defaults.settings.bundleQuantities || [1,2,3,5,10,12];
    const scenarios = [];

    bundleOptions.forEach((qty) => {
      if (qty > maxQty) return;

      const totalBuying = toNumber(buyingPrice) * qty;
      const minimumPrice = calculateMinimumPrice(totalBuying, packagingCost, settings);
      const recommendedPrice = calculateRecommendedPrice(totalBuying, packagingCost, settings);

      scenarios.push({
        qty,
        totalBuying: round2(totalBuying),
        minimumPrice,
        recommendedPrice
      });
    });

    return scenarios;
  }

  function getBestBundleHint(scenarios, lang = "en") {
    if (!scenarios || !scenarios.length) {
      return lang === "ru" ? "Bundle data available nahi" : "No Bundle Data";
    }

    const profitable = scenarios.find((s) => s.qty >= 2);

    if (!profitable) {
      return lang === "ru" ? "Bundle check karo" : "Check Bundle";
    }

    return lang === "ru"
      ? `Best: ${profitable.qty}x bundle try karo`
      : `Best: Try ${profitable.qty}x Bundle`;
  }

  // ---------- RECOMMENDATION ENGINE ----------

  function getRecommendation({
    currentSellingPrice,
    minimumPrice,
    recommendedPrice,
    profitLoss,
    competitorGap,
    lang = "en"
  }) {
    const labels = getRecommendationSet(lang);

    const sell = toNumber(currentSellingPrice);
    const profit = toNumber(profitLoss);
    const min = toNumber(minimumPrice);
    const rec = toNumber(recommendedPrice);
    const gap = toNumber(competitorGap);

    if (!sell && min > 0) {
      return {
        title: lang === "ru" ? "Price Set Karo" : "Set a Selling Price",
        message:
          lang === "ru"
            ? `Minimum ${formatCurrency(min)} se neeche mat jao`
            : `Do not go below ${formatCurrency(min)}`
      };
    }

    if (profit < 0) {
      if (sell < min) {
        return {
          title: labels.doNotSell,
          message:
            lang === "ru"
              ? `Current price low hai. Kam az kam ${formatCurrency(min)} ya us se upar rakho`
              : `Current price is too low. Move to at least ${formatCurrency(min)}`
        };
      }

      return {
        title: labels.raisePrice,
        message:
          lang === "ru"
            ? `Current price nuksan de raha hai. Recommended ${formatCurrency(rec)} try karo`
            : `Current price is causing loss. Try recommended price ${formatCurrency(rec)}`
      };
    }

    if (profit >= 0 && profit < 10) {
      return {
        title: labels.risky,
        message:
          lang === "ru"
            ? `Margin bohat kam hai. Better pricing ya bundle try karo`
            : `Margin is very thin. Try better pricing or a bundle`
      };
    }

    if (profit >= 10 && profit < 25) {
      return {
        title: labels.safe,
        message:
          lang === "ru"
            ? `Price workable hai. Aur behtar margin ke liye ${formatCurrency(rec)} dekh lo`
            : `Current pricing is workable. For better margin, consider ${formatCurrency(rec)}`
      };
    }

    if (gap > 0) {
      return {
        title: labels.healthy,
        message:
          lang === "ru"
            ? `Munafa theek hai lekin competitor se mehngay ho`
            : `Margin is healthy, but you are priced above competitor`
      };
    }

    return {
      title: labels.healthy,
      message:
        lang === "ru"
          ? `Pricing healthy lag rahi hai`
          : `Pricing looks healthy`
    };
  }

  // ---------- REASONS / EXPLANATION ----------

  function getReasonLines({
    buyingPrice,
    packagingCost,
    currentSellingPrice,
    minimumPrice,
    profitLoss,
    marginPercent,
    settings,
    lang = "en"
  }) {
    const lines = [];

    const buy = toNumber(buyingPrice);
    const pack = toNumber(packagingCost);
    const sell = toNumber(currentSellingPrice);
    const min = toNumber(minimumPrice);
    const profit = toNumber(profitLoss);
    const margin = toNumber(marginPercent);

    const variableRate = round2(getVariableRate(settings) * 100);

    if (!buy) {
      lines.push(lang === "ru" ? "Buying price enter karo." : "Enter buying price.");
      return lines;
    }

    lines.push(
      lang === "ru"
        ? `Total variable deduction rate approx ${variableRate}% hai`
        : `Total variable deduction rate is about ${variableRate}%`
    );

    if (pack > 0) {
      lines.push(
        lang === "ru"
          ? `Packaging cost bhi margin ko affect kar rahi hai`
          : `Packaging cost is also affecting your margin`
      );
    }

    if (sell > 0) {
      if (sell < min) {
        lines.push(
          lang === "ru"
            ? `Current price minimum safe price se neeche hai`
            : `Current price is below the minimum safe price`
        );
      }

      if (profit < 0) {
        lines.push(
          lang === "ru"
            ? `Is price par product nuksan de raha hai`
            : `At this price, the product is causing loss`
        );
      }

      if (margin >= 0 && margin < 5) {
        lines.push(
          lang === "ru"
            ? `Margin bohat thin hai`
            : `Margin is very thin`
        );
      }
    } else {
      lines.push(
        lang === "ru"
          ? `Abhi selling price nahi di gayi, is liye safe price dikhaya ja raha hai`
          : `No current selling price entered, so safe pricing is being shown`
      );
    }

    return lines;
  }

  // ---------- MAIN CALCULATOR PIPELINE ----------

  function runPricingEngine({
    sku = "",
    buyingPrice = 0,
    packagingCost = 0,
    currentSellingPrice = 0,
    bundleQty = 1,
    competitorTotalPrice = 0,
    competitorQty = 0,
    settings = defaults.settings,
    lang = "en"
  }) {
    // Determine which pricing mode to use
    const isWebsiteMode = settings.mode === "website";

    // Create a modified settings object for website mode calculations
    let effectiveSettings = settings;

    if (isWebsiteMode) {
      // For website mode, we need to override the cost structure
      // We'll handle this by modifying how we calculate minimumPrice and recommendedPrice
    }

    const minimumPrice = isWebsiteMode
      ? calculateMinimumPriceWebsite(buyingPrice, packagingCost, settings)
      : calculateMinimumPrice(buyingPrice, packagingCost, settings);

    const recommendedPrice = isWebsiteMode
      ? calculateRecommendedPriceWebsite(buyingPrice, packagingCost, settings)
      : calculateRecommendedPrice(buyingPrice, packagingCost, settings);

    const discountSafePrice = calculateDiscountSafePrice(minimumPrice, settings);

    const profitLoss = isWebsiteMode
      ? calculateCurrentProfitLossWebsite(currentSellingPrice, buyingPrice, packagingCost, settings)
      : calculateCurrentProfitLoss(currentSellingPrice, buyingPrice, packagingCost, settings);

    const marginPercent = calculateMarginPercent(currentSellingPrice, profitLoss);
    const healthStatus = getHealthStatus(profitLoss);

    const competitorPerPiece = calculateCompetitorPerPiece(
      competitorTotalPrice,
      competitorQty
    );

    const yourPerPiece = calculateYourPerPiece(
      currentSellingPrice,
      bundleQty
    );

    const priceGap = calculatePriceGap(yourPerPiece, competitorPerPiece);
    const marketPosition = getMarketPosition(priceGap, lang);

    const bundleScenarios = calculateBundleScenarios(
      buyingPrice,
      packagingCost,
      settings,
      bundleQty
    );

    const bundleHint = getBestBundleHint(bundleScenarios, lang);

    const recommendation = getRecommendation({
      currentSellingPrice,
      minimumPrice,
      recommendedPrice,
      profitLoss,
      competitorGap: priceGap,
      lang
    });

    const reasons = getReasonLines({
      buyingPrice,
      packagingCost,
      currentSellingPrice,
      minimumPrice,
      profitLoss,
      marginPercent,
      settings,
      lang
    });

    return {
      sku,
      buyingPrice: round2(toNumber(buyingPrice)),
      packagingCost: round2(toNumber(packagingCost)),
      currentSellingPrice: round2(toNumber(currentSellingPrice)),
      bundleQty: toNumber(bundleQty),

      minimumPrice,
      recommendedPrice,
      discountSafePrice,

      profitLoss,
      marginPercent,

      healthStatus,
      recommendation,

      competitorPerPiece,
      yourPerPiece,
      priceGap,
      marketPosition,

      bundleScenarios,
      bundleHint,

      reasons,

      formatted: {
        minimumPrice: formatCurrency(minimumPrice),
        recommendedPrice: formatCurrency(recommendedPrice),
        discountSafePrice: formatCurrency(discountSafePrice),
        profitLoss: formatCurrency(profitLoss),
        marginPercent: formatPercent(marginPercent),
        competitorPerPiece: formatCurrency(competitorPerPiece),
        yourPerPiece: formatCurrency(yourPerPiece),
        priceGap: formatCurrency(priceGap)
      }
    };
  }

  // ---------- EXPORT ----------

  window.AppCalc = {
    toNumber,
    round2,
    formatCurrency,
    formatPercent,

    getVariableRate,
    getFixedCosts,
    getWebsiteVariableRate,
    getWebsiteFixedCosts,

    calculateMinimumPrice,
    calculateRecommendedPrice,
    calculateDiscountSafePrice,
    calculateCurrentProfitLoss,
    calculateCurrentProfitLossWebsite,
    calculateMarginPercent,

    getHealthStatus,

    calculateCompetitorPerPiece,
    calculateYourPerPiece,
    calculatePriceGap,
    getMarketPosition,

    calculateBundleScenarios,
    getBestBundleHint,

    getRecommendation,
    getReasonLines,

    runPricingEngine
  };
})();