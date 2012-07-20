/*
 * Tine 2.0
 * 
 * @package     Calendar
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 *
 */
 
Ext.ns('Tine.Calendar');

/**
 * @namespace Tine.Calendar
 * @class Tine.Calendar.AttendeeEditDialog
 * @extends Tine.widgets.dialog.EditDialog
 * Calendar Edit Dialog <br>
 * 
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 */
Tine.Calendar.AttendeeEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
    /**
     * @cfg {Number} containerId initial container id
     */
    containerId: -1,
    
    
    labelAlign: 'side',
    windowNamePrefix: 'AttendeeEditWindow_',
    appName: 'Calendar',
    recordClass: Tine.Calendar.Model.Event,
    recordProxy: Tine.Calendar.backend,
    showContainerSelector: false,
    
    mode: 'local',
    
    // note: we need up use new action updater here or generally in the widget!
    evalGrants: false,
    
    
    onResize: function() {
        Tine.Calendar.AttendeeEditDialog.superclass.onResize.apply(this, arguments);
        this.setTabHeight.defer(100, this);
    },
    
    
    /**
     * returns dialog
     * 
     * NOTE: when this method gets called, all initalisation is done.
     * @return {Object} components this.itmes definition
     */
    getFormItems: function() { 
        return {
            title: this.app.i18n.n_('Delegate Invitation'),
            xtype: 'tabpanel',
            border: false,
            plain: true,
            activeTab: 0,
            border: false,
            items: [
                this.attendeeSelCombo
            ]
        };
    },
    
    initComponent: function() {
        
        if(this.attendee) this.attendee = Ext.decode(this.attendee);
        
        this.attendeeSelCombo = new Tine.Calendar.AttendeeSelCombo({});
        this.attendeeStore = this.attendeeSelCombo.getStore();
        
        Tine.Calendar.AttendeeEditDialog.superclass.initComponent.call(this);
    },
    
    /**
     * checks if form data is valid
     * 
     * @return {Boolean}
     */
    isValid: function() {
        var isValid = true;
        
        return isValid && Tine.Calendar.AttendeeEditDialog.superclass.isValid.apply(this, arguments);
    },
     
    onRecordLoad: function() {
        // NOTE: it comes again and again till 
        if (this.rendered) {
            this.attendeeSelCombo.onRecordLoad(this.record, this.attendee);
            
            // apply grants
            if (! this.record.get('editGrant')) {
                this.getForm().items.each(function(f){
                    if(f.isFormField && f.requiredGrant !== undefined){
                        f.setDisabled(! this.record.get(f.requiredGrant));
                    }
                }, this);
            }
        }
        
        Tine.Calendar.AttendeeEditDialog.superclass.onRecordLoad.apply(this, arguments);
    },
    
    onRecordUpdate: function() {
        Tine.Calendar.AttendeeEditDialog.superclass.onRecordUpdate.apply(this, arguments);
        this.attendeeSelCombo.onRecordUpdate(this.event, this.record);
    },
    
    setTabHeight: function() {
    }
    
});

/**
 * Opens a new event edit dialog window
 * 
 * @return {Ext.ux.Window}
 */
Tine.Calendar.AttendeeEditDialog.openWindow = function (config) {
    // record is JSON encoded here...
    var id = config.recordId ? config.recordId : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 500,
        height: 150,
        name: Tine.Calendar.AttendeeEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Calendar.AttendeeEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};
