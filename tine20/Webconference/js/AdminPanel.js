/*
 * Tine 2.0
 * 
 * @package     Tinebase
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2010 Metaways Infosystems GmbH (http://www.metaways.de)
 */
 
/*global Ext, Tine, Locale*/
 
Ext.namespace('Tine.Webconference');

/**
 * admin settings panel
 * 
 * @namespace   Tine.Webconference
 * @class       Tine.Webconference.AdminPanel
 * @extends     Ext.TabPanel
 * 
 * <p>Tinebase Admin Panel</p>
 * <p><pre>
 * </pre></p>
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Edgar de Lucca <edgar.lucca@serpro.gov.br>, Marcelo Teixeira <marcelo.teixeira@serpro.gov.br>
 * @copyright   Copyright (c) 2007-2012 Metaways Infosystems GmbH (http://www.metaways.de)
 * 
 * Create a new Tine.Webconference.AdminPanel
 */

Tine.Webconference.AdminPanel = Ext.extend(Ext.Panel, { // TODO: extend some kind of AppAdminPanel

    //layout: 'form',
    border: false,
    
    
    /**
     * @private
     */
    initComponent: function () {
	this.app = Tine.Tinebase.appMgr.get('Webconference');
	this.title = this.app.i18n._('Webconference Configuration');

	this.items = [ 
	    {
		region: 'botton',
		layout: 'fit',
		autoScroll: true,
		items: [new Tine.Webconference.ConfigGridPanel()],
		height: 450,
		forceFit: true
	    }
	]; 
	
	this.supr().initComponent.call(this);
    },
    
    afterRender: function () {
	this.supr().afterRender.apply(this, arguments);
	
    }
    
    
});



/**
 * Tinebase Admin Panel Popup
 * 
 * @param   {Object} config
 * @return  {Ext.ux.Window}
 */
Tine.Webconference.AdminPanel.openWindow = function (config) {
    var window = Tine.WindowFactory.getWindow({
	width: 800,
	height: 500,
	id: 'webconference-admin-panel',
	name: 'webconference-admin-panel',
	contentPanelConstructor: 'Tine.Webconference.AdminPanel',
	contentPanelConstructorConfig: config
    }); 
    return window;
};