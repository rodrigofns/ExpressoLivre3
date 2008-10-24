<?php
/**
 * Tine 2.0
 *
 * @package     Crm
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Thomas Wadewitz <t.wadewitz@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id$
 *
 */


/**
 * backend for leads products
 *
 * @package     Crm
 */
class Crm_Backend_LeadProducts extends Tinebase_Application_Backend_Sql_Abstract
{
    /**
     * the constructor
     */
    public function __construct ()
    {
    	$this->_identifier = 'lead_id';
        $this->_tableName = SQL_TABLE_PREFIX . 'metacrm_products';
        $this->_modelName = 'Crm_Model_Product';
        $this->_db = Zend_Registry::get('dbAdapter');
        $this->_table = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'metacrm_leads_products'));
    }
        
    /**
     * get products by lead id
     *
     * @param int $_leadId the leadId
     * @return Tinebase_Record_RecordSet of subtype Crm_Model_LeadProduct
     */
    public function get($_leadId)
    {
        $leadId = Crm_Model_Lead::convertLeadIdToInt($_leadId);

        $where  = array(
            $this->_table->getAdapter()->quoteInto('lead_id = ?', $leadId)
        );

        $rows = $this->_table->fetchAll($where);
        
        $result = new Tinebase_Record_RecordSet('Crm_Model_LeadProduct', $rows->toArray());
   
        return $result;
    }      
    
    /**
    * add or updates an product (which belongs to one lead)
    *
    * @param int $_leadId the lead id
    * @param Tinebase_Record_Recordset $_productData the productdata
    */
    public function saveProducts($_leadId, Tinebase_Record_Recordset $_productData)
    {    
        $products = $_productData->toArray();
    
        if(!(int)$_leadId || $_leadId === 0) {
            return $_productData;  
        }
          
        try {
            $transactionId = Tinebase_TransactionManager::getInstance()->startTransaction($this->_db);
            $this->_db->delete(SQL_TABLE_PREFIX . 'metacrm_leads_products', 'lead_id = '.$_leadId);

            foreach($products as $data) {
                $this->_db->insert(SQL_TABLE_PREFIX . 'metacrm_leads_products', $data);                
            }

            Tinebase_TransactionManager::getInstance()->commitTransaction($transactionId);

        } catch (Exception $e) {
            Tinebase_TransactionManager::getInstance()->rollBack();
            error_log($e->getMessage());
        }
    }    
    
}
