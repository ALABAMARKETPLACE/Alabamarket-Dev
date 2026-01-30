import { KNOWLEDGE_BASE, MATCH_THRESHOLD } from "./knowledgeBase";

interface MatchResult {
  response: string | null;
  confidence: number;
}

/**
 * Calculate similarity between two strings using enhanced word matching
 * Returns a score between 0 and 1
 */
function calculateSimilarity(input: string, pattern: string): number {
  const inputWords = input
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2); // Only consider words longer than 2 chars
  const patternWords = pattern
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (patternWords.length === 0) return 0;
  if (inputWords.length === 0) return 0;

  let matches = 0;
  let partialMatches = 0;

  for (const pWord of patternWords) {
    for (const iWord of inputWords) {
      // Exact match
      if (iWord === pWord) {
        matches++;
        break;
      }
      // Contains match
      else if (iWord.includes(pWord) || pWord.includes(iWord)) {
        partialMatches += 0.6;
        break;
      }
      // Levenshtein-like (simple check for similar words)
      else if (
        iWord.length > 3 &&
        pWord.length > 3 &&
        iWord.startsWith(pWord.substring(0, 3))
      ) {
        partialMatches += 0.4;
        break;
      }
    }
  }

  const totalMatches = matches + partialMatches;
  return totalMatches / Math.max(patternWords.length, inputWords.length * 0.7);
}

/**
 * Find the best matching response from knowledge base
 * Returns the response and confidence score
 */
export function findBestMatch(userInput: string): MatchResult {
  let bestMatch: MatchResult = {
    response: null,
    confidence: 0,
  };

  for (const item of KNOWLEDGE_BASE) {
    for (const pattern of item.patterns) {
      const similarity = calculateSimilarity(userInput, pattern);

      if (similarity > bestMatch.confidence) {
        bestMatch = {
          response: item.response,
          confidence: Math.min(similarity, 1), // Cap at 1
        };
      }
    }
  }

  // Only return response if confidence meets threshold (60%)
  if (bestMatch.confidence >= MATCH_THRESHOLD) {
    return bestMatch;
  }

  return {
    response: null,
    confidence: 0,
  };
}

/**
 * Get a chatbot response to user input
 * Returns pre-defined response if match is good enough
 * Otherwise returns a helpful fallback message
 */
export function getChatbotResponse(userInput: string): {
  response: string;
  isKnowledgeBase: boolean;
} {
  if (!userInput || userInput.trim().length === 0) {
    return {
      response:
        "Hello! 👋 Welcome to Alaba Marketplace. I'm here to help! Ask me anything about orders, shipping, payments, products, or sellers.",
      isKnowledgeBase: true,
    };
  }

  const match = findBestMatch(userInput);

  if (match.response) {
    return {
      response: match.response,
      isKnowledgeBase: true,
    };
  }

  // Fallback responses for questions we don't recognize
  const fallbacks = [
    "I'm not entirely sure about that. You can:\n1. Browse our Help Center\n2. Check FAQ section\n3. Contact support via WhatsApp\n\nThanks for the question!",
    "That's a great question! For specific details, I'd recommend checking with our support team via WhatsApp or email. They're available 24/7!",
    "I don't have detailed info on that. Our support team at support@alabamarket.com or via WhatsApp can help you better!",
    "Let me suggest checking our Help Center or contacting our amazing support team. They're here to help!",
    "That's beyond my current knowledge. Reach out to our support team and they'll get you sorted quickly!",
  ];

  // Return a random fallback
  const randomFallback =
    fallbacks[Math.floor(Math.random() * fallbacks.length)];

  return {
    response: randomFallback,
    isKnowledgeBase: false,
  };
}

/**
 * Get suggestions based on user input
 * Useful for helping users find relevant topics
 */
export function getSuggestions(userInput: string): string[] {
  const suggestions = new Set<string>();

  for (const item of KNOWLEDGE_BASE) {
    for (const pattern of item.patterns) {
      const similarity = calculateSimilarity(userInput, pattern);
      if (similarity > 0.25) {
        suggestions.add(pattern);
        if (suggestions.size >= 5) break;
      }
    }
    if (suggestions.size >= 5) break;
  }

  return Array.from(suggestions).slice(0, 3);
}
