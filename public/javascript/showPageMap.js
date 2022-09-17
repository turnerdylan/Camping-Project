mapboxgl.accessToken = mapToken

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: parsedCampground.geometry.coordinates, // starting position [lng, lat]
    zoom: 8, // starting zoom
});
map.on('style.load', () => {
    map.setFog({}); // Set the default atmosphere style
});

map.addControl(new mapboxgl.NavigationControl());


const marker1 = new mapboxgl.Marker()
    .setLngLat(parsedCampground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h4>${parsedCampground.title}</h4> <p>${parsedCampground.location}</p>`
        )
    )
    .addTo(map);