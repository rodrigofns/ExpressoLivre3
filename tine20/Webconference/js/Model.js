Ext.ns('Tine.Webconference.Model');

/**
* contact grid panel
*
* @namespace Tine.Webconference.Model
* @class Tine.Webconference.Model.Configuration
*
*
* <p>Tinebase Webconference Model Configuration</p>
* <p><pre>
* </pre></p>
*
* @license http://www.gnu.org/licenses/agpl.html AGPL Version 3
* @author Edgar de Lucca <edgar.lucca@serpro.gov.br>, Marcelo Teixeira <marcelo.teixeira@serpro.gov.br>
* @copyright Copyright (c) 2007-2012 Metaways Infosystems GmbH (http://www.metaways.de)
*
* Create a new Tine.Webconference.Model.Configuration
*
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
    {name: 'moderator'},
    {name: 'createdBy'},
    {name: 'to'}
    
], {
    appName: 'Webconference',
    modelName: 'WCInvite',
    idProperty: 'id'
});