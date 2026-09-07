export const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (
    typeof lat1 !== "number" ||
    typeof lon1 !== "number" ||
    typeof lat2 !== "number" ||
    typeof lon2 !== "number"
  ) {
    return 0;
  }
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MAX_ACCURACY_METERS = 20;
const MIN_DELTA_METERS = 5;
const MAX_IMPLIED_SPEED_KMH = 60;
const MAX_POINT_AGE_MS = 30 * 1000;

export const validatePoint = (candidate, lastValidPoint) => {
  if (!candidate) return { ok: false, reason: "empty-point" };
  const { lat, lng, accuracy, timestamp } = candidate;
  if (typeof lat !== "number" || typeof lng !== "number") {
    return { ok: false, reason: "bad-coords" };
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, reason: "non-finite" };
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { ok: false, reason: "out-of-range" };
  }
  if (typeof accuracy === "number" && accuracy > MAX_ACCURACY_METERS) {
    return { ok: false, reason: "poor-accuracy" };
  }
  if (typeof timestamp === "number") {
    const age = Date.now() - timestamp;
    if (age > MAX_POINT_AGE_MS) {
      return { ok: false, reason: "stale-point" };
    }
    if (lastValidPoint && timestamp < lastValidPoint.timestamp) {
      return { ok: false, reason: "out-of-order" };
    }
  }
  if (lastValidPoint) {
    const deltaKm = haversineDistanceKm(
      lastValidPoint.lat,
      lastValidPoint.lng,
      lat,
      lng
    );
    const deltaMeters = deltaKm * 1000;
    if (deltaMeters < MIN_DELTA_METERS) {
      return { ok: false, reason: "below-min-delta" };
    }
    if (typeof timestamp === "number" && lastValidPoint.timestamp) {
      const dtSec = Math.max(1, (timestamp - lastValidPoint.timestamp) / 1000);
      const speedKmh = (deltaKm / dtSec) * 3600;
      if (speedKmh > MAX_IMPLIED_SPEED_KMH) {
        return { ok: false, reason: "implausible-speed" };
      }
    }
  }
  return { ok: true };
};
