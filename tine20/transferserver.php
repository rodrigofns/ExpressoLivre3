<?php

echo '<script>';

if (move_uploaded_file($_FILES['file']['tmp_name'], '/tmp/messenger/' . $_FILES['file']['name']))
    echo 'alert("File Sent!");';
else
    echo 'alert("File Transfer ERROR!");';

echo 'location.href = "upload.html";</script>';