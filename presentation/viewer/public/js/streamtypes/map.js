let map;
let bounds;
let polyline;
let path = [];
let markers = [];
let heatmap;

function initMap() {
    var c = {lat: 59.77852, lng: -43.91681};
    bounds = new google.maps.LatLngBounds();
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 4,
      center: c
    });

    polyline = new google.maps.Polyline({
       strokeColor:"#0000FF",
       strokeOpacity: 0.4
    });
  }


//=============================================================================
//  handleData function
//  Desc: Will request data from stream given a specific timeframe (start, end)
//=============================================================================
function handleData(error, streamData) {

  streamValues = streamData[0].streamData;
  streamInfo = streamData[1];
  streamConfig = streamData[2].settingFound;

  $("#datapts").text(streamValues.length);
  $("#autofit").hide();
  $("#autofitlabel").hide();

  if (streamValues == false){
      alert('No values available');
      return;
  }

  if (error) {
      throw error;
  }
  renderMap();
};

function addMarker(location) {
    var marker = new google.maps.Marker({
      position: location,
      map: map
    });
    markers.push(marker);
}


function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
}

function clearMarkers() {
    setMapOnAll(null);
}

function deleteMarkers() {
  clearMarkers();
  markers = [];
  path = [];
}
//=============================================================================
//  renderMaps function
//=============================================================================
function renderMap() {

  //Clear old map data
  deleteMarkers();
  initMap();

  var infoWindow = new google.maps.InfoWindow();
  for (var key in streamValues){
       var position = new google.maps.LatLng(streamValues[key].latitude, streamValues[key].longitude);
       bounds.extend(position);
       addMarker(position);
       map.fitBounds(bounds);
       path.push(position);

       let infoContent = "<b>ts</b>: "+ moment(streamValues[key].ts).format('MMMM Do YYYY, H:mm:ss') + "</br>" +
                         "<b>lat</b>: " + streamValues[key].latitude + "</br>" +
                         "<b>long</b>: " + streamValues[key].longitude + "</br>";
       google.maps.event.addListener(markers[key], 'click', (function(marker, key) {
           return function() {
                infoWindow.setContent(infoContent);
                infoWindow.open(map, marker);
            }
       })(markers[key], key));
  }

    heatmap = new google.maps.visualization.HeatmapLayer({
      data: path
    });

    polyline.setPath(path);
}

function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}

function toggleMarkers() {
    setMapOnAll(markers[0].getMap() ? null : map);
}

function toggleLine() {
    polyline.setMap(polyline.getMap() ? null : map);
}
