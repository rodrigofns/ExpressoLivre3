<?php
/**
*
* This class handles all Json requests for the application
*
* @package     Clients
* @subpackage  Frontend
*/
class Messenger_Frontend_Json extends Tinebase_Frontend_Json_Abstract
{    

    /**
    * controller
    *
    * @var Controller_Client
    */
   protected $_controller = NULL;

   /**
    * the constructor
    *
    */
   public function __construct()
   {
       $this->_applicationName = 'Messenger';
       $this->_controller = Messenger_Controller::getInstance();
   }
   
   /**
    *  
    */
   public function getLocalServerInfo($login)
   {
       return $this->_controller->getLocalServerInfo($login);
   }
   
}