
import { Rectangle, Circle } from '../types';

export const pointInRect = (lat: number, lng: number, rect: Rectangle): boolean => {
    return (
        lat >= rect.low.latitude &&
        lat <= rect.high.latitude &&
        lng >= rect.low.longitude &&
        lng <= rect.high.longitude
    );
};

export const pointInCircle = (lat: number, lng: number, circle: Circle): boolean => {
    const R = 6371000; // Earth's radius in meters
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dLat = toRad(circle.center.latitude - lat);
    const dLng = toRad(circle.center.longitude - lng);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat)) *
        Math.cos(toRad(circle.center.latitude)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d <= circle.radius;
};

export const haversineMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
   