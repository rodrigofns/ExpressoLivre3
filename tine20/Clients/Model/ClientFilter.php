<?php
/**
* filter Class
* @package     Clients
*/
class Clients_Model_ClientFilter extends Tinebase_Model_Filter_FilterGroup
{
   /**
    * @var string application of this filter group
    */
   protected $_applicationName = 'Clients';
   
   /**
    * @var array filter model fieldName => definition
    */
   protected $_filterModel = array(
       'id'             => array('filter' => 'Tinebase_Model_Filter_Id'),
       'query'          => array('filter' => 'Tinebase_Model_Filter_Query', 'options' => array('fields' => array('name', 'company'))),
       'name'           => array('filter' => 'Tinebase_Model_Filter_Text'),
       'company'        => array('filter' => 'Tinebase_Model_Filter_Text'),
   );
}