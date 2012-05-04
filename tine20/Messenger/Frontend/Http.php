<?php
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
           'Messenger/js/jquery-1.7.1.min.js'
       );
   }
}
