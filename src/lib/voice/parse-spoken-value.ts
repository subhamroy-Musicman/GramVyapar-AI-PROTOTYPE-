import { ParsedVoiceValue } from "../../domain/voice/types";

export function parseSpokenValue(transcript: string, fieldType: 'currency' | 'count' = 'currency'): ParsedVoiceValue {
  const cleanStr = transcript.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  if (!cleanStr) {
    return { status: "INVALID", transcript, reason: "Empty speech" };
  }

  // Attempt direct numeric parsing if it's all digits
  const digitMatch = cleanStr.replace(/\s+/g, '');
  if (/^\d+$/.test(digitMatch)) {
    return createResult(parseFloat(digitMatch), transcript, fieldType);
  }

  // Standard word mapping
  const words = cleanStr.split(/\s+/);
  
  // Basic Indian numbering system handler
  let total = 0;
  let currentSegment = 0;
  let hasValidNumber = false;
  
  const numbers: Record<string, number> = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14,
    'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
    'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
    'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90
  };

  const multipliers: Record<string, number> = {
    'hundred': 100,
    'thousand': 1000,
    'lakh': 100000,
    'lakhs': 100000,
    'crore': 10000000,
    'crores': 10000000
  };

  const ignoreWords = ['rupees', 'rupee', 'rs', 'and', 'animals', 'cows', 'buffaloes'];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (ignoreWords.includes(word)) {
      continue;
    }

    // Is it a direct digit string within the phrase? (e.g. "75 thousand")
    if (/^\d+$/.test(word)) {
      currentSegment += parseInt(word, 10);
      hasValidNumber = true;
      continue;
    }

    if (numbers[word] !== undefined) {
      currentSegment += numbers[word];
      hasValidNumber = true;
    } else if (multipliers[word] !== undefined) {
      // If no prefix number provided (e.g. just saying "lakh" means "one lakh")
      if (currentSegment === 0) currentSegment = 1;
      
      total += currentSegment * multipliers[word];
      currentSegment = 0;
      hasValidNumber = true;
    } else {
      // We encountered an unknown word that is not ignored
      return { status: "AMBIGUOUS", transcript, reason: `Unrecognized word: ${word}` };
    }
  }

  total += currentSegment;

  if (!hasValidNumber || !Number.isFinite(total)) {
    return { status: "INVALID", transcript, reason: "Could not parse a valid finite number" };
  }
  
  if (total < 0) {
    return { status: "INVALID", transcript, reason: "Negative numbers are not supported" };
  }

  if (fieldType === 'count' && !Number.isInteger(total)) {
    return { status: "INVALID", transcript, reason: "Count must be an integer" };
  }

  return createResult(total, transcript, fieldType);
}

function createResult(value: number, transcript: string, fieldType: 'currency' | 'count'): ParsedVoiceValue {
  let display = '';
  if (fieldType === 'currency') {
    display = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  } else {
    display = `${value}`;
  }
  return {
    status: 'PARSED',
    value,
    transcript,
    normalizedDisplay: display
  };
}
