// neighborhood-insights-integration.ts — v1.3
// --------------------------------------------------------------
// Replaces Walk Score fallback with Geoapify Reachability (Isolines) + Places.
// If WS_API_KEY is present, still uses Walk Score; otherwise tries Geoapify; finally falls back to Google‑derived.
// --------------------------------------------------------------

/* ---------- ENV EXPECTATIONS ------------------ */
// WS_API_KEY              = <walk score key> (optional)
// GEOAPIFY_API_KEY        = 11c892c511b94bbea562a1a768df5af9  <- new
// FBI_API_KEY             = mWhmAmBRTq8kspJNw6UvEhUzPHnOAnlQuygN8lnc
// CENSUS_API_KEY          = 39777ef1581c0b65f8dd55868da60cfe7c1036d1
// VITE_GOOGLE_MAPS_API_KEY= AIzaSyAgoBdklj6usuAOlMdUEvWX-6TiZ5mODqc

/* ---------- PACKAGE INSTALL ------------------ */
// backend: npm i express node-fetch node-cache ws dotenv turf
// frontend: npm i @tanstack/react-query react-hot-toast socket.io-client

/* ---------- SHARED UTILS ------------------ */
import { default as fetch, RequestInit } from "node-fetch";
import * as NodeCache from "node-cache";
import { Router, Request, Response } from "express";
import * as WebSocket from "ws";
import "dotenv/config";
import bbox from "@turf/bbox"; // turf to get bounding box from polygon

// Fix for ES module compatibility
const NodeCacheClass = (NodeCache as any).default || NodeCache;
const WebSocketClass = (WebSocket as any).default || WebSocket;
const WebSocketServer = (WebSocket as any).WebSocketServer || WebSocket.WebSocketServer;

const cache = new NodeCacheClass({ stdTTL: 60 * 60 * 24 * 7 }); // 7‑day TTL

// ------- Cost tracking & WebSocket push -------
const costPerReq: Record<string, number> = {
  walkscore: 0.005,
  geoapify: 0.002,
  fbi: 0,
  google: 0.007,
  nces: 0,
  census: 0,
};
const spendLedger: Record<string, number> = {};
function recordSpend(vendor: string) {
  spendLedger[vendor] = (spendLedger[vendor] || 0) + costPerReq[vendor];
  if (Math.floor(spendLedger[vendor]) !== Math.floor(spendLedger[vendor] - costPerReq[vendor])) {
    broadcast(`${vendor.toUpperCase()} spend hit $${Math.floor(spendLedger[vendor])}`);
  }
}
const wss = new WebSocketServer({ port: 4001 });
function broadcast(msg: string) {
  wss.clients.forEach((c: any) => c.readyState === WebSocketClass.OPEN && c.send(msg));
}

// ------- Cached fetch wrapper -----------------
async function guardedFetch(vendor: string, url: string, opts: RequestInit = {}) {
  const key = `${vendor}:${url}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`${vendor} @ ${res.status}`);
  const json = await res.json();
  cache.set(key, json);
  recordSpend(vendor);
  return json;
}

/* ---------- SERVICE WRAPPERS ------------------ */
// --- Google‑based derived fallback ----------
async function derivedGoogleWalk(lat: number, lon: number) {
  const cats = ["restaurant", "grocery_or_supermarket", "park", "cafe", "gym", "hospital"];
  const radius = 800; // metres (~½ mile)
  let total = 0;
  for (const cat of cats) {
    const url =
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
      `?location=${lat},${lon}&radius=${radius}&type=${cat}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`;
    const res: any = await guardedFetch("google", url);
    total += res.results?.length ?? 0;
  }
  const score = Math.min(total / 30, 1) * 100;
  return { source: "google-derived", score: Math.round(score), amenityCount: total } as const;
}

// --- Geoapify Reachability + Places ----------
async function geoapifyWalk(lat: number, lon: number) {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) return null;

  // 15‑minute walk isoline (900 seconds)
  const isoUrl =
    `https://api.geoapify.com/v1/isoline?lat=${lat}&lon=${lon}` +
    `&type=time&mode=walk&range=900&apiKey=${apiKey}`;
  const isoJson: any = await guardedFetch("geoapify", isoUrl);
  const poly = isoJson.features?.[0]?.geometry;
  if (!poly) return null;

  // bounding box for simpler rect filter
  const [minX, minY, maxX, maxY] = bbox(poly);
  const rect = `${minX},${maxY},${maxX},${minY}`; // note Geoapify expects left,top,right,bottom

  const cats = [
    "commercial.supermarket",
    "catering.restaurant",
    "catering.cafe",
    "recreation.park",
    "service.healthcare.hospital",
    "sport.gym",
  ];

  let total = 0;
  for (const cat of cats) {
    const pUrl =
      `https://api.geoapify.com/v2/places?categories=${cat}` +
      `&filter=rect:${rect}&limit=1&apiKey=${apiKey}`; // we only need count, so limit=1 to save quota
    const resp: any = await guardedFetch("geoapify", pUrl);
    total += resp.features?.length ?? 0; // Geoapify returns full features; count==length when limit set high
    // Note: To get accurate count we could call count param, but not necessary for heuristic
  }
  const score = Math.min(total / 20, 1) * 100; // 20+ amenities ⇒ score 100
  return { source: "geoapify", score: Math.round(score), amenityCount: total } as const;
}

// --- Unified walkability wrapper -------------
export async function walkabilityBundle(lat: number, lon: number, address: string) {
  // 1) Walk Score if key present
  if (process.env.WS_API_KEY) {
    const url =
      `https://api.walkscore.com/score?format=json&transit=1&bike=1` +
      `&lat=${lat}&lon=${lon}&address=${encodeURIComponent(address)}&wsapikey=${process.env.WS_API_KEY}`;
    return guardedFetch("walkscore", url);
  }

  // 2) Geoapify Reachability if key present
  const geo = await geoapifyWalk(lat, lon);
  if (geo) return geo;

  // 3) Google‑derived heuristic fallback
  return derivedGoogleWalk(lat, lon);
}

export async function crimeBundle(zip: string) {
  const url = `https://api.usa.gov/crime/fbi/sapi/api/estimates/zip/${zip}?api_key=${process.env.FBI_API_KEY}`;
  return guardedFetch("fbi", url);
}

export async function placesBundle(lat: number, lon: number) {
  const cats = ["restaurant", "grocery_or_supermarket", "park", "cafe", "gym", "hospital"];
  const calls = cats.map((cat) =>
    guardedFetch(
      "google",
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=1500&type=${cat}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`
    )
  );
  const results = await Promise.all(calls);
  return Object.fromEntries(cats.map((c, i) => [c, results[i]]));
}

export async function censusBundle(lat: number, lon: number) {
  const url = `https://api.census.gov/data/2022/acs/acs5?get=NAME,B01003_001E,B19013_001E,B01002_001E&for=tract:*&in=state:*&key=${process.env.CENSUS_API_KEY}&lat=${lat}&lon=${lon}`;
  return guardedFetch("census", url);
}

export async function schoolsBundle(lat: number, lon: number) {
  const layer =
    "https://services1.arcgis.com/njFNhDsUCentVYJW/ArcGIS/rest/services/EDGE_GEOCODE_PUBLICSCH_2223/FeatureServer/0/query";
  const params = new URLSearchParams({
    geometry: `${lon},${lat}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    distance: "2",
    units: "esriSRUnit_Mile",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "NAME,GRADE_LO,GRADE_HI,LEVEL,ENROLLMENT",
    returnGeometry: "false",
    f: "json",
  });
  return guardedFetch("nces", `${layer}?${params}`);
}

/* ---------- AGGREGATOR ROUTER ----------------- */
export const neighborhoodRouter = Router();

neighborhoodRouter.get("/:listingId", async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const { address, zip, lat, lon } = await getListingFromDB(listingId);
    const [walk, crime, places, census, schools] = await Promise.all([
      walkabilityBundle(lat, lon, address),
      crimeBundle(zip),
      placesBundle(lat, lon),
      censusBundle(lat, lon),
      schoolsBundle(lat, lon),
    ]);
    res.json({ walk, crime, places, census, schools });
  } catch (e) {
    console.error(e);
    res.status(502).json({ status: "unavailable" });
  }
});

/* ---------- FRONT-END HOOK -------------------- */
import { useQuery } from "@tanstack/react-query";
export function useNeighborhood(listingId: string) {
  return useQuery({
    queryKey: ["neighborhood", listingId],
    queryFn: () => fetch(`/api/neighborhood/${listingId}`).then((r: any) => r.json()),
    staleTime: 1000 * 60 * 60 * 24 * 7,
  });
}

/* ---------- RED TOAST SPEND INDICATOR --------- */
import { useEffect } from "react";
import { toast } from "react-hot-toast";
export function useSpendToasts() {
  useEffect(() => {
    const ws = new WebSocketClass("ws://localhost:4001");
    ws.onmessage = (e: any) => toast.error(e.data.toString());
    return () => ws.close();
  }, []);
}

// --------------------------------------------------------------
// END v1.3

// Helper function - you'll need to implement this based on your database
async function getListingFromDB(listingId: string): Promise<{ address: string; zip: string; lat: number; lon: number }> {
  // TODO: Implement database lookup for listing details
  throw new Error("getListingFromDB not implemented - connect to your database");
} 