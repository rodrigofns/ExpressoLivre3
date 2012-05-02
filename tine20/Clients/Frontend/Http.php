<?php
/**
* This class handles all Http requests for the application
*
* @package     Clients
* @subpackage  Frontend
*/
class Clients_Frontend_Http extends Tinebase_Frontend_Http_Abstract
{
   protected $_applicationName = 'Clients';
   
   /**
    * Returns all JS files which must be included for this app
    *
    * @return array Array of filenames
    */
   public function getJsFilesToInclude()
   {
       return array(
           'Clients/js/Clients.js',
           'Clients/js/Models.js',
           'Clients/js/GridPanel.js',
           'Clients/js/EditDialog.js',
       );
   }
}
