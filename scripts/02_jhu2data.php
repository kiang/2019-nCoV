<?php
require dirname(__DIR__) . '/env.php';
$tmpPath = dirname(__DIR__) . '/osm/jhu.edu';
if(!file_exists($tmpPath)) {
    mkdir($tmpPath, 0777, true);
}
$pointPath = dirname(__DIR__) . '/data/points';
if(!file_exists($pointPath)) {
    mkdir($pointPath, 0777, true);
}
$filePath = dirname(__DIR__) . '/raw/jhu.edu';
$baseUrl = 'https://nominatim.openstreetmap.org/search?format=json&email=' . urlencode($email) . '&q=';
$last = 0;
foreach(glob($filePath . '/*.csv') AS $csvFile) {
    $p = pathinfo($csvFile);
    $ymd = array('2020');
    $ymd[] = date('m', strtotime(substr($p['filename'], 0, 3)));
    $parts = explode('_', substr($p['filename'], 3));
    $ymd[] = str_pad($parts[0], 2, '0', STR_PAD_LEFT);
    if(strlen($parts[1]) < 5) {
        $his = date('H:i:s', strtotime($parts[1]));
    } else {
        $parts[1] = substr($parts[1], 0, -4) . ':' . substr($parts[1], -4);
        $his = date('H:i:s', strtotime($parts[1]));
    }
    $sheetTime = strtotime(implode('-', $ymd) . ' ' . $his);
    if($sheetTime > $last) {
        $last = $sheetTime;
    }
    $pointFile = $pointPath . '/' . date('Ymd_His', $sheetTime) . '.json';
    $fc = array(
        'type' => 'FeatureCollection',
        'features' => array(),
    );
    $fh = fopen($csvFile, 'r');
    $head = fgetcsv($fh, 2048);
    while($line = fgetcsv($fh, 2048)) {
        $data = array_combine($head, $line);
        if(isset($data['Country'])) {
            $data['Country/Region'] = $data['Country'];
            unset($data['Country']);
        }
        if(isset($data['Date last updated'])) {
            $data['Last Update'] = $data['Date last updated'];
            unset($data['Date last updated']);
        }
        $f = array(
            'type' => 'Feature',
            'properties' => $data,
            'geometry' => array(
                'type' => 'Point',
                'coordinates' => array(),
            ),
        );
        if($data['Country/Region'] === 'Mainland China') {
            $data['Country/Region'] = 'China';
        }
        $cacheFile = "{$tmpPath}/{$data['Province/State']}_{$data['Country/Region']}.json";
        if(!file_exists($cacheFile)) {
            $qUrl = $baseUrl . urlencode("{$data['Province/State']}, {$data['Country/Region']}");
            file_put_contents($cacheFile, file_get_contents($qUrl));
        }
        $json = json_decode(file_get_contents($cacheFile), true);
        if(!empty($json[0]['lat'])) {
            $f['geometry']['coordinates'] = array($json[0]['lon'], $json[0]['lat']);
            $fc['features'][] = $f;
        }
    }
    file_put_contents($pointFile, json_encode($fc,  JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_NUMERIC_CHECK));
}
$meta = json_decode(file_get_contents(dirname(__DIR__) . '/data/meta.json'));
$meta->points = date('Ymd_His', $last);
file_put_contents(dirname(__DIR__) . '/data/meta.json', json_encode($meta, JSON_PRETTY_PRINT));