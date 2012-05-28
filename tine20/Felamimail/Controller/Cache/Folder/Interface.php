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
interface Felamimail_Controller_Cache_Folder_Interface
{  
    /**
     * get (sub) folder and create folders in db backend cache
     *
     * @param  mixed   $_accountId
     * @param  string  $_folderName global name
     * @param  boolean $_recursive 
     * @return Tinebase_Record_RecordSet of Felamimail_Model_Folder
     */
    public function updateCacheFolder($_accountId, $_folderName = '', $_recursive = FALSE);
    
    /**
     * delete folder(s) from cache
     * 
     * @param string|array $_id
     */
    public function deleteCacheFolder($_id);
    
    /**
     * get folder status/values from imap server and update folder cache record in database
     * 
     * @param Felamimail_Model_Folder $_folder
     * @param Felamimail_Backend_Imap|boolean $_imap
     * @return Felamimail_Model_Folder
     */
    public function updateFolderStatus(Felamimail_Model_Folder $_folder, $_imap);
    
    /**
     * get folder status/values from imap server and update folder cache record in database
     * 
     * @param Felamimail_Model_Folder $_folder
     * @param Felamimail_Backend_Imap|boolean $_imap
     * @return Felamimail_Model_Folder
     */
    public function getIMAPFolderCounter(Felamimail_Model_Folder $_folder);
    
    /**
     * get folder cache counts from database
     * 
     * @param Felamimail_Model_Folder $_folder
     * @param Felamimail_Backend_Imap|boolean $_imap
     * @return array  counters of totcal count and unread count
     */
    public function getCacheFolderCounter(Felamimail_Model_Folder $_folder);
    
    /**
     * get folder status/values from imap server and update folder cache record in database
     * 
     * @param Felamimail_Model_Folder $_folder
     * @param Felamimail_Backend_Imap|boolean $_imap
     * @return Felamimail_Model_Folder
     */
    public function updateFolderCounters(Felamimail_Model_Folder $_folder, $_imap);
    
    /**
     * clear all folders of account
     * 
     * @param mixed $_accountId
     */
    public function clear($_accountId);
    
    /**
     * check if folder cache is updating atm
     * 
     * @param Felamimail_Model_Folder $_folder
     * @param boolean $_lockFolder
     * @return boolean
     * 
     * @todo we should check the time of the last update to dynamically decide if process could have died
     */
    public function updateAllowed(Felamimail_Model_Folder $_folder, $_lockFolder = TRUE);
}
