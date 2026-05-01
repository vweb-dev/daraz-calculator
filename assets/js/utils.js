/**
 * Daraz Calculator Pro - Enhanced Utilities Module v2.0
 * Advanced helper functions for performance, validation, and UX
 */
(function () {
  const { performance: perfConfig, limits } = window.APP_CONFIG;

  // ---------- DEBOUNCE & THROTTLE ----------
  
  function debounce(func, wait = perfConfig.debounceDelay) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function throttle(func, limit = perfConfig.throttleDelay) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // ---------- VALIDATION ----------
  
  function validatePrice(value, max = limits.maxPrice) {
    const num = parseFloat(value);
    if (isNaN(num)) return { valid: false, error: "Invalid number" };
    if (num < 0) return { valid: false, error: "Cannot be negative" };
    if (num > max) return { valid: false, error: `Exceeds maximum ${max}` };
    return { valid: true, value: Math.round(num * 100) / 100 };
  }

  function validateQuantity(value, max = limits.maxQuantity) {
    const num = parseInt(value, 10);
    if (isNaN(num)) return { valid: false, error: "Invalid number" };
    if (num < 1) return { valid: false, error: "Must be at least 1" };
    if (num > max) return { valid: false, error: `Exceeds maximum ${max}` };
    return { valid: true, value: num };
  }

  function validateSku(value, maxLength = limits.maxSkuLength) {
    if (!value || value.trim() === "") return { valid: false, error: "SKU is required" };
    if (value.length > maxLength) return { valid: false, error: `Exceeds ${maxLength} characters` };
    return { valid: true, value: value.trim() };
  }

  function sanitizeInput(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  // ---------- FORMATTING ----------
  
  function formatNumber(num, decimals = 2) {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  }

  function formatCurrencyCompact(amount) {
    if (amount >= 1000000) {
      return `PKR ${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 1000) {
      return `PKR ${(amount / 1000).toFixed(2)}K`;
    }
    return `PKR ${formatNumber(amount)}`;
  }

  function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatRelativeTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(isoString);
  }

  // ---------- PERFORMANCE ----------
  
  function measureExecution(label, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  }

  function lazyLoad(callback, threshold = perfConfig.lazyLoadThreshold) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: `${threshold}px` });
    
    return {
      observe: (element) => observer.observe(element),
      disconnect: () => observer.disconnect()
    };
  }

  // ---------- ANIMATION ----------
  
  function animateValue(element, start, end, duration = perfConfig.animationDuration) {
    const range = end - start;
    const startTime = performance.now();
    
    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (range * easeProgress);
      
      element.textContent = formatNumber(current);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    
    requestAnimationFrame(step);
  }

  function fadeIn(element, duration = 250) {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease-out`;
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      setTimeout(() => {
        element.style.transition = '';
      }, duration);
    });
  }

  function fadeOut(element, duration = 250) {
    return new Promise(resolve => {
      element.style.transition = `opacity ${duration}ms ease-out`;
      element.style.opacity = '0';
      setTimeout(() => {
        element.style.transition = '';
        resolve();
      }, duration);
    });
  }

  // ---------- DATA MANAGEMENT ----------
  
  function paginateArray(array, page = 1, pageSize = 10) {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return {
      items: array.slice(startIndex, endIndex),
      currentPage: page,
      totalPages: Math.ceil(array.length / pageSize),
      totalItems: array.length,
      hasMore: endIndex < array.length
    };
  }

  function searchArray(array, query, keys = []) {
    if (!query || query.trim() === '') return array;
    
    const searchTerm = query.toLowerCase().trim();
    return array.filter(item => {
      if (keys.length === 0) {
        return Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchTerm)
        );
      }
      return keys.some(key => 
        String(item[key]).toLowerCase().includes(searchTerm)
      );
    });
  }

  function sortArray(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const comparison = String(aVal).localeCompare(String(bVal));
      return order === 'asc' ? comparison : -comparison;
    });
  }

  // ---------- STORAGE HELPERS ----------
  
  function compressData(data) {
    try {
      const json = JSON.stringify(data);
      return btoa(encodeURIComponent(json));
    } catch (err) {
      console.error('Compression failed:', err);
      return null;
    }
  }

  function decompressData(compressed) {
    try {
      const json = decodeURIComponent(atob(compressed));
      return JSON.parse(json);
    } catch (err) {
      console.error('Decompression failed:', err);
      return null;
    }
  }

  function estimateStorageSize(data) {
    const json = JSON.stringify(data);
    return new Blob([json]).size;
  }

  function checkStorageQuota() {
    if (navigator.storage && navigator.storage.estimate) {
      return navigator.storage.estimate().then(estimate => ({
        usage: estimate.usage,
        quota: estimate.quota,
        percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2)
      }));
    }
    return Promise.resolve(null);
  }

  // ---------- MISC UTILITIES ----------
  
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    return new Promise((resolve, reject) => {
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        resolve();
      } catch (err) {
        document.body.removeChild(textArea);
        reject(err);
      }
    });
  }

  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  function isOnline() {
    return navigator.onLine;
  }

  // ---------- EXPORT ----------
  
  window.AppUtils = {
    // Debounce & Throttle
    debounce,
    throttle,
    
    // Validation
    validatePrice,
    validateQuantity,
    validateSku,
    sanitizeInput,
    
    // Formatting
    formatNumber,
    formatCurrencyCompact,
    formatDate,
    formatRelativeTime,
    
    // Performance
    measureExecution,
    lazyLoad,
    
    // Animation
    animateValue,
    fadeIn,
    fadeOut,
    
    // Data Management
    paginateArray,
    searchArray,
    sortArray,
    
    // Storage
    compressData,
    decompressData,
    estimateStorageSize,
    checkStorageQuota,
    
    // Misc
    generateUUID,
    copyToClipboard,
    downloadJSON,
    isMobile,
    isOnline
  };
})();
