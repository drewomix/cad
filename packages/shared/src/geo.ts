export interface GeoPoint {
  lat: number;
  lng: number;
}

export const toPostgresPoint = ({ lat, lng }: GeoPoint) => `POINT(${lng} ${lat})`;

export const fromPostgresPoint = (point?: string | null): GeoPoint | null => {
  if (!point) return null;
  const match = /POINT\(([-0-9.]+) ([-0-9.]+)\)/.exec(point);
  if (!match) return null;
  const [, lng, lat] = match;
  return { lat: Number(lat), lng: Number(lng) };
};
