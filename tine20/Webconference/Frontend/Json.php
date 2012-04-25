<?php
/**
 * Tine 2.0
 * @package     Webconference
 * @subpackage  Frontend
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2010 Metaways Infosystems GmbH (http://www.metaways.de)
 * 
 */

/**
 *
 * This class handles all Json requests for the Webconference application
 *
 * @package     Webconference
 * @subpackage  Frontend
 */
class Webconference_Frontend_Json extends Tinebase_Frontend_Json_Abstract
{
    /**
     * the controller
     *
     * @var Webconference_Controller_ExampleRecord
     */
    protected $_controller = NULL;
    
    /**
     * the constructor
     *
     */
    public function __construct()
    {
        $this->_applicationName = 'Webconference';
        $this->_controller = Webconference_Controller_ExampleRecord::getInstance();
    }
    
    /**
     * Search for records matching given arguments
     *
     * @param  array $filter
     * @param  array $paging
     * @return array
     */
    public function searchExampleRecords($filter, $paging)
    {
        return $this->_search($filter, $paging, $this->_controller, 'Webconference_Model_ExampleRecordFilter', TRUE);
    }     
    
    /**
     * Return a single record
     *
     * @param   string $id
     * @return  array record data
     */
    public function getExampleRecord($id)
    {
        return $this->_get($id, $this->_controller);
    }

    /**
     * creates/updates a record
     *
     * @param  array $recordData
     * @return array created/updated record
     */
    public function saveExampleRecord($recordData)
    {
        return $this->_save($recordData, $this->_controller, 'ExampleRecord');        
    }
    
    /**
     * deletes existing records
     *
     * @param  array  $ids 
     * @return string
     */
    public function deleteExampleRecords($ids)
    {
        return $this->_delete($ids, $this->_controller);
    }    

    /**
     * Returns registry data
     * 
     * @return array
     */
//    public function getRegistryData()
//    {   
//        $defaultContainerArray = Tinebase_Container::getInstance()->getDefaultContainer(Tinebase_Core::getUser()->getId(), $this->_applicationName)->toArray();
//        $defaultContainerArray['account_grants'] = Tinebase_Container::getInstance()->getGrantsOfAccount(Tinebase_Core::getUser(), $defaultContainerArray['id'])->toArray();
//    
//        return array(
//            'defaultContainer' => $defaultContainerArray
//        );
//    }
    
    public function getSettings()
    {
    	$result = Webconference_Controller::getInstance()->getConfigSettings()->toArray();
    
    	return $result;
    }
    
    
    public function getTest($param1)
    {
    	return $param1;	
	}
}