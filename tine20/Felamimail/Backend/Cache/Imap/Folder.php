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

class Felamimail_Backend_Cache_Imap_Folder extends Felamimail_Backend_Cache_Imap_Abstract
                                           implements Felamimail_Backend_Cache_FolderInterface
{
    /*************************** abstract functions ****************************/
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
        $filters = $_filter->getFilterObjects();     
        
//        TODO: implement this folder filter
//        $folderFilter = new Felamimail_Model_FolderFilter(array(
//                        array('field' => 'account_id',  'operator' => 'in',     'value' => $accounts->getArrayOfIds()),
//                        array('field' => 'localname',   'operator' => 'equals', 'value' => 'INBOX')
//        ));
        
        
        foreach($filters as $filter)
        {
            switch($filter->getField())
            {
                case 'account_id':
                    $accountId = $filter->getValue();
                    break;
                case 'parent':
                    $globalName = $filter->getValue();
                    $parent = true;
                    break;
                case 'id':
                    $felamimailAccount = Felamimail_Controller_Account::getInstance()->search()->toArray();
                    $accountId = $felamimailAccount[0]['id'];
                    $globalName = $filter->getValue();
                    $parent = true;
                    break;
                case 'globalname':
                    $globalName = $filter->getValue();
                    if($filter->getOperator() == 'startswith'){
                        $parent = true;
                        $globalName = substr($globalName, 0, -1);
                    }
                    break;
            }
        }
        
        $resultArray = array();
        $accountId = (array)$accountId;
        
        foreach ($accountId as $id)
        {
            $account = Felamimail_Controller_Account::getInstance()->get($id);

            if($parent === true){
                $folders = $this->_getFoldersFromIMAP($account, $globalName);
                foreach($folders as $folder)
                {
                    $resultArray[] = $this->get(self::encodeFolderUid($folder['globalName'],$id));
                }
            }
            else{
                $resultArray[] = $this->get(self::encodeFolderUid(Felamimail_Model_Folder::encodeFolderName($globalName),$id));
            }
        }
        
        $result = new Tinebase_Record_RecordSet('Felamimail_Model_Folder', $resultArray, true);
        
        return $result;
    }
    
    /**
     * get folders from imap
     * 
     * @param Felamimail_Model_Account $_account
     * @param mixed $_folderName
     * @return array
     */
    protected function _getFoldersFromIMAP(Felamimail_Model_Account $_account, $_folderName)
    {
        if (empty($_folderName))
        {
            $folders = $this->_getRootFolders($_account);
        } else {
            if (!is_array($_folderName))
            {
                $folders = $this->_getSubfolders($_account, $_folderName);
            } 
            else
            {
                $folders = array();
                foreach ($_folderName as $folder)
                {
                    $decodedFolder = self::decodeFolderUid($folder);
                    $folders = array_merge($folders, $this->_getFolder($_account, $decodedFolder['globalName']));
                }
            }  
        }
        
        return $folders;
    }
    
    /**
     * get root folders and check account capabilities and system folders
     * 
     * @param Felamimail_Model_Account $_account
     * @return array of folders
     */
    protected function _getRootFolders(Felamimail_Model_Account $_account)
    {
        $imap = Felamimail_Backend_ImapFactory::factory($_account);
        
        if (Tinebase_Core::isLogLevel(Zend_Log::INFO)) Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ 
            . ' Get subfolders of root for account ' . $_account->getId());
        $result = $imap->getFolders('', '%');
        
        return $result;
    }
    
    /**
     * get root folders and check account capabilities and system folders
     * 
     * @param Felamimail_Model_Account $_account
     * @return array of folders
     */
    protected function _getFolder(Felamimail_Model_Account $_account, $_folderName)
    {
        $imap = Felamimail_Backend_ImapFactory::factory($_account);
        
        if (Tinebase_Core::isLogLevel(Zend_Log::INFO)) Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ 
            . ' Get folder ' . $_folderName);
        $result = $imap->getFolders(Felamimail_Model_Folder::encodeFolderName($_folderName));
        
        return $result;
    }
    
    /**
     * get subfolders
     * 
     * @param $_account
     * @param $_folderName
     * @return array of folders
     */
    protected function _getSubfolders(Felamimail_Model_Account $_account, $_folderName)
    {
        $result = array();
        
        try {
            if (Tinebase_Core::isLogLevel(Zend_Log::INFO)) Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ 
                . ' trying to get subfolders of ' . $_folderName . self::IMAPDELIMITER);

            $imap = Felamimail_Backend_ImapFactory::factory($_account);
            $result = $imap->getFolders(
                                   Felamimail_Model_Folder::encodeFolderName($_folderName) . self::IMAPDELIMITER , '%');
            
            // remove folder if self
            if (in_array($_folderName, array_keys($result))) {
                unset($result[$_folderName]);
            }        
        } catch (Zend_Mail_Storage_Exception $zmse) {
            if (Tinebase_Core::isLogLevel(Zend_Log::INFO)) Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ 
                . ' No subfolders of ' . $_folderName . ' found.');
        }
        
        return $result;
    }
    
    
    
    
    /**
     * Updates existing entry
     *
     * @param Tinebase_Record_Interface $_record
     * @throws Tinebase_Exception_Record_Validation|Tinebase_Exception_InvalidArgument
     * @return Tinebase_Record_Interface Record|NULL
     */
    public function update(Tinebase_Record_Interface $_record)
    {
        $folder = $_record->toArray();
        $return = $this->get($this->encodeFolderUid($folder['globalname'], $folder['account_id']));
        Return $return;   
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
     * @param string $_id
     * @param $_getDeleted get deleted records
     * @return Tinebase_Record_Interface
     * @throws Tinebase_Exception_NotFound
     */
    public function get($_id, $_getDeleted = FALSE) 
    {
            $folderDecoded = self::decodeFolderUid($_id);

            if($folderDecoded['globalName'] == 'user'){
                   return new Felamimail_Model_Folder(array(
                    'id' => $_id,
                    'account_id' => Tinebase_Core::getPreference('Felamimail')->{Felamimail_Preference::DEFAULTACCOUNT},
                    'localname' => "Compartilhadas",
                    'globalname' => $folderDecoded['globalName'],
                    'parent' => '',
                    'delimiter' => self::IMAPDELIMITER,
                    'is_selectable' => 0,
                    'has_children' => 1,
                    'system_folder' => 1,
                    'imap_status' => Felamimail_Model_Folder::IMAP_STATUS_OK,
                    'imap_timestamp' => Tinebase_DateTime::now(),
                    'cache_status' => 'complete',
                    'cache_timestamp' => Tinebase_DateTime::now(),
                    'cache_job_lowestuid' => 0,
                    'cache_job_startuid' => 0,
                    'cache_job_actions_est' => 0,
                    'cache_job_actions_done' => 0
                ));
                
            }else{
                $imap = Felamimail_Backend_ImapFactory::factory($folderDecoded['accountId']);
                $folder = $imap->getFolders('',$folderDecoded['globalName']);
                $counter = $imap->examineFolder($folderDecoded['globalName']);
                $status = $imap->getFolderStatus($folderDecoded['globalName']);
            }
            $globalName = $folderDecoded['globalName'];
            if($globalName == 'INBOX' || $globalName == 'user')
            {
                $folder[$folderDecoded['globalName']]['parent'] = '';
            }
            else
            {
                $folder[$folderDecoded['globalName']]['parent'] = substr($globalName,0 , strrpos($globalName,self::IMAPDELIMITER));
            }
            /*
             * @todo must see if it is not better do this on the model directly
             */
            $systemFolders = FALSE;
            if (strtolower($folder[$folderDecoded['globalName']]['parent']) === 'inbox')
            {
                $systemFolders = in_array(strtolower($folder[$folderDecoded['globalName']]['localName']), 
                                                       Felamimail_Controller_Folder::getInstance()->getSystemFolders());
            }
            
            
            return new Felamimail_Model_Folder(array(
                    'id' => $_id,
                    'account_id' => $folderDecoded['accountId'],
                    'localname' => Felamimail_Model_Folder::decodeFolderName($folder[$folderDecoded['globalName']]['localName']),
                    'globalname' => Felamimail_Model_Folder::decodeFolderName($folder[$folderDecoded['globalName']]['globalName']),
                    'parent' => $folder[$folderDecoded['globalName']]['parent'],
                    'delimiter' => $folder[$folderDecoded['globalName']]['delimiter'],
                    'is_selectable' => $folder[$folderDecoded['globalName']]['isSelectable'],
                    'has_children' => $folder[$folderDecoded['globalName']]['hasChildren'],
                    'system_folder' => $systemFolders,
                    'imap_status' => Felamimail_Model_Folder::IMAP_STATUS_OK,
                    'imap_uidvalidity' => $counter['uidvalidity'],
                    'imap_totalcount' => (array_key_exists('exists', $status))?$status['exists']:'',
                    'imap_timestamp' => Tinebase_DateTime::now(),
                    'cache_status' => 'complete',
                    'cache_totalcount' =>  (array_key_exists('messages', $status))?$status['messages']:'',
                    'cache_recentcount' => (array_key_exists('recent', $status))?$status['recent']:'',
                    'cache_unreadcount' => (array_key_exists('unseen', $status))?$status['unseen']:'',
                    'cache_timestamp' => Tinebase_DateTime::now(),
                    'cache_job_lowestuid' => 0,
                    'cache_job_startuid' => 0,
                    'cache_job_actions_est' => 0,
                    'cache_job_actions_done' => 0
                ));
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
//        $aux = new Felamimail_Backend_Cache_Sql_Folder();        
//        $retorno = $aux->delete($_id);
//        
////Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . 'Folder delete = $retorno ' . print_r($retorno,true));
//        return $retorno;
        
        return NULL;
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
//        $aux = new Felamimail_Backend_Cache_Sql_Folder();        
//        $retorno = $aux->getMultiple($_id, $_containerIds = NULL);
//        
////Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . 'Folder delete = $retorno ' . print_r($retorno,true));
//        return $retorno;
        $return = array();
        if(is_array($_id)){
            foreach($_id as $id){
                $folder = $this->get($id);
                $return[] = $folder;
            }
        }else{
            $return[] = $this->get($_id);
        }
        
        return   new Tinebase_Record_RecordSet('Felamimail_Model_Folder', $return, true);
        
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
        $folder = $_record->toArray();
        $return = $this->get($this->encodeFolderUid($folder['globalname'], $folder['account_id']));
        Return $return;
    }
    
/*************************** interface functions ****************************/     
    /**
     * get folder cache counter like total and unseen
     *
     * @param  string  $_folderId  the folderid
     * @return array
     */
    public function getFolderCounter($_folderId)
    {
        if($_folderId instanceof Felamimail_Model_Folder){
            $exists = $_folderId->cache_totalcount;
            $unseen = $_folderId->cache_unreadcount;
        }else{
            $folder = self::decodeFolderUid($_folderId);
            $imap = Felamimail_Backend_ImapFactory::factory($folder['accountId']);
            $counter = $imap->examineFolder($folder['globalName']);
            $exists = $counter['exists'];
            $unseen = $counter['unseen'];
        }
         return array(
            'cache_totalcount'  => $exists,
            'cache_unreadcount' => $unseen
        );
    }

    /**
     * Sql cache specific function. In the IMAPAdapter always returns true
     *
     * @param  Felamimail_Model_Folder  $_folder  the folder to lock
     * @return bool true if locking was successful, false if locking was not possible
     */
    public function lockFolder(Felamimail_Model_Folder $_folder)
    {
        //return true;
        /**
         *TODO: remove the comment above, delete the lines bellow
         */
        $aux = new Felamimail_Backend_Cache_Sql_Folder();        
        return $aux->lockFolder($_folder);
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
/*        
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Folder create = $_folderId ' . print_r($_folderId,true));
Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . ' Folder create = $_counters ' . print_r($_counters,true));
*/ 
        $folder = ($_folderId instanceof Felamimail_Model_Folder) ? $_folderId : $this->get($_folderId);
       
//Tinebase_Core::getLogger()->alert(__METHOD__ . '#####::#####' . __LINE__ . 'Folder create = $retorno ' . print_r($retorno,true));
        return $folder;
    }
    
    /**
     * Encode the folder name to be passed on the calls
     * @param string $_folder
     * @param string $_accountId
     * @return string 
     */
    static public function encodeFolderUid($_folder,$_accountId)
    {
        $folder = base64_encode($_accountId.";".$_folder);
        $count = substr_count($folder, '=');
      return substr($folder,0, (strlen($folder) - $count)) . $count;
    }
    
    /**
     * Decode the folder previously encoded by encoderFolderUid
     * @param string $_folder
     * @return array 
     */
    static public function decodeFolderUid($_folder)
    {
        $decoded = base64_decode(str_pad(substr($_folder, 0, -1), substr($_folder, -1), '='));
        list($accountId, $globalName) = explode(';', $decoded);
        return array(
            'accountId'     => $accountId,
            'globalName'      => $globalName
        );
        
        
    }
    
}