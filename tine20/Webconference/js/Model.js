/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2010 Metaways Infosystems GmbH (http://www.metaways.de)
 */
Ext.ns('Tine.Webconference.Model');

/**
 * @namespace   Tine.Webconference.Model
 * @class       Tine.Webconference.Model.Configuration
 * @extends     Tine.Tinebase.data.Record
 * Configuration Record Definition
 */
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
