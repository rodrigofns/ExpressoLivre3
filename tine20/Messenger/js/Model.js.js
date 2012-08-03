
Ext.ns('Tine.Messenger.Model');

/**
 * @namespace Tine.Messenger.Model
 * @class Tine.Messenger.Model.Account
 * @extends Tine.Tinebase.data.Record
 * 
 * Account Record Definition
 */ 

Tine.Messenger.Model.Account = Tine.Tinebase.data.Record.create(Tine.Tinebase.Model.genericFields.concat([
    { name: 'id' },
    { name: 'notifications' }, // client only, used in message compose dialog for accounts combo
    { name: 'history' },
    { name: 'custom_name' }
]), {
    appName: 'Messenger',
    modelName: 'Account',
    idProperty: 'id',
    titleProperty: 'custom_name',
    // ngettext('Account', 'Accounts', n);
    recordName: 'Account',
    recordsName: 'Accounts',
    containerProperty: 'container_id',
    // ngettext('Email Accounts', 'Email Accounts', n);
    containerName: 'Messenger Accounts',
    containersName: 'Messenger Accounts'
    
});