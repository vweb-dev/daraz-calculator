(() => {
    const {
        adminPassword,
        defaultSettings
    } = window.APP_CONFIG;

    const {
        clone,
        loadSettings,
        saveSettings,
        loadAuth,
        saveAuth,
        resetAllAppData
    } = window.StorageUtils;

    let settings = loadSettings() || clone(defaultSettings);

    function qs(id) {
        return document.getElementById(id);
    }

    function applyTexts() {
        const lang = settings.defaultLanguage || "en";
        const isEn = lang === "en";

        qs("adminGateTitle").textContent = isEn ? "Admin Access" : "Admin Access";
        qs("adminGateSubtitle").textContent = isEn
            ? "Enter password to continue."
            : "Continue karne ke liye password enter karo.";
        qs("adminPasswordLabel").textContent = isEn ? "Password" : "Password";
        qs("unlockBtn").textContent = isEn ? "Unlock" : "Unlock";
        qs("backToAppBtn").textContent = isEn ? "Back to App" : "App par wapas jao";
        qs("adminGateNote").textContent = isEn
            ? "This page is for managing calculator assumptions and defaults."
            : "Yeh page calculator ki assumptions aur defaults manage karne ke liye hai.";

        qs("adminTitle").textContent = isEn ? "Admin Settings" : "Admin Settings";
        qs("adminSubtitle").textContent = isEn
            ? "Manage default Daraz assumptions, language, and pricing behavior."
            : "Default Daraz assumptions, language, aur pricing behavior yahan manage karo.";

        qs("goToCalculatorBtn").textContent = isEn ? "Calculator" : "Calculator";
        qs("saveSettingsBtn").textContent = isEn ? "Save Settings" : "Settings Save Karo";
        qs("lockBtn").textContent = isEn ? "Lock" : "Lock";
        qs("resetSettingsBtn").textContent = isEn ? "Reset Settings" : "Settings Reset Karo";

        qs("variableRatesTitle").textContent = isEn ? "Variable Rates (%)" : "Variable Rates (%)";
        qs("variableRatesSubtitle").textContent = isEn
            ? "Percentage-based Daraz charges."
            : "Daraz ki percentage-based charges.";

        qs("commissionRateLabel").textContent = isEn ? "Commission %" : "Commission %";
        qs("paymentFeeRateLabel").textContent = isEn ? "Payment Fee %" : "Payment Fee %";
        qs("freeShippingRateLabel").textContent = isEn ? "Free Shipping Fee %" : "Free Shipping Fee %";
        qs("coinsRateLabel").textContent = isEn ? "Coins %" : "Coins %";
        qs("voucherRateLabel").textContent = isEn ? "Voucher %" : "Voucher %";
        qs("incomeTaxRateLabel").textContent = isEn ? "Income Tax %" : "Income Tax %";
        qs("salesTaxRateLabel").textContent = isEn ? "Sales Tax %" : "Sales Tax %";

        qs("fixedSettingsTitle").textContent = isEn ? "Fixed & Default Settings" : "Fixed & Default Settings";
        qs("fixedSettingsSubtitle").textContent = isEn
            ? "Pricing defaults and behavior rules."
            : "Pricing defaults aur behavior rules.";
        qs("handlingFeeLabel").textContent = isEn ? "Handling Fee" : "Handling Fee";
        qs("defaultShippingShortfallLabel").textContent = isEn ? "Default Shipping Shortfall" : "Default Shipping Shortfall";
        qs("defaultDiscountRateLabel").textContent = isEn ? "Default Discount %" : "Default Discount %";
        qs("defaultTargetMarginRateLabel").textContent = isEn ? "Default Target Margin %" : "Default Target Margin %";
        qs("defaultLanguageLabel").textContent = isEn ? "Default Language" : "Default Language";

        qs("settingsNote").textContent = isEn
            ? "Public calculator page uses these saved defaults automatically."
            : "Public calculator page yeh saved defaults automatically use karega.";

        qs("footerPoweredBy").textContent = "Powered by vweb.dev";
    }

    function fillForm() {
        qs("commissionRate").value = settings.commissionRate;
        qs("paymentFeeRate").value = settings.paymentFeeRate;
        qs("freeShippingRate").value = settings.freeShippingRate;
        qs("coinsRate").value = settings.coinsRate;
        qs("voucherRate").value = settings.voucherRate;
        qs("incomeTaxRate").value = settings.incomeTaxRate;
        qs("salesTaxRate").value = settings.salesTaxRate;
        qs("handlingFee").value = settings.handlingFee;
        qs("defaultShippingShortfall").value = settings.defaultShippingShortfall;
        qs("defaultDiscountRate").value = settings.defaultDiscountRate;
        qs("defaultTargetMarginRate").value = settings.defaultTargetMarginRate;
        qs("defaultLanguage").value = settings.defaultLanguage || "en";
    }

    function readForm() {
        settings = {
            ...settings,
            commissionRate: parseFloat(qs("commissionRate").value) || 0,
            paymentFeeRate: parseFloat(qs("paymentFeeRate").value) || 0,
            freeShippingRate: parseFloat(qs("freeShippingRate").value) || 0,
            coinsRate: parseFloat(qs("coinsRate").value) || 0,
            voucherRate: parseFloat(qs("voucherRate").value) || 0,
            incomeTaxRate: parseFloat(qs("incomeTaxRate").value) || 0,
            salesTaxRate: parseFloat(qs("salesTaxRate").value) || 0,
            handlingFee: parseFloat(qs("handlingFee").value) || 0,
            defaultShippingShortfall: parseFloat(qs("defaultShippingShortfall").value) || 0,
            defaultDiscountRate: parseFloat(qs("defaultDiscountRate").value) || 0,
            defaultTargetMarginRate: parseFloat(qs("defaultTargetMarginRate").value) || 0,
            defaultLanguage: qs("defaultLanguage").value || "en"
        };
    }

    function unlock() {
        const entered = qs("adminPassword").value;
        if (entered === adminPassword) {
            saveAuth(true);
            showAdmin();
        } else {
            alert(settings.defaultLanguage === "en" ? "Wrong password." : "Ghalat password.");
        }
    }

    function lockAdmin() {
        saveAuth(false);
        location.reload();
    }

    function saveAllSettings() {
        readForm();
        saveSettings(settings);
        applyTexts();
        alert(settings.defaultLanguage === "en" ? "Settings saved." : "Settings save ho gayi hain.");
    }

    function resetSettings() {
        const ok = confirm(
            settings.defaultLanguage === "en"
                ? "Reset admin settings to defaults?"
                : "Admin settings ko defaults par reset karna hai?"
        );

        if (!ok) return;

        settings = clone(defaultSettings);
        saveSettings(settings);
        fillForm();
        applyTexts();

        alert(settings.defaultLanguage === "en"
            ? "Settings reset to defaults."
            : "Settings defaults par reset ho gayi hain.");
    }

    function showAdmin() {
        qs("gateBox").style.display = "none";
        qs("adminApp").style.display = "block";
        settings = loadSettings() || clone(defaultSettings);
        fillForm();
        applyTexts();
    }

    function checkAccess() {
        if (loadAuth()) {
            showAdmin();
        } else {
            qs("gateBox").style.display = "block";
            qs("adminApp").style.display = "none";
            applyTexts();
        }
    }

    function bindEvents() {
        qs("unlockBtn").addEventListener("click", unlock);
        qs("saveSettingsBtn").addEventListener("click", saveAllSettings);
        qs("resetSettingsBtn").addEventListener("click", resetSettings);
        qs("lockBtn").addEventListener("click", lockAdmin);

        qs("defaultLanguage").addEventListener("change", () => {
            readForm();
            applyTexts();
        });
    }

    bindEvents();
    checkAccess();
})();