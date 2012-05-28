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
interface Felamimail_Backend_Cache_FolderInterface
{  
    /**
     * get folder cache counter like total and unseen
     *
     * @param  string  $_folderId  the folderid
     * @return array
     */
    public function getFolderCounter($_folderId);
    
    /**
     * try to lock a folder
     *
     * @param  Felamimail_Model_Folder  $_folder  the folder to lock
     * @return bool  true if locking was successful, false if locking 
     * was not possible
     */
    public function lockFolder(Felamimail_Model_Folder $_folder);
    
    /**
     * increment/decrement folder counter on sql backend
     *
     * @param  mixed  $_folderId
     * @param  array  $_counters
     * @return Felamimail_Model_Folder
     * @throws Tinebase_Exception_InvalidArgument
     */
    public function updateFolderCounter($_folderId, array $_counters);
}