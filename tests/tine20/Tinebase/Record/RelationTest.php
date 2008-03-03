<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Record
 * @license     http://www.gnu.org/licenses/agpl.html
 * @copyright   Copyright (c) 2007-2007 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @version     $Id$
 */

/**
 * Test helper
 */
require_once dirname(dirname(dirname(dirname(__FILE__)))) . DIRECTORY_SEPARATOR . 'TestHelper.php';

// Call Tine20_Tinebase_Record_RelationTest::main() if this source file is executed directly.
if (!defined('PHPUnit_MAIN_METHOD')) {
    define('PHPUnit_MAIN_METHOD', 'Tine20_Tinebase_Record_RelationTest::main');
}

require_once 'PHPUnit/Framework.php';

/**
 * Test class for Tinebase_Record_Relation.
 * Generated by PHPUnit on 2008-02-22 at 18:34:08.
 */
class Tine20_Tinebase_Record_RelationTest extends PHPUnit_Framework_TestCase
{
    /**
     * @var    Tinebase_Record_Relation
     * @access protected
     */
    protected $object;

    /**
     * initial data
     *
     * @var array
     */
    private $relationData = array(
        array(
	        'own_application'        => 'tasks',
	        'own_identifier'         => 3,
	        'related_role'           => 'CHILD',
	        'related_application'    => 'crm',
	        'related_identifier'     => 2
        ),
        array(
            'own_application'        => 'tasks',
            'own_identifier'         => 3,
            'related_role'           => 'PARENT',
            'related_application'    => 'addressbook',
            'related_identifier'     => 1
        ),
        array(
            'own_application'        => 'crm',
            'own_identifier'         => 2,
            'related_role'           => 'PARTNER',
            'related_application'    => 'addressbook',
            'related_identifier'     => 1
        )
    );
    
    /**
     * relation objects
     *
     * @var array
     */
    private $relations = array();
    
    /**
     * Runs the test methods of this class.
     *
     * @access public
     * @static
     */
    public static function main()
    {
        $suite  = new PHPUnit_Framework_TestSuite('Tinebase_Record_RelationTest');
        PHPUnit_TextUI_TestRunner::run($suite);
    }

    /**
     * Sets up the fixture, for example, opens a network connection.
     * This method is called before a test is executed.
     *
     * @access protected
     */
    protected function setUp()
    {
        $this->object = Tinebase_Record_Relation::getInstance();
        foreach ($this->relationData as $num => $relation) {
        	$this->relations[$num] = $this->object->addRelation(new Tinebase_Model_Relation($relation, true));
        }
    }

    /**
     * Tears down the fixture, for example, closes a network connection.
     * This method is called after a test is executed.
     *
     * @access protected
     */
    protected function tearDown()
    {
        $db = new Tinebase_Db_Table(array('name' => SQL_TABLE_PREFIX . 'record_relations'));

        foreach ($this->relations as $relation) {
             $db->delete(array(
                 'identifier' => $relation->getId()
            ));
        }
    }

    /**
     * testGetInstance().
     */
    public function testGetInstance() {
        $this->assertTrue($this->object instanceof Tinebase_Record_Relation );
    }

    /**
     * testAddRelation().
     */
    public function testAddRelation() {
        $application = Tinebase_Application::getInstance();
        
        foreach ($this->relations as $num => $relation) {
            $this->assertEquals($application->getApplicationById($relation->own_application)->app_name, $this->relationData[$num]['own_application']);
            $this->assertEquals($application->getApplicationById($relation->related_application)->app_name, $this->relationData[$num]['related_application']);
            $this->assertEquals($relation->own_identifier, $this->relationData[$num]['own_identifier']);
            $this->assertEquals($relation->related_identifier, $this->relationData[$num]['related_identifier']);
            $this->assertEquals($relation->related_role, $this->relationData[$num]['related_role']);
        }
    }

    /**
     * testBreakRelation().
     */
    public function testBreakRelation() {
        $this->object->breakRelation($this->relations[0]);

        // test active, should throw exception
        try{
            $this->object->getRelationById($this->relations[0]->getId());
            $this->assertTrue(false);
        } catch (Tinebase_Record_Exception_NotDefined $e) {
        	$this->assertTrue(true);
        }
        
        // test incactive, should work
        try {
            $this->object->getRelationById($this->relations[0]->getId(), true);
            $this->assertTrue(true);
        } catch (Tinebase_Record_Exception_NotDefined $e) {
            $this->assertTrue(false);
        }
        
        // test getAllRelations, $this->relations[0] should not be in resultSet
        $record = new Tasks_Model_Task(array(
            'identifier' => $this->relations[0]->own_identifier
        ),true);
        $relations = $this->object->getAllRelations($record);
        // test that the other relations still exists
        $this->assertGreaterThan(0, count($relations));
        foreach ($relations as $relation) {
        	$this->assertFalse($relation->getId() == $this->relations[0]->getId());
        }
    }

    /**
     * testBreakAllRelations().
     */
    public function testBreakAllRelations() {
        $record = new Tasks_Model_Task(array(
            'identifier' => $this->relations[0]->own_identifier
        ),true);
        
        $this->object->breakAllRelations($record);
        $relations = $this->object->getAllRelations($record);
        $this->assertEquals(0, count($relations));
        
        // test that the other relations still exists
        try {
            $this->object->getRelationById($this->relations[2]->getId());
            $this->assertTrue(true);
        } catch (Tinebase_Record_Exception_NotDefined $e) {
            $this->assertTrue(false);
        }
        
    }
}

// Call Tine20_Tinebase_Record_RelationTest::main() if this source file is executed directly.
if (PHPUnit_MAIN_METHOD == 'Tine20_Tinebase_Record_RelationTest::main') {
    Tinebase_Record_RelationTest::main();
}
?>
