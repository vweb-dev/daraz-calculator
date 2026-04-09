window.APP_CONFIG = {
    settingsKey: "daraz_admin_settings_v2",
    productsKey: "daraz_products_v2",
    authKey: "daraz_admin_auth_v2",

    adminPassword: "vweb123!",

    defaultSettings: {
        commissionRate: 23.20,
        paymentFeeRate: 2.62,
        freeShippingRate: 6.96,
        coinsRate: 2.83,
        voucherRate: 2.00,
        incomeTaxRate: 2.36,
        salesTaxRate: 2.70,
        handlingFee: 11.60,
        defaultShippingShortfall: 16.87,
        defaultDiscountRate: 10.00,
        defaultTargetMarginRate: 10.00,
        defaultLanguage: "en"
    },

    defaultProduct: {
        id: "",
        mode: "pricing",
        sku: "",
        buyingPrice: 0,
        packagingCost: 0,
        currentSellingPrice: 0,
        competitorPrice: 0,
        shippingShortfall: "",
        customCommissionRate: "",
        discountRate: "",
        targetMarginRate: "",
        notes: "",

        statementProductPrice: 0,
        buyerShipping: 0,
        darazShippingFee: 0,
        shippingDiscount: 0,
        statementCommission: 0,
        statementPaymentFee: 0,
        statementFreeShippingFee: 0,
        statementCoinsFee: 0,
        statementVoucherFee: 0,
        statementIncomeTax: 0,
        statementSalesTax: 0,
        statementHandlingFee: 0
    },

    defaultProducts: [
        {
            id: "seed-1",
            mode: "pricing",
            sku: "NSRNGS-01-07-1pc",
            buyingPrice: 10,
            packagingCost: 0,
            currentSellingPrice: 49,
            competitorPrice: 45,
            shippingShortfall: 16.87,
            customCommissionRate: "",
            discountRate: 10,
            targetMarginRate: 10,
            notes: "Main low-ticket SKU. Review for bundle.",

            statementProductPrice: 49,
            buyerShipping: 0,
            darazShippingFee: 0,
            shippingDiscount: 0,
            statementCommission: 0,
            statementPaymentFee: 0,
            statementFreeShippingFee: 0,
            statementCoinsFee: 0,
            statementVoucherFee: 0,
            statementIncomeTax: 0,
            statementSalesTax: 0,
            statementHandlingFee: 0
        }
    ],

    recommendationLabels: {
        en: {
            doNotSell: "Do Not Sell",
            raisePrice: "Raise Price",
            risky: "Risky",
            safe: "Safe",
            healthy: "Healthy",
            betterBundle: "Better as Bundle"
        },
        ru: {
            doNotSell: "Mat Becho",
            raisePrice: "Price Barhao",
            risky: "Risky",
            safe: "Safe",
            healthy: "Healthy",
            betterBundle: "Bundle Better Hai"
        }
    },

    healthLabels: {
        en: {
            unsafe: "Unsafe",
            borderline: "Borderline",
            healthy: "Healthy"
        },
        ru: {
            unsafe: "Nuksan",
            borderline: "Kamzor Margin",
            healthy: "Theek"
        }
    },

    translations: {
        en: {
            appTitle: "Daraz Calculator Pro",
            appSubtitle: "Enter buying price and quickly understand whether the product is worth selling, what price is safe, and whether the current price is causing loss.",
            admin: "Admin",
            exportCsv: "Export CSV",
            printReport: "Print",
            totalProducts: "Total Products",
            revenueBase: "Revenue",
            avgMargin: "Avg Margin %",
            bestSku: "Best SKU",
            bulkPasteImport: "Bulk Import",
            offerPlanner: "Offer Planner",
            planOffer: "Plan Offer",
            charts: "Charts",
            sku: "SKU / Product Name",
            buyingPrice: "Buying Price",
            packagingCost: "Packaging Cost",
            currentSellingPrice: "Current Selling Price",
            minimumPrice: "Minimum Price",
            recommendedPrice: "Recommended Price",
            discountSafePrice: "10% Discount-Safe Price",
            profitLoss: "Profit / Loss",
            margin: "Margin %",
            recommendation: "Recommendation",
            notes: "Notes",
            pricingMode: "Pricing Mode",
            statementMode: "Statement Mode",
            duplicate: "Duplicate",
            delete: "Delete",
            bundleComparison: "Bundle Comparison",
            noOfferCalcYet: "No offer calculation yet.",
            poweredBy: "Powered by vweb.dev"
        },
        ru: {
            appTitle: "Daraz Calculator Pro",
            appSubtitle: "Buying price dalo aur foran samjho kya yeh product bechna chahiye, kis price par safe hai, aur current price nuksan de raha hai ya nahi.",
            admin: "Admin",
            exportCsv: "CSV Nikalo",
            printReport: "Print",
            totalProducts: "Total Products",
            revenueBase: "Revenue",
            avgMargin: "Avg Margin %",
            bestSku: "Best SKU",
            bulkPasteImport: "Bulk Import",
            offerPlanner: "Offer Planner",
            planOffer: "Offer Check Karo",
            charts: "Charts",
            sku: "SKU / Product Name",
            buyingPrice: "Buying Price",
            packagingCost: "Packaging Cost",
            currentSellingPrice: "Current Selling Price",
            minimumPrice: "Minimum Price",
            recommendedPrice: "Recommended Price",
            discountSafePrice: "10% Discount-Safe Price",
            profitLoss: "Munafa / Nuksan",
            margin: "Margin %",
            recommendation: "Mashwara",
            notes: "Notes",
            pricingMode: "Pricing Mode",
            statementMode: "Statement Mode",
            duplicate: "Copy Banao",
            delete: "Delete",
            bundleComparison: "Bundle Comparison",
            noOfferCalcYet: "Abhi koi offer calculation nahi hui.",
            poweredBy: "Powered by vweb.dev"
        }
    }
};