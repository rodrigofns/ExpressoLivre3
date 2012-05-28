<?php
/**
 * Tine 2.0
 *
 * @package     Felamimail
 * @subpackage  Backend
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cassiano Dal Pizzol <cassiano.dalpizzol@serpro.gov.br>
 * @copyright   Copyright (c) 2009-2013 Serpro (http://www.serpro.gov.br)
 *
 */

/**
 * Cache interface controller
 * 
 * @package     Felamimail
 * @subpackage  Controller
 */
interface Felamimail_Backend_Cache_MessageInterface
{  
    /**
     * Search for records matching given filter
     *
     * @param  Tinebase_Model_Filter_FilterGroup    $_filter
     * @param  Tinebase_Model_Pagination            $_pagination
     * @return array
     */
    public function searchMessageUids(Tinebase_Model_Filter_FilterGroup $_filter = NULL, Tinebase_Model_Pagination $_pagination = NULL);
    
    /**
     * get all flags for a given folder id
     *
     * @param string|Felamimail_Model_Folder $_folderId
     * @param integer $_start
     * @param integer $_limit
     * @return Tinebase_Record_RecordSet
     */
    public function getFlagsForFolder($_folderId, $_start = NULL, $_limit = NULL);
    
     /**
     * add flag to message
     *
     * @param Felamimail_Model_Message $_message
     * @param string $_flag
     */
    public function addFlag($_message, $_flag);
    
    /**
     * set flags of message
     *
     * @param  mixed         $_messages array of ids, recordset, single message record
     * @param  string|array  $_flags
     */
    public function setFlags($_messages, $_flags, $_folderId = NULL);
    
    /**
     * remove flag from messages
     *
     * @param  mixed  $_messages
     * @param  mixed  $_flag
     */
    public function clearFlag($_messages, $_flag);
    
    /**
     * delete all cached messages for one folder
     *
     * @param  mixed  $_folderId
     */
    public function deleteByFolderId($_folderId);
    
    /**
     * get count of cached messages by folder (id) 
     *
     * @param  mixed  $_folderId
     * @return integer
     */
    public function searchCountByFolderId($_folderId);
    
    /**
     * get count of seen cached messages by folder (id) 
     *
     * @param  mixed  $_folderId
     * @return integer
     * 
     */
    public function seenCountByFolderId($_folderId);
    
    /**
     * delete messages with given messageuids by folder (id)
     *
     * @param  array  $_msguids
     * @param  mixed  $_folderId
     * @return integer number of deleted rows
     */
    public function deleteMessageuidsByFolderId($_msguids, $_folderId);
}
