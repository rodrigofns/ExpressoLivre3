<?php

/**
* backend for records
*
* @package     Clients
* @subpackage  Backend
*/
class Clients_Backend_Client extends Tinebase_Backend_Sql_Abstract
{
   /**
    * Table name without prefix (required)
    *
    * @var string
    */
   protected $_tableName = 'client';
   
   /**
    * Model name (required)
    *
    * @var string
    */
   protected $_modelName = 'Clients_Model_Client';
}
