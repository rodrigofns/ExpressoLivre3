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
 * 
 */

class Expresso_Security_UsernameCallback_Abstract implements Expresso_Security_UsernameCallback_Interface
{
    /**
     * @var Expresso_Security_Certificate_X509
     */
    protected $certificate;
            
    public function __construct(Expresso_Security_Certificate_X509 $certificate) {
        $this->certificate = $certificate;
    }
    
    public function getUsername() {
        return $this->certificate->getEmail();
    }
}