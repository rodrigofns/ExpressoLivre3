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
 * encapsulates SQL commands of PostgreSQL database
 *
 * @package     Tinebase
 * @subpackage  Backend
 */
class Tinebase_Backend_Sql_Command_Pgsql implements Tinebase_Backend_Sql_Command_Interface
{
    /**
     * 
     * @param $adapter Zend_Db_Adapter_Abstract
     * @param $on boolean
     */
    public static function setAutocommit($adapter, $on)
    {
        // SET AUTOCOMMIT=0 is not supported for PostgreSQL
        if ($on) {
            $adapter->query('SET AUTOCOMMIT=1;');
        }
    }
    
    /**
     * 
     * @param Zend_Db_Adapter_Abstract $adapter
     * @param string $field
     * @return string
     */
    public static function getAggregateFunction($adapter, $field)
    {
        return "array_to_string(ARRAY(SELECT unnest(array_agg($field)) 
                                               ORDER BY 1),',')";   	
    }

    /**
     * 
     * @param Zend_Db_Adapter_Abstract $adapter
     * @param string $field
     * @param mixed $returnIfTrue
     * @param mixed $returnIfFalse
     * @return string 
     */
    public static function getIfIsNull($adapter, $field, $returnIfTrue, $returnIfFalse)
    {
        return "(CASE WHEN $field IS NULL THEN " . (string) $returnIfTrue . " ELSE " . (string) $returnIfFalse . " END)";
    }    
    
    /**
      * 
      * @param Zend_Db_Adapter_Abstract $adapter
      * @return string
      */
    public static function getLike($adapter)
    {
        return 'iLIKE';
    }
    
    /**
     *
     * @param Zend_Db_Adapter_Abstract $adapter
     * @param string $date
     * @return string 
     */
    public static function setDate($adapter, $date)
    {
    	return "DATE({$date})";
    }  
        
    /**
     *
     * @param Zend_Db_Adapter_Abstract $adapter
     * @param string $value
     * @return string 
     */
    public static function setDateValue($adapter, $value)
    {
    	return $value;
    } 

    /**
     *
     * @param Zend_Db_Adapter_Abstract $adapter
     * @return mixed
     */
    public static function getFalseValue($adapter = null)
    {    
    	return 'FALSE';
    }
    
    /**
     *
     * @param Zend_Db_Adapter_Abstract $adapter
     * @return mixed
     */
    public static function getTrueValue($adapter = null)
    {  
    	return 'TRUE';
    }    
}
