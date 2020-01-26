
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

var dataPool = {};
$.getJSON('data/meta.json', {}, function(c) {
  var target = c.end.toString();
  var targetFile = 'data/' + target.substring(0, 4) + '/' + target + '.json';
  $.getJSON(targetFile, {}, function(d) {
    dataPool = d;
    city.setSource(sourcePool[currentAdm]);
  })
});

var getCityStyle = function(f) {
  var p = f.getProperties();
  var theStyle = styleLv0.clone();
  var codeKey = 'ADM' + currentAdm + '_PCODE';
  var code = p[codeKey];
  var confirmedCount = 0;
  if(currentAdm == '2') {
    if(dataPool['adm2'][code]) {
      confirmedCount = dataPool['adm2'][code]['confirmedCount'];
      if(confirmedCount > 499) {
        theStyle = styleLv5.clone();
      } else if(confirmedCount > 299) {
        theStyle = styleLv4.clone();
      } else if(confirmedCount > 99) {
        theStyle = styleLv3.clone();
      } else if(confirmedCount > 9) {
        theStyle = styleLv2.clone();
      } else if(confirmedCount > 0) {
        theStyle = styleLv1.clone();
      }
    }
    theStyle.getText().setText(p.ADM1_ZH + p.ADM2_ZH + '(' + confirmedCount + ')');
  } else {
    if(dataPool['adm1'][code]) {
      confirmedCount = dataPool['adm1'][code]['confirmedCount'];
      if(confirmedCount > 1000) {
        theStyle = styleLv5.clone();
      } else if(confirmedCount > 499) {
        theStyle = styleLv4.clone();
      } else if(confirmedCount > 99) {
        theStyle = styleLv3.clone();
      } else if(confirmedCount > 9) {
        theStyle = styleLv2.clone();
      } else if(confirmedCount > 0) {
        theStyle = styleLv1.clone();
      }
    }
    theStyle.getText().setText(p.ADM1_ZH + '(' + confirmedCount + ')');
  }
  return theStyle;
}

var appView = new ol.View({
  center: ol.proj.fromLonLat([114.2600995, 30.6165888]),
  zoom: 6
});

var raster = new ol.layer.Tile({
  source: new ol.source.OSM()
});
var sourcePool = {};

sourcePool['1'] = new ol.source.Vector({
  url: 'json/adm1.json',
  format: new ol.format.GeoJSON()
});

sourcePool['2'] = new ol.source.Vector({
  url: 'json/adm2.json',
  format: new ol.format.GeoJSON()
});

var currentAdm = '2';

var city = new ol.layer.Vector({
  source: null,
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
      var dataPoolKey = '';
      if(currentAdm == '2') {
        if(dataPool['adm2'][p.ADM2_PCODE]) {
          message += '<tr><th scope="row">確診</th><td>' + dataPool['adm2'][p.ADM2_PCODE]['confirmedCount'] + '</td></tr>';
          message += '<tr><th scope="row">疑似</th><td>' + dataPool['adm2'][p.ADM2_PCODE]['suspectedCount'] + '</td></tr>';
          message += '<tr><th scope="row">治癒</th><td>' + dataPool['adm2'][p.ADM2_PCODE]['curedCount'] + '</td></tr>';
          message += '<tr><th scope="row">死亡</th><td>' + dataPool['adm2'][p.ADM2_PCODE]['deadCount'] + '</td></tr>';
        }
        sidebarTitle.innerHTML = p.ADM1_ZH + p.ADM2_ZH;
      } else {
        if(dataPool['adm1'][p.ADM1_PCODE]) {
          message += '<tr><th scope="row">確診</th><td>' + dataPool['adm1'][p.ADM1_PCODE]['confirmedCount'] + '</td></tr>';
          message += '<tr><th scope="row">疑似</th><td>' + dataPool['adm1'][p.ADM1_PCODE]['suspectedCount'] + '</td></tr>';
          message += '<tr><th scope="row">治癒</th><td>' + dataPool['adm1'][p.ADM1_PCODE]['curedCount'] + '</td></tr>';
          message += '<tr><th scope="row">死亡</th><td>' + dataPool['adm1'][p.ADM1_PCODE]['deadCount'] + '</td></tr>';
        }
        sidebarTitle.innerHTML = p.ADM1_ZH;
      }
      message += '</tbody></table>';
      content.innerHTML = message;
      pointClicked = true;
    }
  });
  sidebar.open('home');
});

var lvStroke = new ol.style.Stroke({
  color: 'rgba(37,67,140,0.5)',
  width: 1
});
var lvText = new ol.style.Text({
  font: 'bold 16px "Open Sans", "Arial Unicode MS", "sans-serif"',
  fill: new ol.style.Fill({
    color: 'blue'
  })
});
var styleLv0 = new ol.style.Style({
  stroke: lvStroke,
  text: lvText,
  fill: new ol.style.Fill({
    color: 'rgba(255,255,255,0.1)'
  })
});
var styleLv1 = new ol.style.Style({
  stroke: lvStroke,
  text: lvText,
  fill: new ol.style.Fill({
    color: 'rgba(240,143,127,0.5)'
  })
});
var styleLv2 = new ol.style.Style({
  stroke: lvStroke,
  text: lvText,
  fill: new ol.style.Fill({
    color: 'rgba(226,96,97,0.5)'
  })
});
var styleLv3 = new ol.style.Style({
  stroke: lvStroke,
  text: lvText,
  fill: new ol.style.Fill({
    color: 'rgba(195,69,72,0.5)'
  })
});
var styleLv4 = new ol.style.Style({
  stroke: lvStroke,
  text: lvText,
  fill: new ol.style.Fill({
    color: 'rgba(156,47,49,0.5)'
  })
});
var styleLv5 = new ol.style.Style({
  stroke: lvStroke,
  text: lvText,
  fill: new ol.style.Fill({
    color: 'rgba(115,25,25,0.5)'
  })
});

$('#btnAdm1').click(function() {
  currentAdm = '1';
  city.setSource(sourcePool[currentAdm]);
  return false;
});

$('#btnAdm2').click(function() {
  currentAdm = '2';
  city.setSource(sourcePool[currentAdm]);
  return false;
});

var sidebarTitle = document.getElementById('sidebarTitle');
var content = document.getElementById('sidebarContent');