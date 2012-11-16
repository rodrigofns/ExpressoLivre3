<?php

/**
 * Room controller for Webconference application
 * 
 * @package     Webconference
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Edgar de Lucca <edgar.lucca@sepro.gov.br>
 * @copyright   Copyright (c) 2012 Metaways Infosystems GmbH (http://www.metaways.de)
 *
 */

/**
 * WebconferenceConfig controller class for Access record
 * 
 * @package     Webconference
 * @subpackage  Controller
 */
class Webconference_Controller_AccessLog extends Tinebase_Controller_Record_Abstract {

    /**
     * the constructor
     *
     * don't use the constructor. use the singleton 
     */
    private function __construct() {
        $this->_applicationName = 'Webconference';
        $this->_modelName = 'Webconference_Model_AccessLog';
        $this->_backend = new Webconference_Backend_AccessLog();
        $this->_currentAccount = Tinebase_Core::getUser();
        $this->_purgeRecords = FALSE;
        // activate this if you want to use containers
        $this->_doContainerACLChecks = FALSE;
    }

    /**
     * holds the instance of the singleton
     *
     * @var Webconference_Controller_AccessLog
     */
    private static $_instance = NULL;

    /**
     * the singleton pattern
     *
     * @return Webconference_Controller_AccessLog
     */
    public static function getInstance() {
        if (self::$_instance === NULL) {
            self::$_instance = new Webconference_Controller_AccessLog();
        }
        return self::$_instance;
    }
    
    public function search(Tinebase_Model_Filter_FilterGroup $_filter = NULL, Tinebase_Record_Interface $_pagination = NULL, $_getRelations = FALSE, $_onlyIds = FALSE, $_action = 'get') {
	$result = parent::search($_filter, $_pagination, $_getRelations, $_onlyIds, $_action);
	return $result;
    }
    
    public function logAccessLogin($_roomId){
	return $this->_backend->regLogin($_roomId);
    }

    public function logAccessLogoff($_roomId){
	return $this->_backend->regLogoff($_roomId);
    }
    
    public function regLogoff($_idAccess){
	$record = $this->get($_idAccess);
	$record->setFromArray(array("logout" => time()));
	return $this->update($record);
   }
    
}
