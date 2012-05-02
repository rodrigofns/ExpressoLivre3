<?php
/**
* class to hold record data
* 
* @package     Clients
*/
class Clients_Model_Client extends Tinebase_Record_Abstract
{  
   /**
    * key in $_validators/$_properties array for the field which 
    * represents the identifier
    * 
    * @var string
    */    
   protected $_identifier = 'id';    
   
   /**
    * application the record belongs to
    *
    * @var string
    */
   protected $_application = 'Clients';
   
   /**
    * list of zend validator
    * 
    * this validators get used when validating user generated content with Zend_Input_Filter
    *
    * @var array
    */
   protected $_validators = array(
       'id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => false, 'presence'=>'required'),
       'name'                  => array(Zend_Filter_Input::ALLOW_EMPTY => false, 'presence'=>'required'),
       'company'               => array(Zend_Filter_Input::ALLOW_EMPTY => false, 'presence'=>'required'),
       'phone'                 => array(Zend_Filter_Input::ALLOW_EMPTY => false, 'presence'=>'required'),
       'created_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
       'creation_time'         => array(Zend_Filter_Input::ALLOW_EMPTY => true),
       'is_deleted'            => array(Zend_Filter_Input::ALLOW_EMPTY => true)
   );
}
