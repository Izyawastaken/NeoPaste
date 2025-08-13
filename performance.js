// Performance monitoring and optimization utilities
(function() {
  'use strict';

  // Performance monitoring
  if ('performance' in window && 'mark' in performance) {
    performance.mark('neopaste-start');
  }

  // Auto-run performance audit when page loads
  window.addEventListener('load', function() {
    // Give a short delay to ensure everything is fully loaded
    setTimeout(runPerformanceAudit, 1000);
  });

  function runPerformanceAudit() {
    console.log('%c🚀 NeoPaste Performance Audit Results', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
    console.log('=' .repeat(50));
    
    // Core Web Vitals and Performance Metrics
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      if (navigation) {
        console.log('%c📊 Core Performance Metrics:', 'color: #FF9800; font-weight: bold;');
        console.log(`• DOM Content Loaded: ${Math.round(navigation.domContentLoadedEventEnd)}ms`);
        console.log(`• Load Complete: ${Math.round(navigation.loadEventEnd)}ms`);
        console.log(`• DNS Lookup: ${Math.round(navigation.domainLookupEnd - navigation.domainLookupStart)}ms`);
        console.log(`• Server Response: ${Math.round(navigation.responseEnd - navigation.requestStart)}ms`);
        console.log(`• DOM Processing: ${Math.round(navigation.domInteractive - navigation.responseEnd)}ms`);
      }
      
      if (paint.length > 0) {
        console.log('%c🎨 Paint Metrics:', 'color: #2196F3; font-weight: bold;');
        paint.forEach(entry => {
          console.log(`• ${entry.name}: ${Math.round(entry.startTime)}ms`);
        });
      }
      
      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = performance.memory;
        console.log('%c💾 Memory Usage:', 'color: #9C27B0; font-weight: bold;');
        console.log(`• Used: ${Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100}MB`);
        console.log(`• Total: ${Math.round(memory.totalJSHeapSize / 1024 / 1024 * 100) / 100}MB`);
        console.log(`• Limit: ${Math.round(memory.jsHeapSizeLimit / 1024 / 1024 * 100) / 100}MB`);
      }
    }
    
    // Resource analysis
    analyzeResources();
    
    // Performance score estimation
    calculatePerformanceScore();
  }

  function analyzeResources() {
    const resources = performance.getEntriesByType('resource');
    const resourceTypes = {};
    let totalSize = 0;
    
    resources.forEach(resource => {
      const type = getResourceType(resource.name);
      if (!resourceTypes[type]) {
        resourceTypes[type] = { count: 0, totalTime: 0 };
      }
      resourceTypes[type].count++;
      resourceTypes[type].totalTime += resource.duration;
      if (resource.transferSize) {
        totalSize += resource.transferSize;
      }
    });
    
    console.log('%c📦 Resource Analysis:', 'color: #FF5722; font-weight: bold;');
    Object.entries(resourceTypes).forEach(([type, data]) => {
      console.log(`• ${type}: ${data.count} files, avg ${Math.round(data.totalTime / data.count)}ms`);
    });
    
    if (totalSize > 0) {
      console.log(`• Total Transfer Size: ${Math.round(totalSize / 1024 * 100) / 100}KB`);
    }
  }

  function getResourceType(url) {
    if (url.includes('.css')) return 'CSS';
    if (url.includes('.js')) return 'JavaScript';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.gif') || url.includes('.webp')) return 'Images';
    if (url.includes('font')) return 'Fonts';
    return 'Other';
  }

  function calculatePerformanceScore() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    if (!navigation) return;
    
    let score = 100;
    const loadTime = navigation.loadEventEnd;
    const fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
    
    // Scoring based on Core Web Vitals thresholds
    if (fcp > 1800) score -= 20;
    else if (fcp > 1000) score -= 10;
    
    if (loadTime > 4000) score -= 30;
    else if (loadTime > 2500) score -= 15;
    
    const resourceCount = performance.getEntriesByType('resource').length;
    if (resourceCount > 50) score -= 15;
    else if (resourceCount > 25) score -= 5;
    
    console.log('%c⚡ Performance Score:', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
    console.log(`${score}/100 ${getPerformanceGrade(score)}`);
    
    if (score < 70) {
      console.log('%c💡 Recommendations:', 'color: #FFC107; font-weight: bold;');
      if (fcp > 1800) console.log('• Optimize First Contentful Paint (reduce CSS/JS blocking)');
      if (loadTime > 4000) console.log('• Reduce total page load time');
      if (resourceCount > 50) console.log('• Reduce number of HTTP requests');
    }
    
    console.log('=' .repeat(50));
  }

  function getPerformanceGrade(score) {
    if (score >= 90) return '🏆 Excellent';
    if (score >= 75) return '✅ Good';
    if (score >= 60) return '⚠️ Needs Improvement';
    return '❌ Poor';
  }

  // Original performance optimization code
  const criticalTasks = [];
  
  // Optimize font loading
  if ('fonts' in document) {
    criticalTasks.push(
      document.fonts.load('400 1rem Fredoka'),
      document.fonts.load('600 1rem Fredoka')
    );
  }

  // Preload critical images - only if actually needed
  function preloadCriticalImages() {
    console.log('Image preloading will be handled by the application');
  }

  // Optimize viewport rendering
  function optimizeViewport() {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
    if (!document.querySelector('meta[name="viewport"]')) {
      document.head.appendChild(meta);
    }
  }

  // Memory cleanup utility
  function setupMemoryCleanup() {
    let cleanupTimer;
    
    function cleanup() {
      // Clean up cached API responses older than 5 minutes
      if (window.apiCache) {
        const now = Date.now();
        for (const [key, value] of window.apiCache.entries()) {
          if (value.timestamp && now - value.timestamp > 300000) {
            window.apiCache.delete(key);
          }
        }
      }
      
      // Schedule next cleanup
      cleanupTimer = setTimeout(cleanup, 300000); // 5 minutes
    }
    
    // Start cleanup cycle
    cleanupTimer = setTimeout(cleanup, 300000);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      clearTimeout(cleanupTimer);
    });
  }

  // Performance observer for Core Web Vitals (less verbose)
  function setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Only log critical performance metrics to reduce console noise
          if (entry.name && (entry.name.includes('neopaste') || entry.name.includes('critical'))) {
            if (entry.value && entry.value > 0) {
              console.log(`${entry.name}: ${Math.round(entry.value)}ms`);
            } else if (entry.startTime && entry.startTime > 0) {
              console.log(`${entry.name}: ${Math.round(entry.startTime)}ms`);
            }
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (e) {
        // PerformanceObserver not supported for these entry types
        console.log('Performance Observer not fully supported');
      }
    }
  }

  // Intersection Observer for lazy loading
  function setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });
      
      // Observe all images with data-src
      document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('img[data-src]').forEach(img => {
          imageObserver.observe(img);
        });
      });
    }
  }

  // Initialize optimizations
  document.addEventListener('DOMContentLoaded', () => {
    Promise.all(criticalTasks).then(() => {
      // All critical resources loaded
      if ('performance' in window && 'mark' in performance) {
        try {
          performance.mark('neopaste-critical-loaded');
          // Check if start mark exists before measuring
          const marks = performance.getEntriesByName('neopaste-start');
          if (marks.length > 0) {
            performance.measure('neopaste-critical-time', 'neopaste-start', 'neopaste-critical-loaded');
          }
        } catch (e) {
          console.log('Performance measurement not supported');
        }
      }
    });

    preloadCriticalImages();
    setupMemoryCleanup();
    setupPerformanceObserver();
    setupIntersectionObserver();
    
    // Mark as fully loaded
    window.addEventListener('load', () => {
      if ('performance' in window && 'mark' in performance) {
        try {
          performance.mark('neopaste-loaded');
          // Check if start mark exists before measuring
          const marks = performance.getEntriesByName('neopaste-start');
          if (marks.length > 0) {
            performance.measure('neopaste-total-time', 'neopaste-start', 'neopaste-loaded');
          }
        } catch (e) {
          console.log('Performance measurement not supported');
        }
      }
    });
  });

  // Service Worker registration for caching (improved compatibility)
  if ('serviceWorker' in navigator) {
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const isHTTPS = location.protocol === 'https:';
    const isFile = location.protocol === 'file:';
    const canUseSW = isHTTPS || isLocalhost;
    
    if (canUseSW) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js', { scope: './' })
          .then(registration => {
            console.log('✅ SW registered successfully:', registration.scope);
            
            registration.addEventListener('updatefound', () => {
              console.log('🔄 SW update found');
            });
          })
          .catch(error => {
            console.warn('❌ SW registration failed:', error.message);
            // Continue without caching - not critical for functionality
          });
      });
    } else if (isFile) {
      console.info('ℹ️ Service Worker not available: File protocol not supported. Try using a local server.');
    } else {
      console.info('ℹ️ Service Worker not available: Requires HTTPS or localhost');
    }
  } else {
    console.info('ℹ️ Service Worker not supported in this browser');
  }

  // Expose performance utilities (improved preloading)
  window.NeoPastePerformance = {
    preloadImage: (url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      // Add crossorigin for CORS resources
      if (url.includes('://') && !url.startsWith(location.origin)) {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    },
    
    measurePerformance: () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
        };
      }
      return null;
    }
  };

  // Initialize viewport optimization immediately
  optimizeViewport();

})();
