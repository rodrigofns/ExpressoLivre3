<?php
/**
 * Tine 2.0
 * 
 * @category   Zend
 * @package    Zend_Auth
 * @subpackage Zend_Auth_Adapter
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2009-2013 Serpro (http://www.serpro.gov.br)
 * @author      Mário César Kolling <mario.koling@serpro.gov.br>
 */

/**
 * DigitalCertificate authentication backend adapter
 * 
 * @category   Zend
 * @package    Zend_Auth
 * @subpackage Zend_Auth_Adapter
 * @todo verify Digital certificate
 */
class Zend_Auth_Adapter_ModSsl implements Zend_Auth_Adapter_Interface
{
    public function authenticate()
    {
        if (!empty($_SERVER['SSL_CLIENT_CERT']) &&  !empty($_SERVER['SSL_CLIENT_VERIFY']) && $_SERVER['SSL_CLIENT_VERIFY'] == 'SUCCESS')
        {
            // Dummy Auth
            $this->setIdentity('teste1');
            $this->setCredential(null);
            $messages = array('Authentication Successfull');
            return new Zend_Auth_Result(Zend_Auth_Result::SUCCESS, $this->_identity, $messages);
        }
        else
        {
            $messages = array('Nope!');
            return new Zend_Auth_Result(Zend_Auth_Result::FAILURE, '', $messages);;
        }
        
    }
}