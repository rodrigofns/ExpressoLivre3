
Ext.namespace('Tine.Webconference');

/**
 * contact picker dialog
 * 
 * @namespace   Tine.Webconference
 * @class       Tine.Webconference.ContactPickerDialog
 * @extends     Tine.widgets.dialog.EditDialog
 * 
 * <p>Tinebase Webconference ContactGridPanel</p>
 * <p><pre>
 * </pre></p>
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Edgar de Lucca <edgar.lucca@serpro.gov.br>, Marcelo Teixeira <marcelo.teixeira@serpro.gov.br>
 * @copyright   Copyright (c) 2007-2012 Metaways Infosystems GmbH (http://www.metaways.de)
 * 
 * Create a new Tine.Webconference.ContactGridPanel
 * 
 */
Tine.Webconference.ContactPickerDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
    
    /**
     * @private
     */
    windowNamePrefix: 'ContactPickerWindow_',
    appName: 'Webconference',
    recordClass: Tine.Addressbook.Model.Contact,
    //recordProxy: Tine.Felamimail.messageBackend,
    loadRecord: false,
    evalGrants: false,
    mode: 'local',
    
    bodyStyle: 'padding:0px',
    cancelButtonText: 'Close',
    
          
    
    /**
     * overwrite update toolbars function (we don't have record grants)
     * @private
     */
    updateToolbars: Ext.emptyFn,
    
    /**
     * @private
     */
    onRecordLoad: function() {
        // interrupt process flow till dialog is rendered
        if (! this.rendered) {
            this.onRecordLoad.defer(250, this);
            return;
        }
        
        this.loadMask.hide();
    },

    /**
     * returns dialog
     * 
     * NOTE: when this method gets called, all initialisation is done.
     * 
     * @return {Object}
     * @private
     */
    getFormItems: function() {
        var adbApp = Tine.Tinebase.appMgr.get('Addressbook');
        
        this.treePanel = new Tine.widgets.container.TreePanel({
            allowMultiSelection: true,
            region: 'west',
            filterMode: 'filterToolbar',
            recordClass: Tine.Addressbook.Model.Contact,
            app: adbApp,
            width: 200,
            minSize: 100,
            maxSize: 300,
            border: false,
            enableDrop: false
        });
        
        this.contactGrid = new Tine.Webconference.ContactGridPanel({
            region: 'center',
            messageRecord: this.record,
            app: adbApp,
            plugins: [this.treePanel.getFilterPlugin()]
        });
        
        this.westPanel = new Tine.widgets.mainscreen.WestPanel({
            app: adbApp,
            hasFavoritesPanel: true,
            ContactTreePanel: this.treePanel,
            
            ContactFilterPanel: new Tine.widgets.persistentfilter.PickerPanel({
                filter: [{
                    field: 'model', 
                    operator: 'equals', 
                    value: 'Addressbook_Model_ContactFilter'
                }],
                app: adbApp,
                grid: this.contactGrid
            })
        //            additionalItems: [ new Tine.Felamimail.RecipientPickerFavoritePanel({
        //                app: this.app,
        //                grid: this.contactGrid
        //            })]
        });
        
        return {
            border: false,
            layout: 'border',
            items: [{
                cls: 'tine-mainscreen-centerpanel-west',
                region: 'west',
                stateful: false,
                layout: 'border',
                split: true,
                width: 200,
                minSize: 100,
                maxSize: 300,
                border: false,
                collapsible: true,
                collapseMode: 'mini',
                header: false,
                items: [{
                    border: false,
                    region: 'center',
                    items: [ this.westPanel ]
                }]
            }, this.contactGrid]
        };
    },
    /**
     * init buttons
     */
    initButtons: function() {
        var genericButtons = [
        this.action_delete
        ];
        
        this.action_inviteUsers = new Ext.Button({
            text: Tine.Tinebase.appMgr.get('Webconference').i18n._('Invite Users'),
            menu: new Ext.menu.Menu({
                items: [
                
                    new Ext.Action({ 
                        requiredGrant: this.readGrant,
                        text: Tine.Tinebase.appMgr.get('Webconference').i18n._('Add as Attendee'),
                        minWidth: 70,
                        scope: this,
                        handler: this.onInviteUsers.createDelegate(this, [false]),
                        iconCls: 'action_add'
                    }),
                    new Ext.Action({ 
                        requiredGrant: this.readGrant,
                        text: Tine.Tinebase.appMgr.get('Webconference').i18n._('Add as Moderator'),
                        minWidth: 70,
                        scope: this,
                        handler: this.onInviteUsers.createDelegate(this, [true]),
                        iconCls: 'action_add'
                    })
                ]
            }),
            iconCls: 'action_applyChanges'
            
        });
        
        this.fbar = [
        '->',
        this.action_inviteUsers,
        this.action_cancel
        ];
       
        if (this.tbarItems) {
            this.tbar = new Ext.Toolbar({
                items: this.tbarItems
            });
        }
    },
    
    onInviteUsers: function(moderator){
        this.contactGrid.onAddContact(moderator);
    }
});


Tine.Webconference.ContactPickerDialog.openWindow = function (config) {
    var window = Tine.WindowFactory.getWindow({
        width: 1000,
        height: 600, 
        name: Tine.Webconference.ContactPickerDialog.prototype.windowNamePrefix + Ext.id(),
        contentPanelConstructor: 'Tine.Webconference.ContactPickerDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};
