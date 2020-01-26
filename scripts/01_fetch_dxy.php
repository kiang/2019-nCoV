<?php
$rawPage = dirname(__DIR__) . '/raw/3g.dxy.cn/page.html';
file_put_contents($rawPage, file_get_contents('https://3g.dxy.cn/newh5/view/pneumonia'));
$raw = file_get_contents($rawPage);
$pos = strpos($raw, '<script id="getAreaStat">');
$pos = strpos($raw, '[{"', $pos);
$posEnd = strpos($raw, '}catch(e)', $pos);
$rawJson = substr($raw, $pos, $posEnd - $pos);
file_put_contents(dirname(__DIR__) . '/raw/3g.dxy.cn/data.json', json_encode(json_decode($rawJson),  JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));