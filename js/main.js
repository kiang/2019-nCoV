
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
  var targetFile = 'data/china/' + target.substring(0, 4) + '/' + target + '.json';
  $.getJSON(targetFile, {}, function(d) {
    dataPool = d;
    var counter = false;
    for(k in dataPool['adm1']) {
      if(false !== counter) {
        for(j in counter) {
          counter[j] += dataPool['adm1'][k][j];
        }
      } else {
        counter = dataPool['adm1'][k];
      }
    }
    for(k in counter) {
      $('#' + k).html(counter[k]);
    }
    city.setSource(sourcePool[currentAdm]);
  })
});

var getCityStyle = function(f) {
  var p = f.getProperties();
  var codeKey = 'ADM' + currentAdm + '_PCODE';
  var code = p[codeKey];
  var confirmedCount = 0;
  var lv = 'lv0';
  var theStyle;
  if(currentAdm == '2') {
    if(dataPool['adm2'][code]) {
      confirmedCount = dataPool['adm2'][code]['confirmedCount'];
      if(confirmedCount > 499) {
        lv = 'lv5';
      } else if(confirmedCount > 299) {
        lv = 'lv4';
      } else if(confirmedCount > 99) {
        lv = 'lv3';
      } else if(confirmedCount > 9) {
        lv = 'lv2';
      } else if(confirmedCount > 0) {
        lv = 'lv1';
      }
    }
    theStyle = styleLv[lv].clone();
    theStyle.getText().setText(p.ADM1_ZH + p.ADM2_ZH + '(' + confirmedCount + ')');
  } else {
    code = p.ADM1_ZH;
    if(dataPool['adm1'][code]) {
      confirmedCount = dataPool['adm1'][code]['confirmedCount'];
      if(confirmedCount > 1000) {
        lv = 'lv5';
      } else if(confirmedCount > 499) {
        lv = 'lv4';
      } else if(confirmedCount > 99) {
        lv = 'lv3';
      } else if(confirmedCount > 9) {
        lv = 'lv2';
      } else if(confirmedCount > 0) {
        lv = 'lv1';
      }
    }
    theStyle = styleLv[lv].clone();
    theStyle.getText().setText(p.ADM1_ZH + '(' + confirmedCount + ')');
  }
  f.setProperties({
    'lv': lv,
    'confirmedCount': confirmedCount
  });
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
var lastFeature = false;
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
        if(dataPool['adm1'][p.ADM1_ZH]) {
          message += '<tr><th scope="row">確診</th><td>' + dataPool['adm1'][p.ADM1_ZH]['confirmedCount'] + '</td></tr>';
          message += '<tr><th scope="row">疑似</th><td>' + dataPool['adm1'][p.ADM1_ZH]['suspectedCount'] + '</td></tr>';
          message += '<tr><th scope="row">治癒</th><td>' + dataPool['adm1'][p.ADM1_ZH]['curedCount'] + '</td></tr>';
          message += '<tr><th scope="row">死亡</th><td>' + dataPool['adm1'][p.ADM1_ZH]['deadCount'] + '</td></tr>';
        }
        sidebarTitle.innerHTML = p.ADM1_ZH;
      }
      message += '</tbody></table>';
      content.innerHTML = message;
      pointClicked = true;

      if(false !== lastFeature) {
        lastFeature.setStyle(getCityStyle(lastFeature));
      }
      var theStyle = styleLv[p.lv].clone();
      if(currentAdm == '2') {
        theStyle.getText().setText(p.ADM1_ZH + p.ADM2_ZH + '(' + p.confirmedCount + ')');
      } else {
        theStyle.getText().setText(p.ADM1_ZH + '(' + p.confirmedCount + ')');
      }
      theStyle.setStroke(clickStroke);
      feature.setStyle(theStyle);
      lastFeature = feature;
    }
  });
  sidebar.open('home');
});

var lvStroke = new ol.style.Stroke({
  color: 'rgba(37,67,140,0.5)',
  width: 1
});
var clickStroke = new ol.style.Stroke({
  color: 'rgba(255,0,0,0.7)',
  width: 3
});
var lvText = new ol.style.Text({
  font: 'bold 16px "Open Sans", "Arial Unicode MS", "sans-serif"',
  fill: new ol.style.Fill({
    color: 'blue'
  })
});
var styleLv = {};
styleLv['lv0'] = new ol.style.Style({
  stroke: lvStroke,
  text: lvText,
  fill: new ol.style.Fill({
    color: 'rgba(255,255,255,0.1)'
  })
});
styleLv['lv1'] = new ol.style.Style({
  stroke: lvStroke,
  text: lvText,
  fill: new ol.style.Fill({
    color: 'rgba(240,143,127,0.5)'
  })
});
styleLv['lv2'] = new ol.style.Style({
  stroke: lvStroke,
  text: lvText,
  fill: new ol.style.Fill({
    color: 'rgba(226,96,97,0.5)'
  })
});
styleLv['lv3'] = new ol.style.Style({
  stroke: lvStroke,
  text: lvText,
  fill: new ol.style.Fill({
    color: 'rgba(195,69,72,0.5)'
  })
});
styleLv['lv4'] = new ol.style.Style({
  stroke: lvStroke,
  text: lvText,
  fill: new ol.style.Fill({
    color: 'rgba(156,47,49,0.5)'
  })
});
styleLv['lv5'] = new ol.style.Style({
  stroke: lvStroke,
  text: lvText,
  fill: new ol.style.Fill({
    color: 'rgba(115,25,25,0.5)'
  })
});

$('#btnAdm1').click(function() {
  currentAdm = '1';
  city.setSource(sourcePool[currentAdm]);
  sidebar.close();
  $('a.btn-adm').each(function(k, obj) {
    if($(obj).attr('id') === 'btnAdm1') {
      $(obj).removeClass('btn-secondary');
      $(obj).addClass('btn-primary');
    } else {
      $(obj).removeClass('btn-primary');
      $(obj).addClass('btn-secondary');
    }
  });
  return false;
});

$('#btnAdm2').click(function() {
  currentAdm = '2';
  city.setSource(sourcePool[currentAdm]);
  sidebar.close();
  $('a.btn-adm').each(function(k, obj) {
    if($(obj).attr('id') === 'btnAdm2') {
      $(obj).removeClass('btn-secondary');
      $(obj).addClass('btn-primary');
    } else {
      $(obj).removeClass('btn-primary');
      $(obj).addClass('btn-secondary');
    }
  });
  return false;
});

var sidebarTitle = document.getElementById('sidebarTitle');
var content = document.getElementById('sidebarContent');