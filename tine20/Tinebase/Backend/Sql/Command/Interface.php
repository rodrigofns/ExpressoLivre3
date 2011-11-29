<?php
/**
 * Tine 2.0
 *
 * @package     Tinebase
 * @subpackage  Backend
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Flávio Gomes da Silva Lisboa <flavio.lisboa@serpro.gov.br>
 * @copyright   Copyright (c) 2011-2011 Metaways Infosystems GmbH (http://www.metaways.de)
 */

/**
 * encapsulates SQL commands that are different for each dialect
 *
 * @package     Tinebase
 * @subpackage  Backend
 */
interface Tinebase_Backend_Sql_Command_Interface
{
    /**
     * 
     * @param Zend_Db_Adapter_Abstract $adapter
     * @param boolean $on      
     */
    public static function setAutocommit($adapter,$on);
    
    /**
     * 
     * @param Zend_Db_Adapter_Abstract $adapter
     * @param string $field
     * @return string
     */
     public static function getAggregateFunction($adapter,$field);
     
     /**
      * 
      * @param Zend_Db_Adapter_Abstract $adapter
      * @param string $field
      * @param mixed $returnIfTrue
      * @param mixed $returnIfFalse
      * @return string
      */
	public static function getIfIsNull($adapter,$field,$returnIfTrue,$returnIfFalse);

	
	/**
	 * 
	 * @param Zend_Db_Adapter_Abstract $adapter
	 * @param string $condition
	 * @param string $returnIfTrue
	 * @param string $returnIfFalse
	 * @return string
	 */
	public static function getIfElse($adapter,$condition,$returnIfTrue,$returnIfFalse);
}
