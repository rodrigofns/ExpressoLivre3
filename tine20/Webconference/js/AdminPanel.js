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
Tine.Webconference.AdminPanel = Ext.extend(Ext.TabPanel, {
    
    app : null,
    activeItem: 0,
    border: false,
    
    /**
     * @private
     */
    initComponent: function () {
        this.items = new Tine.Webconference.ConfigPanel({});
        
        Tine.Webconference.AdminPanel.superclass.initComponent.call(this);
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
        width: 400,
        height: 300,
        name: 'webconference-admin-panel',
        contentPanelConstructor: 'Tine.Webconference.AdminPanel',
        contentPanelConstructorConfig: config
    }); 
};


Tine.Webconference.ConfigPanel = Ext.extend(Ext.Panel, { // TODO: extend some kind of AppAdminPanel

    layout: 'fit',
    border: false,
    
    /**
     * @private
     */
    initComponent: function () {
        this.app = Tine.Tinebase.appMgr.get('Webconference');
        this.title = this.app.i18n._('Webconference Configuration');
        this.items = [];
        
        this.applyAction = new Ext.Action({
            text: this.app.i18n._('Apply'),
            disabled: true,
            iconCls: 'action_applyChanges',
            handler: this.applyConfig.createDelegate(this)
        });
        this.buttons = [this.applyAction];
        
        this.initForm();
        
        this.supr().initComponent.call(this);
    },
    
    afterRender: function () {
        this.supr().afterRender.apply(this, arguments);
        
        this.loadMask = new Ext.LoadMask(this.getEl(), {msg: _('Please Wait')});
       	this.loadMask.show();
    },
    
    // Save configuration
    applyConfig: function () {
        
        var config = new Object();
        config.url = Ext.get('url').getValue();
        config.salt = Ext.get('salt').getValue();
        config.description = Ext.get('description').getValue();
        
        this.loadMask.show();
        
        // load configuration
        Ext.Ajax.request({
            params: {
                method: 'Webconference.saveWebconferenceConfig',
                recordData:config
                
            },
            scope: this,
            success: function(_result, _request){
                //var result = Ext.util.JSON.decode(_result.responseText);
                //this.applyAction.setDisabled(false);
                if (this.loadMask) {
                    this.loadMask.hide();
                }
                
            },
            failure: function(response, options) {
                var responseText = Ext.util.JSON.decode(response.responseText);
                var exception = responseText.data ? responseText.data : responseText;
                Tine.Tinebase.ExceptionHandler.handleRequestException(exception);
                
                this.applyAction.setDisabled(false);
                if (this.loadMask) {
                    this.loadMask.hide();
                }               
            }
        });
       
        
    },
    
    // Carregar
    initForm: function () {
       
        // load configuration
        Ext.Ajax.request({
            params: {
                method: 'Webconference.loadWebconferenceConfig'
                
            },
            scope: this,
            success: function(_result, _request){
                var result = Ext.util.JSON.decode(_result.responseText);
                
                Ext.get('url').set({'value':result.url});
                Ext.get('salt').set({'value':result.salt});
                Ext.get('description').set({'value':result.description});
                
                
                if (this.loadMask) {
                    this.loadMask.hide();
                }
                
            }
        });
        
        
        
        // create form
        this.configForm = new Ext.FormPanel({
            labelWidth: 75,
            frame:true,
            name:'configForm',
            bodyStyle:'padding:5px 5px 0',
            width: 350,
            defaults: {width: 230},
            defaultType: 'textfield',
            border:false,
            items: [
                
                {
                    id:'url', 
                    name: 'url',
                    fieldLabel: this.app.i18n._('BBB Url'),
                    allowBlank:false
                },{
                    id: 'salt',
                    name: 'salt',
                    fieldLabel: this.app.i18n._('Security Salt'),
                    allowBlank:false
                    
                },{
                    id:'description',
                    name: 'description',
                    fieldLabel: this.app.i18n._('Description')
                }
            ]
        });
        
        this.items=[this.configForm];
        this.doLayout();
        this.applyAction.setDisabled(false);
    }
    
    
});
