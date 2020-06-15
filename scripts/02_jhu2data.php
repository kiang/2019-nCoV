<?php
$rootPath = dirname(__DIR__);
$repo = "{$rootPath}/tmp/COVID-19";
exec("cd {$repo} && /usr/bin/git pull");

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
$lastTotal = array();
$filesToSkip = array('Notice', 'README');
foreach(glob($repo . '/csse_covid_19_data/csse_covid_19_daily_reports/*.csv') AS $csvFile) {
    $p = pathinfo($csvFile);
    if(in_array($p['filename'], $filesToSkip)) {
        continue;
    }
    $parts1 = explode('-', $p['filename']);
    $sheetTime = strtotime(implode('-', array($parts1[2], $parts1[0], $parts1[1])));

    $pointFile = $pointPath . '/' . date('Ymd', $sheetTime) . '.json';
    $fc = array(
        'type' => 'FeatureCollection',
        'features' => array(),
    );
    $fh = fopen($csvFile, 'r');
    $head = fgetcsv($fh, 2048);
    if('efbbbf' === bin2hex(substr($head[0], 0, 3))) {
        $head[0] = substr($head[0], 3);
    }
    $currentTotal = array(
        'Confirmed' => 0,
        'Recovered' => 0,
        'Deaths' => 0,
    );
    while($line = fgetcsv($fh, 2048)) {
        $data = array_combine($head, $line);
        foreach($data AS $k => $v) {
            switch($k) {
                case 'Confirmed':
                case 'Recovered':
                case 'Deaths':
                    $data[$k] = intval($data[$k]);
                break;
                case 'Country':
                case 'Country_Region':
                    $data['Country/Region'] = $data[$k];
                    unset($data[$k]);
                break;
                case 'Province_State':
                    $data['Province/State'] = $data[$k];
                    unset($data[$k]);
                break;
                case 'Date last updated':
                case 'Last_Update':
                    $data['Last Update (UTC)'] = $data[$k];
                    unset($data[$k]);
                break;
                case 'Lat':
                    $data['Latitude'] = $data[$k];
                    unset($data[$k]);
                break;
                case 'Long_':
                    $data['Longitude'] = $data[$k];
                    unset($data[$k]);
                break;
            }
        }
        $currentTotal['Confirmed'] += $data['Confirmed'];
        $currentTotal['Recovered'] += $data['Recovered'];
        $currentTotal['Deaths'] += $data['Deaths'];
        switch($data['Country/Region']) {
            case 'Mainland China':
            case 'Macau':
                $data['Country/Region'] = 'China';
            break;
            case 'Taipei and environs':
                $data['Country/Region'] = 'Taiwan';
            break;
        }
        $f = array(
            'type' => 'Feature',
            'properties' => $data,
            'geometry' => array(
                'type' => 'Point',
                'coordinates' => array(),
            ),
        );
        if(!empty($data['Latitude']) && !empty($data['Longitude'])) {
            $f['geometry']['coordinates'] = array($data['Longitude'], $data['Latitude']);
            $fc['features'][] = $f;
        } else {
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
    }
    file_put_contents($pointFile, json_encode($fc,  JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_NUMERIC_CHECK));

    if($sheetTime > $last) {
        $last = $sheetTime;
        $lastTotal = $currentTotal;
    }
}
$meta = json_decode(file_get_contents(dirname(__DIR__) . '/data/meta.json'), true);
$meta['points'] = date('Ymd', $last);
foreach($lastTotal AS $k => $v) {
    $meta[$k] = $v;
}
file_put_contents(dirname(__DIR__) . '/data/meta.json', json_encode($meta, JSON_PRETTY_PRINT));
