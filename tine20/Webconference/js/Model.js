/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2010 Metaways Infosystems GmbH (http://www.metaways.de)
 */
Ext.ns('Tine.Webconference.Model');



/**
 * @namespace   Tine.Webconference.Model
 * @class       Tine.Webconference.Model.Invite
 * @extends     Tine.Tinebase.data.Record
 * Invite Record Definition
 */
Tine.Webconference.Model.Invite = Tine.Tinebase.data.Record.create([
    {name: 'id'},
    {name: 'url'},
    {name: 'roomName'},
    {name: 'roomId'},
    {name: 'roomTitle'},
    {name: 'moderator'},
    {name: 'createdBy'},
    {name: 'to'}
    
], {
    appName: 'Webconference',
    modelName: 'Invite',
    idProperty: 'id'
});


/**
 * @namespace   Tine.Webconference.Model
 * @class       Tine.Webconference.Model.Config
 * @extends     Tine.Tinebase.data.Record
 * Config Record Definition
 */
Tine.Webconference.Model.Config = Tine.Tinebase.data.Record.create(Tine.Tinebase.Model.genericFields.concat([
    { name: 'id' },
    { name: 'url' },
    { name: 'salt' },
    { name: 'limit_room' },
    { name: 'description' }
]), {
    appName: 'Webconference',
    modelName: 'Config',
    idProperty: 'id',
    titleProperty: 'description',
    
    recordName: 'server',
    recordsName: 'servers',
    containerProperty: 'container_id',
    
    containerName: 'server list',
    containersName: 'server lists'
});

Tine.Webconference.Model.Config.getFilterModel = function() {
    var app = Tine.Tinebase.appMgr.get('Webconference');
    
    return [
        {filtertype: 'tine.widget.container.filtermodel', app: app, recordClass: Tine.Webconference.Model.Config}
    ];
};

Tine.Webconference.Model.Config.getDefaultData = function() { 
    return {};
};

/**
 * Config record backend
 */
Tine.Webconference.configRecordBackend = new Tine.Tinebase.data.RecordProxy({
    appName: 'Webconference',
    modelName: 'Config',
    recordClass: Tine.Webconference.Model.Config
});


/**
 * @namespace   Tine.Webconference.Model
 * @class       Tine.Webconference.Model.Room
 * @extends     Tine.Tinebase.data.Record
 * Room Record Definition
 */
Tine.Webconference.Model.Room = Tine.Tinebase.data.Record.create(Tine.Tinebase.Model.genericFields.concat([
    { name: 'id' },
    { name: 'title' },
    { name: 'room_name' },
    { name: 'conference_role' },
    { name: 'creation_time'},
    { name: 'create_date'},
    { name: 'status'},
    { name: 'room_url'},
    { name: 'call_date'},
    { name: 'user_email'},
    { name: 'user_name'}
    
    
    
]), {
    appName: 'Webconference',
    modelName: 'Room',
    idProperty: 'id',
    titleProperty: 'title',
    
    recordName: 'room',
    recordsName: 'rooms',
    containerProperty: 'container_id',
    
    containerName: 'room list',
    containersName: 'room lists'
});

Tine.Webconference.Model.Room.getFilterModel = function() {
    var app = Tine.Tinebase.appMgr.get('Webconference');
    
    return [
        {filtertype: 'tine.widget.container.filtermodel', app: app, recordClass: Tine.Webconference.Model.Room}
    ];
};
/**
 * Room record backend
 */
Tine.Webconference.roomRecordBackend = new Tine.Tinebase.data.RecordProxy({
    appName: 'Webconference',
    modelName: 'Room',
    recordClass: Tine.Webconference.Model.Room
});