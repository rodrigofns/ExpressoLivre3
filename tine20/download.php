<?php
$file = '/tmp/messenger/' . $_GET['file'];
$download = ($_GET['download'] == 1);

if (file_exists($file) && $download) {
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename='.basename($file));
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($file));
    ob_clean();
    flush();
    readfile($file);
}

unlink($file);
exit;