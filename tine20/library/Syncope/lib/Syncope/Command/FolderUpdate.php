<?php
/**
 * Tine 2.0
 *
 * @package     ActiveSync
 * @license     http://www.tine20.org/licenses/lgpl.html LGPL Version 3
 * @copyright   Copyright (c) 2008-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 */

/**
 * class documentation
 *
 * @package     ActiveSync
 */
class Syncope_Command_FolderUpdate extends Syncope_Command_Wbxml 
{        
    protected $_defaultNameSpace    = 'uri:FolderHierarchy';
    protected $_documentElement     = 'FolderUpdate';

    protected $_classes             = array(
    		Syncope_Data_Factory::CLASS_CALENDAR,
    		Syncope_Data_Factory::CLASS_CONTACTS,
    		Syncope_Data_Factory::CLASS_EMAIL,
    		Syncope_Data_Factory::CLASS_TASKS
    );
     
    /**
     * synckey sent from client
     *
     * @var string
     */
    protected $_syncKey;
    protected $_parentId;
    protected $_displayName;
    protected $_serverId;
  
    /**
     * parse FolderUpdate request
     *
     */
    public function handle()
    {
        $xml = simplexml_import_dom($this->_inputDom);
        
        $this->_syncKey     = (int)$xml->SyncKey;
        $this->_parentId    = (string)$xml->ParentId;
        $this->_displayName = (string)$xml->DisplayName;
        $this->_serverId    = (string)$xml->ServerId;
        
        if ($this->_logger instanceof Zend_Log)
        	$this->_logger->debug(__METHOD__ . '::' . __LINE__ . " synckey is $this->_syncKey parentId $this->_parentId name $this->_displayName");
 
        $defaultAccountId = Tinebase_Core::getPreference('Felamimail')->{Felamimail_Preference::DEFAULTACCOUNT};
        $this->_syncState = $this->_syncStateBackend->validate($this->_device, 'FolderSync', $this->_syncKey);
        
        try {
        	$this->_folder = $this->_folderBackend->getFolder($this->_device, $this->_serverId);
        	$dataController = Syncope_Data_Factory::factory($this->_folder->class, $this->_device, $this->_syncTimeStamp);
        	$felamimail_model_folder = Felamimail_Controller_Folder::getInstance()->get($this->_folder->folderid);
        	
        	$dataController->updateFolder($defaultAccountId, trim($this->_displayName), $felamimail_model_folder['globalname']);
        	$this->_folderBackend->update($this->_folder);
        
        } catch (Syncope_Exception_NotFound $senf) {
        	if ($this->_logger instanceof Zend_Log)
        		$this->_logger->debug(__METHOD__ . '::' . __LINE__ . " " . $senf->getMessage());
        }
    }
    
    /**
     * generate FolderUpdate response
     *
     */
    public function getResponse($_keepSession = FALSE)
    {
        $folderUpdate = $this->_outputDom->documentElement;
        
        if($this->_syncState == false) {
        	if ($this->_logger instanceof Zend_Log)
        		$this->_logger->info(__METHOD__ . '::' . __LINE__ . " INVALID synckey");
        	$folderUpdate->appendChild($this->_outputDom->createElementNS('uri:FolderHierarchy', 'Status', Syncope_Command_FolderSync::STATUS_INVALID_SYNC_KEY));
        } else {
        	if ($this->_folder instanceof Syncope_Model_IFolder) {
        		$this->_syncState->counter++;
        
        		// create xml output
        		$folderUpdate->appendChild($this->_outputDom->createElementNS('uri:FolderHierarchy', 'Status', Syncope_Command_FolderSync::STATUS_SUCCESS));
        		$folderUpdate->appendChild($this->_outputDom->createElementNS('uri:FolderHierarchy', 'SyncKey', $this->_syncState->counter));
        
        		$this->_syncStateBackend->update($this->_syncState);
        	} else {
        		// create xml output
        		$folderUpdate->appendChild($this->_outputDom->createElementNS('uri:FolderHierarchy', 'Status', Syncope_Command_FolderSync::STATUS_FOLDER_NOT_FOUND));
        		$folderUpdate->appendChild($this->_outputDom->createElementNS('uri:FolderHierarchy', 'SyncKey', $this->_syncState->counter));
        	}
        }
        return $this->_outputDom;
    }    
}
