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
 * encapsulates SQL commands of Oracle database
 *
 * @package     Tinebase
 * @subpackage  Backend
 */
class Tinebase_Backend_Sql_Command_Oracle implements Tinebase_Backend_Sql_Command_Interface
{
    /**
     *
     * @param $adapter Zend_Db_Adapter_Abstract
     * @param $on boolean
     */
    public static function setAutocommit($adapter, $on)
    {
        // SET AUTOCOMMIT=0 is not supported for Oracle
        if ($on) {
            $adapter->query('SET AUTOCOMMIT=1;');
        } else {
            $adapter->query('SET AUTOCOMMIT=0;');
        }
    }
    
    /**
     * 
     * @param Zend_Db_Adapter_Abstract $adapter
     * @param string $field
     * @return string
     * @todo replace by equivalent function of MySQL GROUP_CONCAT in Oracle
     */    
    public static function getAggregateFunction($adapter, $field)
    {
        return "GROUP_CONCAT( DISTINCT $field)";
    } 
    
    /**
     * 
     * @param Zend_Db_Adapter_Abstract $adapter
     * @param string $field
     * @param mixed $returnIfTrue
     * @param mixed $returnIfFalse
     */
    public static function getIfIsNull($adapter, $field, $returnIfTrue, $returnIfFalse)
    {
        return "CASE WHEN $field IS NULL THEN " . (string) $returnIfTrue . " ELSE " . (string) $returnIfFalse . " END";
    }
    
	/**
	 * 
	 * @param Zend_Db_Adapter_Abstract $adapter
	 * @param string $condition
	 * @param string $returnIfTrue
	 * @param string $returnIfFalse
	 * @return string
	 */
	public static function getIfElse($adapter,$condition,$returnIfTrue,$returnIfFalse)
	{
		return "IF($condition,$returnIfTrue,$returnIfFalse)";
	}    
}
