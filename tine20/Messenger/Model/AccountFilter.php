<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Messenger_Model_Account
 *
 * @author 00882748530
 */
class Messenger_Model_AccountFilter extends Tinebase_Model_Filter_FilterGroup {
    
    /**
     * @var string class name of this filter group
     *      this is needed to overcome the static late binding
     *      limitation in php < 5.3
     */
    protected $_className = 'Messenger_Model_AccountFilter';
    
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Messenger';
    
    /**
     * @var string name of model this filter group is designed for
     */
    protected $_modelName = 'Messenger_Model_Account';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
        'id'                 => array('filter' => 'Tinebase_Model_Filter_Id'),
        'custom_name'        => array('filter' => 'Tinebase_Model_Filter_Text'),
    );
    
}

?>
