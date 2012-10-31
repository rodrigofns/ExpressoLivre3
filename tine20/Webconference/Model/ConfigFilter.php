<?php
/**
 * Tine 2.0
 * 
 * @package     Webconference
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Edgar de Lucca <edgar.lucca@serpro.gov.br>, Marcelo Teixeira <marcelo.teixeira@serpro.gov.br>
 * @copyright   Copyright (c) 2012 Metaways Infosystems GmbH (http://www.metaways.de)
 *
 */

/**
 * ExampleRecord filter Class
 * @package     Webconference
 */
class Webconference_Model_ConfigFilter extends Tinebase_Model_Filter_FilterGroup 
{
    
    protected $_className = 'Webconference_Model_ConfigFilter';
    
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Webconference';
    
    /**
     * @var string name of model this filter group is designed for
     */
    protected $_modelName = 'Webconference_Model_Config';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
        'query'          => array('filter' => 'Tinebase_Model_Filter_Query', 'options' => array('fields' => array('description', /*'...'*/))),
        'container_id'   => array('filter' => 'Tinebase_Model_Filter_Container', 'options' => array('applicationName' => 'Webconference')),
        'id'             => array('filter' => 'Tinebase_Model_Filter_Id'),
        
        
        // @todo add filters
        /*
        'title'          => array('filter' => 'Tinebase_Model_Filter_Text'),
        'number'         => array('filter' => 'Tinebase_Model_Filter_Text'),
        'description'    => array('filter' => 'Tinebase_Model_Filter_Text'),
        'status'         => array('filter' => 'Tinebase_Model_Filter_Text'),
        'showClosed'     => array('custom' => true),
        'isBookable'     => array('custom' => true),
        */
    );
}
