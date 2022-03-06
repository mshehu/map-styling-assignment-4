mapboxgl.accessToken = 'pk.eyJ1IjoibXRzaGVodSIsImEiOiJja3pxcWxhamUwNTZrMnZvdzV5ZGN6emQzIn0.NovLA1r6sNV2eZAHxt2UFA'

// lngLat for the map center location
var mapCenter = [-73.997456, 40.730831]

$.getJSON('./data/car-accidents.geojson', function(data) {
  var map = new mapboxgl.Map({
    container: 'mapContainer', // HTML container id
    style: 'mapbox://styles/mapbox/dark-v9', // style
    center: mapCenter, // starting position
    zoom: 10,
    minZoom: 8,
    maxZoom: 14
  });

  map.on('load', function() {
    map.addSource('car-accidents', {
      type: 'geojson',
      data: data
    })

    // todo
    map.addLayer({
      id: 'car-accidents-fill',
      type: 'fill',
      source: 'car-accidents',
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'mateoinjur'],
          0, // interpolating start position
          '#f1eef6',
          8500,
          '#ffaaaa',
          17000,
          '#ff5555',
          25000,
          '#ff0000',
          35000,
          '#970000', // interpolating end position
        ]
      }
    })

    // initialize a source with dummy data
    map.addSource('selected-feature', {
      type: 'geojson',
      data: {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [
            0,
            0
          ]
        }
      }
    })

    map.addLayer({
      id: 'selected-feature-line',
      type: 'line',
      source: 'selected-feature',
      paint: {
        'line-color': 'orange',
        'line-width': 3,
        'line-dasharray': [1, 1]
      }
    })

    map.on('click', function(e) {
      var features = map.queryRenderedFeatures(e.point)
      var featureProperties = features[0].properties
      var featureGeometry = features[0].geometry // get features on click

      var neighborhoodname = featureProperties['ntaname']
      var deaths = featureProperties['Deaths']
      var unsafeSpeed = featureProperties['unsafespee']
      var totalInjuries = featureProperties['mateoinjur']

      if (neighborhoodname !== undefined) {
        // use this geometry to update the source for the selected layer
        map.getSource('selected-feature').setData(featureGeometry)

        $('#sidebar-content-area').html(`
          <h4>${neighborhoodname}</h4>
          <p>Deaths: ${numeral(deaths).format('0.0a')}</p>
          <p>Unsafe speeds: ${numeral(unsafeSpeed).format('0.0a')}</p>
          <p>Total injuries: ${numeral(totalInjuries).format('0.0a')}</p>
        `)
      }
    })
  })

  $('#fly-to-map-center').on('click', function() {
    map.flyTo({
      center: mapCenter,
      zoom: 10
    })
  })
  // toggle overlay and boundaries
  $('#toggle-accident-layer').on('click', function() {
    var visibility = map.getLayoutProperty('car-accidents-fill', 'visibility')
    if (visibility === 'none') {
      map.setLayoutProperty('selected-feature-line', 'visibility', 'visible');
      map.setLayoutProperty('car-accidents-fill', 'visibility', 'visible');
    } else {
      map.setLayoutProperty('selected-feature-line', 'visibility', 'none');
      map.setLayoutProperty('car-accidents-fill', 'visibility', 'none');
    }
  })
})
