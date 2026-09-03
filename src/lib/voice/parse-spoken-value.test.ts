import { expect, it, describe } from 'vitest';
import { parseSpokenValue } from './parse-spoken-value';

describe('Voice Parser', () => {
  it('parses numeric digits', () => {
    expect(parseSpokenValue("5", "count")).toEqual({ status: "PARSED", value: 5, transcript: "5", normalizedDisplay: "5" });
    expect(parseSpokenValue("75000")).toEqual({ status: "PARSED", value: 75000, transcript: "75000", normalizedDisplay: "₹75,000" });
    expect(parseSpokenValue("75,000")).toEqual({ status: "PARSED", value: 75000, transcript: "75,000", normalizedDisplay: "₹75,000" });
  });

  it('parses simple words', () => {
    expect(parseSpokenValue("five", "count")).toEqual({ status: "PARSED", value: 5, transcript: "five", normalizedDisplay: "5" });
    expect(parseSpokenValue("seventy five thousand")).toEqual({ status: "PARSED", value: 75000, transcript: "seventy five thousand", normalizedDisplay: "₹75,000" });
    expect(parseSpokenValue("75 thousand")).toEqual({ status: "PARSED", value: 75000, transcript: "75 thousand", normalizedDisplay: "₹75,000" });
  });

  it('parses indian units', () => {
    expect(parseSpokenValue("one lakh")).toEqual({ status: "PARSED", value: 100000, transcript: "one lakh", normalizedDisplay: "₹1,00,000" });
    expect(parseSpokenValue("1 lakh")).toEqual({ status: "PARSED", value: 100000, transcript: "1 lakh", normalizedDisplay: "₹1,00,000" });
    expect(parseSpokenValue("one lakh fifty thousand")).toEqual({ status: "PARSED", value: 150000, transcript: "one lakh fifty thousand", normalizedDisplay: "₹1,50,000" });
    expect(parseSpokenValue("two lakhs")).toEqual({ status: "PARSED", value: 200000, transcript: "two lakhs", normalizedDisplay: "₹2,00,000" });
  });

  it('handles currency words safely', () => {
    expect(parseSpokenValue("one lakh rupees")).toEqual({ status: "PARSED", value: 100000, transcript: "one lakh rupees", normalizedDisplay: "₹1,00,000" });
    expect(parseSpokenValue("seventy five thousand rupees")).toEqual({ status: "PARSED", value: 75000, transcript: "seventy five thousand rupees", normalizedDisplay: "₹75,000" });
  });

  it('rejects ambiguous or invalid speech', () => {
    expect(parseSpokenValue("around maybe seventy-ish").status).toBe("AMBIGUOUS");
    expect(parseSpokenValue("abc").status).toBe("AMBIGUOUS");
    expect(parseSpokenValue("").status).toBe("INVALID");
  });
});
