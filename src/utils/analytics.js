/**
 * Google Analytics Integration
 * Supports both Firebase Analytics and Google Analytics 4 (GA4)
 */

// Configuration
const GA_MEASUREMENT_ID = window.GA_MEASUREMENT_ID || import.meta.env.VITE_GA_MEASUREMENT_ID;
const USE_FIREBASE_ANALYTICS = window.USE_FIREBASE_ANALYTICS !== false;

/**
 * Initialize Google Analytics
 */
export function initAnalytics() {
  // Firebase Analytics (if available)
  if (USE_FIREBASE_ANALYTICS && typeof firebase !== 'undefined' && firebase.analytics) {
    try {
      firebase.analytics();
      console.log('Firebase Analytics initialized');
      return 'firebase';
    } catch (error) {
      console.warn('Firebase Analytics initialization failed:', error);
    }
  }

  // Google Analytics 4 (if Measurement ID provided)
  if (GA_MEASUREMENT_ID) {
    try {
      // Load gtag.js
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script1);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID, {
        page_path: window.location.pathname,
        anonymize_ip: true,
      });

      console.log('Google Analytics 4 initialized:', GA_MEASUREMENT_ID);
      return 'ga4';
    } catch (error) {
      console.warn('Google Analytics initialization failed:', error);
    }
  }

  console.warn('No analytics configured');
  return null;
}

/**
 * Track page view
 */
export function trackPageView(path) {
  const pagePath = path || window.location.pathname;

  // Firebase Analytics
  if (typeof firebase !== 'undefined' && firebase.analytics) {
    try {
      firebase.analytics().logEvent('page_view', {
        page_path: pagePath,
      });
    } catch (error) {
      console.warn('Firebase Analytics page view failed:', error);
    }
  }

  // Google Analytics 4
  if (window.gtag) {
    try {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: pagePath,
      });
    } catch (error) {
      console.warn('GA4 page view failed:', error);
    }
  }
}

/**
 * Track custom event
 */
export function trackEvent(eventName, eventParams = {}) {
  // Firebase Analytics
  if (typeof firebase !== 'undefined' && firebase.analytics) {
    try {
      firebase.analytics().logEvent(eventName, eventParams);
    } catch (error) {
      console.warn('Firebase Analytics event failed:', error);
    }
  }

  // Google Analytics 4
  if (window.gtag) {
    try {
      window.gtag('event', eventName, eventParams);
    } catch (error) {
      console.warn('GA4 event failed:', error);
    }
  }
}

/**
 * Track assessment started
 */
export function trackAssessmentStarted() {
  trackEvent('assessment_started', {
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track assessment completed
 */
export function trackAssessmentCompleted(archetypeId, archetypeName) {
  trackEvent('assessment_completed', {
    archetype_id: archetypeId,
    archetype_name: archetypeName,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track email collected
 */
export function trackEmailCollected() {
  trackEvent('email_collected', {
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track results shared
 */
export function trackResultsShared(platform, archetypeId, archetypeName) {
  trackEvent('results_shared', {
    platform: platform, // 'twitter', 'facebook', 'linkedin', 'copy_link', etc.
    archetype_id: archetypeId,
    archetype_name: archetypeName,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track archetype result (anonymized)
 */
export function trackArchetypeResult(archetypeId, archetypeName) {
  trackEvent('archetype_result', {
    archetype_id: archetypeId,
    archetype_name: archetypeName,
    // Note: No personal data included
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track question answered
 */
export function trackQuestionAnswered(questionId, domain, answer) {
  trackEvent('question_answered', {
    question_id: questionId,
    domain: domain,
    answer: answer, // Scale value (1-5)
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track domain completed
 */
export function trackDomainCompleted(domain) {
  trackEvent('domain_completed', {
    domain: domain,
    timestamp: new Date().toISOString(),
  });
}

