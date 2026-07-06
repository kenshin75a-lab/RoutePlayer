import './style.css';
import { loadGoogleMap } from './map.js';
import { GOOGLE_MAP_KEY } from './config.js';
import { drawRoute } from './route.js';
import { setupPlaces } from './places.js';

document.querySelector('#app').innerHTML = `
<div class="app">

    <aside class="sidebar">

        <h1>🏍 RoutePlayer</h1>

        <p class="version">
            v0.0.2
        </p>

        <label>출발지</label>
        <input id="origin" value="연제주공아파트 광주">

        <label>경유지</label>
        <input id="waypoint" value="광주호호수생태원">

        <label>목적지</label>
        <input id="destination" value="빠라디">

        <button id="routeBtn">
            경로 생성
        </button>

        <div id="status">
            준비 완료
        </div>

    </aside>

    <main class="mapArea">

        <div
    id="map"
    class="placeholder">
</div>

    </main>

</div>
`;

document.getElementById('routeBtn').addEventListener('click', async () => {
  try {
    await drawRoute();
  } catch (error) {
    document.getElementById('status').textContent =
      `경로 생성 실패 ❌ : ${error.message}`;
    console.error(error);
  }
});

loadGoogleMap(GOOGLE_MAP_KEY).then(() => {
  setupPlaces();
});