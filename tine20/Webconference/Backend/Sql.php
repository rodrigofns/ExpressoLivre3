<?php
/**
 * Tine 2.0
 *
 * @package     Webconference
 * @subpackage  Backend
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Edgar de Lucca <edgar.lucca@serpro.gov.br>
 * @copyright   Copyright (c) 2007-2011 Metaways Infosystems GmbH (http://www.metaways.de)
 */

/**
 * sql backend class for the webconference
 *
 * @package     Webconference
 * @subpackage  Backend
 */
class Webconference_Backend_Sql extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'webconference_room';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Webconference_Model_Room';

    /**
     * if modlog is active, we add 'is_deleted = 0' to select object in _getSelect()
     *
     * @var boolean
     */
    protected $_modlogActive = TRUE;
    
    /**
     * should the class return contacts of disabled users
     * 
     * @var boolean
     */
    protected $_getDisabledContacts = FALSE;

    /**
     * foreign tables (key => tablename)
     *
     * @var array
     */
//    protected $_foreignTables = array(
	/*
	'jpegphoto'    => array(
            'table'         => 'addressbook_image',
            'joinOn'        => 'contact_id',
            'select'        => array('jpegphoto' => null),
            'singleValue'   => TRUE,
            'preserve'      => TRUE,
        ),
        'account_id'    => array(
            'table'         => 'accounts',
            'joinOn'        => 'contact_id',
            'singleValue'   => TRUE,
        ),*/
	
	/*
	
	'room_url'    => array(
            'table'         => 'webconference_room_user',
            'joinOn'        => 'webconference_room_id',
            //'select'        => array('room_url' => null),
            'singleValue'   => TRUE,
            'preserve'      => TRUE,
        ),
        'webconference_room_id'    => array(
            'table'         => 'webconference_room',
            'joinOn'        => 'id',
            'singleValue'   => TRUE,
        ),
	*/
  //  );     

    
    public function __construct($_dbAdapter=null, array $_options = array())
    {
    	parent::__construct($_dbAdapter, $_options);
    }
    
    /**
     * returns account rooms
     *
     * @param int $_contactId
     * @return blob
     */
    public function getRooms($_accountId)
    {
	$select = $this->_db->select()
            ->from($this->_tablePrefix . 'webconference_room', array('*'))
	    ->join($this->_tablePrefix . 'webconference_room_user', 
		    ($this->_tablePrefix . 'webconference_room_user.webconference_room_id = '.$this->_tablePrefix . 'webconference_room.id'), array('*'))
            ->where($this->_db->quoteInto($this->_db->quoteIdentifier('accounts_id'). ' = ? ', $_accountId))
	    ->where($this->_db->quoteInto($this->_db->quoteIdentifier('status'). ' = ? ', 'A'))	
	    ->limit();

	$this->_traitGroup($select);
        
        $stmt = $this->_db->query($select);
	
        $queryResult = $stmt->fetchAll();
        $stmt->closeCursor();
                
        if (!$queryResult) {
            throw new Webconference_Exception_NotFound('Conference with account id ' . $_accountId . ' not found.');
        }
        $rowsRoom = $this->_rawDataToRecordSet($queryResult);
        return $rowsRoom->toArray();
    }
}
