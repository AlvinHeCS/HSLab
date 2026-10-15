import { z } from "zod";

/**
 * Place search over OpenStreetMap via Photon (photon.komoot.io): free, no API key, and the
 * data may be stored as long as we credit OpenStreetMap. Results are limited to Greater Sydney.
 */
const SYDNEY_BBOX = "150.5,-34.35,151.4,-33.4"; // minLon,minLat,maxLon,maxLat

/** OSM tags that are never a date: roads, stations, car parks, signboards, utilities. */
const EXCLUDED_TAGS = [
  "!highway",
  "!railway",
  "!public_transport",
  "!boundary",
  "!amenity:parking",
  "!information",
  "!man_made",
  "!emergency",
];

const photonResponse = z.object({
  features: z.array(
    z.object({
      geometry: z.object({ coordinates: z.tuple([z.number(), z.number()]) }),
      properties: z.object({
        osm_type: z.string(),
        osm_id: z.number(),
        osm_value: z.string().optional(),
        name: z.string().optional(),
        housenumber: z.string().optional(),
        street: z.string().optional(),
        locality: z.string().optional(),
        district: z.string().optional(),
        city: z.string().optional(),
      }),
    }),
  ),
});

export type PlaceResult = {
  sourceId: string;
  name: string;
  category: string | null;
  address: string | null;
  suburb: string | null;
  lat: number;
  lng: number;
};

export async function searchSydney(query: string): Promise<PlaceResult[]> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("bbox", SYDNEY_BBOX);
  url.searchParams.set("lang", "en");
  url.searchParams.set("limit", "8");
  for (const tag of EXCLUDED_TAGS) url.searchParams.append("osm_tag", tag);

  const response = await fetch(url, {
    headers: { "User-Agent": "Bubbyverse (private date planner)" },
    // The public instance can take ~5s at busy times.
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Photon search failed: ${response.status}`);

  const { features } = photonResponse.parse(await response.json());
  return features.flatMap(({ geometry, properties: p }) => {
    if (!p.name) return [];
    const street = [p.housenumber, p.street].filter(Boolean).join(" ");
    return {
      sourceId: `${p.osm_type}${p.osm_id}`,
      name: p.name,
      category: p.osm_value?.replaceAll("_", " ") ?? null,
      address: street || null,
      suburb: p.district ?? p.locality ?? p.city ?? null,
      lng: geometry.coordinates[0],
      lat: geometry.coordinates[1],
    };
  });
}
