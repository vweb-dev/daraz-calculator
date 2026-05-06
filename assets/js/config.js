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

  admin: {
    defaultPassword: "vweb123!"
  },

  defaults: {
    language: "en",

    quickForm: {
      sku: "",
      buyingPrice: "",
      packagingCost: 0,
      currentSellingPrice: "",
      bundleQty: 12,
      competitorTotalPrice: "",
      competitorQty: ""
    },

    settings: {
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
      bundleQuantities: [1, 2, 3, 5, 10, 12]
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

      heroStatusLabel: "Live Decision",
      heroRecommendationDefault: "Enter product values to get a pricing decision.",

      whyPlaceholder1: "Reasoning will appear here.",
      whyPlaceholder2: "It will explain why the product is safe or risky.",

      quickCalculatorTitle: "Quick Calculator",
      quickCalculatorSubtitle: "Enter buying price and instantly see safe prices, current loss, competitor gap, and bundle result.",

      welcomeTitle: "Welcome to Daraz Calculator Pro!",
      welcomeMessage: "Enter your buying price below and get instant pricing recommendations, bundle suggestions, and profit analysis.",
      bundleCalculatorTitle: "Bundle Calculator",
      bundleCalculatorSubtitle: "Enter a target bundle price to see how bundling can increase your profits.",
      bundleInsightTitle: "Bundle Insights",
      bundleInsightText: "Enter a target bundle price to see how bundling can increase your profits.",
      bundleTargetPrice: "Target Bundle Price",

      calculateNow: "Calculate Now",
      saveProduct: "Save Product",
      clear: "Clear",

      skuProductName: "SKU / Product Name",
      skuPlaceholder: "e.g. pc silver nosepin",

      buyingPrice: "Buying Price",
      buyingPricePlaceholder: "e.g. 10",

      packagingCost: "Packaging Cost",

      currentSellingPrice: "Current Selling Price",
      sellingPricePlaceholder: "e.g. 35",

      maxBundleQty: "Max Bundle Qty",

      competitorTotalPrice: "Competitor Total Price",
      competitorTotalPlaceholder: "e.g. 180",

      competitorQty: "Competitor Quantity",
      competitorQtyPlaceholder: "e.g. 6",

      showAssumptions: "Show all fee & cost assumptions",
      commissionRate: "Commission Rate",
      handlingFee: "Handling Fee",
      shippingShortfall: "Shipping Shortfall",
      defaultDiscount: "Default Discount",

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

      competitorView: "Competitor View",
      competitorPerPiece: "Competitor Per Piece",
      yourPerPiece: "Your Per Piece",
      priceGap: "Gap",
      marketPosition: "Market Position",

      recentProducts: "Recent Products",
      recentProductsSubtitle: "Review your latest saved products quickly. Open full Saved page for all items.",
      viewAllSaved: "View All",

      chartInsights: "Chart Insights",
      chartInsightsSubtitle: "Quick visual understanding of profit, revenue, and pricing performance.",
      profitLossBySku: "Profit / Loss by SKU",
      revenueBySku: "Revenue by SKU",

      reportPreview: "Report Preview",
      reportPreviewSubtitle: "Print-friendly summary of current pricing decisions.",
      printReport: "Print Report",

      sku: "SKU",
      price: "Price",

      navCalculator: "Calculator",
      navSaved: "Saved",
      navAdmin: "Admin",
      navBulk: "Bulk",

      poweredBy: "Powered by"
    },

    ru: {
      appTitle: "Daraz Listing Calculator Pro",
      appSubtitle: "Buying price dalo aur foran samjho kya bechna hai, kis price par bechna hai, aur current price nuksan de raha hai ya nahi.",

      heroStatusLabel: "Live Faisla",
      heroRecommendationDefault: "Product values likho taake pricing decision mil sake.",

      whyPlaceholder1: "Reason yahan show hogi.",
      whyPlaceholder2: "Yahan samajh aayega ke product safe hai ya risky.",

      quickCalculatorTitle: "Quick Calculator",
      quickCalculatorSubtitle: "Buying price likho aur foran safe price, current nuksan, competitor gap, aur bundle result dekh lo.",

      welcomeTitle: "Daraz Calculator Pro mein khush aamdeed!",
      welcomeMessage: "Apna buying price niche daalein aur foran pricing recommendations, bundle suggestions, aur profit analysis hasil karein.",
      bundleCalculatorTitle: "Bundle Calculator",
      bundleCalculatorSubtitle: "Bundling se aap apne munafe ko kaise barha sakte hain, dekhne ke liye target bundle price dalein.",
      bundleInsightTitle: "Bundle Insights",
      bundleInsightText: "Bundling se fayda dekhne ke liye target bundle price enter karein.",
      bundleTargetPrice: "Target Bundle Price",

      calculateNow: "Hisaab Karo",
      saveProduct: "Save Karo",
      clear: "Clear",

      skuProductName: "SKU / Product Name",
      skuPlaceholder: "misal: pc silver nosepin",

      buyingPrice: "Buying Price",
      buyingPricePlaceholder: "misal: 10",

      packagingCost: "Packaging Cost",

      currentSellingPrice: "Current Selling Price",
      sellingPricePlaceholder: "misal: 35",

      maxBundleQty: "Max Bundle Qty",

      competitorTotalPrice: "Competitor Total Price",
      competitorTotalPlaceholder: "misal: 180",

      competitorQty: "Competitor Quantity",
      competitorQtyPlaceholder: "misal: 6",

      showAssumptions: "Saari fee aur cost assumptions dekho",
      commissionRate: "Commission Rate",
      handlingFee: "Handling Fee",
      shippingShortfall: "Shipping Shortfall",
      defaultDiscount: "Default Discount",

      resultOverview: "Result Overview",
      resultOverviewSubtitle: "Foran samjho pricing strategy kya honi chahiye, current reality kya hai, competitor gap kya hai, aur bundle better hai ya nahi.",

      priceStrategy: "Price Strategy",
      minimumPrice: "Minimum Price",
      recommendedPrice: "Recommended Price",
      discountSafePrice: "10% Discount-Safe Price",
      bundleHint: "Bundle Hint",

      currentReality: "Current Reality",
      profitLoss: "Munafa / Nuksan",
      marginPercent: "Margin %",
      status: "Status",

      competitorView: "Competitor View",
      competitorPerPiece: "Competitor Per Piece",
      yourPerPiece: "Your Per Piece",
      priceGap: "Farq",
      marketPosition: "Market Position",

      recentProducts: "Recent Products",
      recentProductsSubtitle: "Apne latest saved products jaldi review karo. Full list ke liye Saved page kholo.",
      viewAllSaved: "Sab Dekho",

      chartInsights: "Chart Insights",
      chartInsightsSubtitle: "Profit, revenue, aur pricing performance ka quick visual view.",
      profitLossBySku: "Profit / Loss by SKU",
      revenueBySku: "Revenue by SKU",

      reportPreview: "Report Preview",
      reportPreviewSubtitle: "Print ke liye current pricing decisions ka summary.",
      printReport: "Report Print Karo",

      sku: "SKU",
      price: "Price",

      navCalculator: "Calculator",
      navSaved: "Saved",
      navAdmin: "Admin",
      navBulk: "Bulk",

      poweredBy: "Powered by"
    }
  }
};
