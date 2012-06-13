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

class Felamimail_Backend_Cache_Imap_Folder extends Felamimail_Backend_Cache_Sql_Folder
                                            implements Felamimail_Backend_Cache_FolderInterface
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
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Folder Search = $_filter ' . print_r($_filter,true));
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Folder Search = $_pagination' . print_r($_filter,true));
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Folder Search = $_cols' . print_r($_cols,true));
*/  
        $aux = new Felamimail_Backend_Cache_Sql_Folder();           
        $retorno = $aux->search($_filter,$_pagination, $_cols);
        
//Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Folder Search = $retorno' . print_r($retorno,true));        
        
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
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Folder searchCount = $_filter ' . print_r($_filter,true));
*/  
        $aux = new Felamimail_Backend_Cache_Sql_Folder();
        $retorno = $aux->searchCount($_filter);
//Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . 'Folder searchCount = $retorno ' . print_r($retorno,true));
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
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Folder get = $_id ' . print_r($_id,true));
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Folder get = $_getDeleted' . print_r($_getDeleted,true));
*/ 
        $aux = new Felamimail_Backend_Cache_Sql_Folder();        
        $retorno = $aux->get($_id, $_getDeleted);
        
//Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . 'Folder get = get ' . print_r($retorno,true));
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
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Folder delete = $_id ' . print_r($_id,true));
*/ 
        $aux = new Felamimail_Backend_Cache_Sql_Folder();        
        $retorno = $aux->delete($_id);
        
//Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . 'Folder delete = $retorno ' . print_r($retorno,true));
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
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Folder getMultiple = $_id ' . print_r($_id,true));
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Folder getMultiple = $_containerIds ' . print_r($_containerIds,true));
*/ 
        $aux = new Felamimail_Backend_Cache_Sql_Folder();        
        $retorno = $aux->getMultiple($_id, $_containerIds = NULL);
        
//Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . 'Folder delete = $retorno ' . print_r($retorno,true));
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
     * get folder cache counter like total and unseen
     *
     * @param  string  $_folderId  the folderid
     * @return array
     */
    public function getFolderCounter($_folderId)
    {
        $folderId = ($_folderId instanceof Felamimail_Model_Folder) ? $_folderId->getId() : $_folderId;

        // fetch total count
        $cols = array('cache_totalcount' => new Zend_Db_Expr('COUNT(*)'));
        $select = $this->_db->select()
            ->from(array('felamimail_cache_message' => $this->_tablePrefix . 'felamimail_cache_message'), $cols)
            ->where($this->_db->quoteIdentifier('felamimail_cache_message.folder_id') . ' = ?', $folderId);

        $stmt = $this->_db->query($select);
        $totalCount = $stmt->fetchColumn(0);
        $stmt->closeCursor();
        $stmt = NULL;

        // get seen count
        $select = $this->_db->select()
            ->from(array(
                'felamimail_cache_message_flag' => $this->_tablePrefix . 'felamimail_cache_message_flag'),
                array('cache_totalcount' => new Zend_Db_Expr('COUNT(DISTINCT(felamimail_cache_message_flag.message_id))'))
            )
            ->where($this->_db->quoteIdentifier('felamimail_cache_message_flag.folder_id') . ' = ?', $folderId)
            ->where($this->_db->quoteIdentifier('felamimail_cache_message_flag.flag') . ' = ?', '\\Seen');

        Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' folder counter: ' . $select->assemble());

        $stmt = $this->_db->query($select);
        $seenCount = $stmt->fetchColumn(0);
        $stmt->closeCursor();
        $stmt = NULL;

        if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__
            . ' totalcount:' . $totalCount . ' / seencount:' . $seenCount);

        return array(
            'cache_totalcount'  => $totalCount,
            'cache_unreadcount' => $totalCount - $seenCount
        );
    }

    /**
     * try to lock a folder
     *
     * @param  Felamimail_Model_Folder  $_folder  the folder to lock
     * @return bool  true if locking was successful, false if locking was not possible
     */
    public function lockFolder(Felamimail_Model_Folder $_folder)
    {
        $folderData = $_folder->toArray();

        $data = array(
            'cache_timestamp' => Tinebase_DateTime::now()->get(Tinebase_Record_Abstract::ISO8601LONG),
            'cache_status'    => Felamimail_Model_Folder::CACHE_STATUS_UPDATING
        );

        $where  = array(
            $this->_db->quoteInto($this->_db->quoteIdentifier('id') . ' = ?', $folderData['id']),
            $this->_db->quoteInto($this->_db->quoteIdentifier('cache_status') . ' = ?', $folderData['cache_status']),
        );

        if (!empty($folderData['cache_timestamp'])) {
            $where[] = $this->_db->quoteInto($this->_db->quoteIdentifier('cache_timestamp') . ' = ?', $folderData['cache_timestamp']);
        }

        $affectedRows = $this->_db->update($this->_tablePrefix . $this->_tableName, $data, $where);

        if ($affectedRows !== 1) {
            return false;
        }

        return true;
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

        // don't write this value as it requires a schema update
        // see: Felamimail_Controller_Cache_Folder::getIMAPFolderCounter
        unset($result['cache_uidvalidity']);

        // can't be set directly, can only incremented or decremented via updateFolderCounter
        unset($result['cache_totalcount']);
        unset($result['cache_unreadcount']);

        return $result;
    }

    /**
     * increment/decrement folder counter on sql backend
     *
     * @param  mixed  $_folderId
     * @param  array  $_counters
     * @return Felamimail_Model_Folder
     * @throws Tinebase_Exception_InvalidArgument
     */
    public function updateFolderCounter($_folderId, array $_counters)
    {
        if (empty($_folderId)) {
            throw new Tinebase_Exception_InvalidArgument('Missing folder or folder id.');
        }

        if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' starting update folder counter: ' . $_folderId . ' - ' . print_r($_counters, true));
        $folder = ($_folderId instanceof Felamimail_Model_Folder) ? $_folderId : $this->get($_folderId);
        if (empty($_counters)) {
            return $folder; // nothing todo
        }

        $data = array();
        $where = array();
        foreach ($_counters as $counter => $value) {
            if ($value{0} == '+' || $value{0} == '-') {
                // increment or decrement values
                $intValue = (int) substr($value, 1);
                $quotedIdentifier = $this->_db->quoteIdentifier($counter);
                if ($value{0} == '-') {
                	$data[$counter] = new Zend_Db_Expr("CASE WHEN $quotedIdentifier  >= $intValue THEN $quotedIdentifier - $intValue ELSE 0 END");
                    $folder->{$counter} = ($folder->{$counter} >= $intValue) ? $folder->{$counter} - $intValue : 0;
                } else {
                    $data[$counter] = new Zend_Db_Expr($this->_db->quoteIdentifier($counter) . ' + ' . $intValue);
                    $folder->{$counter} += $intValue;
                }
            } else {
                // set values
                $data[$counter] = ($value >= 0) ? (int)$value : 0;
                $folder->{$counter} = ($value >= 0) ? (int)$value : 0;
            }
        }

        $where[] = $this->_db->quoteInto($this->_db->quoteIdentifier('id') . ' = ?', $folder->getId());

        if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' update folder counter query: ' . $this->_tablePrefix . $this->_tableName . ' ' . print_r($data,true) . ' ' . print_r($where,true));

        try {
            $this->_db->update($this->_tablePrefix . $this->_tableName, $data, $where);
        } catch (Zend_Db_Statement_Exception $zdse) {
            if (Tinebase_Core::isLogLevel(Zend_Log::WARN)) Tinebase_Core::getLogger()->warn(__METHOD__ . '::' . __LINE__ . ' Could not update folder counts: ' . $zdse->getMessage());
        } catch (Exception $e)
        {
        	if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ .  ' unexpected exception: ' . $e->getMessage());
        }

        // sanitize unreadcount
        try {
        	$updatedFolder = $this->get($folder->getId());
        	if ($updatedFolder->cache_totalcount === 0 && $updatedFolder->cache_unreadcount >= 0) {
        		$this->updateFolderCounter($folder, array('cache_unreadcount' => 0));
        	}
        } catch (Exception $e) {
        	if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ .  ' Exception when sanitize unreadcount: ' . $e->getMessage());
        	throw $e;
        }

        if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ .  " folder counter up-to-date");

        return $folder;
    }
}