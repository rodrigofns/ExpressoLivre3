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
 * @todo        probaly we won't use this class, delete it
 */

abstract class Expresso_Security_Certificate_Abstract
{
    
    protected $certificate; // TODO: pem or der format??? its pem for now
    
    // other certificate properties
    
    public function __construct($certificate)
    {
        $this->certificate = $certificate;
        $c = openssl_x509_parse($certificate);
        
        // define other certificate properties
    }
    
    // getters and setters
}