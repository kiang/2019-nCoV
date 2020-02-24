<?php
$json = json_decode(file_get_contents('https://od.cdc.gov.tw/eic/Weekly_Age_County_Gender_19CoV.json'));
if(!empty($json)) {
    file_put_contents(dirname(__DIR__) . '/raw/taiwan/Weekly_Age_County_Gender_19CoV.json', json_encode($json,  JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}