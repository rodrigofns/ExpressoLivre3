<?php

/**
* record controller class for Application
* 
* @package     Clients
* @subpackage  Controller
*/
class Clients_Controller_Client extends Tinebase_Controller_Record_Abstract
{
   /**
    * the constructor
    *
    * don't use the constructor. use the singleton 
    */
   private function __construct() {        
       $this->_applicationName = 'Clients';
       $this->_backend = new Clients_Backend_Client();
       $this->_modelName = 'Clients_Model_Client';
       $this->_currentAccount = Tinebase_Core::getUser();   
   }    
   
   /**
    * holdes the instance of the singleton
    *
    * @var Application_Controller_Record
    */
   private static $_instance = NULL;
   
   /**
    * the singleton pattern
    *
    * @return Application_Controller_Record
    */
   public static function getInstance() 
   {
       if (self::$_instance === NULL) {
           self::$_instance = new Clients_Controller_Client();
       }
       
       return self::$_instance;
   }        
}