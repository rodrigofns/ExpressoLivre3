<?php
/**
 * Tine 2.0 - http://www.tine20.org
 * 
 * @package     Tasks
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @version     $Id$
 */

/**
 * Test helper
 */
require_once dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR . 'TestHelper.php';

if (!defined('PHPUnit_MAIN_METHOD')) {
    define('PHPUnit_MAIN_METHOD', 'Calendar_Backend_SqlTests::main');
}

/**
 * Test class for Calendar_Backend_Sql
 */
class Calendar_Backend_SqlTests extends PHPUnit_Framework_TestCase
{
    /**
     * @var Tasks_Backend_Sql SQL Backend in test
     */
    protected $_backend;
    
    /**
     * @var Tinebase_Model_Container
     */
    protected $_testCalendar;
    
    public function setUp()
    {
        $this->_backend = new Calendar_Backend_Sql(SQL_TABLE_PREFIX . 'cal_events', 'Calendar_Model_Event');
        $personalContainers = Tinebase_Core::getUser()->getPersonalContainer('Calendar', Tinebase_Core::getUser(), Tinebase_Model_Container::GRANT_ADMIN);
        $this->_testCalendar = $personalContainers[0];
        
    }
    
    public function testCreateSimpleEvent()
    {
        $event = $this->_getEvent();
        $persistentEvent = $this->_backend->create($event);
                
        $this->assertEquals($persistentEvent->summary, $event->summary);
        
        $this->_backend->delete($persistentEvent->getId());
    }
    
    public function testGetSimpleEvent()
    {
        $event = $this->_getEvent();
        $persistentEvent = $this->_backend->create($event);
        
        $loadedEvent = $this->_backend->get($persistentEvent->getId());
        
        $this->assertEquals($loadedEvent->summary, $event->summary);
        
        $this->_backend->delete($persistentEvent->getId());
    }
    
    public function testDeleteSimpleEvent()
    {
        $event = $this->_getEvent();
        $persistentEvent = $this->_backend->create($event);
        
        $this->_backend->delete($persistentEvent->getId());
        
        $this->setExpectedException('Tinebase_Exception_NotFound');
        $loadedEvent = $this->_backend->get($persistentEvent->getId());
    }
    
    public function testSearchSimpleEvents()
    {
        $persistentEventIds = array();
        
        $event1 = $this->_getEvent();
        $persistentEventIds[] = $this->_backend->create($event1)->getId();
        
        $event2 = $this->_getEvent();
        $event2->dtstart->addDay(1);
        $persistentEventIds[] = $this->_backend->create($event2)->getId();
        
        $event3 = $this->_getEvent();
        $event3->dtstart->addDay(2);
        $persistentEventIds[] = $this->_backend->create($event3)->getId();
        
        $from = $event1->dtstart->addMinute(7)->get(Calendar_Model_Event::ISO8601LONG);
        $until = $event3->dtstart->addMinute(-7)->get(Calendar_Model_Event::ISO8601LONG);
        
        $filter = new Calendar_Model_EventFilter(array(
            array('field' => 'container_id', 'operator' => 'equals', 'value' => $event1->container_id),
            array('condition' => 'OR', 'filters' => array(
               array('condition' => 'AND', 'filters' => array(
                   array('field' => 'dtstart', 'operator' => 'after',  'value' => $from),
                   array('field' => 'dtstart', 'operator' => 'before', 'value' => $until),
               )),
               array('condition' => 'AND', 'filters' => array(
                   array('field' => 'dtend', 'operator' => 'after',  'value' => $from),
                   array('field' => 'dtend', 'operator' => 'before', 'value' => $until),
               )),
           )),
        ));
        
        $events = $this->_backend->search($filter, new Tinebase_Model_Pagination());
        
        $this->assertEquals(3, count($events));
        
        foreach ($persistentEventIds as $id) {
            $this->_backend->delete($id);
        }
    }
    
    /**
     * returns a simple event
     *
     * @return Calendar_Model_Event
     */
    protected function _getEvent()
    {
        return new Calendar_Model_Event(array(
            'summary'     => 'Wakeup',
            'dtstart'     => '2009-03-25 06:00:00',
            'dtend'       => '2009-03-25 06:15:00',
            'description' => 'Earyly to bed and early to rise, makes a men helthy, welthy and wise',
        
            'container_id' => $this->_testCalendar->getId(),
            'organizer'    => Tinebase_Core::getUser()->getId(),
            'uid'          => Calendar_Model_Event::generateUID(),
        ));
    }
}
    

if (PHPUnit_MAIN_METHOD == 'Calendar_Backend_SqlTests::main') {
    Calendar_Backend_SqlTests::main();
}
