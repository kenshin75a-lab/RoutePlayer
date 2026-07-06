let map;

export function loadGoogleMap(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps && map) {
      resolve(map);
      return;
    }

    window.initMap = function () {
      map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 35.1766, lng: 126.9124 },
        zoom: 13,
        mapTypeControl: true,
      });

      resolve(map);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&v=weekly`;
    script.async = true;
    script.onerror = reject;

    document.body.appendChild(script);
  });
}

export function getMap() {
  return map;
}