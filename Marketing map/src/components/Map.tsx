import { useEffect, useRef } from 'react';
import maplibregl, { Map, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Location, MapMatch, Listing } from '../types';

// ============================================================================
// MAP COMPONENT
// ============================================================================

interface MapLibreMapProps {
  center?: Location;
  zoom?: number;
  listings?: Listing[];
  matches?: MapMatch[];
  userLocation?: Location; // User's current location
  onMarkerClick?: (item: Listing | MapMatch) => void;
  onMapMove?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  className?: string;
}

export function MapLibreMap({
  center = { lat: 50.8798, lng: 4.7005 }, // Leuven, BE
  zoom = 13,
  listings = [],
  matches = [],
  userLocation,
  onMarkerClick,
  onMapMove,
  className,
}: MapLibreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const markers = useRef<Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return; // Initialize map only once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [center.lng, center.lat],
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Map move listener
    if (onMapMove) {
      map.current.on('moveend', () => {
        if (!map.current) return;
        const bounds = map.current.getBounds();
        onMapMove({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      });
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map center when prop changes
  useEffect(() => {
    if (map.current && center) {
      map.current.setCenter([center.lng, center.lat]);
    }
  }, [center.lat, center.lng]);

  // Update markers when listings or matches change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add listing markers
    listings.forEach((listing) => {
      if (!map.current) return;

      const el = createMarkerElement('listing');
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([listing.lng, listing.lat])
        .addTo(map.current);

      // Add popup
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-bold text-sm mb-1">${listing.title}</h3>
          <p class="text-xs text-gray-600">${listing.category}</p>
          <p class="text-xs text-gray-500 mt-1">${listing.city || ''}</p>
        </div>
      `);
      marker.setPopup(popup);

      // Click handler
      el.addEventListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(listing);
        }
      });

      markers.current.push(marker);
    });

    // Add match markers (with different styling)
    matches.forEach((match) => {
      if (!map.current) return;

      const el = createMarkerElement('match');
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([match.listing_lng, match.listing_lat])
        .addTo(map.current);

      // Add popup
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-bold text-sm mb-1">${match.listing_title}</h3>
          <p class="text-xs text-gray-600">Match: ${Math.round(match.match_score)}%</p>
          <p class="text-xs text-gray-500">${match.distance_km.toFixed(1)} km verwijderd</p>
        </div>
      `);
      marker.setPopup(popup);

      // Click handler
      el.addEventListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(match);
        }
      });

      markers.current.push(marker);
    });

    // Add user location marker (green)
    if (userLocation) {
      const el = createMarkerElement('user');
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);

      // Add popup
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-bold text-sm mb-1">📍 Jouw Locatie</h3>
          <p class="text-xs text-gray-600">Dit is waar je bent</p>
        </div>
      `);
      marker.setPopup(popup);

      markers.current.push(marker);
    }
  }, [listings, matches, userLocation, onMarkerClick]);

  return (
    <div
      ref={mapContainer}
      className={className || 'w-full h-full rounded-lg overflow-hidden'}
    />
  );
}

// ============================================================================
// HELPER: Create marker element
// ============================================================================

function createMarkerElement(type: 'listing' | 'match' | 'user'): HTMLElement {
  const el = document.createElement('div');
  el.className = 'custom-marker';
  
  const colors = {
    listing: '#576238',  // Brand groen voor advertenties
    match: '#7b845f',    // Groen accent voor matches
    user: '#ffd95e',     // Geel accent voor gebruikerslocatie
  };

  el.innerHTML = `
    <svg width="31" height="31" viewBox="0 0 31 31" fill="none" class="drop-shadow-lg cursor-pointer transition-transform hover:scale-110">
      <circle cx="15.5" cy="15.5" r="15.5" fill="${colors[type]}" />
      <circle cx="15.5" cy="15.5" r="7" fill="white" />
    </svg>
  `;

  return el;
}

// ============================================================================
// USER LOCATION MARKER
// ============================================================================

interface UserLocationMarkerProps {
  map: Map | null;
  location: Location;
}

export function useUserLocationMarker({ map, location }: UserLocationMarkerProps) {
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create user location marker
    const el = createMarkerElement('user');
    markerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([location.lng, location.lat])
      .addTo(map);

    return () => {
      markerRef.current?.remove();
    };
  }, [map, location.lat, location.lng]);
}

// ============================================================================
// CLUSTERING (for many markers)
// ============================================================================

export function useMapClustering(
  map: Map | null,
  locations: Array<{ id: string; lat: number; lng: number; properties?: any }>
) {
  useEffect(() => {
    if (!map) return;

    // Wait for map to load
    if (!map.isStyleLoaded()) {
      map.once('load', () => setupClusters(map, locations));
    } else {
      setupClusters(map, locations);
    }

    function setupClusters(mapInstance: Map, locs: typeof locations) {
      // Remove existing source/layers
      if (mapInstance.getSource('listings-source')) {
        if (mapInstance.getLayer('clusters')) mapInstance.removeLayer('clusters');
        if (mapInstance.getLayer('cluster-count')) mapInstance.removeLayer('cluster-count');
        if (mapInstance.getLayer('unclustered-point')) mapInstance.removeLayer('unclustered-point');
        mapInstance.removeSource('listings-source');
      }

      // Add source
      mapInstance.addSource('listings-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: locs.map((loc) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [loc.lng, loc.lat],
            },
            properties: {
              id: loc.id,
              ...loc.properties,
            },
          })),
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Add cluster circles
      mapInstance.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'listings-source',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#8B5CF6', 10, '#EC4899', 30, '#EF4444'],
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
        },
      });

      // Add cluster count labels
      mapInstance.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'listings-source',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      // Add unclustered points
      mapInstance.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'listings-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#8B5CF6',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // Click handler for clusters
      mapInstance.on('click', 'clusters', (e) => {
        const features = mapInstance.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        });
        const clusterId = features[0].properties?.cluster_id;
        const source = mapInstance.getSource('listings-source') as maplibregl.GeoJSONSource;
        
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || zoom === null) return;
          if (features[0].geometry.type === 'Point') {
            mapInstance.easeTo({
              center: features[0].geometry.coordinates as [number, number],
              zoom: zoom,
            });
          }
        });
      });

      // Change cursor on hover
      mapInstance.on('mouseenter', 'clusters', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });
      mapInstance.on('mouseleave', 'clusters', () => {
        mapInstance.getCanvas().style.cursor = '';
      });
    }

    return () => {
      if (!map.getSource('listings-source')) return;
      if (map.getLayer('clusters')) map.removeLayer('clusters');
      if (map.getLayer('cluster-count')) map.removeLayer('cluster-count');
      if (map.getLayer('unclustered-point')) map.removeLayer('unclustered-point');
      map.removeSource('listings-source');
    };
  }, [map, locations]);
}
