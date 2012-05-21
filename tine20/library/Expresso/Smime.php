<?php
/**
 * Expresso 3.0
 *
 * @package     Expresso
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2008 Serpro (www.serpro.gov.br)
 * @author      Mário César Kolling <mario.kolling@serpro.gov.br>
 * 
 */

class Expresso_Smime extends Zend_Mime
{

    const CONTENT_TYPE_MULTIPART_SIGNED = 'multipart/signed';
    const CONTENT_TYPE_APPLICATION_X_PKCS7_MIME = 'application/x-pkcs7-mime';
    const CONTENT_TYPE_APPLICATION_PKCS7_MIME = 'application/pkcs7-mime';
    const CONTENT_TYPE_APPLICATION_PKCS7_SIGNATURE = 'application/pkcs7-signature';

    const CONTENT_TYPE_PROPERTY_SMIME_TYPE = 'smime-type';
    const CONTENT_TYPE_PROPERTY_NAME = 'name';

    const SMIME_TYPE_SIGNED_DATA = 'signed-data';
    const SMIME_TYPE_ENVELOPED_DATA = 'enveloped-data';
    const SMIME_TYPE_COMPRESSED_DATA = 'compressed-data';
    const SMIME_TYPE_CERTS_ONLY = 'certs-only';

    const TYPE_SIGNED_DATA_VALUE = 1;
    const TYPE_ENVELOPED_DATA_VALUE = 2;
    const TYPE_COMPRESSED_DATA_VALUE = 3;
    const TYPE_CERTS_ONLY_VALUE = 4;
    const TYPE_UNDEFINED_VALUE = 5;

    const PKCS7_SIGNATURE_EXTENSION = '.p7s';
    const PKCS7_ENVELOPED_SIGNED_EXTENSION = '.p7m';
    const PKCS7_CERTS_EXTENSION = '.p7c';
    const PKCS7_COMPRESSED_EXTENSION = '.p7z';

    /**
     * Verify a integrity of a signed message
     *
     * @return array
     */
    public static function verifyIntegrity($msg, $path) // Only message Integrity
    {
        $return = array();

        if (!empty($msg))
        {
            // creates temporary files
            $temporary_files = array();
            $msgTempFile = self::generateTempFilename($temporary_files, $path);
            if (!self::writeTo($msgTempFile, $msg))
            {
                $return['success'] = false;
                $return['msgs'] = array("Coudn't write temporary files!");
            }

            // do verification
            $result = openssl_pkcs7_verify($msgTempFile,PKCS7_NOVERIFY);

            if ($result === -1 || !$result)
            {
                // error
                $return['success'] = false;
                $return['msgs'] = self::getOpensslErrors();

            }
            else {
                $return['success'] = true;
                $return['msgs'] = array("Verification Successful");
            }

            self::removeTempFiles($temporary_files);

            return $return;

        }
        else
        {
            return array(
                'success'   => false,
                'msgs'       => array("Empty message"),
            );
        }
    }

    public static function writeTo($file, $content)
    {
        return file_put_contents($file, $content);   
    }

    public static function generateTempFilename(&$tab_arqs, $path)
    {

        $list = array('A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z');
        $N = $list[rand(0,count($list)-1)].date('U').$list[rand(0,count($list)-1)].RAND(12345,9999999999).$list[rand(0,count($list)-1)].$list[rand(0,count($list)-1)].RAND(12345,9999999999).'.tmp';
        $aux = $path.'/'.$N;
        array_push($tab_arqs ,$aux);
        return  $aux;
    }

    private static function getOpensslErrors()
    {
        $errors = array();
        while ($error = openssl_error_string())
        {
            $errors[] = $error;
        }
        return $errors;
    }

    private static function removeTempFiles($tab_arqs)
    {
        foreach($tab_arqs as $arquivo )
        {
            if(file_exists($arquivo))
            {
                unlink($arquivo);
            }
        }
    }

}

?>
