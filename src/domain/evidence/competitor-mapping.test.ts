import { describe, it, expect } from "vitest";
import { calculateCompetitorMapping } from "./competitor-mapping";
import { EvidenceResult, EvidenceItem } from "./types";

function createMockItem(id: string, name: string | null, dist: number, cat: 'DIRECT_DAIRY_SIGNAL' | 'POTENTIAL_SALES_CHANNEL' | 'SUPPORT_INFRASTRUCTURE'): EvidenceItem {
  return {
    source: "OPENSTREETMAP",
    sourceId: id,
    name,
    latitude: 0,
    longitude: 0,
    distanceKm: dist,
    category: cat,
    classificationReason: "test",
    matchedTerm: "test",
    relevantTags: {}
  };
}

function createEvidence(
  status: "AVAILABLE" | "PROVIDER_UNAVAILABLE",
  rad5: boolean,
  rad10: boolean,
  signals5: EvidenceItem[],
  signals10: EvidenceItem[],
  precision: "LOCALITY" | "DISTRICT" = "LOCALITY"
): EvidenceResult {
  return {
    availability: status,
    location: {
      resolutionLevel: precision,
      resolvedDisplayName: "Test Locality"
    },
    commercialEvidenceCoverage: "MEDIUM",
    radius5km: {
      radiusKm: 5,
      providerAvailable: rad5,
      rawCandidateCount: 0,
      directDairySignals: signals5,
      potentialSalesChannels: [],
      supportInfrastructure: []
    },
    radius10km: {
      radiusKm: 10,
      providerAvailable: rad10,
      rawCandidateCount: 0,
      directDairySignals: signals10,
      potentialSalesChannels: [],
      supportInfrastructure: []
    }
  } as unknown as EvidenceResult;
}

describe("Competitor Mapping", () => {
  it("1. Direct dairy signals populate competitor mapping", () => {
    const sig1 = createMockItem("1", "A", 2, "DIRECT_DAIRY_SIGNAL");
    const ev = createEvidence("AVAILABLE", true, true, [sig1], [sig1]);
    const res = calculateCompetitorMapping(ev);
    expect(res.entities.length).toBe(1);
    expect(res.entities[0].entityType).toBe("DAIRY_BUSINESS_SIGNAL");
  });

  it("4. Correct 5 km direct-signal count", () => {
    const sig1 = createMockItem("1", "A", 2, "DIRECT_DAIRY_SIGNAL");
    const ev = createEvidence("AVAILABLE", true, true, [sig1, sig1], [sig1, sig1, sig1]);
    const res = calculateCompetitorMapping(ev);
    expect(res.radius5km?.mappedSimilarBusinessSignals).toBe(2);
  });

  it("5. Correct 10 km direct-signal count", () => {
    const sig1 = createMockItem("1", "A", 2, "DIRECT_DAIRY_SIGNAL");
    const ev = createEvidence("AVAILABLE", true, true, [sig1, sig1], [sig1, sig1, sig1]);
    const res = calculateCompetitorMapping(ev);
    expect(res.radius10km?.mappedSimilarBusinessSignals).toBe(3);
  });

  it("6. 5 km and 10 km are not double-added", () => {
    const sig1 = createMockItem("1", "A", 2, "DIRECT_DAIRY_SIGNAL");
    const ev = createEvidence("AVAILABLE", true, true, [sig1], [sig1, sig1, sig1]);
    const res = calculateCompetitorMapping(ev);
    expect(res.entities.length).toBe(3);
  });

  it("7. Named entity preserved", () => {
    const sig1 = createMockItem("1", "Named Dairy", 2, "DIRECT_DAIRY_SIGNAL");
    const ev = createEvidence("AVAILABLE", true, true, [sig1], [sig1]);
    const res = calculateCompetitorMapping(ev);
    expect(res.entities[0].name).toBe("Named Dairy");
  });

  it("8. Unnamed entity preserved", () => {
    const sig1 = createMockItem("1", null, 2, "DIRECT_DAIRY_SIGNAL");
    const ev = createEvidence("AVAILABLE", true, true, [sig1], [sig1]);
    const res = calculateCompetitorMapping(ev);
    expect(res.entities[0].name).toBeNull();
  });

  it("11. Entities sorted nearest-first when distance exists", () => {
    const sigFar = createMockItem("1", "Far", 8, "DIRECT_DAIRY_SIGNAL");
    const sigNear = createMockItem("2", "Near", 1, "DIRECT_DAIRY_SIGNAL");
    const ev = createEvidence("AVAILABLE", true, true, [sigNear], [sigFar, sigNear]);
    const res = calculateCompetitorMapping(ev);
    expect(res.entities[0].distanceKm).toBe(1);
    expect(res.entities[1].distanceKm).toBe(8);
  });

  it("12. Zero mapped direct signals does not produce no competition", () => {
    const ev = createEvidence("AVAILABLE", true, true, [], []);
    const res = calculateCompetitorMapping(ev);
    expect(res.interpretation).toContain("does not prove that no competitors operate locally");
    expect(res.interpretation).not.toContain("no competition");
  });

  it("13. Zero direct signals does not produce low competition", () => {
    const ev = createEvidence("AVAILABLE", true, true, [], []);
    const res = calculateCompetitorMapping(ev);
    expect(res.interpretation).not.toContain("low competition");
  });

  it("14. Many direct signals do not produce high competition", () => {
    const sig1 = createMockItem("1", "A", 2, "DIRECT_DAIRY_SIGNAL");
    const ev = createEvidence("AVAILABLE", true, true, [sig1, sig1, sig1, sig1, sig1], [sig1, sig1, sig1, sig1, sig1, sig1, sig1, sig1]);
    const res = calculateCompetitorMapping(ev);
    expect(res.interpretation).not.toContain("high competition");
  });

  it("15. Many direct signals do not produce market saturated", () => {
    const sig1 = createMockItem("1", "A", 2, "DIRECT_DAIRY_SIGNAL");
    const ev = createEvidence("AVAILABLE", true, true, [sig1, sig1, sig1, sig1, sig1], [sig1, sig1, sig1, sig1, sig1, sig1, sig1, sig1]);
    const res = calculateCompetitorMapping(ev);
    expect(res.limitations.some(l => l.includes("do not establish market saturation"))).toBe(true);
  });

  it("16. Provider unavailable returns DATA_UNAVAILABLE", () => {
    const ev = createEvidence("PROVIDER_UNAVAILABLE", false, false, [], []);
    const res = calculateCompetitorMapping(ev);
    expect(res.status).toBe("DATA_UNAVAILABLE");
  });

  it("17. Provider unavailable does not produce meaningful zero competitor count", () => {
    const ev = createEvidence("PROVIDER_UNAVAILABLE", false, false, [], []);
    const res = calculateCompetitorMapping(ev);
    expect(res.radius5km).toBeNull();
    expect(res.radius10km).toBeNull();
  });

  it("18. Partial radius failure returns LIMITED", () => {
    const ev = createEvidence("AVAILABLE", true, false, [], []);
    const res = calculateCompetitorMapping(ev);
    expect(res.status).toBe("LIMITED");
  });

  it("19. District fallback preserves district-level wording", () => {
    const sig1 = createMockItem("1", "A", 2, "DIRECT_DAIRY_SIGNAL");
    const ev = createEvidence("AVAILABLE", true, true, [sig1], [sig1], "DISTRICT");
    const res = calculateCompetitorMapping(ev);
    expect(res.validationActions.some(a => a.includes("district-level"))).toBe(true);
    expect(res.limitations.some(l => l.includes("District-level fallback"))).toBe(true);
  });

  it("20. Existing evidence confidence is reused and downgraded on district", () => {
    const sig1 = createMockItem("1", "A", 2, "DIRECT_DAIRY_SIGNAL");
    const ev = createEvidence("AVAILABLE", true, true, [sig1], [sig1], "DISTRICT");
    const res = calculateCompetitorMapping(ev);
    expect(res.evidenceConfidence).toBe("LOW"); // downgraded due to district
  });
});
