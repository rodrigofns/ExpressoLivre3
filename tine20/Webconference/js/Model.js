/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2010 Metaways Infosystems GmbH (http://www.metaways.de)
 */
Ext.ns('Tine.Webconference.Model');


/**
 * @namespace   Tine.Webconference.Model
 * @class       Tine.Webconference.Model.ExampleRecord
 * @extends     Tine.Tinebase.data.Record
 * Example record definition
 * 
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 */
Tine.Webconference.Model.ExampleRecord = Tine.Tinebase.data.Record.create(Tine.Tinebase.Model.genericFields.concat([
    { name: 'id' },
    { name: 'name' },
    // TODO add more record fields here
    // tine 2.0 notes + tags
    { name: 'notes'},
    { name: 'tags' }
]), {
    appName: 'Webconference',
    modelName: 'ExampleRecord',
    idProperty: 'id',
    titleProperty: 'title',
    // ngettext('example record', 'example records', n);
    recordName: 'example record',
    recordsName: 'example records',
    containerProperty: 'container_id',
    // ngettext('example record list', 'example record lists', n);
    containerName: 'example record list',
    containersName: 'example record lists'
});

/**
 * @namespace Tine.Webconference.Model
 * 
 * get default data for a new record
 *  
 * @return {Object} default data
 * @static
 * 
 * TODO generalize default container id handling
 */ 
Tine.Webconference.Model.ExampleRecord.getDefaultData = function() { 
    var app = Tine.Tinebase.appMgr.get('Webconference');
    var defaultsContainer = Tine.Webconference.registry.get('defaultContainer');
    
    return {
        container_id: app.getMainScreen().getWestPanel().getContainerTreePanel().getSelectedContainer('addGrant', defaultsContainer)
        // TODO add more defaults
    };
};

/**
 * default ExampleRecord backend
 */
Tine.Webconference.recordBackend = new Tine.Tinebase.data.RecordProxy({
    appName: 'Webconference',
    modelName: 'ExampleRecord',
    recordClass: Tine.Webconference.Model.ExampleRecord
});



Tine.Webconference.Model.Configuration = Tine.Tinebase.data.Record.create(Tine.Tinebase.Model.genericFields.concat([
    {name: 'id'},
    {name: 'name'},
    {name: 'description'},
    {name: 'email'},
    
    {name: 'tags'},
    {name: 'notes'}
]), {
    appName: 'Webconference',
    modelName: 'Configuration',
    idProperty: 'id',
    titleProperty: 'name',
    // ngettext('Resource', 'Resources', n); gettext('Resources');
    recordName: 'Configuration',
    recordsName: 'Configurations',
    containerProperty: null
});