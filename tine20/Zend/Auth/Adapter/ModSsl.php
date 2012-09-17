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
 * @todo log user get logged in
 */
class Zend_Auth_Adapter_ModSsl implements Zend_Auth_Adapter_Interface
{
    public function authenticate()
    {
        if (!empty($_SERVER['SSL_CLIENT_CERT']) &&  !empty($_SERVER['SSL_CLIENT_VERIFY']) && $_SERVER['SSL_CLIENT_VERIFY'] == 'SUCCESS')
        {
            // get Identity
            $certificate = Expresso_Security_CertificateFactory::buildCertificate($_SERVER['SSL_CLIENT_CERT']);
            
            if ($certificate instanceof Expresso_Security_Certificate_ICPBrasil)
            {
                $config = (object)Tinebase_Config::getInstance()->getConfig('digital_certificate')->value;
                if (class_exists($config->username_callback))
                {
                    $callback = new $config->username_callback($certificate);
                }
                else
                {
                    $callback = new Expresso_Security_UsernameCallback_Abstract($certificate);
                }
                
                if ($certificate->isPF())
                {
                    $this->setIdentity(call_user_func(array($callback, 'getUsername')));
                    $this->setCredential(null);
                    $messages = array('Authentication Successfull');
                    return new Zend_Auth_Result(Zend_Auth_Result::SUCCESS, $this->_identity, $messages);
                }
            }
        }
        
        $messages = array('Nope!');
        return new Zend_Auth_Result(Zend_Auth_Result::FAILURE, '', $messages);
    }
}