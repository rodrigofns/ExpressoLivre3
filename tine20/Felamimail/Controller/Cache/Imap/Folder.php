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

class Felamimail_Controller_Cache_Imap_Folder extends Felamimail_Controller_Cache_Folder_Abstract 
                                                implements Felamimail_Controller_Cache_Folder_Interface
{
    /**
     * holds the instance of the singleton
     *
     * @var Felamimail_Controller_Cache_Message
     */
    private static $_instance = NULL;
    
    /**
     * the constructor
     *
     * don't use the constructor. use the singleton
     */
    private function __construct()
    {
        $this->_backend = Felamimail_Backend_Folder::getInstance();
        $this->_currentAccount = Tinebase_Core::getUser();
    }
    
    /**
     * don't clone. Use the singleton.
     *
     */
    private function __clone() 
    {        
    }
    
    /**
     * the singleton pattern
     *
     * @return Felamimail_Controller_Cache_Message
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Felamimail_Controller_Cache_Imap_Folder();
        }
        
        return self::$_instance;
    }
    
    /**
     * get (sub) folder and create folders in db backend cache
     *
     * @param  mixed   $_accountId
     * @param  string  $_folderName global name
     * @param  boolean $_recursive 
     * @return Tinebase_Record_RecordSet of Felamimail_Model_Folder
     */
    public function updateCacheFolder($_accountId, $_folderName = '', $_recursive = FALSE)
    {
        
//    	if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ .  ' getting (sub) folder and creating folders in db backend cache');
//    	
//        $account = ($_accountId instanceof Felamimail_Model_Account) ? $_accountId : Felamimail_Controller_Account::getInstance()->get($_accountId);
//        $this->_delimiter = $account->delimiter;
//        
//        try {
//            $folders = $this->_getFoldersFromIMAP($account, $_folderName);
//            $result = $this->_getOrCreateFolders($folders, $account, $_folderName);
//            
//            $hasChildren = (empty($folders) || count($folders) > 0 && count($result) == 0) ? 0 : 1;
//            $this->_updateHasChildren($_accountId, $_folderName, $hasChildren);
//            
//            if ($_recursive) {
//                $this->_updateRecursive($account, $result);
//            }
//        } catch (Zend_Mail_Protocol_Exception $zmpe) {
//            Tinebase_Core::getLogger()->notice(__METHOD__ . '::' . __LINE__ . ' IMAP Protocol Exception: ' . $zmpe->getMessage());
//            $result = new Tinebase_Record_RecordSet('Felamimail_Model_Folder');
//        } catch (Exception $e) {
//       		Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' unexpected Exception: ' . $e->getMessage());
         $result = new Tinebase_Record_RecordSet('Felamimail_Model_Folder');
//        }
//        
        return $result;
    }
    
    /**
     * delete folder(s) from cache
     * 
     * @param string|array $_id
     */
    public function deleteCacheFolder($_id)
    {
        $this->_backend->delete($_id);
    }
    
    /**
     * get folder status/values from imap server and update folder cache record in database
     * 
     * @param Felamimail_Model_Folder $_folder
     * @param Felamimail_Backend_Imap|boolean $_imap
     * @return Felamimail_Model_Folder
     */
    public function updateFolderStatus(Felamimail_Model_Folder $_folder, $_imap)
    {
        return Felamimail_Controller_Cache_Message::getInstance()->updateCache($_folder, 1);
    }
    
    /**
     * get folder status/values from imap server and update folder cache record in database
     * 
     * @param Felamimail_Model_Folder $_folder
     * @param Felamimail_Backend_Imap|boolean $_imap
     * @return Felamimail_Model_Folder
     */
    public function getIMAPFolderCounter(Felamimail_Model_Folder $_folder)
    {
        $folder = ($_folder instanceof Felamimail_Model_Folder) ? $_folder : Felamimail_Controller_Folder::getInstance()->get($_folder);
        
        $imap = Felamimail_Backend_ImapFactory::factory($folder->account_id);
        
        // get folder values / status from imap server
        $counter = $imap->examineFolder(Felamimail_Model_Folder::encodeFolderName($folder->globalname));
        
        if (Tinebase_Core::isLogLevel(Zend_Log::TRACE)) Tinebase_Core::getLogger()->trace(__METHOD__ . '::' . __LINE__ .  ' ' . print_r($counter, TRUE));
            
        // check validity
        $folder->cache_uidvalidity = $folder->imap_uidvalidity;
        $folder->imap_uidvalidity  = $counter['uidvalidity']; 
        $folder->cache_uidvalidity = empty($folder->cache_uidvalidity) ? $folder->imap_uidvalidity : $folder->cache_uidvalidity;          
        $folder->imap_totalcount   = $counter['exists'];
        $folder->imap_status       = Felamimail_Model_Folder::IMAP_STATUS_OK;
        $folder->imap_timestamp    = Tinebase_DateTime::now();
        
        return $folder;
    }
    
    /**
     * get folder cache counts from database
     * 
     * @param Felamimail_Model_Folder $_folder
     * @param Felamimail_Backend_Imap|boolean $_imap
     * @return array  counters of totcal count and unread count
     */
    public function getCacheFolderCounter(Felamimail_Model_Folder $_folder)
    {
        $result = $this->_backend->getFolderCounter($_folder);
        
        return $result;
    }
    
    /**
     * get folder status/values from imap server and update folder cache record in database
     * 
     * @param Felamimail_Model_Folder $_folder
     * @param Felamimail_Backend_Imap|boolean $_imap
     * @return Felamimail_Model_Folder
     */
    public function updateFolderCounters(Felamimail_Model_Folder $_folder, $_imap)
    {
        return Felamimail_Controller_Cache_Message::getInstance()->updateCache($folder, 1);
    }
    
    /**
     * clear all folders of account
     * 
     * @param mixed $_accountId
     */
    public function clear($_accountId)
    {
        $account = ($_accountId instanceof Felamimail_Model_Account) ? $_accountId : Felamimail_Controller_Account::getInstance()->get($_accountId);
        
        if (Tinebase_Core::isLogLevel(Zend_Log::INFO)) Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ . ' Clearing folder cache of account ' . $account->name);
        
        $this->_removeFromCache($account);
    }
    
    /**
     * check if folder cache is updating atm
     * 
     * @param Felamimail_Model_Folder $_folder
     * @param boolean $_lockFolder
     * @return boolean
     * 
     * @todo we should check the time of the last update to dynamically decide if process could have died
     */
    public function updateAllowed(Felamimail_Model_Folder $_folder, $_lockFolder = TRUE)
    {
        // if cache status is CACHE_STATUS_UPDATING and timestamp is less than 5 minutes ago, don't update
        if ($_folder->cache_status == Felamimail_Model_Folder::CACHE_STATUS_UPDATING &&
            (
                is_object($_folder->cache_timestamp) 
                && $_folder->cache_timestamp instanceof Tinebase_DateTime 
                && $_folder->cache_timestamp->compare(Tinebase_DateTime::now()->subMinute(5)) == 1
            )
        ) {
            return false;
        }

        $result = ($_lockFolder) ? $this->_backend->lockFolder($_folder) : TRUE;
        
        return $result;
    }
}