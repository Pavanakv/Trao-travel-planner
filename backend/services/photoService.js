// Fetches a real photo from Pexels for a given search query. Isolated here
// (same pattern as services/llmService.js) so it can be swapped for a
// different provider, or simply disabled by omitting PEXELS_API_KEY,
// without touching any controller code.
//
// Callers must treat a null return as normal - the frontend falls back to
// a gradient+monogram card when there's no photo, so a missing key or a
// failed request is never a hard error for trip creation.

async function searchPexels(query) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: apiKey } }
    );

    if (!response.ok) {
      console.error(`Pexels request failed (${response.status}) for "${query}"`);
      return null;
    }

    const data = await response.json();
    const photo = data?.photos?.[0];
    return photo?.src?.large || null;
  } catch (err) {
    console.error('Pexels photo fetch failed:', err.message);
    return null;
  }
}

export async function getDestinationPhoto(destination) {
  return searchPexels(destination);
}

// Representative photo per hotel tier - searches by destination + tier,
// NOT the specific hotel name, since AI-suggested hotel names aren't
// verified real businesses. This is illustrative ambiance only.
export async function getHotelPhotos(destination, hotels) {
  if (!hotels || hotels.length === 0) {
    return [];
  }

  const photos = await Promise.all(
    hotels.map((hotel) => searchPexels(`${destination} ${hotel.tier} hotel room`))
  );

  return hotels.map((hotel, i) => ({ ...hotel, photoUrl: photos[i] }));
}