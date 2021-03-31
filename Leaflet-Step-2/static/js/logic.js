// Define the data source URL
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var plateQueryUrl = "data/PB2002_plates.json";
// Query the URL to obtain a response
d3.json(queryUrl, function(data) {


    // Define function for creating popups
    function onEachFeature(feature, layer) {
    layer.bindPopup(
      "Date/Time: " + new Date(feature.properties.time) +
      "<br> Magnitude: " + feature.properties.mag +
      "<br> Location: " + feature.properties.place +
      "<br> Depth: " + feature.geometry.coordinates[2] + "(km)");
    }


    // Define function for selecting colors based on depth coordinate
    function markerColor(depth) {
        if (depth < 10) {
          return "#a3f600"
        }
        else if (depth < 30) {
          return "#dcf400"
        }
        else if (depth < 50) {
          return "#f7db11"
        }
        else if (depth < 70) {
          return "#fdb72a"
        }
        else if (depth < 90) {
          return "#fca35d"
        }
        else {
          return "#ff5f65"
        }
      }


    // Create the GeoJSON layer for earthquake objects
    var earthquakes = L.geoJSON(data.features, {
        // On this layer, begin creating circles as defined in L.circle
        pointToLayer: function(quakeData, coords) {
            return L.circle(coords, {
              radius: quakeData.properties.mag * 15000,
              color: "black",
              fillColor: markerColor(quakeData.geometry.coordinates[2]),
              fillOpacity: 1,
              opacity: 1,
              weight:.5
            });
          },
    onEachFeature: onEachFeature
    });

// Create new layer object for plates data
    var plates = new L.LayerGroup();
// Populate layer object with plates data
    d3.json(plateQueryUrl, function(data) {
      console.log(data)
      plates = L.geoJson(data, {
        style: function(feature) {
          return {
            color: "#ffb514",
            fillOpacity: 0,
            weight: 1.5
          };
        },
        // Add polygonal object to layer object
      }).addTo(plates);
    });


    // Define base layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "dark-v10",
      accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "satellite-v9",
      accessToken: API_KEY
    });


    // Define base layers object
    var baseMaps = {
      "Street Map": streetmap,
      "Dark Map": darkmap,
      "Satellite": satellite
    };

    // Define overlay object, holding the earthquake and plates layers
    var overlayMaps = {
      Earthquakes: earthquakes,
      Plates: plates
    };

    // Create the map with initial data
    var myMap = L.map("mapid", {
      center: [
        40, -105
      ],
      zoom: 5,
      layers: [streetmap, earthquakes, plates]
    });

    // Create a layer control
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    // Create legend object
    var info = L.control({
      position: "bottomright"
    });

    // Populate legend object, referencing lists for labels and colors
    info.onAdd = function() {
    var div = L.DomUtil.create("div", "legend");
    var depths = ["-10-10","10-30","30-50","50-70","70-90","90+"];
    var colors = ["#a3f600", "#dcf400", "#f7db11", "#fdb72a", "#fca35d", "#ff5f65"]
    div.innerHTML += "Depth Measures<br>(in km)<br><hr>"
    for (var i = 0; i < depths.length; i++) {
      div.innerHTML += "<div width='50' height='50' style='float:left; background-color:" + colors[i] + "'>&nbsp&nbsp&nbsp&nbsp</div>&nbsp&nbsp" + depths[i] + "<br>";
    };
      return div;
    };

    // Add the legend to the map object
    info.addTo(myMap);

  });
