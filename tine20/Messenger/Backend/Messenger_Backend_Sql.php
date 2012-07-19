<?php

class Messenger_Backend_Sql extends Tinebase_Backend_Sql_Abstract
{
    
    /**
    * Table name without prefix (required)
    *
    * @var string
    */
   protected $_tableName = 'messenger';
   
   /**
    * Model name (required)
    *
    * @var string
    */
   protected $_modelName = 'Messenger_Model_PersonalConfig';
    
}