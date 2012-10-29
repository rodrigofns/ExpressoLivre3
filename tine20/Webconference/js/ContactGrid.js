 
Ext.ns('Tine.Webconference');

/**
 * contact grid panel
 * 
 * @namespace   Tine.Webconference
 * @class       Tine.Webconference.ContactGridPanel
 * @extends     Tine.Addressbook.ContactGridPanel
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
Tine.Webconference.ContactGridPanel = Ext.extend(Tine.Addressbook.ContactGridPanel, {

    hasDetailsPanel: false,
    hasFavoritesPanel: false,
    hasQuickSearchFilterToolbarPlugin: false,
    stateId: 'WebconferenceContactGrid',
    
    gridConfig: {
        autoExpandColumn: 'n_fileas',
        enableDragDrop: false
    },
    
    
    messageRecord: null,
    
    /**
     * inits this cmp
     * @private
     */
    initComponent: function() {
        this.addEvents(
            /**
             * @event addcontacts
             * Fired when contacts are added
             */
            'addcontacts'
            );
        
        this.app = Tine.Tinebase.appMgr.get('Webconference');
        this.initFilterToolbar();
        
        Tine.Webconference.ContactGridPanel.superclass.initComponent.call(this);
        
        this.grid.on('rowdblclick', this.onRowDblClick, this);
        this.grid.on('cellclick', this.onCellClick, this);
        this.store.on('load', this.onContactStoreLoad, this);
    },
    
    /**
     * init filter toolbar
     */
    initFilterToolbar: function() {
        this.defaultFilters = [
        {
            field: 'email_query', 
            operator: 'contains', 
            value: '@'
        }
        ];
        this.filterToolbar = this.getFilterToolbar({
            filterFieldWidth: 100,
            filterValueWidth: 100
        });
    },
    
    /**
     * returns array with columns
     * 
     * @return {Array}
     */
    getColumns: function() {
        var columns = Tine.Webconference.ContactGridPanel.superclass.getColumns.call(this);
        
        // hide all columns except name/company/email/email_home (?)
        Ext.each(columns, function(column) {
            if (['n_fileas', 'org_name', 'email'].indexOf(column.dataIndex) === -1) {
                column.hidden = true;
            }
        });
    
        return columns;
    },
    
  
 
    /**
     * cell click handler -> update recipients in record
     * 
     * @param {Grid} grid
     * @param {Number} row
     * @param {Number} col
     * @param {Event} e
     */
    onCellClick: function(grid, row, col, e) {
    //this.getContextMenu().showAt(e.getXY());
        
    },
    
      
    /**
     * Return CSS class to apply to rows depending upon email set or not
     * 
     * @param {Tine.Addressbook.Model.Contact} record
     * @param {Integer} index
     * @return {String}
     */
    getViewRowClass: function(record, index) {
        var className = '';
        
        if (! record.hasEmail()) {
            className = 'felamimail-no-email';
        }
        
        return className;
    },
    
    /**
     * @private
     */
    initActions: function() {
        this.actions_addAsAttendee = new Ext.Action({
            requiredGrant: 'readGrant',
            text: this.app.i18n._('Add as Attendee'),
            disabled: false,
            iconCls: 'action_add',
            actionUpdater: this.updateRecipientActions,
            handler: this.onAddContact.createDelegate(this, [false]),
            allowMultiple: true,
            scope: this
        });

        this.actions_addAsModerator = new Ext.Action({
            requiredGrant: 'readGrant',
            text: this.app.i18n._('Add as Moderator'),
            disabled: false,
            iconCls: 'action_add',
            actionUpdater: this.updateRecipientActions,
            handler: this.onAddContact.createDelegate(this, [true]),
            allowMultiple: true,
            scope: this
        });

       
        
        //register actions in updater
        this.actionUpdater.addActions([
            this.actions_addAsAttendee,
            this.actions_addAsModerator,
            
            ]);
            
        Tine.Webconference.ContactGridPanel.superclass.initActions.call(this,arguments);
    },
    
    /**
     * updates context menu
     * 
     * @param {Ext.Action} action
     * @param {Object} grants grants sum of grants
     * @param {Object} records
     */
    updateRecipientActions: function(action, grants, records) {
        //console.debug('updateRecipientActions....');
        if (records.length > 0) {
            var emptyEmails = true;
            for (var i=0; i < records.length; i++) {
                if (records[i].hasEmail()) {
                    emptyEmails = false;
                    break;
                }
            }
            
            action.setDisabled(emptyEmails);
        } else {
            action.setDisabled(true);
        }
    //action.setDisabled(false);
    },
    
    /**
     * on add contact -> fires addcontacts event and passes rows + type
     * 
     * @param {String} type
     */
    onAddContact: function(type) {
        
        var contacts = this.grid.getSelectionModel().getSelectionsCollection().items;
        
        if (contacts.length > 0){
            
            var loadMask = new Ext.LoadMask(this.container, {
                msg: String.format(_('Please wait'))
            });
            loadMask.show();
        
            selected = [];
            Ext.each(contacts, function (item) {
                selected.push(item.data);
            });        

            Tine.Webconference.inviteUsersToJoin(selected, type, Tine.Tinebase.appMgr.get('Webconference').roomId,  function(response) {

                loadMask.hide();

                Ext.MessageBox.show({
                    title: _('Webconference'), 
                    msg: response.message,
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.INFO
                });

            });
        }
        else{
            Ext.MessageBox.show({
                title: _('Webconference'), 
                msg: Tine.Tinebase.appMgr.get('Webconference').i18n._('No records selected'),
                buttons: Ext.Msg.OK,
                icon: Ext.MessageBox.INFO
            });
        }
      
    },
    
    /**
     * row doubleclick handler
     * 
     * @param {} grid
     * @param {} row
     * @param {} e
     */
    onRowDblClick: function(grid, row, e) {
        //this.onAddContact('Invite');
        this.getContextMenu().showAt(e.getXY());
    }, 
    
    /**
     * returns rows context menu
     * 
     * @return {Ext.menu.Menu}
     */
    getContextMenu: function() {
        //console.debug('getContextMenu....');
        
        if (! this.contextMenu) {
            
            var items = [
            this.actions_addAsAttendee,
            this.actions_addAsModerator,
            
            ];
            this.contextMenu = new Ext.menu.Menu({
                items: items
            });
        }
        return this.contextMenu;
    }
});

Ext.reg('webconferencecontactgrid', Tine.Webconference.ContactGridPanel);
