import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { REGIONAL_HUBS, COUNTRIES, CONNECTION_ROUTES } from './globeData.js';
import {
  latLngToVector3,
  vector3ToLatLng,
  createCurvedArc,
  parseGeoJsonToLineSegments,
  createGraticuleLineSegments,
  computeCountryBbox,
  pointInPolygonGeometry,
} from './globeMath.js';

const GLOBE_RADIUS = 4.7;

/**
 * EarthCanvas (Digital World Map)
 * Renders a luminous cobalt-blue digital world map on a sphere directly over
 * a 100% transparent canvas, seamlessly blending with Talkyy's warm-paper background.
 * Supports dual-level interaction:
 * Level 1: Major priority countries with exact polygon boundaries and soft cobalt surface fills.
 * Level 2: Regional communication hubs and 27 global communication corridors.
 */
export default function EarthCanvas({
  selectedHubId,
  hoveredHubId,
  onHubSelect,
  onHubHover,
  selectedCountryId,
  hoveredCountryId,
  onCountrySelect,
  onCountryHover,
  isAutoRotate = true,
  onWebGLFailure,
}) {
  const mountRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const stateRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    globeGroup: null,
    baseSphere: null,
    coastlineLine: null,
    graticuleLine: null,
    hubsMeshMap: new Map(),
    routesMap: new Map(),
    countriesData: [], // { iso, name, bbox, geometry, lineMesh, fillMesh }
    pulseParticles: [],
    beaconRings: [],
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragDistance: 0,
    velocity: { x: 0, y: 0 },
    targetRotation: { x: 0.15, y: -0.6 },
    currentRotation: { x: 0.15, y: -0.6 },
    reqId: null,
    isIntersecting: true,
  });

  // Handle external hub selection (smoothly rotate globe to face the selected hub)
  useEffect(() => {
    if (!selectedHubId) return;
    const hub = REGIONAL_HUBS.find((h) => h.id === selectedHubId);
    if (!hub) return;

    const phi = (hub.lat * Math.PI) / 180;
    const theta = (hub.lng * Math.PI) / 180;

    stateRef.current.targetRotation.x = phi * 0.55;
    stateRef.current.targetRotation.y = -theta - Math.PI / 2;
  }, [selectedHubId]);

  // Handle external country selection (smoothly rotate globe to face selected country)
  useEffect(() => {
    if (!selectedCountryId) return;
    const country = COUNTRIES.find((c) => c.iso === selectedCountryId);
    if (!country) return;

    const phi = (country.lat * Math.PI) / 180;
    const theta = (country.lng * Math.PI) / 180;

    stateRef.current.targetRotation.x = phi * 0.55;
    stateRef.current.targetRotation.y = -theta - Math.PI / 2;
  }, [selectedCountryId]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 540;
    const height = container.clientHeight || 540;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 16.5);
    stateRef.current.scene = scene;
    stateRef.current.camera = camera;

    // 2. WebGL Renderer with TRANSPARENT canvas (blends with #F7F5EF)
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setClearColor(0x000000, 0); // 100% transparent background
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);
      stateRef.current.renderer = renderer;
    } catch (err) {
      console.error('[EarthCanvas] WebGL initialization failed:', err);
      setLoadError('WebGL not supported');
      if (onWebGLFailure) onWebGLFailure();
      return;
    }

    // 3. Lighting Model
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x2858e8, 0.85);
    keyLight.position.set(12, 10, 14);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfff5ea, 0.9);
    fillLight.position.set(-10, -6, 12);
    scene.add(fillLight);

    // 4. Globe Parent Group
    const globeGroup = new THREE.Group();
    globeGroup.rotation.x = stateRef.current.currentRotation.x;
    globeGroup.rotation.y = stateRef.current.currentRotation.y;
    scene.add(globeGroup);
    stateRef.current.globeGroup = globeGroup;

    // 5. Translucent Soft-Porcelain Base Sphere
    const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 0.994, 64, 64);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xf5f3ec,
      roughness: 0.85,
      metalness: 0.05,
      transparent: true,
      opacity: 0.94,
    });
    const baseSphere = new THREE.Mesh(sphereGeo, sphereMat);
    baseSphere.userData = { isBaseSphere: true };
    globeGroup.add(baseSphere);
    stateRef.current.baseSphere = baseSphere;

    // 6. Delicate Graticule Grid Lines (Latitudes and Longitudes)
    const graticulePositions = createGraticuleLineSegments(GLOBE_RADIUS * 0.998);
    const graticuleGeo = new THREE.BufferGeometry();
    graticuleGeo.setAttribute('position', new THREE.BufferAttribute(graticulePositions, 3));
    const graticuleMat = new THREE.LineBasicMaterial({
      color: 0x2858e8,
      transparent: true,
      opacity: 0.14,
    });
    const graticuleMesh = new THREE.LineSegments(graticuleGeo, graticuleMat);
    globeGroup.add(graticuleMesh);
    stateRef.current.graticuleLine = graticuleMesh;

    // 7. Load Natural Earth GeoJSON for Digital Vector Coastlines
    fetch('/assets/earth/ne_110m_land.geojson')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((geoJson) => {
        const coastlinePositions = parseGeoJsonToLineSegments(geoJson, GLOBE_RADIUS * 1.002);
        const coastlinesGeo = new THREE.BufferGeometry();
        coastlinesGeo.setAttribute('position', new THREE.BufferAttribute(coastlinePositions, 3));

        const coastlinesMat = new THREE.LineBasicMaterial({
          color: 0x2858e8,
          transparent: true,
          opacity: 0.78,
          linewidth: 1.5,
        });
        const coastlinesMesh = new THREE.LineSegments(coastlinesGeo, coastlinesMat);
        globeGroup.add(coastlinesMesh);
        stateRef.current.coastlineLine = coastlinesMesh;
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('[EarthCanvas] Error loading GeoJSON coastlines:', err);
        setLoadError('Failed to load geographic digital linework');
        setIsLoading(false);
      });

    // 8. Load Priority Countries GeoJSON for 3D Country-Level Interactivity
    fetch('/assets/earth/priority_countries_110m.geojson')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((countryGeoJson) => {
        const countriesList = [];

        countryGeoJson.features.forEach((feature) => {
          const iso = feature.properties.iso;
          const name = feature.properties.name;
          const bbox = computeCountryBbox(feature.geometry);

          // A. 3D Boundary line segments
          const linePositions = parseGeoJsonToLineSegments(
            { type: 'FeatureCollection', features: [feature] },
            GLOBE_RADIUS * 1.0026
          );
          const lineGeo = new THREE.BufferGeometry();
          lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
          const lineMat = new THREE.LineBasicMaterial({
            color: 0x2858e8,
            transparent: true,
            opacity: 0.28,
            linewidth: 1.2,
          });
          const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
          globeGroup.add(lineMesh);

          // B. 3D Surface highlight mesh (triangulated polygon fill on sphere)
          const polys =
            feature.geometry.type === 'Polygon'
              ? [feature.geometry.coordinates]
              : feature.geometry.coordinates;

          const triPositions = [];

          polys.forEach((rings) => {
            let ring = rings[0];
            if (
              ring.length > 3 &&
              ring[0][0] === ring[ring.length - 1][0] &&
              ring[0][1] === ring[ring.length - 1][1]
            ) {
              ring = ring.slice(0, ring.length - 1);
            }
            const outerRing = ring.map((pt) => new THREE.Vector2(pt[0], pt[1]));

            const holes = rings.slice(1).map((r) => {
              let hr = r;
              if (
                hr.length > 3 &&
                hr[0][0] === hr[hr.length - 1][0] &&
                hr[0][1] === hr[hr.length - 1][1]
              ) {
                hr = hr.slice(0, hr.length - 1);
              }
              return hr.map((pt) => new THREE.Vector2(pt[0], pt[1]));
            });

            try {
              const faces = THREE.ShapeUtils.triangulateShape(outerRing, holes);
              const allPoints = outerRing.concat(...holes);

              faces.forEach((face) => {
                const p0 = allPoints[face[0]];
                const p1 = allPoints[face[1]];
                const p2 = allPoints[face[2]];
                if (!p0 || !p1 || !p2) return;

                const v0 = latLngToVector3(p0.y, p0.x, GLOBE_RADIUS * 1.0014);
                const v1 = latLngToVector3(p1.y, p1.x, GLOBE_RADIUS * 1.0014);
                const v2 = latLngToVector3(p2.y, p2.x, GLOBE_RADIUS * 1.0014);

                // Compute normal to guarantee outward facing triangles
                const edge1 = new THREE.Vector3().subVectors(v1, v0);
                const edge2 = new THREE.Vector3().subVectors(v2, v0);
                const normal = new THREE.Vector3().crossVectors(edge1, edge2);

                if (normal.dot(v0) < 0) {
                  triPositions.push(v0.x, v0.y, v0.z, v2.x, v2.y, v2.z, v1.x, v1.y, v1.z);
                } else {
                  triPositions.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
                }
              });
            } catch {
              // Silently ignore rare non-triangulable small degenerate ring
            }
          });

          const fillGeo = new THREE.BufferGeometry();
          fillGeo.setAttribute('position', new THREE.Float32BufferAttribute(triPositions, 3));
          fillGeo.computeVertexNormals();

          const fillMat = new THREE.MeshBasicMaterial({
            color: 0x2858e8,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const fillMesh = new THREE.Mesh(fillGeo, fillMat);
          fillMesh.userData = { iso, name };
          globeGroup.add(fillMesh);

          countriesList.push({
            iso,
            name,
            bbox,
            geometry: feature.geometry,
            lineMesh,
            fillMesh,
          });
        });

        stateRef.current.countriesData = countriesList;
      })
      .catch((err) => {
        console.error('[EarthCanvas] Error loading priority countries:', err);
      });

    // 9. Regional Hub Markers (Cobalt dots & pulsing beacon rings)
    const hubLookup = new Map();
    REGIONAL_HUBS.forEach((hub) => {
      const hubPos = latLngToVector3(hub.lat, hub.lng, GLOBE_RADIUS * 1.004);
      hubLookup.set(hub.id, hubPos);

      const normal = hubPos.clone().normalize();

      // Solid central beacon dot
      const dotGeo = new THREE.SphereGeometry(0.09, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({
        color: 0x2858e8,
      });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.position.copy(hubPos);
      dotMesh.userData = { hubId: hub.id, hubName: hub.name, originalPos: hubPos };
      globeGroup.add(dotMesh);

      // Pulsing beacon ring
      const ringGeo = new THREE.RingGeometry(0.12, 0.17, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x2858e8,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(hubPos.clone().add(normal.clone().multiplyScalar(0.01)));
      ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      globeGroup.add(ringMesh);

      stateRef.current.beaconRings.push({
        mesh: ringMesh,
        speed: 1.6 + Math.random() * 0.6,
        offset: Math.random() * Math.PI * 2,
      });

      // Raycast hit target sphere
      const hitGeo = new THREE.SphereGeometry(0.42, 12, 12);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.copy(hubPos);
      hitMesh.userData = { hubId: hub.id, isHubTarget: true };
      globeGroup.add(hitMesh);

      stateRef.current.hubsMeshMap.set(hub.id, { dotMesh, ringMesh, hitMesh, hub });
    });

    // 10. Connection Routes & Subtle Traveling Signal Pulses (27 Routes)
    CONNECTION_ROUTES.forEach((route, idx) => {
      const fromPos = hubLookup.get(route.from);
      const toPos = hubLookup.get(route.to);
      if (!fromPos || !toPos) return;

      const curve = createCurvedArc(fromPos, toPos, GLOBE_RADIUS, route.altitude);
      const points = curve.getPoints(45);
      const routeGeo = new THREE.BufferGeometry().setFromPoints(points);

      const routeMat = new THREE.LineBasicMaterial({
        color: 0x2858e8,
        transparent: true,
        opacity: 0.35,
      });
      const routeLine = new THREE.Line(routeGeo, routeMat);
      globeGroup.add(routeLine);

      const pulseGeo = new THREE.SphereGeometry(0.055, 10, 10);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0x2858e8,
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      globeGroup.add(pulseMesh);

      stateRef.current.pulseParticles.push({
        mesh: pulseMesh,
        curve,
        speed: 0.14 + (idx % 3) * 0.04,
        progress: (idx * 0.14) % 1,
      });

      stateRef.current.routesMap.set(route.id, {
        line: routeLine,
        material: routeMat,
        from: route.from,
        to: route.to,
      });
    });

    // 11. Intersection Observer (Pauses animation when scrolled away)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          stateRef.current.isIntersecting = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // 12. Pointer Drag & Touch Handling with Momentum & Dual-Level Raycasting
    let pointerX = 0;
    let pointerY = 0;

    const onPointerDown = (e) => {
      stateRef.current.isDragging = true;
      stateRef.current.dragDistance = 0;
      stateRef.current.velocity = { x: 0, y: 0 };
      pointerX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      pointerY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      stateRef.current.dragStart = { x: pointerX, y: pointerY };
    };

    const onPointerMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      // Track drag movement
      if (stateRef.current.isDragging) {
        const deltaX = (clientX - pointerX) * 0.0055;
        const deltaY = (clientY - pointerY) * 0.0055;
        stateRef.current.dragDistance += Math.abs(clientX - pointerX) + Math.abs(clientY - pointerY);

        stateRef.current.targetRotation.y += deltaX;
        stateRef.current.targetRotation.x = Math.max(
          -Math.PI / 3,
          Math.min(Math.PI / 3, stateRef.current.targetRotation.x + deltaY)
        );

        stateRef.current.velocity = { x: deltaY, y: deltaX };
        pointerX = clientX;
        pointerY = clientY;
      }

      // Dual-Level Raycasting (Desktop only when not dragging vigorously)
      if (e.clientX !== undefined && !stateRef.current.isDragging) {
        const rect = container.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);

        // A. Check Hub targets first (Hubs have priority over countries)
        const hitTargets = [];
        stateRef.current.hubsMeshMap.forEach(({ hitMesh }) => hitTargets.push(hitMesh));
        const hubIntersects = raycaster.intersectObjects(hitTargets, false);

        if (hubIntersects.length > 0) {
          const matchedHubId = hubIntersects[0].object.userData.hubId;
          if (onHubHover) onHubHover(matchedHubId);
          if (onCountryHover) onCountryHover(null);
          container.style.cursor = 'pointer';
        } else if (stateRef.current.baseSphere) {
          // B. Raycast against baseSphere to calculate surface (lat, lng) for country hit-test
          const sphereIntersects = raycaster.intersectObject(stateRef.current.baseSphere, false);

          if (sphereIntersects.length > 0) {
            const localPt = stateRef.current.globeGroup.worldToLocal(
              sphereIntersects[0].point.clone()
            );
            const { lat, lng } = vector3ToLatLng(localPt, GLOBE_RADIUS * 0.994);

            let matchedCountry = null;
            for (const c of stateRef.current.countriesData) {
              const [minLng, minLat, maxLng, maxLat] = c.bbox;
              if (lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat) {
                if (pointInPolygonGeometry(lng, lat, c.geometry)) {
                  matchedCountry = c;
                  break;
                }
              }
            }

            if (matchedCountry) {
              if (onCountryHover) onCountryHover(matchedCountry.iso);
              if (onHubHover) onHubHover(null);
              container.style.cursor = 'pointer';
            } else {
              if (onCountryHover) onCountryHover(null);
              if (onHubHover) onHubHover(null);
              container.style.cursor = 'grab';
            }
          } else {
            if (onCountryHover) onCountryHover(null);
            if (onHubHover) onHubHover(null);
            container.style.cursor = 'grab';
          }
        }
      }
    };

    const onPointerUp = (e) => {
      // If minimal movement (< 8px), treat as intentional click / selection
      if (stateRef.current.dragDistance < 8 && e.clientX !== undefined) {
        const rect = container.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);

        // Check Hubs first
        const hitTargets = [];
        stateRef.current.hubsMeshMap.forEach(({ hitMesh }) => hitTargets.push(hitMesh));
        const hubIntersects = raycaster.intersectObjects(hitTargets, false);

        if (hubIntersects.length > 0) {
          const clickedHubId = hubIntersects[0].object.userData.hubId;
          if (onHubSelect) onHubSelect(clickedHubId);
          if (onCountrySelect) onCountrySelect(null);
        } else if (stateRef.current.baseSphere) {
          // Check Country
          const sphereIntersects = raycaster.intersectObject(stateRef.current.baseSphere, false);
          if (sphereIntersects.length > 0) {
            const localPt = stateRef.current.globeGroup.worldToLocal(
              sphereIntersects[0].point.clone()
            );
            const { lat, lng } = vector3ToLatLng(localPt, GLOBE_RADIUS * 0.994);

            let matchedCountry = null;
            for (const c of stateRef.current.countriesData) {
              const [minLng, minLat, maxLng, maxLat] = c.bbox;
              if (lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat) {
                if (pointInPolygonGeometry(lng, lat, c.geometry)) {
                  matchedCountry = c;
                  break;
                }
              }
            }

            if (matchedCountry) {
              if (onCountrySelect) onCountrySelect(matchedCountry.iso);
              if (onHubSelect) onHubSelect(null);
            } else {
              // Clicked empty ocean: clear selections
              if (onCountrySelect) onCountrySelect(null);
              if (onHubSelect) onHubSelect(null);
            }
          }
        }
      }

      stateRef.current.isDragging = false;
      container.style.cursor = 'grab';
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 13. Animation Loop with native high-resolution timer
    let lastTime = performance.now();
    const startTime = performance.now();

    const animate = (currentTime = performance.now()) => {
      stateRef.current.reqId = requestAnimationFrame(animate);

      if (!stateRef.current.isIntersecting) return;

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      const elapsedTime = (currentTime - startTime) / 1000;

      const prefersReduced =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Auto-rotation when not interacting and reduced-motion is not requested
      if (
        isAutoRotate &&
        !stateRef.current.isDragging &&
        !selectedHubId &&
        !selectedCountryId &&
        !prefersReduced
      ) {
        stateRef.current.targetRotation.y += 0.0016;
      }

      // Momentum damping
      if (!stateRef.current.isDragging) {
        stateRef.current.velocity.x *= 0.92;
        stateRef.current.velocity.y *= 0.92;
        stateRef.current.targetRotation.x += stateRef.current.velocity.x;
        stateRef.current.targetRotation.y += stateRef.current.velocity.y;
      }

      // Smooth interpolation
      stateRef.current.currentRotation.x +=
        (stateRef.current.targetRotation.x - stateRef.current.currentRotation.x) * 0.08;
      stateRef.current.currentRotation.y +=
        (stateRef.current.targetRotation.y - stateRef.current.currentRotation.y) * 0.08;

      if (globeGroup) {
        globeGroup.rotation.x = stateRef.current.currentRotation.x;
        globeGroup.rotation.y = stateRef.current.currentRotation.y;
      }

      // Pulse beacon rings animation
      if (!prefersReduced) {
        stateRef.current.beaconRings.forEach((beacon) => {
          const wave = Math.sin(elapsedTime * beacon.speed + beacon.offset) * 0.5 + 0.5;
          const scale = 1.0 + wave * 1.2;
          beacon.mesh.scale.set(scale, scale, 1);
          beacon.mesh.material.opacity = (1.0 - wave) * 0.75;
        });

        // Travel pulse particles along Bézier arcs
        stateRef.current.pulseParticles.forEach((pulse) => {
          pulse.progress = (pulse.progress + delta * pulse.speed) % 1;
          const pt = pulse.curve.getPointAt(pulse.progress);
          pulse.mesh.position.copy(pt);
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // 14. Responsive Resize Handling
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 540;
      const h = container.clientHeight || 540;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 15. Resource Cleanup on Unmount
    return () => {
      cancelAnimationFrame(stateRef.current.reqId);
      observer.disconnect();

      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);

      sphereGeo.dispose();
      sphereMat.dispose();
      graticuleGeo.dispose();
      graticuleMat.dispose();

      stateRef.current.beaconRings.forEach((b) => {
        b.mesh.geometry.dispose();
        b.mesh.material.dispose();
      });

      stateRef.current.routesMap.forEach((r) => {
        r.line.geometry.dispose();
        r.material.dispose();
      });

      stateRef.current.pulseParticles.forEach((p) => {
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
      });

      stateRef.current.countriesData.forEach((c) => {
        c.lineMesh.geometry.dispose();
        c.lineMesh.material.dispose();
        c.fillMesh.geometry.dispose();
        c.fillMesh.material.dispose();
      });

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [
    isAutoRotate,
    onHubSelect,
    onHubHover,
    onCountrySelect,
    onCountryHover,
    onWebGLFailure,
  ]);

  // Update dynamic highlight on countries, routes & hubs when selection or hover changes
  useEffect(() => {
    const activeHub = hoveredHubId || selectedHubId;
    const activeCountry = hoveredCountryId || selectedCountryId;

    // Determine route corridor highlighting
    let activeRouteHub = activeHub;
    if (!activeRouteHub && activeCountry) {
      const country = COUNTRIES.find((c) => c.iso === activeCountry);
      activeRouteHub = country?.hubRef || null;
    }

    // 1. Update 3D country polygons highlight
    stateRef.current.countriesData.forEach((c) => {
      if (c.iso === activeCountry) {
        const isSelected = selectedCountryId === c.iso;
        c.fillMesh.material.opacity = isSelected ? 0.35 : 0.22;
        c.fillMesh.material.color.setHex(0x2858e8);
        c.lineMesh.material.opacity = isSelected ? 1.0 : 0.85;
        c.lineMesh.material.color.setHex(isSelected ? 0x173bb5 : 0x2858e8);
      } else {
        c.fillMesh.material.opacity = 0;
        c.lineMesh.material.opacity = 0.28;
        c.lineMesh.material.color.setHex(0x2858e8);
      }
    });

    // 2. Update routes highlight
    stateRef.current.routesMap.forEach((routeData) => {
      const isConnected =
        activeRouteHub &&
        (routeData.from === activeRouteHub || routeData.to === activeRouteHub);

      if (isConnected) {
        routeData.material.color.setHex(0x2858e8);
        routeData.material.opacity = 0.95;
      } else if (activeRouteHub) {
        routeData.material.color.setHex(0x2858e8);
        routeData.material.opacity = 0.15;
      } else {
        routeData.material.color.setHex(0x2858e8);
        routeData.material.opacity = 0.35;
      }
    });

    // 3. Update hub pins highlight
    stateRef.current.hubsMeshMap.forEach(({ dotMesh, hub }) => {
      if (hub.id === activeHub) {
        dotMesh.scale.set(1.5, 1.5, 1.5);
        dotMesh.material.color.setHex(0x173bb5);
      } else {
        dotMesh.scale.set(1, 1, 1);
        dotMesh.material.color.setHex(0x2858e8);
      }
    });
  }, [selectedHubId, hoveredHubId, selectedCountryId, hoveredCountryId]);

  return (
    <div className="relative h-full w-full select-none overflow-visible">
      {/* Three.js Canvas Container - 100% transparent */}
      <div
        ref={mountRef}
        className="h-full w-full touch-pan-y bg-transparent"
        style={{ minHeight: '360px' }}
        aria-label="Interactive digital world map showing global communication routes and selectable countries"
        role="img"
      />

      {/* Loading Skeleton */}
      {isLoading && !loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--c-cobalt)] border-t-transparent" />
          <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-[var(--c-secondary-ink)]">
            Loading Digital Map...
          </p>
        </div>
      )}

      {/* Error prompt */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-xs text-red-500">{loadError}</p>
        </div>
      )}
    </div>
  );
}

