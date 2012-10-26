<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
class Webconference_Backend_WebconferenceRoomUser extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'webconference_room_user';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Webconference_Model_WebconferenceRoomUser';

    /**
     * if modlog is active, we add 'is_deleted = 0' to select object in _getSelect()
     *
     * @var boolean
     */
    protected $_modlogActive = TRUE;
}