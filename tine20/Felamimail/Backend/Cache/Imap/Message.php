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

class Felamimail_Backend_Cache_Imap_Message extends Felamimail_Backend_Cache_Imap_Abstract
                                                implements Felamimail_Backend_Cache_MessageInterface
{
    /**
     * Search for records matching given filter
     *
     * @param  Tinebase_Model_Filter_FilterGroup    $_filter
     * @param  Tinebase_Model_Pagination            $_pagination
     * @param  array|string|boolean                 $_cols columns to get, * per default / use self::IDCOL or TRUE to get only ids
     * @return Tinebase_Record_RecordSet|array
     */
    public function search(Tinebase_Model_Filter_FilterGroup $_filter = NULL, Tinebase_Model_Pagination $_pagination = NULL, $_cols = '*')    
    {
/*        
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Message Search = $_filter ' . print_r($_filter,true));
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Message Search = $_pagination' . print_r($_filter,true));
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Message Search = $_cols' . print_r($_cols,true));
*/  
        $aux = new Felamimail_Backend_Cache_Sql_Message();           
        $retorno = $aux->search($_filter,$_pagination, $_cols);
        
//Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Message Search = $retorno' . print_r($retorno,true));        
        
        return $retorno;
    }
    
    /**
     * Gets total count of search with $_filter
     * 
     * @param Tinebase_Model_Filter_FilterGroup $_filter
     * @return int
     */
    public function searchCount(Tinebase_Model_Filter_FilterGroup $_filter)
    {
/*        
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Message searchCount = $_filter ' . print_r($_filter,true));
*/  
        $aux = new Felamimail_Backend_Cache_Sql_Message();
        $retorno = $aux->searchCount($_filter);
//Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . 'Message searchCount = $retorno ' . print_r($retorno,true));
        return $retorno;
    }
    
    /**
     * Gets one entry (by id)
     *
     * @param integer|Tinebase_Record_Interface $_id
     * @param $_getDeleted get deleted records
     * @return Tinebase_Record_Interface
     * @throws Tinebase_Exception_NotFound
     */
    public function get($_id, $_getDeleted = FALSE) 
    {
/*        
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Message get = $_id ' . print_r($_id,true));
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Message get = $_getDeleted' . print_r($_getDeleted,true));
*/ 
        $aux = new Felamimail_Backend_Cache_Sql_Message();        
        $retorno = $aux->get($_id, $_getDeleted);
        
//Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . 'Message get = get ' . print_r($retorno,true));
        return $retorno;
    }
    
     /**
      * Deletes entries
      * 
      * @param string|integer|Tinebase_Record_Interface|array $_id
      * @return void
      * @return int The number of affected rows.
      */
    public function delete($_id) 
    {
/*        
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Message delete = $_id ' . print_r($_id,true));
*/ 
        $aux = new Felamimail_Backend_Cache_Sql_Message();        
        $retorno = $aux->delete($_id);
        
//Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . 'Message delete = $retorno ' . print_r($retorno,true));
        return $retorno;
    }
    
    /**
     * Get multiple entries
     *
     * @param string|array $_id Ids
     * @param array $_containerIds all allowed container ids that are added to getMultiple query
     * @return Tinebase_Record_RecordSet
     * 
     * @todo get custom fields here as well
     */
    public function getMultiple($_id, $_containerIds = NULL) 
    {
/*        
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Message getMultiple = $_id ' . print_r($_id,true));
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Message getMultiple = $_containerIds ' . print_r($_containerIds,true));
*/ 
        $aux = new Felamimail_Backend_Cache_Sql_Message();        
        $retorno = $aux->getMultiple($_id, $_containerIds = NULL);
        
//Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . 'Message delete = $retorno ' . print_r($retorno,true));
        return $retorno;
    }

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
    public function create(Tinebase_Record_Interface $_record)
    {
/*        
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Message create = $_record ' . print_r($_record,true));
*/ 
        $aux = new Felamimail_Backend_Cache_Sql_Message();        
        $retorno = $aux->create($_record);
        
//Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . 'Message create = $retorno ' . print_r($retorno,true));
        return $retorno;        
    }
    
    
    
    /**
     * Search for records matching given filter
     *
     * @param  Tinebase_Model_Filter_FilterGroup    $_filter
     * @param  Tinebase_Model_Pagination            $_pagination
     * @return array
     */
    public function searchMessageUids(Tinebase_Model_Filter_FilterGroup $_filter = NULL, Tinebase_Model_Pagination $_pagination = NULL)    
    {
        return $this->search($_filter, $_pagination, array(Tinebase_Backend_Sql_Abstract::IDCOL, 'messageuid'));
    }
    
    /**
     * get all flags for a given folder id
     *
     * @param string|Felamimail_Model_Folder $_folderId
     * @param integer $_start
     * @param integer $_limit
     * @return Tinebase_Record_RecordSet
     */
    public function getFlagsForFolder($_folderId, $_start = NULL, $_limit = NULL)    
    {
        $filter = $this->_getMessageFilterWithFolderId($_folderId);
        $pagination = ($_start !== NULL || $_limit !== NULL) ? new Tinebase_Model_Pagination(array(
            'start' => $_start,
            'limit' => $_limit,
        ), TRUE) : NULL;
        
        return $this->search($filter, $pagination, array('messageuid' => 'messageuid', 'id' => Tinebase_Backend_Sql_Abstract::IDCOL, 'flags' => 'felamimail_cache_message_flag.flag'));
    }
        
    /**
     * update foreign key values
     * 
     * @param string $_mode create|update
     * @param Tinebase_Record_Abstract $_record
     * 
     * @todo support update mode
     */
    protected function _updateForeignKeys($_mode, Tinebase_Record_Abstract $_record)
    {
        if ($_mode == 'create') {
            
            foreach ($this->_foreignTables as $key => $foreign) {
                if (!isset($_record->{$key}) || empty($_record->{$key})) {
                    continue;
                }
                
                //if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . $_field . ': ' . print_r($_record->{$_field}, TRUE));
                
                foreach ($_record->{$key} as $data) {
                    if ($key == 'flags') {
                        $data = array(
                            'flag'      => $data,
                            'folder_id' => $_record->folder_id
                        );
                    }
                    $data['message_id'] = $_record->getId();
                    $this->_insertWithProfile($this->_tablePrefix . $foreign['table'], $data);                    
                }
            }
        }
    }
    
    /**
     * add flag to message
     *
     * @param Felamimail_Model_Message $_message
     * @param string $_flag
     */
    public function addFlag($_message, $_flag)
    {
        if (empty($_flag)) {
            // nothing todo
            return;
        }
        
        $data = array(
            'flag'          => $_flag,
            'message_id'    => $_message->getId(),
            'folder_id'     => $_message->folder_id
        );
        $this->_insertWithProfile($this->_tablePrefix . $this->_foreignTables['flags']['table'], $data);
    }
    
    /**
     * set flags of message
     *
     * @param  mixed         $_messages array of ids, recordset, single message record
     * @param  string|array  $_flags
     */
    public function setFlags($_messages, $_flags, $_folderId = NULL)
    {
        if ($_messages instanceof Tinebase_Record_RecordSet) {
            $messages = $_messages;
        } elseif ($_messages instanceof Felamimail_Model_Message) {
            $messages = new Tinebase_Record_RecordSet('Felamimail_Model_Message', array($_messages));
        } else if (is_array($_messages) && $_folderId !== NULL) {
            // array of ids
            $messages = $_messages;
        } else {
            throw new Tinebase_Exception_UnexpectedValue('$_messages must be instance of Felamimail_Model_Message');
        }
        
        $where = array(
            $this->_db->quoteInto($this->_db->quoteIdentifier('message_id') . ' IN (?)', ($messages instanceof Tinebase_Record_RecordSet) ? $messages->getArrayOfIds() : $messages)
        );
        $this->_db->delete($this->_tablePrefix . $this->_foreignTables['flags']['table'], $where);
        
        $flags = (array) $_flags;
        $touchedMessages = array();

        foreach ($flags as $flag) {
            foreach ($messages as $message) {
                $id = $touchedMessages[] = ($message instanceof Felamimail_Model_Message) ? $message->getId() : $message;
                $folderId = ($message instanceof Felamimail_Model_Message) ? $message->folder_id : $_folderId;
                
                $data = array(
                    'flag'          => $flag,
                    'message_id'    => $id,
                    'folder_id'     => $folderId,
                );
                $this->_insertWithProfile($this->_tablePrefix . $this->_foreignTables['flags']['table'], $data);
            }
        }
        
        // touch messages so sync can find the updates
        $this->updateMultiple($touchedMessages, array('timestamp' => Tinebase_DateTime::now()));
    }
    
    /**
     * remove flag from messages
     *
     * @param  mixed  $_messages
     * @param  mixed  $_flag
     */
    public function clearFlag($_messages, $_flag)
    {
        if ($_messages instanceof Tinebase_Record_RecordSet) {
            $messageIds = $_messages->getArrayOfIds();
        } elseif ($_messages instanceof Felamimail_Model_Message) {
            $messageIds = $_messages->getId();
        } else {
            // single id or array of ids
            $messageIds = $_messages;
        }
        
        $where = array(
            $this->_db->quoteInto($this->_db->quoteIdentifier('message_id') . ' IN (?)', $messageIds),
            $this->_db->quoteInto($this->_db->quoteIdentifier('flag') . ' IN (?)', $_flag)
        );
        
        $this->_db->delete($this->_tablePrefix . $this->_foreignTables['flags']['table'], $where);
    }
    
    /**
     * delete all cached messages for one folder
     *
     * @param  mixed  $_folderId
     */
    public function deleteByFolderId($_folderId)
    {
        $folderId = ($_folderId instanceof Felamimail_Model_Folder) ? $_folderId->getId() : $_folderId;
        
        $where = array(
            $this->_db->quoteInto($this->_db->quoteIdentifier('folder_id') . ' = ?', $folderId)
        );
        
        $this->_db->delete($this->_tablePrefix . $this->_tableName, $where);
    }

    /**
     * get count of cached messages by folder (id) 
     *
     * @param  mixed  $_folderId
     * @return integer
     */
    public function searchCountByFolderId($_folderId)
    {
        $filter = $this->_getMessageFilterWithFolderId($_folderId);
        $count = $this->searchCount($filter);
        
        return $count;
    }
    
    /**
     * get folder id message filter
     * 
     * @param mixed $_folderId
     * @return Felamimail_Model_MessageFilter
     */
    protected function _getMessageFilterWithFolderId($_folderId)
    {
        $folderId = ($_folderId instanceof Felamimail_Model_Folder) ? $_folderId->getId() : $_folderId;
        $filter = new Felamimail_Model_MessageFilter(array(
            array('field' => 'folder_id', 'operator' => 'equals', 'value' => $folderId)
        ));
        
        return $filter;
    }
    
    /**
     * get count of seen cached messages by folder (id) 
     *
     * @param  mixed  $_folderId
     * @return integer
     * 
     */
    public function seenCountByFolderId($_folderId)
    {
        $folderId = ($_folderId instanceof Felamimail_Model_Folder) ? $_folderId->getId() : $_folderId;
        
        $select = $this->_db->select();
        $select->from(
            array('flags' => $this->_tablePrefix . $this->_foreignTables['flags']['table']), 
            array('count' => 'COUNT(DISTINCT message_id)')
        )->where(
            $this->_db->quoteInto($this->_db->quoteIdentifier('folder_id') . ' = ?', $folderId)
        )->where(
            $this->_db->quoteInto($this->_db->quoteIdentifier('flag') . ' = ?', '\Seen')
        );
        
        $this->_traitGroup($select);

        $seenCount = $this->_db->fetchOne($select);
                
        return $seenCount;
    }
    
    /**
     * delete messages with given messageuids by folder (id)
     *
     * @param  array  $_msguids
     * @param  mixed  $_folderId
     * @return integer number of deleted rows
     */
    public function deleteMessageuidsByFolderId($_msguids, $_folderId)
    {
        if (empty($_msguids) || !is_array($_msguids)) {
            return FALSE;
        }
        
        $folderId = ($_folderId instanceof Felamimail_Model_Folder) ? $_folderId->getId() : $_folderId;
        
        $where = array(
            $this->_db->quoteInto($this->_db->quoteIdentifier('messageuid') . ' IN (?)', $_msguids),
            $this->_db->quoteInto($this->_db->quoteIdentifier('folder_id') . ' = ?', $folderId)
        );
        
        return $this->_db->delete($this->_tablePrefix . $this->_tableName, $where);
    }

    /**
     * converts record into raw data for adapter
     *
     * @param  Tinebase_Record_Abstract $_record
     * @return array
     */
    protected function _recordToRawData($_record)
    {
        $result = parent::_recordToRawData($_record);
        
        if(isset($result['structure'])) {
            $result['structure'] = Zend_Json::encode($result['structure']);
        }
        
        return $result;
    }
    
    /**
     * converts raw data from adapter into a single record
     *
     * @param  array $_rawData
     * @return Tinebase_Record_Abstract
     */
    protected function _rawDataToRecord(array $_rawData)
    {
        if (isset($_rawData['structure'])) {
            $_rawData['structure'] = Zend_Json::decode($_rawData['structure']);
        }
        
        $result = parent::_rawDataToRecord($_rawData);
                
        return $result;
    }
    
    /**
     * converts raw data from adapter into a set of records
     *
     * @param  array $_rawDatas of arrays
     * @return Tinebase_Record_RecordSet
     */
    protected function _rawDataToRecordSet(array $_rawDatas)
    {
        foreach($_rawDatas as &$_rawData) {
            if(isset($_rawData['structure'])) {
                $_rawData['structure'] = Zend_Json::decode($_rawData['structure']);
            }
        }
        $result = parent::_rawDataToRecordSet($_rawDatas);
        
        return $result;
    }
}
