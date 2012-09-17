<?php

/**
 * Tine 2.0
 *
 * @package     Expresso
 * @subpackage  Security
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Antonio Carlos da Silva <antonio-carlos.silva@serpro.gov.br>
 * @author      Mario Cesar Kolling <mario.kolling@serpro.gov.br>
 * @copyright   Copyright (c) 2009-2013 Serpro (http://www.serpro.gov.br)
 * @todo        verify certificate format
 * @todo        support other possible formats pkcs7, pkcs12, etc?
 * 
 */

class Expresso_Security_CertificateFactory
{
    
    public static function buildCertificate($certificate)
    {   
        if(!extension_loaded('openssl'))
        {
            // No suport to openssl.....
            throw new Expresso_Security_Exception_OpensslNotLoaded('Openssl not supported!');
        }
        
        if (!preg_match('/^-----BEGIN CERTIFICATE-----/', $certificate)){
            // TODO: convert to pem
        }
        
        // get Oids from ICPBRASIL
        $icpBrasilData = Expresso_Security_Certificate_ICPBrasil::parseICPBrasilData($certificate);
        if ($icpBrasilData)
        {
            return new Expresso_Security_Certificate_ICPBrasil($certificate, $icpBrasilData);
        }
        return new Expresso_Security_Certificate_X509($certificate);
        
    }
    
    
}
            
            
