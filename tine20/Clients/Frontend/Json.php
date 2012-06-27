<?php
/**
*
* This class handles all Json requests for the application
*
* @package     Clients
* @subpackage  Frontend
*/
class Clients_Frontend_Json extends Tinebase_Frontend_Json_Abstract
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
       $this->_applicationName = 'Clients';
       $this->_recordController = Clients_Controller_Client::getInstance();
   }

   /**
    * Search for records matching given arguments
    *
    * @param string $filter json encoded
    * @param string $paging json encoded
    * @return array
    */
   public function searchRecords($filter, $paging)
   {
       return $this->_search($filter, $paging, $this->_recordController, 'Clients_Model_ClientFilter');
   }     
   
   /**
    * Return a single record
    *
    * @param   string $uid
    * @return  array record data
    */
   public function getRecord($uid)
   {
       return $this->_get($uid, $this->_recordController);
   }

   /**
    * creates/updates a record
    *
    * @param  string $recordData
    * @return array created/updated record
    */
   public function saveRecord($recordData)
   {
       return $this->_save($recordData, $this->_recordController, 'Client');
   }
    
   /**
    * deletes existing records
    *
    * @param string $ids 
    * @return string
    */
   public function deleteRecords($ids)
   {
       $this->_delete($ids, $this->_recordController);
   }   
}