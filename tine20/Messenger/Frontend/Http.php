<?php

/**
* This class handles all Http requests for the application
*
* @package     Application
* @subpackage  Frontend
*/
class Messenger_Frontend_Http extends Tinebase_Frontend_Http_Abstract
{
   protected $_applicationName = 'Messenger';
   
   /**
    * Returns all JS files which must be included for this app
    *
    * @return array Array of filenames
    */
   public function getJsFilesToInclude()
   {
       return array(
           'Messenger/js/Application.js',
       );
   }
}