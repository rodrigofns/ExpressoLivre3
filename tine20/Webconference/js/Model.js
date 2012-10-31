/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2010 Metaways Infosystems GmbH (http://www.metaways.de)
 */
Ext.ns('Tine.Webconference.Model');



/**
 * @namespace   Tine.Webconference.Model
 * @class       Tine.Webconference.Model.WCInvite
 * @extends     Tine.Tinebase.data.Record
 * WCInvite Record Definition
 */
Tine.Webconference.Model.WCInvite = Tine.Tinebase.data.Record.create([
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
    modelName: 'WCInvite',
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
    
    recordName: 'config',
    recordsName: 'configs',
    containerProperty: 'container_id',
    
    containerName: 'config list',
    containersName: 'config lists'
});

Tine.Webconference.Model.Config.getFilterModel = function() {
    var app = Tine.Tinebase.appMgr.get('Webconference');
    
    return [
        {filtertype: 'tine.widget.container.filtermodel', app: app, recordClass: Tine.Webconference.Model.Config}
    ];
};

Tine.Webconference.Model.Config.getDefaultData = function() { 
    //var app = Tine.Tinebase.appMgr.get('Webconference');
    
    return {
        //container_id: app.getMainScreen().getWestPanel().getContainerTreePanel().getDefaultContainer()
        // [...] add more defaults
    };
};

/**
 * default Config record backend
 */
Tine.Webconference.configRecordBackend = new Tine.Tinebase.data.RecordProxy({
    appName: 'Webconference',
    modelName: 'Config',
    recordClass: Tine.Webconference.Model.Config
});