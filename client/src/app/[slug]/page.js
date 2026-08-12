'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { businessAPI, scanAPI, feedbackAPI, suggestionsAPI } from '../../lib/api';
import { t, LANGUAGES } from '../../lib/constants';
import {
  Star, Copy, Check, ExternalLink, MessageCircle,
  Phone, MapPin, X, Gift, ChevronRight, RefreshCw, Sparkles
} from 'lucide-react';

// Universal cross-browser copy helper (works on iOS, Android, Windows, Mac, HTTP, HTTPS)
const copyToClipboard = async (text) => {
  if (!text) return false;
  let success = false;

  // 1. Modern API (HTTPS)
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      success = true;
    } catch (e) {
      success = false;
    }
  }

  // 2. Universal ExecCommand fallback (iOS, Android, HTTP, legacy webviews)
  if (!success && typeof document !== 'undefined') {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '-9999px';
      textArea.style.opacity = '0';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);

      if (navigator.userAgent.match(/ipad|iphone|ipod/i)) {
        const range = document.createRange();
        range.selectNodeContents(textArea);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        textArea.setSelectionRange(0, 999999);
      } else {
        textArea.select();
      }

      success = document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch (e) {
      success = false;
    }
  }

  return success;
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
  const [selectedSuggestion, setSelectedSuggestion] = useState('');
  const [copied, setCopied] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [refreshingSuggestions, setRefreshingSuggestions] = useState(false);

  // Generate / Refresh brand-new unique review suggestions
  const handleRefreshSuggestions = async () => {
    setRefreshingSuggestions(true);
    try {
      const category = business?.category || 'general';
      const res = await suggestionsAPI.getRandom(category, lang, {
        count: 5,
        businessName: business?.name || '',
        random: Math.random().toString(36).substring(7),
      });
      setSuggestions(res.data.suggestions || []);
      setSelectedSuggestion('');
      toast.success('Generated new review choices! ✨');
    } catch (e) {
      toast.error('Could not refresh reviews');
    } finally {
      setRefreshingSuggestions(false);
    }
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
      // Positive flow — load AI-tailored suggestions
      setPhase('positive');
      try {
        const category = business?.category || 'general';
        const res = await suggestionsAPI.getRandom(category, lang, {
          count: 5,
          businessName: business?.name || '',
        });
        setSuggestions(res.data.suggestions || []);
      } catch (e) {
        setSuggestions([]);
      }
    } else {
      // Negative flow — show feedback form
      setPhase('negative');
    }
  }, [scanId, business, lang]);

  // Handle selecting a review suggestion — auto-copy and open Google Review link
  const handleSelectSuggestion = async (s) => {
    setSelectedSuggestion(s);

    const isCopied = await copyToClipboard(s);
    if (isCopied) {
      setCopied(true);
      toast.success('Review Copied! 📋 Long-press on Google box to Paste 🚀', { duration: 4000 });
      setTimeout(() => setCopied(false), 4000);
    } else {
      toast.success('Opening Google Reviews 🚀');
    }

    if (scanId) {
      scanAPI.recordAction(scanId, { action: 'copied_review' }).catch(() => {});
      scanAPI.recordAction(scanId, { action: 'clicked_google' }).catch(() => {});
    }

    if (business?.googleReviewLink) {
      window.open(business.googleReviewLink, '_blank');
    }
  };

  // Copy review text manually
  const handleCopy = async () => {
    if (!selectedSuggestion) {
      toast.error('Please select a review first');
      return;
    }
    const isCopied = await copyToClipboard(selectedSuggestion);
    if (isCopied) {
      setCopied(true);
      toast.success('Review Copied! 📋 Long-press on Google box to Paste');
      setTimeout(() => setCopied(false), 4000);
    } else {
      toast.error('Failed to copy');
    }
  };

  // Handle Google review click
  const handleGoogleClick = () => {
    if (scanId) {
      scanAPI.recordAction(scanId, { action: 'clicked_google' }).catch(() => {});
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
        scanAPI.recordAction(scanId, { action: 'submitted_feedback' }).catch(() => {});
      }
      setPhase('thanks');
      toast.success(t('feedback_thanks', lang));
    } catch {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="review-page" style={{ justifyContent: 'center' }}>
        <div className="spinner" style={{ borderTopColor: 'white' }}></div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="review-page" style={{ justifyContent: 'center' }}>
        <div className="review-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
          <h2 className="review-title">Business Not Found</h2>
          <p className="review-subtitle">This review page doesn't exist or has been deactivated.</p>
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
            onClick={() => setLang(l.code)}
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
              <img src={business.logo} alt={business.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
            ) : (
              business.name.charAt(0).toUpperCase()
            )}
          </div>
          <h1 className="review-title">{business.name}</h1>

          {phase === 'rating' && (
            <>
              <p className="review-subtitle">{t('rating_title', lang)}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: 4 }}>
                {t('tap_stars', lang)}
              </p>
            </>
          )}
          {phase === 'positive' && (
            <>
              <p className="review-subtitle" style={{ color: 'var(--emerald-600)', fontWeight: 600 }}>
                {t('positive_title', lang)}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: 4 }}>
                {t('positive_subtitle', lang)}
              </p>
            </>
          )}
          {phase === 'negative' && (
            <>
              <p className="review-subtitle" style={{ fontWeight: 600 }}>
                {t('negative_title', lang)}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: 4 }}>
                {t('negative_subtitle', lang)}
              </p>
            </>
          )}
          {phase === 'thanks' && (
            <>
              <p className="review-subtitle" style={{ color: 'var(--emerald-600)', fontWeight: 600 }}>
                {t('feedback_thanks', lang)}
              </p>
            </>
          )}
        </div>

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

        {/* ── POSITIVE FLOW ── */}
        {phase === 'positive' && (
          <div className="animate-fade-in-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: '0.75rem' }}>
                  <Sparkles size={12} /> AI Tailored Reviews
                </span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleRefreshSuggestions}
                disabled={refreshingSuggestions}
                style={{ fontSize: '0.8rem', padding: '4px 8px', color: 'var(--primary-600)' }}
              >
                <RefreshCw size={13} className={refreshingSuggestions ? 'spin' : ''} style={{ animation: refreshingSuggestions ? 'spin 1s linear infinite' : 'none' }} />
                {refreshingSuggestions ? 'Generating...' : 'Refresh Reviews'}
              </button>
            </div>

            {suggestions.length > 0 && (
              <>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: 10 }}>
                  {t('pick_suggestion', lang)}
                </p>
                <div className="suggestion-list">
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className={`suggestion-item ${selectedSuggestion === s ? 'selected' : ''}`}
                      onClick={() => handleSelectSuggestion(s)}
                    >
                      <div className="suggestion-radio"></div>
                      <span className="suggestion-text">{s}</span>
                    </div>
                  ))}
                </div>

                {copied && (
                  <div style={{
                    background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46',
                    padding: '10px 14px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600,
                    marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <span>📋 <strong>Copied to Clipboard!</strong> Long-press (tap & hold) the text box on Google to <strong>Paste</strong>.</span>
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

            {/* Google Review Button — Always visible (policy compliant) */}
            <a
              href={business.googleReviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="google-review-btn"
              onClick={handleGoogleClick}
            >
              <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t('write_google_review', lang)}
              <ExternalLink size={16} style={{ opacity: 0.5 }} />
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

            {/* Google Review — Always available (policy compliant) */}
            <div className="feedback-divider">{t('also_review', lang)}</div>
            <a
              href={business.googleReviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="google-review-btn"
              onClick={handleGoogleClick}
            >
              <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t('write_google_review', lang)}
              <ExternalLink size={16} style={{ opacity: 0.5 }} />
            </a>
          </div>
        )}

        {/* ── THANK YOU ── */}
        {phase === 'thanks' && (
          <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🙏</div>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem' }}>
              {t('feedback_thanks', lang)}
            </p>
            {/* Still show Google review option */}
            <a
              href={business.googleReviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="google-review-btn"
              style={{ marginTop: 20 }}
              onClick={handleGoogleClick}
            >
              <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
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
