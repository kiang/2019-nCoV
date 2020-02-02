<?php
require_once 'vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;

$filePath = dirname(__DIR__) . '/raw/jhu.edu';
if(!file_exists($filePath)) {
    mkdir($filePath, 0777, true);
}
$spreadsheetFile = $filePath . '/data.xlsx';
file_put_contents($spreadsheetFile, file_get_contents('https://docs.google.com/spreadsheets/d/1yZv9w9zRKwrGTaR-YzmAqMefw4wMlaXocejdxZaTs6w/export?format=xlsx&id=1yZv9w9zRKwrGTaR-YzmAqMefw4wMlaXocejdxZaTs6w'));
$spreadsheet = IOFactory::load($spreadsheetFile);
$sheetIndex = 0;
foreach ($spreadsheet->getAllSheets() AS $worksheet) {
    $targetFile = $filePath . '/' . $worksheet->getTitle() . '.csv';
    $targetFile = str_replace(' ', '_', $targetFile);
    $writer = new \PhpOffice\PhpSpreadsheet\Writer\Csv($spreadsheet);
    $writer->setSheetIndex($sheetIndex);
    $writer->save($targetFile);
    ++$sheetIndex;
}