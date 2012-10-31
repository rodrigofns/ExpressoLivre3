/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      
 * @copyright   Copyright (c) 2007-2011 Metaways Infosystems GmbH (http://www.metaways.de)
 */
Ext.ns('Tine.Webconference');

/**
 * @namespace Tine.Webconference
 * @class Tine.Webconference.ConfigEditDialog
 * @extends Tine.widgets.dialog.EditDialog
 * 
 * 
 * 
 * @param {Object}
 *            config
 * @constructor Create a new Tine.Webconference.ConfigEditDialog
 */
Tine.Webconference.ConfigEditDialog = Ext.extend(
    Tine.widgets.dialog.EditDialog,
    {

	windowNamePrefix : 'ConfigEditWindow_',
	appName : 'Webconference',
	recordClass : Tine.Webconference.Model.Config,
	recordProxy : Tine.Webconference.configRecordBackend,
	
	loadRecord : false,
	evalGrants : false,
	
	
	onRecordLoad : function() {
	    // you can do something here
		
	    Tine.Webconference.ConfigEditDialog.superclass.onRecordLoad.call(this);
	},

	onRecordUpdate : function() {
	    Tine.Webconference.ConfigEditDialog.superclass.onRecordUpdate.call(this);

	// you can do something here
	},

	getFormItems : function() {
	
	    return {
		xtype : 'tabpanel',
		border : false,
		plain : true,
		activeTab : 0,
		border : false,
		    
		items : [
		{
		    title : this.app.i18n._('Server'),
		    autoScroll : true,
		    border : false,
		    frame : true,
		    layout : 'border',
	
		    items: {
		
			region:'center',
			xtype : 'columnform',
			labelAlign : 'top',
			formDefaults : {
			    xtype : 'textfield',
			    anchor : '100%',
			    labelSeparator : '',
			    columnWidth : .333
		    
			}, 
			items:[
                
			[{
			    columnWidth : 1,
			    name: 'url',
			    fieldLabel: this.app.i18n._('BBB Url'),
			    allowBlank:false
			}],[{
			    columnWidth : 1,
			    name: 'salt',
			    fieldLabel: this.app.i18n._('Security Salt'),
			    allowBlank:false

			}],[{
			    columnWidth : 1,
			    name: 'limit_room',
			    fieldLabel: this.app.i18n._('Room Limit'),
			    allowBlank:false

			}],[{
			    columnWidth : 1,
			    name: 'description',
			    fieldLabel: this.app.i18n._('Description')
			}]
			] 
		    }
		    
		}]
	    }
	}
    
    });

/**
 * Webconference Config Edit Popup
 * 
 * @param {Object}
 *            config
 * @return {Ext.ux.Window}
 */
Tine.Webconference.ConfigEditDialog.openWindow = function(config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
	width : 500,
	height : 400,
	name : Tine.Webconference.ConfigEditDialog.prototype.windowNamePrefix
	+ id,
	contentPanelConstructor : 'Tine.Webconference.ConfigEditDialog',
	contentPanelConstructorConfig : config
    });
    return window;
};
