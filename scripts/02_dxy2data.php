<?php
$geojson = json_decode(file_get_contents(dirname(__DIR__) . '/json/adm2.json'), true);
$ref = array();
foreach($geojson['features'] AS $f) {
    $name1 = $f['properties']['ADM1_ZH'];
    $name2 = $f['properties']['ADM2_ZH'];
    if(!isset($ref[$name1])) {
        $ref[$name1] = array(
            'code' => $f['properties']['ADM1_PCODE'],
            'cities' => array(),
        );
    }
    if(!isset($ref[$name1]['cities'][$name2])) {
        $ref[$name1]['cities'][$name2] = $f['properties']['ADM2_PCODE'];
    }
}
$json = json_decode(file_get_contents(dirname(__DIR__) . '/raw/3g.dxy.cn/data.json'), true);
$hardCodes = array(
    '湖南省株洲' => 'CN431400',
    '内蒙古自治区满洲里' => 'CN150700',
);
$year = date('Y');
$dataPath = dirname(__DIR__) . '/data/' . $year;
if(!file_exists($dataPath)) {
    mkdir($dataPath, 0777, true);
}
$data = array(
    'adm1' => array(),
    'adm2' => array(),
);
foreach($json AS $p1) {
    $provinceFound = false;
    foreach($ref AS $pName => $pValue) {
        if(false === $provinceFound && false !== strpos($pName, $p1['provinceName'])) {
            $p1['code'] = $pValue['code'];
            $provinceFound = $pName;
        }
    }
    if($provinceFound) {
        $data['adm1'][$provinceFound] = array(
            'confirmedCount' => $p1['confirmedCount'],
            'suspectedCount' => $p1['suspectedCount'],
            'curedCount' => $p1['curedCount'],
            'deadCount' => $p1['deadCount'],
        );
        foreach($p1['cities'] AS $p2) {
            $cityFound = false;
            $key = $provinceFound . $p2['cityName'];
            if(isset($hardCodes[$key])) {
                $cityFound = $hardCodes[$key];
            }
            foreach($ref[$provinceFound]['cities'] AS $cityName => $cityCode) {
                if(false === $cityFound && false !== strpos($cityName, $p2['cityName'])) {
                    $cityFound = $cityCode;
                }
                if(false === $cityFound && false !== strpos($cityName, mb_substr($p2['cityName'], 0, 2, 'utf-8'))) {
                    $cityFound = $cityCode;
                }
            }
            if(false === $cityFound) {
                $cityKey = key($ref[$provinceFound]['cities']);
                $cityFound = $ref[$provinceFound]['cities'][$cityKey];
            }
            if(!isset($data['adm2'][$cityFound])) {
                $data['adm2'][$cityFound] = array(
                    'confirmedCount' => 0,
                    'suspectedCount' => 0,
                    'curedCount' => 0,
                    'deadCount' => 0,
                );
            }
            $data['adm2'][$cityFound]['confirmedCount'] += $p2['confirmedCount'];
            $data['adm2'][$cityFound]['suspectedCount'] += $p2['suspectedCount'];
            $data['adm2'][$cityFound]['curedCount'] += $p2['curedCount'];
            $data['adm2'][$cityFound]['deadCount'] += $p2['deadCount'];
        }
    }

}
ksort($data['adm1']);
ksort($data['adm2']);
$today = date('Ymd');
$dataFile = $dataPath . '/' . $today . '.json';
file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));

$metaFile = dirname(__DIR__) . '/data/meta.json';
if(!file_exists($metaFile)) {
    file_put_contents($metaFile, json_encode(array(
        'begin' => $today,
        'end' => $today,
    ), JSON_PRETTY_PRINT | JSON_NUMERIC_CHECK));
} else {
    $meta = json_decode(file_get_contents($metaFile), true);
    $meta['end'] = $today;
    file_put_contents($metaFile, json_encode($meta, JSON_PRETTY_PRINT | JSON_NUMERIC_CHECK));
}