<?php
$json = json_decode(file_get_contents('https://view.inews.qq.com/g2/getOnsInfo?name=disease_h5'));
if(!empty($json->data)) {
    file_put_contents(dirname(__DIR__) . '/raw/qq.com/data.json', json_encode(json_decode($json->data),  JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}