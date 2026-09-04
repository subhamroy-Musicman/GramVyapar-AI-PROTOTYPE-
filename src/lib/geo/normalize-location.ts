export interface NormalizedLocation {
  original: {
    villageTown: string;
    district: string;
    state: string;
  };
  normalized: {
    locality: string;
    district: string;
    state: string;
  };
}

export function normalizeLocation(villageTown: string, district: string, state: string): NormalizedLocation {
  const clean = (s: string) => {
    return s
      .replace(/[^a-zA-Z0-9\u0900-\u097F\u0980-\u09FF\u0B80-\u0BFF\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  let loc = clean(villageTown);
  const dist = clean(district);
  const st = clean(state);

  // If district or state is duplicated in locality, remove it from locality
  if (loc.toLowerCase().includes(dist.toLowerCase()) && loc.length > dist.length) {
     const regex = new RegExp(dist, 'gi');
     loc = loc.replace(regex, '').replace(/\s+/g, ' ').trim();
  }

  if (loc.toLowerCase().includes(st.toLowerCase()) && loc.length > st.length) {
     const regex = new RegExp(st, 'gi');
     loc = loc.replace(regex, '').replace(/\s+/g, ' ').trim();
  }

  return {
    original: { villageTown, district, state },
    normalized: { locality: loc, district: dist, state: st }
  };
}
