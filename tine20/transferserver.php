<?php

$pathname = $_POST['path'];
if (!file_exists($pathname))
    mkdir($pathname);

$fileName = $_FILES['file']['name'];
$fileSize = $_FILES['file']['size'];

$error = $_FILES['file']['error'];
$status = '';
switch ($error)
{
    case UPLOAD_ERR_OK:
        if (move_uploaded_file($_FILES['file']['tmp_name'], $pathname . $fileName))
            $status = 'OK';
        break;
    case UPLOAD_ERR_INI_SIZE:
        $kb = ini_get('upload_max_filesize');
        $status = 'File too big - must be less then ' . $kb . 'B';
        break;
    case UPLOAD_ERR_PARTIAL:
        $status = 'File partialy uploaded';
        break;
    case UPLOAD_ERR_NO_FILE:
        $status = 'File was not uploaded';
        break;
    default:
        $status = 'File transfer error';
}

echo json_encode(array(
    "error"    => ($error != 0),
    "status"   => $status,
    "path"     => $pathname,
    "fileName" => $fileName,
    "fileSize" => $fileSize
));