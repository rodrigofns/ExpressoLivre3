<?php
/**
 * Tine 2.0
 * 
 * @package     Tasks
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id$
 *
 */

/**
 * Task Filter Class
 * @package Tasks
 */
class Tasks_Model_Filter extends Tinebase_Record_Abstract
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
    protected $_application = 'Tasks';
    
    protected $_validators = array(
        'id'                   => array('allowEmpty' => true,  'Int'   ),

        'containerType'        => array('allowEmpty' => true           ),
        'owner'                => array('allowEmpty' => true           ),
        'container'            => array('allowEmpty' => true           ),
        
        'query'                => array('allowEmpty' => true           ),
        'organizer'            => array('allowEmpty' => true           ),
        'status'               => array('allowEmpty' => true           ),
        'showClosed'           => array('allowEmpty' => true, 'InArray' => array(true,false)),
        'due'                  => array('allowEmpty' => true           ),
        'tag'                  => array('allowEmpty' => true           ),
        
    );
    
    protected $_datetimeFields = array(
        'due',
    );
    
    /**
     * gets record related properties
     * 
     * @param string name of property
     * @return mixed value of property
     */
    public function __get($_name)
    {
        switch ($_name) {
            case 'container':
                $this->_resolveContainer();
                break;
            default:
        }
        return parent::__get($_name);
    }
    
    /**
     * Resolves containers from selected nodes
     * 
     * @throws Tasks_Exception_UnexpectedValue
     * @return void
     */
    protected function _resolveContainer()
    {
        if (isset($this->_properties['container']) && is_array($this->_properties['container'])) {
            return;
        }
        if (!$this->containerType) {
            throw new Tasks_Exception_UnexpectedValue('You need to set a containerType.');
        }
        if ($this->containerType == 'Personal' && !$this->owner) {
            throw new Tasks_Exception_UnexpectedValue('You need to set an owner when containerType is "Personal".');
        }
        
        $cc = Tinebase_Container::getInstance();
        switch($this->containerType) {
            case 'all':
                $containers = $cc->getContainerByACL(Zend_Registry::get('currentAccount'), $this->_application, Tinebase_Model_Container::GRANT_READ);
                break;
            case 'personal':
                $containers = Zend_Registry::get('currentAccount')->getPersonalContainer($this->_application, $this->owner, Tinebase_Model_Container::GRANT_READ);
                break;
            case 'shared':
                $containers = Zend_Registry::get('currentAccount')->getSharedContainer($this->_application, Tinebase_Model_Container::GRANT_READ);
                break;
            case 'otherUsers':
                $containers = Zend_Registry::get('currentAccount')->getOtherUsersContainer($this->_application, Tinebase_Model_Container::GRANT_READ);
                break;
            case 'singleContainer':
                $this->_properties['container'] = array($this->_properties['container']);
                return;
            default:
                throw new Tasks_Exception_UnexpectedValue('containerType not supported.');
        }
        $container = array();
        foreach ($containers as $singleContainer) {
            $container[] = $singleContainer->getId();
        }
        
        $this->_properties['container'] = $container;
    }
}