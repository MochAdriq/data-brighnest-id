<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$serverBase = __DIR__ . '/../laravel_app';
$basePath = is_dir($serverBase) ? $serverBase : dirname(__DIR__);

if (file_exists($maintenance = $basePath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $basePath . '/vendor/autoload.php';
$app = require_once $basePath . '/bootstrap/app.php';

$app->handleRequest(Request::capture());
