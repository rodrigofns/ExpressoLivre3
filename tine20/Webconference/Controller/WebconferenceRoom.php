<?php

/**
 * WebconferenceConfig controller for Webconference application
 * 
 * @package     Webconference
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Edgar de Lucca <edgar.lucca@sepro.gov.br>
 * @copyright   Copyright (c) 2012 Metaways Infosystems GmbH (http://www.metaways.de)
 *
 */

/**
 * WebconferenceConfig controller class for WebconferenceRomm record
 * 
 * @package     Webconference
 * @subpackage  Controller
 */
class Webconference_Controller_WebconferenceRoom extends Tinebase_Controller_Record_Abstract {

    /**
     * the constructor
     *
     * don't use the constructor. use the singleton 
     */
    private function __construct() {
        $this->_applicationName = 'Webconference';
        $this->_modelName = 'Webconference_Model_WebconferenceRoom';
        $this->_backend = new Webconference_Backend_WebconferenceRoom();
        $this->_currentAccount = Tinebase_Core::getUser();
        $this->_purgeRecords = FALSE;
        // activate this if you want to use containers
        $this->_doContainerACLChecks = FALSE;
    }

    /**
     * holds the instance of the singleton
     *
     * @var Webconference_Controller_WebconferenceRoom
     */
    private static $_instance = NULL;

    /**
     * the singleton pattern
     *
     * @return Webconference_Controller_WebconferenceRoom
     */
    public static function getInstance() {
        if (self::$_instance === NULL) {
            self::$_instance = new Webconference_Controller_WebconferenceRoom();
        }
        return self::$_instance;
    }
}
