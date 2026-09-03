
export const EVIDENCE_CONFIG = {
  radii: [5, 10] as const,
  overpassTimeout: 25,
  queryVersion: '1.0',
  cacheTtlMs: 1000 * 60 * 60 * 24, // 24 hours
  dairyTerms: [
    'dairy',
    'milk',
    'dudh',
    'doodh',
    'dugdha',
    'milk centre',
    'milk center'
  ],
  thresholds: {
    HIGH_DIRECT_SIGNALS: 3,
    MEDIUM_DIRECT_SIGNALS: 1,
    MEDIUM_TOTAL_COMMERCIAL: 5,
    LOW_TOTAL_COMMERCIAL: 1
  }
};
