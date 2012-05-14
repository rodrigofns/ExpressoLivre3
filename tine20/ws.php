<?php

$session_id = $_POST['SID'];
$login_name = $_POST['LGN'];

$pdo = new PDO('mysql:host=localhost;dbname=expresso', 'root', '12345');
$sql = 'SELECT al.ip, substring(email, 1, locate(\'@\', email)-1) as login_name
        FROM tine20_access_log al
        INNER JOIN tine20_accounts ac ON ac.login_name = al.login_name
        WHERE sessionid = :sessionid AND email LIKE :search AND lo is null';
$st = $pdo->prepare($sql);
$st->bindParam(':sessionid', $session_id, PDO::PARAM_STR);
$st->bindParam(':search', $login_name, PDO::PARAM_STR);
$st->execute();
$user_access = $st->fetch(PDO::FETCH_OBJ);

$server = $_SERVER['SERVER_NAME'].' ('.$_SERVER['SERVER_ADDR'].')';
$remote = (isset($_SERVER['REMOTE_HOST']) ? $_SERVER['REMOTE_HOST'] : '') . 
          ' ('.$_SERVER['REMOTE_ADDR'].':'.$_SERVER['REMOTE_PORT'].')';

file_put_contents('/home/91900603500/tmp/ws.log', "$remote => $server\n", FILE_APPEND);
file_put_contents('/home/91900603500/tmp/ws.log', "$user_access->ip / $user_access->login_name\n", FILE_APPEND);
file_put_contents('/home/91900603500/tmp/ws.log', "============================================\n", FILE_APPEND);

header('Content-type: application/json');
echo json_encode(array(
    'login_name' => $user_access->login_name,
    'ip'         => $user_access->ip
));