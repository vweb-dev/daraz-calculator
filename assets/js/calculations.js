window.CalcUtils = (() => {
    function num(v) {
        const n = parseFloat(v);
        return isNaN(n) ? 0 : n;
    }

    function round2(v) {
        return Math.round((Number(v) + Number.EPSILON) * 100) / 100;
    }

    function money(v) {
        return `PKR ${round2(v).toFixed(2)}`;
    }

    function escapeHtml(str) {
        return String(str ?? "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function getLanguage(settings) {
        return settings?.defaultLanguage || "en";
    }

    function t(settings, key) {
        const lang = getLanguage(settings);
        const dict =
            window.APP_CONFIG.translations[lang] ||
            window.APP_CONFIG.translations.en;
        return dict[key] || key;
    }

    function getRecommendationLabel(settings, key) {
        const lang = getLanguage(settings);
        const dict =
            window.APP_CONFIG.recommendationLabels[lang] ||
            window.APP_CONFIG.recommendationLabels.en;
        return dict[key] || key;
    }

    function getHealthLabel(settings, key) {
        const lang = getLanguage(settings);
        const dict =
            window.APP_CONFIG.healthLabels[lang] ||
            window.APP_CONFIG.healthLabels.en;
        return dict[key] || key;
    }

    function getPricingRates(product, settings) {
        return {
            commissionRate:
                (product.customCommissionRate === ""
                    ? num(settings.commissionRate)
                    : num(product.customCommissionRate)) / 100,
            paymentFeeRate: num(settings.paymentFeeRate) / 100,
            freeShippingRate: num(settings.freeShippingRate) / 100,
            coinsRate: num(settings.coinsRate) / 100,
            voucherRate: num(settings.voucherRate) / 100,
            incomeTaxRate: num(settings.incomeTaxRate) / 100,
            salesTaxRate: num(settings.salesTaxRate) / 100
        };
    }

    function getEffectiveDiscountRate(product, settings) {
        return (
            (product.discountRate === ""
                ? num(settings.defaultDiscountRate)
                : num(product.discountRate)) / 100
        );
    }

    function getEffectiveTargetMarginRate(product, settings) {
        return (
            (product.targetMarginRate === ""
                ? num(settings.defaultTargetMarginRate)
                : num(product.targetMarginRate)) / 100
        );
    }

    function getEffectiveShippingShortfall(product, settings) {
        return product.shippingShortfall === ""
            ? num(settings.defaultShippingShortfall)
            : num(product.shippingShortfall);
    }

    function calculatePricingProduct(product, settings) {
        const rates = getPricingRates(product, settings);

        const buyingPrice = num(product.buyingPrice);
        const packagingCost = num(product.packagingCost);
        const currentSellingPrice = num(product.currentSellingPrice);
        const competitorPrice = num(product.competitorPrice);

        const handlingFee = num(settings.handlingFee);
        const shippingShortfall = getEffectiveShippingShortfall(product, settings);
        const discountRate = getEffectiveDiscountRate(product, settings);
        const targetMarginRate = getEffectiveTargetMarginRate(product, settings);

        const totalVariableRate =
            rates.commissionRate +
            rates.paymentFeeRate +
            rates.freeShippingRate +
            rates.coinsRate +
            rates.voucherRate +
            rates.incomeTaxRate +
            rates.salesTaxRate;

        const fixedCosts =
            buyingPrice +
            packagingCost +
            handlingFee +
            shippingShortfall;

        const minimumPrice =
            (1 - totalVariableRate) > 0
                ? fixedCosts / (1 - totalVariableRate)
                : 0;

        const recommendedPrice =
            (1 - totalVariableRate - targetMarginRate) > 0
                ? fixedCosts / (1 - totalVariableRate - targetMarginRate)
                : 0;

        const discountSafePrice =
            (1 - discountRate) > 0
                ? minimumPrice / (1 - discountRate)
                : 0;

        const currentCommission = currentSellingPrice * rates.commissionRate;
        const currentPaymentFee = currentSellingPrice * rates.paymentFeeRate;
        const currentFreeShippingFee = currentSellingPrice * rates.freeShippingRate;
        const currentCoinsFee = currentSellingPrice * rates.coinsRate;
        const currentVoucherFee = currentSellingPrice * rates.voucherRate;
        const currentIncomeTax = currentSellingPrice * rates.incomeTaxRate;
        const currentSalesTax = currentSellingPrice * rates.salesTaxRate;

        const currentVariableDeductions =
            currentCommission +
            currentPaymentFee +
            currentFreeShippingFee +
            currentCoinsFee +
            currentVoucherFee +
            currentIncomeTax +
            currentSalesTax;

        const currentFixedDeductions = handlingFee + shippingShortfall;
        const totalDarazDeductions =
            currentVariableDeductions + currentFixedDeductions;

        const estimatedProfit =
            currentSellingPrice -
            buyingPrice -
            packagingCost -
            totalDarazDeductions;

        const estimatedMarginPercent =
            currentSellingPrice > 0
                ? (estimatedProfit / currentSellingPrice) * 100
                : 0;

        const competitorGap = competitorPrice
            ? currentSellingPrice - competitorPrice
            : 0;

        return {
            type: "pricing",
            buyingPrice,
            packagingCost,
            currentSellingPrice,
            competitorPrice,
            minimumPrice,
            recommendedPrice,
            discountSafePrice,
            estimatedProfit,
            estimatedMarginPercent,
            totalDarazDeductions,
            competitorGap,
            revenueBase: currentSellingPrice
        };
    }

    function calculateStatementProduct(product) {
        const buyingPrice = num(product.buyingPrice);
        const packagingCost = num(product.packagingCost);

        const productPrice = num(product.statementProductPrice);
        const buyerShipping = num(product.buyerShipping);
        const darazShippingFee = num(product.darazShippingFee);
        const shippingDiscount = num(product.shippingDiscount);
        const commission = num(product.statementCommission);
        const paymentFee = num(product.statementPaymentFee);
        const freeShippingFee = num(product.statementFreeShippingFee);
        const coinsFee = num(product.statementCoinsFee);
        const voucherFee = num(product.statementVoucherFee);
        const incomeTax = num(product.statementIncomeTax);
        const salesTax = num(product.statementSalesTax);
        const handlingFee = num(product.statementHandlingFee);

        const totalRecoveries = buyerShipping + shippingDiscount;

        const totalDarazDeductions =
            darazShippingFee +
            commission +
            paymentFee +
            freeShippingFee +
            coinsFee +
            voucherFee +
            incomeTax +
            salesTax +
            handlingFee;

        const netPayoutBeforeCost =
            productPrice + totalRecoveries - totalDarazDeductions;

        const estimatedProfit =
            netPayoutBeforeCost - buyingPrice - packagingCost;

        const estimatedMarginPercent =
            productPrice > 0
                ? (estimatedProfit / productPrice) * 100
                : 0;

        return {
            type: "statement",
            buyingPrice,
            packagingCost,
            productPrice,
            totalDarazDeductions,
            estimatedProfit,
            estimatedMarginPercent,
            revenueBase: productPrice
        };
    }

    function calculateProduct(product, settings) {
        if (product.mode === "statement") {
            return calculateStatementProduct(product, settings);
        }
        return calculatePricingProduct(product, settings);
    }

    function getHealth(profit) {
        if (profit < 0) {
            return { key: "unsafe", className: "bad" };
        }
        if (profit >= 0 && profit < 10) {
            return { key: "borderline", className: "risky" };
        }
        return { key: "healthy", className: "good" };
    }

    function getRecommendation(product, result, settings) {
        if (product.mode === "statement") {
            if (result.estimatedProfit < 0) {
                return getRecommendationLabel(settings, "doNotSell");
            }
            if (result.estimatedProfit < 10) {
                return getRecommendationLabel(settings, "risky");
            }
            return getRecommendationLabel(settings, "safe");
        }

        const currentPrice = num(product.currentSellingPrice);
        const competitorPrice = num(product.competitorPrice);

        if (currentPrice <= 0) {
            return getRecommendationLabel(settings, "raisePrice");
        }

        if (result.estimatedProfit < 0) {
            if (competitorPrice && competitorPrice < result.minimumPrice) {
                return getRecommendationLabel(settings, "betterBundle");
            }
            if (currentPrice < result.minimumPrice) {
                return getRecommendationLabel(settings, "doNotSell");
            }
            return getRecommendationLabel(settings, "raisePrice");
        }

        if (result.estimatedProfit >= 0 && result.estimatedProfit < 10) {
            return getRecommendationLabel(settings, "risky");
        }

        if (competitorPrice && competitorPrice < result.minimumPrice) {
            return getRecommendationLabel(settings, "betterBundle");
        }

        if (currentPrice < result.recommendedPrice) {
            return getRecommendationLabel(settings, "safe");
        }

        return getRecommendationLabel(settings, "healthy");
    }

    function bundleCompare(product, settings) {
        const qtys = [1, 2, 3, 5];

        return qtys.map(qty => {
            const p = {
                ...product,
                buyingPrice: num(product.buyingPrice) * qty,
                currentSellingPrice: num(product.currentSellingPrice) * qty
            };

            const result = calculatePricingProduct(p, settings);

            return {
                qty,
                price: p.currentSellingPrice,
                profit: result.estimatedProfit,
                margin: result.estimatedMarginPercent
            };
        });
    }

    function planOffer(input, settings) {
        const basePrice = num(input.basePrice);
        const discountPercent = num(input.discountPercent);
        const extraVoucherPercent = num(input.extraVoucherPercent);
        const coinsPercent = num(input.coinsPercent);
        const buyingPrice = num(input.buyingPrice);
        const packagingCost = num(input.packagingCost);

        const finalSalePrice = basePrice * (1 - discountPercent / 100);
        const voucherImpact = finalSalePrice * (extraVoucherPercent / 100);
        const coinsImpact = finalSalePrice * (coinsPercent / 100);

        const mockProduct = {
            ...window.APP_CONFIG.defaultProduct,
            mode: "pricing",
            buyingPrice,
            packagingCost,
            currentSellingPrice: finalSalePrice
        };

        const result = calculatePricingProduct(mockProduct, settings);
        const finalProfitAfterPromo =
            result.estimatedProfit - voucherImpact - coinsImpact;

        return {
            finalSalePrice,
            voucherImpact,
            coinsImpact,
            totalPromoImpact: voucherImpact + coinsImpact,
            finalProfitAfterPromo
        };
    }

    return {
        num,
        round2,
        money,
        escapeHtml,
        t,
        getHealthLabel,
        getRecommendationLabel,
        calculatePricingProduct,
        calculateStatementProduct,
        calculateProduct,
        getHealth,
        getRecommendation,
        bundleCompare,
        planOffer
    };
})();