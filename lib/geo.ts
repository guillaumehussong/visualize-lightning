/**
 * Country centroids (lat, lon) for placing nodes on the background globe.
 * Only country granularity is known from public data (mempool rankings
 * iso_code). Nodes without a known country fall back to a deterministic
 * fibonacci position. Covers the countries that dominate public LN nodes.
 */
export const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  US: [39.8, -98.6],
  DE: [51.2, 10.4],
  FR: [46.6, 2.3],
  GB: [54.0, -2.5],
  CA: [56.1, -106.3],
  NL: [52.2, 5.3],
  CH: [46.8, 8.2],
  ES: [40.2, -3.6],
  IT: [42.8, 12.8],
  SE: [62.0, 15.0],
  NO: [64.5, 11.5],
  FI: [64.0, 26.0],
  PL: [52.0, 19.4],
  CZ: [49.8, 15.5],
  AT: [47.6, 14.1],
  BE: [50.6, 4.7],
  PT: [39.6, -8.0],
  JP: [36.2, 138.3],
  KR: [36.4, 127.9],
  SG: [1.35, 103.8],
  HK: [22.3, 114.2],
  AU: [-25.3, 133.8],
  NZ: [-41.8, 172.8],
  BR: [-10.8, -52.9],
  AR: [-34.0, -64.0],
  MX: [23.6, -102.6],
  SV: [13.8, -88.9],
  CR: [9.7, -84.0],
  ZA: [-29.0, 24.7],
  NG: [9.1, 8.7],
  KE: [0.5, 37.9],
  IN: [21.0, 78.0],
  AE: [24.0, 54.0],
  IL: [31.0, 34.9],
  TR: [39.0, 35.2],
  RU: [55.8, 37.6],
  UA: [49.0, 32.0],
  IE: [53.3, -8.2],
  DK: [56.0, 10.0],
  IS: [64.9, -18.6],
  RO: [45.9, 25.0],
  HU: [47.2, 19.5],
  GR: [39.0, 22.0],
  TH: [15.9, 101.0],
  VN: [14.1, 108.3],
  ID: [-2.5, 118.0],
  PH: [12.9, 121.8],
  CN: [35.9, 104.2],
  TW: [23.7, 121.0],
  CL: [-33.4, -70.7],
  CO: [4.6, -74.1],
  PE: [-9.2, -75.0],
};

/** lat/lon (degrees) to XYZ on a sphere of radius r, three.js coords (y up). */
export function latLonToVec3(
  lat: number,
  lon: number,
  r: number,
): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return [
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
}
