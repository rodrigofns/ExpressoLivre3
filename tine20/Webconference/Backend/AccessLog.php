<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
class Webconference_Backend_AccessLog extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'webconference_access';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Webconference_Model_AccessLog';

    /**
     * if modlog is active, we add 'is_deleted = 0' to select object in _getSelect()
     *
     * @var boolean
     */
    protected $_modlogActive = FALSE;
    
    public function regLogin($_roomId){
	// save data table webconference_access
	$data = array("accounts_id"=> Tinebase_Core::getUser()->getId(),
		      "webconference_room_id" => $_roomId,
                      "login" => time(),
		      );
	$record =  new Webconference_Model_AccessLog($data);
        return $this->create($record)->getId();
    }

    public function regLogoff($_roomId){
	$accountId = Tinebase_Core::getUser()->getId();
	$cond = $this->_db->select()->from($this->_tablePrefix . $this->_tableName, "max(id) as id" )
		->where($this->_db->quoteInto($this->_db->quoteIdentifier('accounts_id'). ' = ? ', $accountId))
		->where($this->_db->quoteInto($this->_db->quoteIdentifier('webconference_room_id'). ' = ? ', $_roomId));
	$id = (object)$this->_db->query($cond)->fetch();
	$where = $this->_db->quoteInto($this->_db->quoteIdentifier("id") . ' = ?', $id->id); 
	
	$record =  new Webconference_Model_AccessLog(Array("logout"=>time()));
	return $this->_db->update($this->_tablePrefix . $this->_tableName, $record->toArray() , $where);
    }
}