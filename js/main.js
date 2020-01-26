
var sidebar = new ol.control.Sidebar({ element: 'sidebar', position: 'right' });
var jsonFiles, filesLength, fileKey = 0;

var projection = ol.proj.get('EPSG:3857');
var projectionExtent = projection.getExtent();
var size = ol.extent.getWidth(projectionExtent) / 256;
var resolutions = new Array(20);
var matrixIds = new Array(20);
for (var z = 0; z < 20; ++z) {
    // generate resolutions and matrixIds arrays for this WMTS
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z;
}

var getCityStyle = function(f) {
  var p = f.getProperties();
  var theStyle = styleYellow.clone();
  theStyle.getText().setText(p.ADM2_ZH);
  return theStyle;
}

var appView = new ol.View({
  center: ol.proj.fromLonLat([120.221507, 23.000694]),
  zoom: 14
});

var raster = new ol.layer.Tile({
  source: new ol.source.OSM()
});

var city = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'json/china.json',
    format: new ol.format.GeoJSON()
  }),
  style: getCityStyle
});
var map = new ol.Map({
  layers: [raster, city],
  target: 'map',
  view: appView
});
map.addControl(sidebar);
map.on('singleclick', function(evt) {
  content.innerHTML = '';
  pointClicked = false;

  map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    if(false === pointClicked) {
      var message = '<table class="table table-dark">';
      message += '<tbody>';
      var p = feature.getProperties();
      for(k in p) {
        message += '<tr><th scope="row">' + k + '</th><td>' + p[k] + '</td></tr>';
      }
      message += '</tbody></table>';
      content.innerHTML = message;
      pointClicked = true;
    }
  });
  sidebar.open('home');
});

var styleHide = new ol.style.Style();

var styleBlank = new ol.style.Style({
  stroke: new ol.style.Stroke({
      color: 'rgba(37,67,140,0.5)',
      width: 1
  }),
  fill: new ol.style.Fill({
    color: 'rgba(255,255,255,0.1)'
  }),
  text: new ol.style.Text({
    font: 'bold 16px "Open Sans", "Arial Unicode MS", "sans-serif"',
    fill: new ol.style.Fill({
      color: 'blue'
    })
  })
});

var styleHigh = new ol.style.Style({
  stroke: new ol.style.Stroke({
      color: 'rgba(37,67,140,0.5)',
      width: 1
  }),
  fill: new ol.style.Fill({
    color: 'rgba(139,0,255,0.7)'
  }),
  text: new ol.style.Text({
    font: 'bold 16px "Open Sans", "Arial Unicode MS", "sans-serif"',
    fill: new ol.style.Fill({
      color: 'blue'
    })
  })
});

var styleNotice = new ol.style.Style({
  stroke: new ol.style.Stroke({
      color: 'rgba(139,0,255,0.3)',
      width: 1
  }),
  fill: new ol.style.Fill({
    color: 'rgba(184,161,207,0.4)'
  }),
  text: new ol.style.Text({
    font: 'bold 16px "Open Sans", "Arial Unicode MS", "sans-serif"',
    fill: new ol.style.Fill({
      color: 'blue'
    })
  })
});

var styleYellow = new ol.style.Style({
  stroke: new ol.style.Stroke({
      color: 'rgba(139,0,255,0.3)',
      width: 1
  }),
  fill: new ol.style.Fill({
    color: 'rgba(255,255,0,0.1)'
  }),
  text: new ol.style.Text({
    font: 'bold 16px "Open Sans", "Arial Unicode MS", "sans-serif"',
    fill: new ol.style.Fill({
      color: 'blue'
    })
  })
});

var layerYellow = new ol.style.Style({
  stroke: new ol.style.Stroke({
      color: 'rgba(0,0,0,1)',
      width: 1
  }),
  fill: new ol.style.Fill({
      color: 'rgba(255,255,0,0.1)'
  }),
  text: new ol.style.Text({
    font: 'bold 16px "Open Sans", "Arial Unicode MS", "sans-serif"',
    fill: new ol.style.Fill({
      color: 'blue'
    })
  })
});

$('#btnPrevious').click(function() {
  return false;
});

$('#btnNext').click(function() {
  return false;
});

var sidebarTitle = document.getElementById('sidebarTitle');
var content = document.getElementById('sidebarContent');