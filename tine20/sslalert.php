<!DOCTYPE html>
<html>
    <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>
    <body>
        <div align="center"><H1>Não foi possível usar o certificado apresentado para acessar o Expresso.</H1></div>
        <div align="center">
            <?php
               echo '</br></br>';
               $d = explode('#', base64_decode($_REQUEST['d']));
               foreach ($d as $value) 
               {
                   echo $value . '</br>';
               }
            ?>
        </div>
    </body>
</html>
