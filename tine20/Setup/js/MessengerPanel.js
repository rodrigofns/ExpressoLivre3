/*
 * Tine 2.0
 * 
 * @package     Setup
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schüle <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009-2011 Metaways Infosystems GmbH (http://www.metaways.de)
 *
 */
 
Ext.ns('Tine', 'Tine.Setup');
 
/**
 * Setup Email Config Manager
 * 
 * @namespace   Tine.Setup
 * @class       Tine.Setup.MessengerPanel
 * @extends     Tine.Tinebase.widgets.form.ConfigPanel
 * 
 * <p>Messenger Config Panel</p>
 * <p><pre>
 * </pre></p>
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Marcio Albuquerque <marcio.lima.albuquerque@gmail.com>
 * 
 * @param       {Object} config
 * @constructor
 * Create a new Tine.Setup.MessengerPanel
 */
Tine.Setup.MessengerPanel = Ext.extend(Tine.Tinebase.widgets.form.ConfigPanel, {
    
    /**
     * @property idPrefix DOM Id prefix
     * @type String
     */
    idPrefix: null,
    
    /**
     * show type before db settings
     * @cfg {Boolean} showType
     */
    showType: false,
    
    /**
     * @private
     * panel cfg
     */
    saveMethod: 'Setup.saveMessengerConfig',
    registryKey: 'messengerData',
    
    /**
     * @private
     */
    initComponent: function() {
        this.idPrefix = Ext.id();
        Tine.Setup.MessengerPanel.superclass.initComponent.call(this);
    },

    /**
     * @private
     */
//    onRender: function(ct, position) {
//        Tine.Setup.MessengerPanel.superclass.onRender.call(this, ct, position);
//        
////        this.getForm().findField('messenger_domain').setValue('ABC');
////        this.getForm().findField('messenger_resource').setValue('ABC');
//    },
    
   /**
     * returns config manager form
     * 
     * @private
     * @return {Array} items
     */
    getFormItems: function() {
        return [
                   {
                       xtype: 'fieldset',
                       autoHeight: 'auto',
                       defaults: {width: 300},
                       title: this.app.i18n._('Messenger Service'),
                       id: 'setup-messenger-service-group',
                       items: [
                           {
                               allowBlank: false,
                               name: 'messenger_domain',
                               fieldLabel: this.app.i18n._('Domain'),
                               xtype: 'textfield'
                           },
                           {
                               allowBlank: false,
                               name: 'messenger_resource',
                               fieldLabel: this.app.i18n._('Resource'),
                               xtype: 'textfield'
                           }
                       ]
                   },
                   {
                       xtype: 'fieldset',
                       autoHeight: 'auto',
                       defaults: {width: 300},
                       title: this.app.i18n._('Messenger Users'),
                       id: 'setup-messenger-users-group',
                       items: [
                           {
                               name: 'messenger_format',
                               fieldLabel: this.app.i18n._('Format'),
                               xtype: 'combo',
                               editable: false,
                               store: [
                                   ['email', this.app.i18n._('E-mail Name')],
                                   ['login', this.app.i18n._('Login')],
                                   ['custom', this.app.i18n._('Custom Name')]
                               ]     
                           }
                       ]
                   }
               ];
    },
    
    /**
     * applies registry state to this cmp
     */
    applyRegistryState: function() {
        //this.action_saveConfig.setDisabled(!this.isValid());
        this.action_saveConfig.setDisabled(false);
    }
    
});
