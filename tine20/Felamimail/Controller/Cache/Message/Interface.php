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
interface Felamimail_Controller_Cache_Message_Interface
{  
    /**
    * get folder status and return all folders where something needs to be done
    *
    * @param Felamimail_Model_FolderFilter  $_filter
    * @return Tinebase_Record_RecordSet
    */
    public function getFolderStatus(Felamimail_Model_FolderFilter $_filter);
    
    /**
     * update message cache
     * 
     * @param string $_folder
     * @param integer $_time in seconds
     * @param integer $_updateFlagFactor 1 = update flags every time, x = update flags roughly each xth run (10 by default)
     * @return Felamimail_Model_Folder folder status (in cache)
     * @throws Felamimail_Exception
     */
    public function updateCache($_folder, $_time = 10, $_updateFlagFactor = 10);
    
    /**
     * add one message to cache
     * 
     * @param  array                    $_message
     * @param  Felamimail_Model_Folder  $_folder
     * @param  bool                     $_updateFolderCounter
     * @return Felamimail_Model_Message|bool
     */
    public function addMessage(array $_message, Felamimail_Model_Folder $_folder, $_updateFolderCounter = true);
    
     /**
     * remove all cached messages for this folder and reset folder values / folder status is updated in the database
     *
     * @param string|Felamimail_Model_Folder $_folder
     * @return Felamimail_Model_Folder
     */
    public function clear($_folder);
    
    /**
     * update/synchronize flags
     * 
     * @param string|Felamimail_Model_Folder $_folder
     * @param integer $_time
     * @return Felamimail_Model_Folder
     * 
     * @todo only get flags of current batch of messages from imap?
     * @todo add status/progress to start at later messages when this is called next time?
     */
    public function updateFlags($_folder, $_time = 60);
}