'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { businessAPI, scanAPI, feedbackAPI, suggestionsAPI } from '../../lib/api';
import { t, LANGUAGES } from '../../lib/constants';
import { Testimonial } from '../../components/ui/testimonial-card';
import {
  Star, Copy, Check, ExternalLink, MessageCircle,
  Phone, MapPin, X, Gift, ChevronRight, RefreshCw, Sparkles
} from 'lucide-react';

// ─── Bullet-proof cross-platform clipboard helper ───────────────────────────
// Works on: iOS Safari / WKWebView, Android Chrome, Desktop Chrome/Firefox/Edge/Safari
// Works over: HTTPS, HTTP (localhost), and in-app browsers
const copyToClipboard = async (text) => {
  if (!text) return false;

  // Strategy 1 — ClipboardItem API (most reliable on iOS Safari 13.4+)
  // This is the ONLY method that works reliably inside iOS Safari's
  // strict user-gesture clipboard security model.
  if (typeof ClipboardItem !== 'undefined' && navigator?.clipboard?.write) {
    try {
      const blob = new Blob([text], { type: 'text/plain' });
      const item = new ClipboardItem({ 'text/plain': blob });
      await navigator.clipboard.write([item]);
      return true;
    } catch (_) { /* fall through */ }
  }

  // Strategy 2 — navigator.clipboard.writeText (HTTPS only, desktop browsers)
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) { /* fall through */ }
  }

  // Strategy 3 — Invisible textarea + execCommand (HTTP, Android WebView, legacy)
  if (typeof document !== 'undefined') {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      // Must be on-screen for iOS — position off-viewport but visible
      ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:none;outline:none;box-shadow:none;background:transparent;opacity:0.01;';
      ta.setAttribute('readonly', '');            // prevent keyboard flash on mobile
      ta.setAttribute('contenteditable', 'true'); // needed for some iOS webviews
      document.body.appendChild(ta);

      const isIOS = /ipad|iphone|ipod/i.test(navigator.userAgent);
      if (isIOS) {
        // iOS requires range-based selection, not .select()
        const range = document.createRange();
        range.selectNodeContents(ta);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        ta.setSelectionRange(0, text.length); // double-ensure
      } else {
        ta.focus();
        ta.select();
      }

      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) return true;
    } catch (_) { /* fall through */ }
  }

  return false;
};

// Helper: copy text, then open a URL after a short delay so the clipboard
// write is fully committed before the browser switches tabs / contexts.
const copyThenOpen = (text, url) => {
  // Start with a synchronous copy attempt so it runs within the user gesture
  const copyPromise = copyToClipboard(text);

  if (url) {
    // Opening synchronously keeps browsers from treating it as a popup.
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return copyPromise;
};

export default function ReviewPage() {
  const params = useParams();
  const slug = params.slug;

  // State
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState('en');
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [scanId, setScanId] = useState(null);
  const [phase, setPhase] = useState('rating'); // rating | positive | negative | thanks
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionState, setSuggestionState] = useState('idle'); // idle | loading | ready | error
  const [suggestionSource, setSuggestionSource] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState('');
  const [copied, setCopied] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [refreshingSuggestions, setRefreshingSuggestions] = useState(false);

  const loadSuggestions = useCallback(async (requestedLanguage = lang, showRefreshState = false) => {
    if (!business) return;

    setSuggestionState('loading');
    setSuggestions([]);
    setSelectedSuggestion('');
    setCopied(false);
    if (showRefreshState) setRefreshingSuggestions(true);

    try {
      const category = business?.category || 'general';
      const res = await suggestionsAPI.getRandom(category, requestedLanguage, {
        count: 5,
        businessName: business?.name || '',
        random: Math.random().toString(36).substring(7),
      });
      const nextSuggestions = res.data.suggestions || [];
      setSuggestions(nextSuggestions);
      setSuggestionSource(res.data.source || '');
      setSuggestionState(nextSuggestions.length ? 'ready' : 'error');
      if (showRefreshState && nextSuggestions.length) toast.success('New review drafts are ready.');
    } catch {
      setSuggestionState('error');
      if (showRefreshState) toast.error('Could not refresh review drafts.');
    } finally {
      if (showRefreshState) setRefreshingSuggestions(false);
    }
  }, [business, lang]);

  // Generate brand-new review drafts without losing the selected language.
  const handleRefreshSuggestions = () => loadSuggestions(lang, true);

  const handleLanguageChange = (nextLanguage) => {
    setLang(nextLanguage);
    if (phase === 'positive') loadSuggestions(nextLanguage, false);
  };

  // Feedback form
  const [feedbackForm, setFeedbackForm] = useState({
    name: '', phone: '', message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Load business data
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await businessAPI.getBySlug(slug);
        const biz = res.data.business;
        setBusiness(biz);
        setLang(biz.defaultLanguage || 'en');

        // Record scan safely
        try {
          const scanRes = await scanAPI.record({
            businessId: biz._id,
            language: biz.defaultLanguage || 'en',
          });
          if (scanRes?.data?.scan?._id) {
            setScanId(scanRes.data.scan._id);
          }
        } catch (e) {
          // Silent fallback if scan tracking fails
        }

        // Show offer popup if enabled
        if (biz.offer?.enabled && biz.offer?.title) {
          setTimeout(() => setShowOffer(true), 1000);
        }
      } catch (err) {
        setError('Business not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchBusiness();
  }, [slug]);

  // Handle star selection
  const handleRating = useCallback(async (value) => {
    setRating(value);

    // Record the rating action
    if (scanId) {
      try {
        await scanAPI.recordAction(scanId, { action: 'rated', rating: value });
      } catch (e) { /* silent */ }
    }

    if (value >= 4) {
      // Positive flow — load tailored, editable review drafts.
      setPhase('positive');
      loadSuggestions(lang, false);
    } else {
      // Negative flow — show feedback form
      setPhase('negative');
    }
  }, [scanId, business, lang, loadSuggestions]);

  // Handle selecting a review suggestion — auto-copy and open Google Review link
  const handleSelectSuggestion = async (s) => {
    setSelectedSuggestion(s);

    // Copy text first, then open Google after a small delay so the
    // clipboard write completes before the browser switches context.
    const ok = await copyThenOpen(s, business?.googleReviewLink);

    if (ok) {
      setCopied(true);
      toast.success('Review Copied! 📋 Just tap & hold on Google to Paste ✨', { duration: 5000 });
    } else {
      // Clipboard write failed — show the text so user can copy manually
      toast('Tap "Copy Review" button below, then paste on Google', { icon: '📝', duration: 5000 });
    }

    if (scanId) {
      scanAPI.recordAction(scanId, { action: 'copied_review' }).catch(() => { });
      scanAPI.recordAction(scanId, { action: 'clicked_google' }).catch(() => { });
    }
  };

  // Copy review text manually
  const handleCopy = async (e) => {
    if (e) e.preventDefault();
    if (!selectedSuggestion) {
      toast.error('Please select a review first');
      return;
    }
    const ok = await copyToClipboard(selectedSuggestion);
    if (ok) {
      setCopied(true);
      toast.success('Review Copied! 📋 Long-press on Google to Paste');
      setTimeout(() => setCopied(false), 4000);
    } else {
      toast.error('Copy failed — please select the text manually');
    }
  };

  // Handle Google review click
  const handleGoogleClick = () => {
    if (scanId) {
      scanAPI.recordAction(scanId, { action: 'clicked_google' }).catch(() => { });
    }
  };

  // Submit feedback
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.name || !feedbackForm.phone || !feedbackForm.message) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      await feedbackAPI.submit({
        businessId: business._id,
        scanId,
        rating,
        ...feedbackForm,
      });
      if (scanId) {
        scanAPI.recordAction(scanId, { action: 'submitted_feedback' }).catch(() => { });
      }
      setPhase('thanks');
      toast.success(t('feedback_thanks', lang));
    } catch {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Compute current step for the progress indicator
  const currentStep = phase === 'rating' ? 1 : (phase === 'positive' ? 2 : phase === 'thanks' ? 3 : 2);

  // Google icon SVG component (reused in multiple places)
  const GoogleIcon = () => (
    <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  // ─── Render ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="review-page" style={{ justifyContent: 'center' }}>
        <div className="spinner" style={{ borderTopColor: '#4f46e5' }}></div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="review-page" style={{ justifyContent: 'center' }}>
        <div className="review-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🔍</div>
          <h2 className="review-title">Business Not Found</h2>
          <p className="review-subtitle">This review page doesn&#39;t exist or has been deactivated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-page">
      {/* Language Switcher */}
      <div className="lang-switcher">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            className={`lang-btn ${lang === l.code ? 'active' : ''}`}
            onClick={() => handleLanguageChange(l.code)}
          >
            {l.short}
          </button>
        ))}
      </div>

      {/* Main Card */}
      <div className="review-card">
        {/* Header */}
        <div className="review-header">
          <div className="review-logo">
            {business.logo ? (
              <img src={business.logo} alt={business.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
            ) : (
              business.name.charAt(0).toUpperCase()
            )}
          </div>
          <h1 className="review-title">{business.name}</h1>

          {phase === 'rating' && (
            <>
              <p className="review-subtitle">{t('rating_title', lang)}</p>
              <p style={{ fontSize: '0.8rem', color: '#71717a', marginTop: 4 }}>
                {t('tap_stars', lang)}
              </p>
            </>
          )}
          {phase === 'positive' && (
            <>
              <p className="review-subtitle" style={{ color: '#fbbf24', fontWeight: 600 }}>
                {t('positive_title', lang)}
              </p>
              <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: 4 }}>
                {t('positive_subtitle', lang)}
              </p>
            </>
          )}
          {phase === 'negative' && (
            <>
              <p className="review-subtitle" style={{ fontWeight: 600, color: '#f87171' }}>
                {t('negative_title', lang)}
              </p>
              <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: 4 }}>
                {t('negative_subtitle', lang)}
              </p>
            </>
          )}
          {phase === 'thanks' && (
            <p className="review-subtitle" style={{ color: '#34d399', fontWeight: 600 }}>
              {t('feedback_thanks', lang)}
            </p>
          )}
        </div>

        {/* Step Progress Indicator */}
        {phase !== 'negative' && phase !== 'thanks' && (
          <div className="step-progress">
            <div style={{ textAlign: 'center' }}>
              <div className={`step-dot ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'inactive'}`}>
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <div className="step-label">Rate</div>
            </div>
            <div className={`step-line ${currentStep > 1 ? 'active' : ''}`}></div>
            <div style={{ textAlign: 'center' }}>
              <div className={`step-dot ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'inactive'}`}>
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <div className="step-label">Pick</div>
            </div>
            <div className={`step-line ${currentStep > 2 ? 'active' : ''}`}></div>
            <div style={{ textAlign: 'center' }}>
              <div className={`step-dot ${currentStep === 3 ? 'active' : 'inactive'}`}>3</div>
              <div className="step-label">Post</div>
            </div>
          </div>
        )}

        {/* Star Rating */}
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`star-btn ${rating >= star ? 'active' : ''}`}
              onClick={() => phase === 'rating' && handleRating(star)}
              onMouseEnter={() => phase === 'rating' && setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              disabled={phase !== 'rating'}
              aria-label={`Rate ${star} stars`}
            >
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  className={(hoveredStar >= star || rating >= star) ? 'star-filled' : 'star-empty'}
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
            </button>
          ))}
        </div>

        {/* Dynamic Star Emotion Label */}
        {(hoveredStar > 0 || rating > 0) && (
          <div className="star-emotion-container">
            <div className="star-emotion-badge">
              {t(`star_${hoveredStar || rating}_emotion`, lang)}
            </div>
          </div>
        )}

        {/* ── POSITIVE FLOW ── */}
        {phase === 'positive' && (
          <div className="animate-fade-in-up">
            {/* AI badge + Refresh */}
            <div className="review-toolbar">
              <span className="ai-badge">
                <Sparkles size={12} /> {suggestionSource === 'gemini' ? 'AI-assisted drafts' : 'Review drafts'}
              </span>
              <button
                className="refresh-btn"
                onClick={handleRefreshSuggestions}
                disabled={refreshingSuggestions}
              >
                <RefreshCw size={13} style={{ animation: refreshingSuggestions ? 'spin 1s linear infinite' : 'none' }} />
                {refreshingSuggestions ? 'Generating...' : 'Refresh'}
              </button>
            </div>

            {/* Shimmer loading state */}
            {suggestionState === 'loading' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="shimmer-card" style={{ animationDelay: `${i * 0.2}s` }}></div>
                ))}
              </div>
            )}

            {suggestionState === 'error' && (
              <div className="suggestion-error" role="status">
                <p>We could not load review drafts right now.</p>
                <button type="button" className="refresh-btn" onClick={handleRefreshSuggestions}>
                  Try again
                </button>
              </div>
            )}

            {suggestionState === 'ready' && suggestions.length > 0 && (
              <>
                <p className="suggestion-heading">
                  {t('pick_suggestion', lang)}
                </p>
                <p className="suggestion-helper">Choose a draft, then personalize it so it reflects your experience.</p>
                <div className="suggestion-list">
                  {suggestions.map((s, i) => (
                    <Testimonial
                      key={i}
                      className="suggestion-item"
                      selected={selectedSuggestion === s}
                      testimonial={s}
                      rating={rating}
                      tabIndex={0}
                      interactiveRole="button"
                      aria-pressed={selectedSuggestion === s}
                      aria-label={`Select review draft ${i + 1}`}
                      onClick={() => handleSelectSuggestion(s)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleSelectSuggestion(s);
                        }
                      }}
                    />
                  ))}
                </div>

                {copied && (
                  <div className="copied-banner">
                    <span>📋</span>
                    <span><strong>Copied!</strong> Long-press the text box on Google to <strong>Paste</strong>.</span>
                  </div>
                )}

                <button
                  className={`copy-btn ${copied ? 'copied' : ''}`}
                  onClick={handleCopy}
                  disabled={!selectedSuggestion}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? '✓ Copied to Clipboard!' : t('copy_review', lang)}
                </button>
              </>
            )}

            {/* Google Review Button — Pulses when review is copied */}
            <a
              href={business.googleReviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`google-review-btn ${copied ? 'pulse-glow' : ''}`}
              onClick={handleGoogleClick}
            >
              <GoogleIcon />
              {t('write_google_review', lang)}
              <ExternalLink size={15} style={{ opacity: 0.4 }} />
            </a>
          </div>
        )}

        {/* ── NEGATIVE FLOW ── */}
        {phase === 'negative' && (
          <div className="feedback-section">
            <form onSubmit={handleFeedbackSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('your_name', lang)}
                  value={feedbackForm.name}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  className="form-input"
                  placeholder={t('your_phone', lang)}
                  value={feedbackForm.phone}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  className="form-input form-textarea"
                  placeholder={t('your_message', lang)}
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitting}>
                {submitting ? (
                  <span className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></span>
                ) : (
                  t('submit_feedback', lang)
                )}
              </button>
            </form>

            {/* Google Review — Always available */}
            <div className="feedback-divider">{t('also_review', lang)}</div>
            <a
              href={business.googleReviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="google-review-btn"
              onClick={handleGoogleClick}
            >
              <GoogleIcon />
              {t('write_google_review', lang)}
              <ExternalLink size={15} style={{ opacity: 0.4 }} />
            </a>
          </div>
        )}

        {/* ── THANK YOU ── */}
        {phase === 'thanks' && (
          <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: '24px 0' }}>
            <div className="thanks-emoji">🙏</div>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {t('feedback_thanks', lang)}
            </p>
            <a
              href={business.googleReviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="google-review-btn"
              style={{ marginTop: 24 }}
              onClick={handleGoogleClick}
            >
              <GoogleIcon />
              {t('write_google_review', lang)}
            </a>
          </div>
        )}

        {/* ── Action Buttons (WhatsApp, Call, Directions) ── */}
        {(business.whatsappNumber || business.phone || business.googleMapsLink) && (
          <div className="action-buttons" style={{ marginTop: phase === 'rating' ? 8 : 20 }}>
            {business.whatsappNumber && (
              <a
                href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn action-btn-whatsapp"
              >
                <MessageCircle size={16} />
                {t('whatsapp', lang)}
              </a>
            )}
            {business.phone && (
              <a href={`tel:${business.phone}`} className="action-btn action-btn-call">
                <Phone size={16} />
                {t('call', lang)}
              </a>
            )}
            {business.googleMapsLink && (
              <a
                href={business.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn action-btn-maps"
              >
                <MapPin size={16} />
                {t('directions', lang)}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Powered By */}
      <p className="powered-by">{t('powered_by', lang)}</p>

      {/* ── Offer Popup ── */}
      {showOffer && business.offer?.enabled && (
        <div className="offer-overlay" onClick={() => setShowOffer(false)}>
          <div className="offer-card" onClick={(e) => e.stopPropagation()}>
            <button className="offer-close" onClick={() => setShowOffer(false)}>
              <X size={16} />
            </button>
            <div className="offer-emoji">🎁</div>
            <h3 className="offer-title">{business.offer.title}</h3>
            <p className="offer-description">{business.offer.description}</p>
            <button
              className="btn btn-primary btn-lg btn-full"
              onClick={() => setShowOffer(false)}
            >
              {t('offer_cta', lang)} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
