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
    * @var Clients_Controller_Client
    */
   protected $_recordController = NULL;

   /**
    * the constructor
    *
    */
   public function __construct()
   {
       $this->_applicationName = 'Messenger';
       //$this->_recordController = Clients_Controller_Client::getInstance();
   }
}