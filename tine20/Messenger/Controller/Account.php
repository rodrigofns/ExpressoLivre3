<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Account
 *
 * @author 00882748530
 */
class Messenger_Controller_Account extends Tinebase_Controller_Record_Abstract {
    
    protected $_applicationName = 'Messenger';
    private static $_instance = NULL;
    
    public static function getInstance() {
        if (self::$_instance === NULL) {            
            self::$_instance = new Messenger_Controller_Account();
        }
        
        return self::$_instance;
    }
    
    private function __construct() {
        $this->_modelName = 'Messenger_Model_Account';
        $this->_doContainerACLChecks = FALSE;
        $this->_doRightChecks = TRUE;
        $this->_purgeRecords = FALSE;
        
        $this->_backend = new Messenger_Backend_Account();
        
        $this->_currentAccount = Tinebase_Core::getUser();
        
//        $this->_imapConfig = Tinebase_Config::getInstance()->getConfigAsArray(Tinebase_Config::IMAP);
//        $this->_useSystemAccount = (array_key_exists('useSystemAccount', $this->_imapConfig) && $this->_imapConfig['useSystemAccount']);
    }
    
    /**
     * get list of records
     *
     * @param Tinebase_Model_Filter_FilterGroup|optional $_filter
     * @param Tinebase_Model_Pagination|optional $_pagination
     * @param boolean $_getRelations
     * @param boolean $_onlyIds
     * @param string $_action for right/acl check
     * @return Tinebase_Record_RecordSet|array
     */
    public function search(Tinebase_Model_Filter_FilterGroup $_filter = NULL, Tinebase_Record_Interface $_pagination = NULL, $_getRelations = FALSE, $_onlyIds = FALSE, $_action = 'get')
    {
        if ($_filter === NULL) {
            $_filter = new Messenger_Model_AccountFilter(array());
        }
        
        $result = parent::search($_filter, $_pagination, $_getRelations, $_onlyIds, $_action);
        
        // check preference / config if we should add system account with tine user credentials or from config.inc.php
//        if ($this->_useSystemAccount && ! $_onlyIds) {
//            $systemAccountFound = FALSE;
//            // check if resultset contains system account and add config values
//            foreach($result as $account) {
//                if ($account->type == Messenger_Model_Account::TYPE_SYSTEM) {
//                    $this->_addSystemAccountConfigValues($account);
//                    $systemAccountFound = TRUE;
//                }
//            }
//            if (! $systemAccountFound) {
//                $this->_addSystemAccount($result);
//            }
//        }
        
        return $result;
    }
    
    /**
     * get by id
     *
     * @param string $_id
     * @param int $_containerId
     * @return Messenger_Model_Account
     */
    public function get($_id, $_containerId = NULL)
    {
        $record = parent::get($_id, $_containerId);
        
        return $record;    
    }
}

?>
