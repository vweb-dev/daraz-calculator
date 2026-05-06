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

  // ---------- CORE PRICE CALCULATIONS ----------

  function calculateMinimumPrice(buyingPrice, packagingCost, settings) {
    const buy = toNumber(buyingPrice);
    const variableRate = getVariableRate(settings);
    const fixedCosts = getFixedCosts(settings, packagingCost);

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
    const minimumPrice = calculateMinimumPrice(buyingPrice, packagingCost, settings);
    const recommendedPrice = calculateRecommendedPrice(buyingPrice, packagingCost, settings);
    const discountSafePrice = calculateDiscountSafePrice(minimumPrice, settings);

    const profitLoss = calculateCurrentProfitLoss(
      currentSellingPrice,
      buyingPrice,
      packagingCost,
      settings
    );

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

    calculateMinimumPrice,
    calculateRecommendedPrice,
    calculateDiscountSafePrice,
    calculateCurrentProfitLoss,
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
