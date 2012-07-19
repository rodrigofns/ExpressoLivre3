<?php

define('AUTH_URL', 'http://10.200.237.159:5678/ws.php');

$resource = curl_init();
$get_url = curl_setopt($resource, CURLOPT_URL, AUTH_URL);
if (!$get_url)
    die('N&aacute;o capturou a URL: '.AUTH_URL);
curl_setopt($resource, CURLOPT_HEADER, false);
curl_setopt($resource, CURLOPT_RETURNTRANSFER, true);
curl_setopt($resource, CURLOPT_POST, true);
curl_setopt($resource, CURLOPT_POSTFIELDS, array('SID' => 'b1v9jhkuqrm54vp0tlub4sdrlkeoa5un',
                                                 'LGN' => "carlos.pilla%"));
$raw_html = curl_exec($resource);
curl_close($resource);

var_dump((empty($raw_html)) ? '{}' : json_decode($raw_html));