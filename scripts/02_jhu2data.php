<?php
require dirname(__DIR__) . '/env.php';
$tmpPath = dirname(__DIR__) . '/osm/jhu.edu';
if(!file_exists($tmpPath)) {
    mkdir($tmpPath, 0777, true);
}
$filePath = dirname(__DIR__) . '/raw/jhu.edu';
$baseUrl = 'https://nominatim.openstreetmap.org/search?format=json&email=' . urlencode($email) . '&q=';
foreach(glob($filePath . '/*.csv') AS $csvFile) {
    $fh = fopen($csvFile, 'r');
    $head = fgetcsv($fh, 2048);
    while($line = fgetcsv($fh, 2048)) {
        $data = array_combine($head, $line);
        if($data['Country/Region'] === 'Mainland China') {
            $data['Country/Region'] = 'China';
        }
        $cacheFile = "{$tmpPath}/{$data['Province/State']}_{$data['Country/Region']}.json";
        if(!file_exists($cacheFile)) {
            echo $qUrl = $baseUrl . urlencode("{$data['Province/State']}, {$data['Country/Region']}");
            file_put_contents($cacheFile, file_get_contents($qUrl));
        }
        $json = json_decode(file_get_contents($cacheFile));
    }
}