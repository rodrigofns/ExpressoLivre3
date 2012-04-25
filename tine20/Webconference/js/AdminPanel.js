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
 * @namespace   Tine.Tinebase
 * @class       Tine.Tinebase.AdminPanel
 * @extends     Ext.TabPanel
 * 
 * <p>Tinebase Admin Panel</p>
 * <p><pre>
 * </pre></p>
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2010 Metaways Infosystems GmbH (http://www.metaways.de)
 * 
 * @param       {Object} config
 * @constructor
 * Create a new Tine.Tinebase.AdminPanel
 * @TODO        Invent some kind of registry for inner panels
 */
Tine.Webconference.AdminPanel = Ext.extend(Ext.TabPanel, {
    
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
        width: 500,
        height: 470,
        name: 'tinebase-admin-panel',
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
        this.title = _('Webconference Configuration');
        this.items = [];
        
        this.applyAction = new Ext.Action({
            text: _('Apply'),
            disabled: true,
            iconCls: 'action_applyChanges',
            handler: this.applyConfig.createDelegate(this)
        });
        this.buttons = [this.applyAction];
        
        //Tine.Tinebase.getUserProfileConfig(this.initProfileTable, this);
        this.initForm();
        
        this.supr().initComponent.call(this);
    },
    
    afterRender: function () {
        this.supr().afterRender.apply(this, arguments);
        
        this.loadMask = new Ext.LoadMask(this.getEl(), {msg: _('Please Wait')});
        if (! this.store) {
            (function () {
            	this.loadMask.show();
            }).defer(50, this);
        }
    },
    
    // Aplicar
    applyConfig: function () {
        
        
        // pegar campos do form
        
        this.loadMask.show();
        Tine.Tinebase.setUserProfileConfig(userProfileConfig, function () {
            
            // enviar dados
            //this.store.commitChanges();
            
            this.applyAction.setDisabled(true);
            this.loadMask.hide();
        }, this);
        
    },
    
    // // Carregar
    initForm: function () {
        
        // buscar dados
        
        // criar form
        this.configForm = new Ext.FormPanel({
            labelWidth: 75,
            id:'configForm',
            frame:true,
            title: 'Webconference Config',
            bodyStyle:'padding:5px 5px 0',
            width: 350,
            defaults: {width: 230},
            defaultType: 'textfield',
            border:false,
            items: [
                {
                    fieldLabel: 'First Name',
                    name: 'first',
                    allowBlank:false
                },{
                    fieldLabel: 'Last Name',
                    name: 'last'
                },{
                    fieldLabel: 'Company',
                    name: 'company'
                }, {
                    fieldLabel: 'Email',
                    name: 'email',
                    vtype:'email'
                }
            ]
        });
        
       
        
        //this.add(this.configForm);
        this.items = [this.configForm];
        this.doLayout();
        
        if (this.loadMask) {
            this.loadMask.hide();
        }
    }
    
    
});
