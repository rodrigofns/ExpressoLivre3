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
     * List of the hosts of the connections indexed by the Id of the user
     * @var array
     */
    static protected $_hostAddr = array();
    
    /**
     * List of theo the connections indexed by the Id of the user
     * @var array 
     */
    static protected $_imap = array();
     
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
    
    /**
     * Create or return a connection with the IMAP using the PHP native functions
     * 
     * @param Felamimail_Model_Account | string $_accountId
     * @param string $_mailbox Default is the INBOX
     * @return Imap Connectin
     * @throws Felamimail_Exception_IMAPInvalidCredentials 
     */
    protected function _getImapConnection($_accountId, $_mailbox = 'INBOX')
    {
        $accountId = ($_accountId instanceof Felamimail_Model_Account) ? $_accountId->getId() : $_accountId;
        if (!(isset(Felamimail_Backend_Cache_Imap_Message::$_imap[$accountId])))
        {
            $account = ($_accountId instanceof Felamimail_Model_Account) ? 
                            $_accountId : Felamimail_Controller_Account::getInstance()->get($_accountId);
            
            $params = (object) $account->getImapConfig();

            if (is_array($params))
            {
                $params = (object) $params;
            }

            if (!isset($params->user)) 
            {
                throw new Felamimail_Exception_IMAPInvalidCredentials('Need at least user in params.');
            }
            
            
            $imapConfig = Tinebase_Config::getInstance()->getConfigAsArray('imap');
            
            $params->host     = isset($params->host)     ? $params->host     : 
                isset($imapConfig['host']) ? $imapConfig['host'] : 'localhost';
            $params->password = isset($params->password) ? $params->password : '';
            $params->port     = isset($params->port)     ? $params->port     : 
                isset($imapConfig['port']) ? $imapConfig['port'] : '143';
            $params->ssl      = isset($params->ssl)      ? '/tls'      : '/notls';

            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' Connecting to server ' . $params->host 
                . ':' . $params->port . ' (' . (($params->ssl) ? $params->ssl : 'none') . ')' . ' with username ' 
                . $params->user);
            
            self::$_hostAddr[$accountId] = '{' . $params->host . ':' . $params->port . 
                    $params->ssl . '}';
            $mailbox = mb_convert_encoding(self::$_hostAddr[$accountId] . $_mailbox, "UTF7-IMAP","ISO_8859-1");
            $mbox = @imap_open($mailbox, $params->user, $params->password);
            if ($mbox === FALSE)
            {
                /**
                 *TODO: Throw an exeption on failure to open the connection
                 */
            }
            self::$_imap[$accountId] = $mbox;
        }
        else
        {
            $mailbox = mb_convert_encoding(self::$_hostAddr . $_mailbox, "UTF7-IMAP","ISO_8859-1");
            Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . 'Reconnecting to server on ' 
                    . self::$_hostAddr . ' in mailbox '. $_mailbox);
            if (@imap_reopen(self::$_imap[$accountId] , $mailbox) === FALSE)
            {
               /**
                * TODO: Throw an exeption on failure to reopen the connection
                */ 
            }
        }
        return self::$_imap[$accountId];
    }
}