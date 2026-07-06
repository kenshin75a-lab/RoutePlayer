import { getMap } from './map.js';
import { ORS_API_KEY } from './config.js';

let routePolyline = null;

const ROUTE_POINTS = [
  [126.9124, 35.1766],
  [126.9818, 35.1839],
];

export async function drawRoute(routePoints = ROUTE_POINTS) {
  const map = getMap();

  if (!map) {
    throw new Error('지도가 아직 준비되지 않았습니다.');
  }

  document.getElementById('status').textContent = 'ORS 경로 생성 중...';

  const response = await fetch(
    'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
    {
      method: 'POST',
      headers: {
        Authorization: ORS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinates: routePoints,
        instructions: false,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.features?.length) {
    console.log('ORS error:', data);
    throw new Error(data.error?.message || 'ORS 경로 생성 실패');
  }

  const coordinates = data.features[0].geometry.coordinates;

  const path = coordinates.map(([lng, lat]) => ({
    lat,
    lng,
  }));

  if (routePolyline) {
    routePolyline.setMap(null);
  }

  routePolyline = new google.maps.Polyline({
    path,
    map,
    strokeColor: '#2979ff',
    strokeOpacity: 1,
    strokeWeight: 6,
  });

  const bounds = new google.maps.LatLngBounds();
  path.forEach((point) => bounds.extend(point));
  map.fitBounds(bounds);

  const distanceKm =
    data.features[0].properties.summary.distance / 1000;

  document.getElementById('status').textContent =
    `경로 생성 성공 ✅ 약 ${distanceKm.toFixed(1)}km`;
}