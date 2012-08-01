<?php
$file = urldecode($_GET['file']);
$download = ($_GET['download'] == 'yes');
file_put_contents('/tmp/filetransfer.log', "$file\n$download\n", FILE_APPEND);
file_put_contents('/tmp/filetransfer.log', "FILE EXISTS: ".(file_exists($file) ? "SIM":"NÃO")."\n", FILE_APPEND);
file_put_contents('/tmp/filetransfer.log', "DOWNLOAD: ".($download ? "SIM":"NÃO")."\n", FILE_APPEND);
if (file_exists($file) && $download) {
    file_put_contents('/tmp/filetransfer.log', "GOT IN!!\n", FILE_APPEND);
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
    file_put_contents('/tmp/filetransfer.log', "DOWNLOAD!!\n", FILE_APPEND);
}
file_put_contents('/tmp/filetransfer.log', "DELETING...\n", FILE_APPEND);
unlink($file);
file_put_contents('/tmp/filetransfer.log', "DELETED!\n\n", FILE_APPEND);
exit;