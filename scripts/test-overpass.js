async function run() {
  const lat = 18.5204;
  const lon = 73.8567; // Pune
  const query = `
    [out:json][timeout:15];
    (
      nwr["shop"~"supermarket|convenience|dairy|general|wholesale"](around:10000, ${lat}, ${lon});
      nwr["amenity"~"marketplace|veterinary|cafe|restaurant"](around:10000, ${lat}, ${lon});
    );
    out center;
  `;
  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'GramVyaparAI/1.0 (test)'
        }
      });
      
    const data = await response.json();
    console.log('Raw Overpass Elements:', data.elements?.length);
    
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2-lat1)*(Math.PI/180);  
      const dLon = (lon2-lon1)*(Math.PI/180); 
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1*(Math.PI/180)) * Math.cos(lat2*(Math.PI/180)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      return R * c;
    }

    const results = data.elements.map((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      const parsedLat = typeof elLat === 'number' ? elLat : 0;
      const parsedLon = typeof elLon === 'number' ? elLon : 0;
      
      const tags = el.tags || {};
      const distanceKm = getDistanceFromLatLonInKm(lat, lon, parsedLat, parsedLon);
      
      let type = "other";
      if (tags.amenity === "veterinary") type = "veterinary";
      else if (tags.amenity === "marketplace") type = "marketplace";
      else if (tags.shop === "dairy" || tags.name?.toLowerCase().includes("dairy") || tags.name?.toLowerCase().includes("milk") || tags.name?.toLowerCase().includes("dudh") || tags.name?.toLowerCase().includes("cooperative")) type = "dairy_competitor";
      else if (tags.shop) type = "retail";
      else if (tags.amenity) type = "food_service";
      
      return { type, distanceKm };
    });
    
    console.log('Normalized Elements:', results.length);
    
    const market = results.filter(p => ["marketplace", "retail", "food_service"].includes(p.type) && p.distanceKm <= 5);
    console.log('Market POI Count (5km):', market.length);
    
    const dairy = results.filter(p => p.type === "dairy_competitor" && p.distanceKm <= 10);
    console.log('Dairy-related POI Count (10km):', dairy.length);
    
    const vet = results.filter(p => p.type === "veterinary");
    console.log('Veterinary POI Count (10km):', vet.length);
    
  } catch(e) {
    console.log(e);
  }
}
run();
