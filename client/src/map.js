let map;
export function loadGoogleMap(apiKey) {
    const script = document.createElement("script");

    script.src =
        `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;

    script.async = true;

    window.initMap = function () {
        map = new google.maps.Map(
            document.getElementById("map"),
            {
                center: {
                    lat: 35.1766,
                    lng: 126.9124
                },
                zoom: 13,
                mapTypeControl: true
            }
        );
    };

    document.body.appendChild(script);
}

export function getMap() {
    return map;
}