/**
 * Produces editable review drafts. Gemini is used when configured, but every
 * request has a local, multilingual fallback so the scan flow never depends on
 * an external model being available.
 */

const MAX_REVIEW_LENGTH = 500;

const generateAiReviews = async ({ businessName = 'this business', category = 'general', keywords = '', language = 'en' }) => {
  const context = {
    businessName: cleanPromptValue(businessName, 120) || 'this business',
    category: cleanPromptValue(category, 40) || 'general',
    keywords: cleanPromptValue(keywords, 180),
    language: ['en', 'hi', 'gu'].includes(language) ? language : 'en',
    timestamp: Date.now(),
  };

  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = require('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: createPrompt(context),
        config: {
          temperature: 0.95, // High randomness for real-time unique reviews every scan
          maxOutputTokens: 900,
          responseMimeType: 'application/json',
        },
      });

      const suggestions = parseReviewArray(response.text);
      if (suggestions.length >= 3) {
        return { suggestions, source: 'gemini' };
      }
    } catch (error) {
      console.warn('Gemini generation unavailable; using dynamic local review drafts:', error.message);
    }
  }

  return {
    suggestions: createLocalReviewDrafts(context),
    source: 'templates',
  };
};

function createPrompt({ businessName, category, keywords, language }) {
  const languageName = { en: 'English', hi: 'Hindi', gu: 'Gujarati' }[language];
  return `Create five short, editable review drafts for a customer to personalize after a real visit.

Business name: "${businessName}"
Category: "${category}"
Optional highlights: "${keywords || 'service, quality, and overall experience'}"
Language: "${languageName}"

Requirements:
- Return only a JSON array of exactly five strings.
- Keep each draft to one or two short sentences.
- Use a different angle in each draft: service, quality, value, atmosphere, and recommendation.
- Do not invent precise facts, prices, timings, staff names, awards, or medical claims.
- Write natural first-person drafts which the customer can edit to reflect their real experience.`;
}

function parseReviewArray(responseText) {
  if (typeof responseText !== 'string') return [];

  const json = responseText.trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => typeof item === 'string')
      .map((item) => item.replace(/\s+/g, ' ').trim())
      .filter((item) => item.length >= 12 && item.length <= MAX_REVIEW_LENGTH)
      .slice(0, 5);
  } catch {
    return [];
  }
}

function cleanPromptValue(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function createLocalReviewDrafts({ businessName, category, language }) {
  const subject = getCategorySubject(category, language);
  const templates = getLocalTemplates(language, businessName, subject);
  return shuffle(templates).slice(0, 5);
}

function getCategorySubject(category, language) {
  const subjects = {
    restaurant: { en: 'food and service', hi: 'खाने और सेवा', gu: 'ભોજન અને સેવા' },
    salon: { en: 'service and care', hi: 'सेवा और देखभाल', gu: 'સેવા અને કાળજી' },
    clinic: { en: 'care and guidance', hi: 'देखभाल और मार्गदर्शन', gu: 'કાળજી અને માર્ગદર્શન' },
    mobile_shop: { en: 'service and guidance', hi: 'सेवा और मार्गदर्शन', gu: 'સેવા અને માર્ગદર્શન' },
    gym: { en: 'support and environment', hi: 'सहयोग और माहौल', gu: 'સહકાર અને વાતાવરણ' },
    hotel: { en: 'hospitality and comfort', hi: 'मेहमाननवाज़ी और आराम', gu: 'આતિથ્ય અને આરામ' },
    general: { en: 'service and overall experience', hi: 'सेवा और पूरे अनुभव', gu: 'સેવા અને સમગ્ર અનુભવ' },
  };

  return (subjects[category] || subjects.general)[language] || subjects.general.en;
}

function getLocalTemplates(language, businessName, subject) {
  const templates = {
    en: [
      `I had a pleasant experience at ${businessName}. The ${subject} felt thoughtful and welcoming.`,
      `${businessName} made my visit easy and comfortable. I especially appreciated the friendly service.`,
      `I was happy with my experience at ${businessName}. It is a place I would consider visiting again.`,
      `The team at ${businessName} was polite and helpful throughout my visit.`,
      `${businessName} left a positive impression with its care and attention to customers.`,
      `I appreciated the overall experience at ${businessName}. The team made me feel valued.`,
      `A good experience at ${businessName}; I would recommend it based on my visit.`,
    ],
    hi: [
      `${businessName} में मेरा अनुभव अच्छा रहा। ${subject} में ध्यान और अपनापन महसूस हुआ।`,
      `${businessName} में आना आसान और आरामदायक लगा। सेवा बहुत विनम्र थी।`,
      `${businessName} में अपने अनुभव से मैं खुश हूँ। मैं फिर से आने के बारे में सोचूँगा/सोचूँगी।`,
      `${businessName} की टीम मेरे पूरे विज़िट के दौरान मददगार और शिष्ट थी।`,
      `${businessName} ने ग्राहकों के प्रति अपने ध्यान से अच्छा प्रभाव छोड़ा।`,
      `${businessName} में कुल मिलाकर अच्छा अनुभव रहा। टीम ने मुझे महत्व दिया।`,
      `मेरे अनुभव के आधार पर मैं ${businessName} की सिफारिश करूँगा/करूँगी।`,
    ],
    gu: [
      `${businessName} ખાતે મારો અનુભવ સારો રહ્યો. ${subject}માં કાળજી અને આપણી લાગણી અનુભવાઈ.`,
      `${businessName} ખાતે આવવું સરળ અને આરામદાયક લાગ્યું. સેવા ખૂબ વિનમ્ર હતી.`,
      `${businessName} ખાતેના મારા અનુભવથી હું ખુશ છું. હું ફરી આવવાનું વિચારીશ.`,
      `${businessName}ની ટીમ મારી મુલાકાત દરમિયાન મદદરૂપ અને વિનમ્ર હતી.`,
      `${businessName}એ ગ્રાહકો પ્રત્યેના ધ્યાનથી સારી છાપ છોડી.`,
      `${businessName} ખાતે કુલ મળીને સારો અનુભવ રહ્યો. ટીમે મને મહત્વ આપ્યું.`,
      `મારા અનુભવના આધારે હું ${businessName}ની ભલામણ કરીશ.`,
    ],
  };

  return templates[language] || templates.en;
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

module.exports = { generateAiReviews, parseReviewArray, createLocalReviewDrafts };
