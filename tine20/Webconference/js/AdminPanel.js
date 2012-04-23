/*
 * Tine 2.0
 * 
 * @package     Admin
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2010 Metaways Infosystems GmbH (http://www.metaways.de)
 *
 */

Ext.namespace('Tine.Webconference');

/**
 * admin settings panel
 * 
 * @namespace   Tine.Admin
 * @class       Tine.Admin.AdminPanel
 * @extends     Tine.widgets.dialog.AdminPanel
 * 
 * <p>Admin Admin Panel</p>
 * <p><pre>
 * </pre></p>
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2010 Metaways Infosystems GmbH (http://www.metaways.de)
 * 
 * @param       {Object} config
 * @constructor
 * Create a new Tine.Admin.AdminPanel
 */
Tine.Webconference.AdminPanel = Ext.extend(Tine.widgets.dialog.AdminPanel, {
    /**
     * @private
     */
    appName: 'Webconference',
    
    /**
     * get config items
     * 
     * @return {Array}
     */
    getConfigItems: function() {
        return [[{
            xtype: 'tinerecordpickercombobox',
            fieldLabel: this.app.i18n._('Default Addressbook for new contacts and groups'),
            name: 'defaultInternalAddressbook',
            blurOnSelect: true,
            recordClass: Tine.Tinebase.Model.Container,
            recordProxy: Tine.Webconference.sharedAddressbookBackend
        }]];
    }
});

/**
 * admin panel on update function
 * 
 * TODO         update registry without reloading the mainscreen
 */
Tine.Webconference.AdminPanel.onUpdate = function() {
    // reload mainscreen to make sure registry gets updated
    window.location = window.location.href.replace(/#+.*/, '');
}

/**
 * Admin admin settings popup
 * 
 * @param   {Object} config
 * @return  {Ext.ux.Window}
 */
Tine.Webconference.AdminPanel.openWindow = function (config) {
    var window = Tine.WindowFactory.getWindow({
        width: 600,
        height: 400,
        name: Tine.Webconference.AdminPanel.prototype.windowNamePrefix + Ext.id(),
        contentPanelConstructor: 'Tine.Webconference.AdminPanel',
        contentPanelConstructorConfig: config
    });
    return window;
};


