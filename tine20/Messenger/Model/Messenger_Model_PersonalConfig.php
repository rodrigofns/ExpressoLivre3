<?php

class Messenger_Model_PersonalConfig extends Tinebase_Record_Abstract
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
   protected $_application = 'Messenger';
   
   /**
    * list of zend validator
    * 
    * this validators get used when validating user generated content with Zend_Input_Filter
    *
    * @var array
    */
   protected $_validators = array(
       'id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => false, 'presence'=>'required'),
       'view_notification'     => array(Zend_Filter_Input::ALLOW_EMPTY => false, 'presence'=>'required'),
       'auto_authentication'   => array(Zend_Filter_Input::ALLOW_EMPTY => false, 'presence'=>'required'),
       'messenger_login'       => array(Zend_Filter_Input::ALLOW_EMPTY => true)
   );
      
}