/*
 * Tine 2.0
 * 
 * @package     Addressbook
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2009-2011 Metaways Infosystems GmbH (http://www.metaways.de)
 *
 */

/*global Ext, Tine*/

Ext.ns('Tine.Addressbook');

/**
 * @namespace   Tine.Addressbook
 * @class       Tine.Addressbook.DynamicContactsDialog
 * @extends     Tine.widgets.dialog.EditDialog
 * Addressbook Edit Dialog <br>
 * 
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 */
Tine.Addressbook.DynamicContactsDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
    
    /**
     * parse address button
     * @type Ext.Button 
     */
    
    windowNamePrefix: 'DynamicContacts_',
    appName: 'Addressbook',
    recordClass: Tine.Addressbook.Model.Contact,
    showContainerSelector: true,
    multipleEdit: true,
    mailContacts: '',
    contact_count: 0,
    contact_index: 0,
    bulkInvalid: false,
    validOk: false, 
    
    getFormItems: function () {
		if (this.mailContacts) {
			var contacts = [];
			Ext.each(this.mailContacts, function(email) {
				if (email) {
					contacts.push(this.initContactFields(email));
				}
			}, this);
		}

        return {
            xtype: 'tabpanel',
            border: false,
            plain: true,
            activeTab: 0,
            plugins: [{
                ptype : 'ux.tabpanelkeyplugin'
            }],
            items: [{
                title: this.app.i18n._('Contacts'),
                border: false,
                frame: true,
                items: [{
                    title: this.app.i18n._('Select the contacts to add and fill in the required information'),
                    xtype: 'fieldset',
                    region: 'center',
					height: 190,
					autoScroll: true,
                    items: contacts
                }]
            }]
        };
    },
    
    /**
     * init actions
     */
    initActions: function() {
		this.supr().initActions.apply(this, arguments);   

		this.action_saveAndClose = new Ext.Action({
			requiredGrant: this.editGrant,
			text: (this.saveAndCloseButtonText != '') ? this.app.i18n._(this.saveAndCloseButtonText) : _('Ok'),
			minWidth: 70,
			ref: '../btnSaveAndClose',
			scope: this,
			handler: function() { 
				this.bulkSaveContacts.defer(100, this) 
			},
			iconCls: 'action_saveAndClose'
		});
    },
    
    /**
     * init contact fields
     */
    initContactFields: function (email) {
		// called once for each contact

		this.contact_count = this.contact_count + 1;
		var s_index = '_'+this.contact_count.toString();
        
		return {
			xtype: 'columnform',
			id: 'dynamic_contact'+s_index,
			items: [[{
                columnWidth: 0.05,
                xtype: 'checkbox',
				checked: true,
                listeners: {scope: this, check: this.onAddCheck},
                name: 'add_contact'+s_index,
                requiredGrant: 'editGrant'
            }, {
                columnWidth: 0.95,
				xtype: 'columnform',
				id: 'contact_data'+s_index,
				items: [[{
		            columnWidth: 0.30,
		            xtype: 'label',
		            fieldLabel: this.app.i18n._('E-Mail'), 
		            text: email,
		        }, {
					xtype: 'hidden',
		            value: email,
		            name: 'email'+s_index,
		        }, {
		            columnWidth: 0.23,
		            fieldLabel: this.app.i18n._('First Name'), 
		            name: 'n_given'+s_index,
		            maxLength: 64
		        }, {
		            columnWidth: 0.23,
		            fieldLabel: this.app.i18n._('Last Name'), 
		            name: 'n_family'+s_index,
		            maxLength: 255
		        }, {
		            columnWidth: 0.23,
		            fieldLabel: this.app.i18n._('Company'), 
		            name: 'org_name'+s_index,
		            maxLength: 255
		        }, {
		            width: 3,
		            hidden: true
	            }]]
			}]]
		};
    },

    /**
     * checks if form data is valid
     * 
     * @return {Boolean}
     */
    isValid: function () {
        var form = this.getForm();
        var isValid = true;
		
        
        // you need to fill in one of: n_given n_family org_name
        var s_index = '_'+this.contact_count.toString();
        if (form.findField('n_family'+s_index).getValue() === '' && form.findField('org_name'+s_index).getValue() === '') {
            var invalidString = String.format(this.app.i18n._('Either {0} or {1} must be given'), this.app.i18n._('Last Name'), this.app.i18n._('Company'));

            form.findField('n_family'+s_index).markInvalid(invalidString);
            form.findField('org_name'+s_index).markInvalid(invalidString);

            isValid = false;
        }

        this.validOk = (isValid && Tine.Addressbook.DynamicContactsDialog.superclass.isValid.apply(this, arguments));

        if (!this.validOk) {     
            this.bulkInvalid = !this.validOk;
        }

        return this.validOk;
    },
    
    /**
     * onAddCheck
     */
    onAddCheck: function (el) {
        var el_div = this.find('id',el.name.replace('add_contact','contact_data'));
        if (el.checked) {
            el_div[0].enable();
        }
        else {
            el_div[0].disable();
        }
		
    },
    
    /**
     * onRequestSuccess (onApplyChanges success handler)
     */
    onRequestSuccess: function(record) {
        this.supr().onRequestSuccess.apply(this, arguments);
        this.contact_index = this.contact_index + 1;

        if (!this.bulkInvalid && this.mailContacts.length==this.contact_index) {
            // all contacts where added successfully
            this.window.close();
        }
    },
    
    /**
     * saveContact
     */
    bulkSaveContacts: function (button, event) {
		// loops through the contacts and adds each one to addressbook
		
        var form = this.getForm();
        var all_emails = this.mailContacts;
        this.contact_count = 0;
        this.contact_index = 0;
        this.bulkInvalid = false;

        Ext.each(all_emails, function(email) {
            this.contact_count = this.contact_count + 1;
            var s_index = '_'+this.contact_count.toString();
            if (form.findField('add_contact'+s_index).getValue() && !this.find('id','dynamic_contact'+s_index)[0].hidden) {
                var new_contact = new Tine.Addressbook.Model.Contact(Tine.Addressbook.Model.Contact.getDefaultData(),'new-'+Ext.id() );
                new_contact.set('email', form.findField('email'+s_index).getValue());
                new_contact.set('n_family', form.findField('n_family'+s_index).getValue());
                new_contact.set('n_given', form.findField('n_given'+s_index).getValue());
                new_contact.set('org_name', form.findField('org_name'+s_index).getValue());
                this.record = new_contact;
                this.onApplyChanges(button, event, false);
                if (this.validOk) {
                    // contact was added, now row must be hidden
                    this.find('id','dynamic_contact'+s_index)[0].hide();
                }
            }
            else {
                this.contact_index = this.contact_index + 1;
            }
        }, this);

    },

    /**
     * onRecordLoad
     */
    onRecordLoad: function () {
        // NOTE: it comes again and again till 
        if (this.rendered) {
            var container;
                        
            // handle default container
            if (! this.record.id) {
                if (this.forceContainer) {
                    container = this.forceContainer;
                    // only force initially!
                    this.forceContainer = null;
                } else {
                    container = Tine.Addressbook.registry.get('defaultAddressbook');
                }
                
                this.record.set('container_id', '');
                this.record.set('container_id', container);
            }
            
        }

        if (!this.bulkInvalid) {
            this.supr().onRecordLoad.apply(this, arguments);
        }
        else {
            this.loadMask.hide();
        }
        
    }
});

/**
 * Opens a new contact edit dialog window
 * 
 * @return {Ext.ux.Window}
 */
Tine.Addressbook.DynamicContactsDialog.openWindow = function (config) {
    
    // if a container is selected in the tree, take this as default container
    var treeNode = Ext.getCmp('Addressbook_Tree') ? Ext.getCmp('Addressbook_Tree').getSelectionModel().getSelectedNode() : null;
    if (treeNode && treeNode.attributes && treeNode.attributes.container.type) {
        config.forceContainer = treeNode.attributes.container;
    } else {
        config.forceContainer = null;
    }
    
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 720,
        height: 300,
        name: Tine.Addressbook.DynamicContactsDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Addressbook.DynamicContactsDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};
