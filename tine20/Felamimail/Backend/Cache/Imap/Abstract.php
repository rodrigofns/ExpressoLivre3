<?php
/**
 * Tine 2.0
 *
 * @package     Felamimail
 * @subpackage  Backend
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cassiano Dal Pizzol <cassiano.dalpizzol@serpro.gov.br>
 * @author      Bruno Costa Vieira <bruno.vieira-costa@serpro.gov.br>
 * @author      Mario Cesar Kolling <mario.kolling@serpro.gov.br>
 * @copyright   Copyright (c) 2009-2013 Serpro (http://www.serpro.gov.br)
 *
 */
abstract class Felamimail_Backend_Cache_Imap_Abstract
{
    /**
     *  TODO: Tentar recuperar o 'delimiter' do imap. Pois o delimiter pode 
     * variar dependo da configuração do servidor imap.
     */
    const IMAPDELIMITER = '/';
    
    /**
     * Search for records matching given filter
     *
     * @param  Tinebase_Model_Filter_FilterGroup    $_filter
     * @param  Tinebase_Model_Pagination            $_pagination
     * @param  array|string|boolean                 $_cols columns to get, * per default / use self::IDCOL or TRUE to get only ids
     * @return Tinebase_Record_RecordSet|array
     */
    abstract public function search(Tinebase_Model_Filter_FilterGroup $_filter = NULL, Tinebase_Model_Pagination $_pagination = NULL, $_cols = '*');
    
    /**
     * Updates existing entry
     *
     * @param Tinebase_Record_Interface $_record
     * @throws Tinebase_Exception_Record_Validation|Tinebase_Exception_InvalidArgument
     * @return Tinebase_Record_Interface Record|NULL
     */
    abstract public function update(Tinebase_Record_Interface $_record);
    
    /**
     * Gets total count of search with $_filter
     * 
     * @param Tinebase_Model_Filter_FilterGroup $_filter
     * @return int
     */
    abstract public function searchCount(Tinebase_Model_Filter_FilterGroup $_filter);
        
    /**
     * Gets one entry (by id)
     *
     * @param integer|Tinebase_Record_Interface $_id
     * @param $_getDeleted get deleted records
     * @return Tinebase_Record_Interface
     * @throws Tinebase_Exception_NotFound
     */
    abstract public function get($_id, $_getDeleted = FALSE);
    
    /**
      * Deletes entries
      * 
      * @param string|integer|Tinebase_Record_Interface|array $_id
      * @return void
      * @return int The number of affected rows.
      */
    abstract public function delete($_id);
    
    /**
     * Get multiple entries
     *
     * @param string|array $_id Ids
     * @param array $_containerIds all allowed container ids that are added to getMultiple query
     * @return Tinebase_Record_RecordSet
     * 
     * @todo get custom fields here as well
     */
    abstract public function getMultiple($_id, $_containerIds = NULL);
    
    /**
     * Creates new entry
     *
     * @param   Tinebase_Record_Interface $_record
     * @return  Tinebase_Record_Interface
     * @throws  Tinebase_Exception_InvalidArgument
     * @throws  Tinebase_Exception_UnexpectedValue
     * 
     * @todo    remove autoincremental ids later
     */
    abstract public function create(Tinebase_Record_Interface $_record);
    
    
    /**
     * Convert an object to Array, recursively
     * @TODO: Put into an Helper Class (ex. Tinebase_Helper)
     */
    public static function objectToArray($var)
    {
        if (gettype($var) === 'object')
        {
            return self::objectToArray(get_object_vars($var));
        }
        else if (gettype($var) === 'array') {
            $array = array();
            foreach ($var as $idx => $value)
            {
                $array[$idx] = self::objectToArray($value);
            }
            return $array;
        }
        else {
            return $var;
        }
//        
//        $return = get_object_vars($obj);
//        foreach ($return as $key => $value)
//        {
//            if (gettype($value) === 'array')
//            {
//                $array = array();
//                foreach ($value as $idx => $content)
//                {
//                    if (gettype($content) === 'object')
//                    {
//                        
//                    }
//                }
//                
//            }
//            else if (gettype($value) === 'object')
//            {
//                
//            }
//        }
    }
    
    
/********************************************** protected functions ***************************************************/
    
    /**
     * converts raw data from adapter into a set of records
     * got from Tinebase_Backend_Sql_Abstract
     * 
     * @param  array $_rawDatas of arrays
     * @return Tinebase_Record_RecordSet
     */
    protected function _rawDataToRecordSet(array $_rawDatas)
    {
        $result = new Tinebase_Record_RecordSet($this->_modelName, $_rawDatas, true);
                
        return $result;
    }
    
    /**
     * explode foreign values
     * got from Tinebase_Backend_Sql_Abstract
     * 
     * @param Tinebase_Record_Interface $_record
     */
    protected function _explodeForeignValues(Tinebase_Record_Interface $_record)
    {
        foreach (array_keys($this->_foreignTables) as $field) {
            $isSingleValue = (array_key_exists('singleValue', $this->_foreignTables[$field]) && $this->_foreignTables[$field]['singleValue']);
            if (! $isSingleValue) {
                $_record->{$field} = (! empty($_record->{$field})) ? explode(',', $_record->{$field}) : array();
            }
        }
    }
}