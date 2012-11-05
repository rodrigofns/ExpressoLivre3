<?php
/**
 * class to Filter Record data
 * 
 * @package     Webconference
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Edgar de Lucca <edgar.lucca@serpro.gov.br>, Marcelo Teixeira <marcelo.teixeira@serpro.gov.br>
 * @copyright   Copyright (c) 2012 Metaways Infosystems GmbH (http://www.metaways.de)
 * 
 */


/**
 * Room filter Class
 * 
 * @package     Sales
 * @subpackage  Filter
 */
class Webconference_Model_RoomFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string class name of this filter group
     *      this is needed to overcome the static late binding
     *      limitation in php < 5.3
     */
    protected $_className = 'Webconference_Model_RoomFilter';
    
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Webconference';
    
    /**
     * @var string name of model this filter group is designed for
     */
    protected $_modelName = 'Webconference_Model_Room';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
        'id'                    => array('filter' => 'Tinebase_Model_Filter_Id', 'options' => array('modelName' => 'Webconference_Model_Room')),
        'query'                 => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('status', 'room_name', 'title', 'webconference_config_id'))
        ),
        'status'           => array('filter' => 'Tinebase_Model_Filter_Text'),
        'room_name'        => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'created_by'       => array('filter' => 'Tinebase_Model_Filter_User'),
    );
}
