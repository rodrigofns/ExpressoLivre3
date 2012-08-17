<?php
/**
 * Tine 2.0
 * 
 * @package     Webconference
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Edgar de Lucca <edgar.lucca@serpro.gov.br>
 * @copyright   Copyright (c) 2012 Metaways Infosystems GmbH (http://www.metaways.de)
 *
 */

/**
 * Webconference Controller (composite)
 * 
 * The Webconference 2.0 Controller manages access (acl) to the different backends and supports
 * a common interface to the servers/views
 * 
 * @package Webconference
 * @subpackage  Controller
 */
class Webconference_Controller extends Tinebase_Controller_Event implements Tinebase_Container_Interface
{
    /**
     * the constructor
     *
     * don't use the constructor. use the singleton 
     */
    private function __construct() {
        $this->_applicationName = 'Webconference';
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
     * holds self
     * @var Webconference_Controller
     */
    private static $_instance = NULL;
    
    /**
     * singleton
     *
     * @return Webconference_Controller
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Webconference_Controller();
        }
        return self::$_instance;
    }
    
    /**
     * temporaray function to get a default container]
     * 
     * @param string $_referingApplication
     * @return Tinebase_Model_Container container
     * 
     * @todo replace this by Tinebase_Container::getDefaultContainer
     */
    public function getDefaultContainer($_referingApplication = 'tasks')
    {
        $taskConfig = Tinebase_Core::getConfig()->tasks;
        $configString = 'defaultcontainer_' . ( empty($_referingApplication) ? 'tasks' : $_referingApplication );
        
        if (isset($taskConfig->$configString)) {
            $defaultContainer = Tinebase_Container::getInstance()->getContainerById((int)$taskConfig->$configString);
        } else {
            $defaultContainer = Tinebase_Container::getInstance()->getDefaultContainer($this->_currentAccount->accountId, 'Webconference');
        }
        
        return $defaultContainer;
    }
        
    /**
     * creates the initial folder for new accounts
     *
     * @param mixed[int|Tinebase_Model_User] $_account   the accountd object
     * @return Tinebase_Record_RecordSet                            of subtype Tinebase_Model_Container
     */
    public function createPersonalFolder($_accountId)
    {
        $translation = Tinebase_Translation::getTranslation('Webconference');
        
        $accountId = Tinebase_Model_User::convertUserIdToInt($_accountId);
        $account = Tinebase_User::getInstance()->getUserById($accountId);
        $newContainer = new Tinebase_Model_Container(array(
            'name'              => sprintf($translation->_("%s's personal example records"), $account->accountFullName),
            'type'              => Tinebase_Model_Container::TYPE_PERSONAL,
            'backend'           => 'Sql',
            'application_id'    => Tinebase_Application::getInstance()->getApplicationByName('Webconference')->getId() 
        ));
        
        $personalContainer = Tinebase_Container::getInstance()->addContainer($newContainer, NULL, FALSE, $accountId);
        $container = new Tinebase_Record_RecordSet('Tinebase_Model_Container', array($personalContainer));
        
        return $container;
    }

    /**
     * event handler function
     * 
     * all events get routed through this function
     *
     * @param Tinebase_Event_Abstract $_eventObject the eventObject
     */
    protected function _handleEvent(Tinebase_Event_Abstract $_eventObject)
    {
        if (Tinebase_Core::isLogLevel(Zend_Log::TRACE)) Tinebase_Core::getLogger()->trace(__METHOD__ . ' (' . __LINE__ . ') handle event of type ' . get_class($_eventObject));
        
        switch(get_class($_eventObject)) {
            case 'Admin_Event_AddAccount':
                $this->createPersonalFolder($_eventObject->account);
                break;
            case 'Admin_Event_DeleteAccount':
                #$this->deletePersonalFolder($_eventObject->account);
                break;
        }
    }
    
    public function getConfigSettings($_resolve = FALSE)
    {
    	$cache = Tinebase_Core::get('cache');
    	$cacheId = convertCacheId('getCrmSettings');
    	$result = $cache->load($cacheId);
    
    	if (! $result) {
    
    		$translate = Tinebase_Translation::getTranslation('Crm');
    
    		$result = new Crm_Model_Config(array(
    				'defaults' => parent::getConfigSettings()
    		));
    
    		$others = array(
    				Crm_Model_Config::LEADTYPES => array(
    						array('id' => 1, 'leadtype' => $translate->_('Customer')),
    						array('id' => 2, 'leadtype' => $translate->_('Partner')),
    						array('id' => 3, 'leadtype' => $translate->_('Reseller')),
    				),
    				Crm_Model_Config::LEADSTATES => array(
    						array('id' => 1, 'leadstate' => $translate->_('open'),                  'probability' => 0,     'endslead' => 0),
    						array('id' => 2, 'leadstate' => $translate->_('contacted'),             'probability' => 10,    'endslead' => 0),
    						array('id' => 3, 'leadstate' => $translate->_('waiting for feedback'),  'probability' => 30,    'endslead' => 0),
    						array('id' => 4, 'leadstate' => $translate->_('quote sent'),            'probability' => 50,    'endslead' => 0),
    						array('id' => 5, 'leadstate' => $translate->_('accepted'),              'probability' => 100,   'endslead' => 1),
    						array('id' => 6, 'leadstate' => $translate->_('lost'),                  'probability' => 0,     'endslead' => 1),
    				),
    				Crm_Model_Config::LEADSOURCES => array(
    						array('id' => 1, 'leadsource' => $translate->_('Market')),
    						array('id' => 2, 'leadsource' => $translate->_('Email')),
    						array('id' => 3, 'leadsource' => $translate->_('Telephone')),
    						array('id' => 4, 'leadsource' => $translate->_('Website')),
    				)
    		);
    		foreach ($others as $setting => $defaults) {
    			$result->$setting = Tinebase_Config::getInstance()->getConfigAsArray($setting, $this->_applicationName, $defaults);
    		}
    
    		// save result and tag it with 'settings'
    		$cache->save($result, $cacheId, array('settings'));
    	}
    
    	return $result;
    }
}
