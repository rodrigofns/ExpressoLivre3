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

class Felamimail_Controller_Cache_Imap_Message extends Felamimail_Controller_Cache_Message_Abstract
                                                implements Felamimail_Controller_Cache_Message_Interface
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
        $this->_backend = Felamimail_Backend_Message::getInstance();
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
            self::$_instance = new Felamimail_Controller_Cache_Imap_Message();
        }
        
        return self::$_instance;
    }
    
    /**
    * get folder status and return all folders where something needs to be done
    *
    * @param Felamimail_Model_FolderFilter  $_filter
    * @return Tinebase_Record_RecordSet
    */
    public function getFolderStatus(Felamimail_Model_FolderFilter $_filter)
    {
        $this->_availableUpdateTime = NULL;
        
        // add user account ids to filter and use the folder backend to search as the folder controller has some special handling in its search function
        $_filter->createFilter(array('field' => 'account_id', 'operator' => 'in', 'value' => Felamimail_Controller_Account::getInstance()->search()->getArrayOfIds()));
        $folderBackend = Felamimail_Backend_Folder::getInstance();
        $folders = $folderBackend->search($_filter);
        
        if (Tinebase_Core::isLogLevel(Zend_Log::TRACE)) Tinebase_Core::getLogger()->trace(__METHOD__ . '::' . __LINE__ .  ' ' . print_r($_filter->toArray(), TRUE));
        if (Tinebase_Core::isLogLevel(Zend_Log::INFO)) Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ .  " Checking status of " . count($folders) . ' folders.');
        
        $result = new Tinebase_Record_RecordSet('Felamimail_Model_Folder');
        foreach ($folders as $folder) {
            if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ .  ' Checking folder ' . $folder->globalname);
            
            if ($this->_doNotUpdateCache($folder, FALSE)) {
                continue;
            }
            
            $imap = Felamimail_Backend_ImapFactory::factory($folder->account_id);
            
            $folder = Felamimail_Controller_Cache_Folder::getInstance()->getIMAPFolderCounter($folder);
            
            if ($this->_cacheIsInvalid($folder) || $this->_messagesInCacheButNotOnIMAP($folder)) {
                $result->addRecord($folder);
                continue;
            }
            
            if ($folder->imap_totalcount > 0) {
                try {
                    $this->_updateMessageSequence($folder, $imap);
                } catch (Felamimail_Exception_IMAPMessageNotFound $feimnf) {
                    $result->addRecord($folder);
                    continue;
                }
                
                if ($this->_messagesDeletedOnIMAP($folder) || $this->_messagesToBeAddedToCache($folder) || $this->_messagesMissingFromCache($folder) ) {
                    $result->addRecord($folder);
                    continue;
                }
            }
        }

        if (Tinebase_Core::isLogLevel(Zend_Log::INFO)) Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ .  " Found " . count($result) . ' folders that need an update.');
        
        return $result;
    }
    
    /**
     * update message cache
     * 
     * @param string $_folder
     * @param integer $_time in seconds
     * @param integer $_updateFlagFactor 1 = update flags every time, x = update flags roughly each xth run (10 by default)
     * @return Felamimail_Model_Folder folder status (in cache)
     * @throws Felamimail_Exception
     */
    public function updateCache($_folder, $_time = 10, $_updateFlagFactor = 10)
    {
//        $oldMaxExcecutionTime = Tinebase_Core::setExecutionLifeTime(300); // 5 minutes
//        
//        // always read folder from database
        $folder = Felamimail_Controller_Folder::getInstance()->get($_folder);
        
//        if ($this->_doNotUpdateCache($folder)) {
//            return $folder;
//        }
//        
//        $imap = Felamimail_Backend_ImapFactory::factory($folder->account_id);
//        
//        $this->_availableUpdateTime = $_time;
//        
//        $this->_expungeCacheFolder($folder, $imap);
//        $this->_initUpdate($folder);
//        $this->_updateMessageSequence($folder, $imap);
//        $this->_deleteMessagesInCache($folder, $imap);
//        $this->_addMessagesToCache($folder, $imap);
//        $this->_checkForMissingMessages($folder, $imap);
//        $this->_updateFolderStatus($folder);
//        
//        if (rand(1, $_updateFlagFactor) == 1) {
//            $folder = $this->updateFlags($folder);
//        }
//        
//        $this->_updateFolderQuota($folder, $imap);
//        
//        // reset max execution time to old value
//        Tinebase_Core::setExecutionLifeTime($oldMaxExcecutionTime);
        
        return $folder;
    }
    
    /**
     * add one message to cache
     * 
     * @param  array                    $_message
     * @param  Felamimail_Model_Folder  $_folder
     * @param  bool                     $_updateFolderCounter
     * @return Felamimail_Model_Message|bool
     */
    public function addMessage(array $_message, Felamimail_Model_Folder $_folder, $_updateFolderCounter = true)
    {
        if (! array_key_exists('header', $_message) || ! is_array($_message['header'])) {
            if (Tinebase_Core::isLogLevel(Zend_Log::NOTICE)) Tinebase_Core::getLogger()->notice(__METHOD__ . '::' . __LINE__ . ' Email uid ' . $_message['uid'] . ' has no headers. Skipping ...');
            return FALSE;
        }
        
        $messageToCache = $this->_createMessageToCache($_message, $_folder);
        $cachedMessage = $this->_addMessageToCache($messageToCache);
        
        if ($cachedMessage !== FALSE) { 
            $this->_saveMessageInTinebaseCache($cachedMessage, $_folder, $_message);
            
            if ($_updateFolderCounter == TRUE) {
                Felamimail_Controller_Folder::getInstance()->updateFolderCounter($_folder, array(
                    'cache_totalcount'  => '+1',
                    'cache_unreadcount' => (! $messageToCache->hasSeenFlag())   ? '+1' : '+0',
                ));
            }
        }
        
        return $cachedMessage;
    }
    
    /**
     * remove all cached messages for this folder and reset folder values / folder status is updated in the database
     *
     * @param string|Felamimail_Model_Folder $_folder
     * @return Felamimail_Model_Folder
     */
    public function clear($_folder)
    {
        $folder = ($_folder instanceof Felamimail_Model_Folder) ? $_folder : Felamimail_Controller_Folder::getInstance()->get($_folder);
        
        Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ . ' Clearing cache of ' . $folder->globalname);
        
        $this->deleteByFolder($folder);
        
        $folder->cache_timestamp        = Tinebase_DateTime::now();
        $folder->cache_status           = Felamimail_Model_Folder::CACHE_STATUS_EMPTY;
        $folder->cache_job_actions_est = 0;
        $folder->cache_job_actions_done = 0;
        
        Felamimail_Controller_Folder::getInstance()->updateFolderCounter($folder, array(
            'cache_totalcount'  => 0,
            'cache_recentcount' => 0,
            'cache_unreadcount' => 0
        ));
        
        $folder = Felamimail_Controller_Folder::getInstance()->update($folder);
        
        return $folder;
    }
    
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
    public function updateFlags($_folder, $_time = 60)
    {
        // always read folder from database
        $folder = Felamimail_Controller_Folder::getInstance()->get($_folder);
        
        if ($folder->cache_status !== Felamimail_Model_Folder::CACHE_STATUS_COMPLETE) {
            if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . 
                ' Do not update flags of incomplete folder ' . $folder->globalname
            );
            return $folder;
        }
        
        if ($this->_availableUpdateTime == 0) {
            $this->_availableUpdateTime = $_time;
            $this->_timeStart = microtime(true);
        }
        
        if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . 
            ' Updating flags of folder ' . $folder->globalname 
            . ' / start time: ' . Tinebase_DateTime::now()->toString() 
            . ' / available seconds: ' . ($this->_availableUpdateTime - $this->_timeElapsed)
        );

        // get all flags for folder
        $imap = Felamimail_Backend_ImapFactory::factory($folder->account_id);
        $imap->selectFolder(Felamimail_Model_Folder::encodeFolderName($folder->globalname));
        $flags = $imap->getFlags(1, INF);
        
        for ($i = $folder->cache_totalcount; $i > 0; $i -= $this->_flagSyncCountPerStep) {
            $firstMessageSequence = ($i - $this->_flagSyncCountPerStep) >= 0 ? $i - $this->_flagSyncCountPerStep : 0;
            $messagesWithFlags = $this->_backend->getFlagsForFolder($folder->getId(), $firstMessageSequence, $this->_flagSyncCountPerStep);
            $this->_setFlagsOnCache($messagesWithFlags, $flags, $folder->getId());
            
            if(! $this->_timeLeft()) {
                break;
            }
        }
        
        $updatedCounters = Felamimail_Controller_Cache_Folder::getInstance()->getCacheFolderCounter($_folder);
        $folder = Felamimail_Controller_Folder::getInstance()->updateFolderCounter($folder, array(
            'cache_unreadcount' => $updatedCounters['cache_unreadcount'],
        ));
        
        if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ 
            . ' New unreadcount after flags update: ' . $updatedCounters['cache_unreadcount']);
        
        return $folder;
    }
}