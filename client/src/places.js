let selectedPlaces = {
  origin: null,
  waypoint: null,
  destination: null,
};

export async function setupPlaces() {
  await google.maps.importLibrary('places');

  setupPlaceInput('origin', '출발지');
  setupPlaceInput('waypoint', '경유지');
  setupPlaceInput('destination', '목적지');
}

function setupPlaceInput(inputId, label) {
  const input = document.getElementById(inputId);

  if (!input) {
    console.warn(`${inputId} 입력창을 찾지 못했습니다.`);
    return;
  }

  const autocomplete = new google.maps.places.PlaceAutocompleteElement({
    componentRestrictions: { country: ['kr'] },
  });

  autocomplete.id = `${inputId}Autocomplete`;
  autocomplete.className = 'place-autocomplete';

  input.replaceWith(autocomplete);

  autocomplete.addEventListener('gmp-select', async (event) => {
    const place = event.placePrediction.toPlace();

    await place.fetchFields({
      fields: ['displayName', 'formattedAddress', 'location'],
    });

    selectedPlaces[inputId] = {
      name: place.displayName,
      address: place.formattedAddress,
      lat: place.location.lat(),
      lng: place.location.lng(),
    };

    document.getElementById('status').textContent =
      `${label} 선택 완료 ✅ ${place.displayName}`;
  });
}

export function getSelectedPlaces() {
  return selectedPlaces;
}