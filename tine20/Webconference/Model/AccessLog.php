<?php
/**
 * class to hold ExampleRecord data
 * 
 * @package     Webconference
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Edgar de Lucca <edgar.lucca@serpro.gov.br>, Marcelo Teixeira <marcelo.teixeira@serpro.gov.br>
 * @copyright   Copyright (c) 2012 Metaways Infosystems GmbH (http://www.metaways.de)
 * 
 */

class Webconference_Model_AccessLog extends Tinebase_Record_Abstract
{  
    /**
     * key in $_validators/$_properties array for the filed which 
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
    protected $_application = 'Webconference';

    /**
     * list of zend validator
     * 
     * this validators get used when validating user generated content with Zend_Input_Filter
     *
     * @var array
     */
    protected $_validators = array(
        'id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'accounts_id'           => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	'webconference_room_id' => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	'login'		        => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'logout'		=> array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );

    /**
     * name of fields containing datetime or an array of datetime information
     *
     * @var array list of datetime fields
     */    
    protected $_datetimeFields = array(
        'login',
        'logout'
    );
    
    /**
     * overwrite constructor to add more filters
     *
     * @param mixed $_data
     * @param bool $_bypassFilters
     * @param mixed $_convertDates
     * @return void
     */
    public function __construct($_data = NULL, $_bypassFilters = false, $_convertDates = true)
    {
        // do something here if you like (add default empty values, ...)
        
        return parent::__construct($_data, $_bypassFilters, $_convertDates);
    }

    /**
     * fills a record from json data
     *
     * @param string $_data json encoded data
     * @return void
     */
    public function setFromJson($_data)
    {
        parent::setFromJson($_data);
        
        // do something here if you like
    }
}
