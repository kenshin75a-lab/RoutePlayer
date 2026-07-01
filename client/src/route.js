import { getMap } from './map.js';
import { GOOGLE_MAP_KEY } from './config.js';

let routePolyline;

async function geocode(address) {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&region=kr&key=${GOOGLE_MAP_KEY}`
  );

  const data = await res.json();

  if (data.status !== 'OK') {
    throw new Error(`Geocoding 실패: ${data.status}`);
  }

  return {
    lat: data.results[0].geometry.location.lat,
    lng: data.results[0].geometry.location.lng,
  };
}

function decodePolyline(encoded) {
  let index = 0;
  const len = encoded.length;
  const path = [];
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    path.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }

  return path;
}

export async function drawRoute(origin, waypoint, destination) {
  const map = getMap();

  if (!map) {
    throw new Error('지도가 아직 준비되지 않았습니다.');
  }

  document.getElementById('status').textContent = '주소 좌표 변환 중...';

  const originPoint = await geocode(origin);
  const waypointPoint = waypoint ? await geocode(waypoint) : null;
  const destinationPoint = await geocode(destination);

  document.getElementById('status').textContent = 'Routes API 경로 생성 중...';

  const body = {
    origin: {
      location: {
        latLng: originPoint,
      },
    },
    destination: {
      location: {
        latLng: destinationPoint,
      },
    },
    travelMode: 'DRIVE',
    routingPreference: 'TRAFFIC_UNAWARE',
    computeAlternativeRoutes: false,
    polylineQuality: 'HIGH_QUALITY',
    polylineEncoding: 'ENCODED_POLYLINE',
  };

  if (waypointPoint) {
    body.intermediates = [
      {
        location: {
          latLng: waypointPoint,
        },
      },
    ];
  }

  const res = await fetch(
    'https://routes.googleapis.com/directions/v2:computeRoutes',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAP_KEY,
        'X-Goog-FieldMask': 'routes.polyline.encodedPolyline,routes.distanceMeters,routes.duration',
      },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();

  if (!res.ok || !data.routes || data.routes.length === 0) {
    console.error(data);
    throw new Error(data.error?.message || 'Routes API 경로 생성 실패');
  }

  const encoded = data.routes[0].polyline.encodedPolyline;
  const path = decodePolyline(encoded);

  if (routePolyline) {
    routePolyline.setMap(null);
  }

  routePolyline = new google.maps.Polyline({
    path,
    geodesic: true,
    strokeColor: '#2979ff',
    strokeOpacity: 1.0,
    strokeWeight: 6,
  });

  routePolyline.setMap(map);

  const bounds = new google.maps.LatLngBounds();
  path.forEach((p) => bounds.extend(p));
  map.fitBounds(bounds);

  const distanceKm = (data.routes[0].distanceMeters / 1000).toFixed(1);

  document.getElementById('status').textContent =
    `경로 생성 성공 ✅ / 약 ${distanceKm}km`;
}