import * as THREE from 'three';

/**
 * Converts geographic latitude and longitude to a 3D Cartesian Vector on a sphere of radius R.
 * Matches Three.js standard equirectangular sphere UV layout:
 * - Latitude: -90° (South) to +90° (North)
 * - Longitude: -180° (West) to +180° (East), 0° at Prime Meridian
 * 
 * @param {number} lat - Latitude in degrees (-90 to 90)
 * @param {number} lng - Longitude in degrees (-180 to 180)
 * @param {number} radius - Sphere radius in world units
 * @returns {THREE.Vector3}
 */
export const latLngToVector3 = (lat, lng, radius) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
};

/**
 * Creates a smooth elevated 3D cubic Bézier curve between two surface points.
 * 
 * @param {THREE.Vector3} startVec
 * @param {THREE.Vector3} endVec
 * @param {number} globeRadius
 * @param {number} altitudeScale
 * @returns {THREE.CubicBezierCurve3}
 */
export const createCurvedArc = (startVec, endVec, globeRadius, altitudeScale = 0.16) => {
  const distance = startVec.distanceTo(endVec);
  const mid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
  const midLength = mid.length();

  const peakAltitude = globeRadius * (1 + altitudeScale * Math.min(1.4, distance / (globeRadius * 1.2)));

  if (midLength > 0.001) {
    mid.normalize().multiplyScalar(peakAltitude);
  } else {
    mid.set(0, peakAltitude, 0);
  }

  const control1 = new THREE.Vector3().lerpVectors(startVec, mid, 0.55).normalize().multiplyScalar(peakAltitude * 0.96);
  const control2 = new THREE.Vector3().lerpVectors(endVec, mid, 0.55).normalize().multiplyScalar(peakAltitude * 0.96);

  return new THREE.CubicBezierCurve3(startVec, control1, control2, endVec);
};

/**
 * Parses GeoJSON polygons (e.g. Natural Earth 110m land) into line segment vertices.
 * 
 * @param {Object} geoJson - GeoJSON FeatureCollection
 * @param {number} radius - Target sphere radius
 * @returns {Float32Array} Positions array for THREE.LineSegments
 */
export const parseGeoJsonToLineSegments = (geoJson, radius) => {
  const positions = [];

  const addRing = (ring) => {
    if (!ring || ring.length < 2) return;
    for (let i = 0; i < ring.length - 1; i++) {
      const [lng1, lat1] = ring[i];
      const [lng2, lat2] = ring[i + 1];

      // Skip huge wrap-around jumps across the antimeridian (-180 / +180)
      if (Math.abs(lng2 - lng1) > 180) continue;

      const p1 = latLngToVector3(lat1, lng1, radius);
      const p2 = latLngToVector3(lat2, lng2, radius);

      positions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }
  };

  if (geoJson && geoJson.features) {
    geoJson.features.forEach((feature) => {
      const geom = feature.geometry;
      if (!geom) return;

      if (geom.type === 'Polygon') {
        geom.coordinates.forEach(addRing);
      } else if (geom.type === 'MultiPolygon') {
        geom.coordinates.forEach((poly) => {
          poly.forEach(addRing);
        });
      }
    });
  }

  return new Float32Array(positions);
};

/**
 * Generates delicate spherical graticule grid lines (parallels and meridians).
 * 
 * @param {number} radius
 * @returns {Float32Array} Positions array for THREE.LineSegments
 */
export const createGraticuleLineSegments = (radius) => {
  const positions = [];

  // Parallels (Latitudes: -60, -30, 0, 30, 60)
  const latitudes = [-60, -30, 0, 30, 60];
  latitudes.forEach((lat) => {
    for (let lng = -180; lng < 180; lng += 4) {
      const p1 = latLngToVector3(lat, lng, radius);
      const p2 = latLngToVector3(lat, lng + 4, radius);
      positions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }
  });

  // Meridians (Longitudes every 30 degrees)
  for (let lng = -180; lng < 180; lng += 30) {
    for (let lat = -80; lat < 80; lat += 4) {
      const p1 = latLngToVector3(lat, lng, radius);
      const p2 = latLngToVector3(lat + 4, lng, radius);
      positions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }
  }

  return new Float32Array(positions);
};

/**
 * Converts a 3D Cartesian Vector on a sphere of radius R back to geographic lat/lng.
 * Exact mathematical inverse of latLngToVector3.
 * 
 * @param {THREE.Vector3|{x: number, y: number, z: number}} vec
 * @param {number} [radius]
 * @returns {{lat: number, lng: number}}
 */
export const vector3ToLatLng = (vec, radius) => {
  const r = radius || Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z) || 1;
  const cosPhi = Math.max(-1, Math.min(1, vec.y / r));
  const phi = Math.acos(cosPhi);
  const lat = 90 - (phi * 180) / Math.PI;

  const theta = Math.atan2(vec.z, -vec.x);
  let lng = (theta * 180) / Math.PI - 180;
  while (lng < -180) lng += 360;
  while (lng > 180) lng -= 360;

  return { lat, lng };
};

/**
 * Standard ray-casting point-in-polygon ring test.
 * 
 * @param {[number, number]} pt - [lng, lat]
 * @param {Array<[number, number]>} ring
 * @returns {boolean}
 */
export const pointInRing = (pt, ring) => {
  let inside = false;
  const x = pt[0], y = pt[1];
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

/**
 * Tests whether a [lng, lat] point is inside a GeoJSON geometry (Polygon or MultiPolygon).
 * 
 * @param {number} lng
 * @param {number} lat
 * @param {Object} geometry
 * @returns {boolean}
 */
export const pointInPolygonGeometry = (lng, lat, geometry) => {
  if (!geometry) return false;
  if (geometry.type === 'Polygon') {
    if (!pointInRing([lng, lat], geometry.coordinates[0])) return false;
    for (let k = 1; k < geometry.coordinates.length; k++) {
      if (pointInRing([lng, lat], geometry.coordinates[k])) return false;
    }
    return true;
  } else if (geometry.type === 'MultiPolygon') {
    for (let p = 0; p < geometry.coordinates.length; p++) {
      const poly = geometry.coordinates[p];
      if (pointInRing([lng, lat], poly[0])) {
        let inHole = false;
        for (let k = 1; k < poly.length; k++) {
          if (pointInRing([lng, lat], poly[k])) { inHole = true; break; }
        }
        if (!inHole) return true;
      }
    }
  }
  return false;
};

/**
 * Computes the 2D bounding box [minLng, minLat, maxLng, maxLat] for a GeoJSON geometry.
 * 
 * @param {Object} geometry
 * @returns {[number, number, number, number]}
 */
export const computeCountryBbox = (geometry) => {
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  const update = (coords) => {
    if (typeof coords[0] === 'number') {
      const lng = coords[0], lat = coords[1];
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    } else {
      coords.forEach(update);
    }
  };
  update(geometry.coordinates);
  return [minLng, minLat, maxLng, maxLat];
};

