/*
 * Tine 2.0
 * 
 * @package     Felamimail
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009-2010 Metaways Infosystems GmbH (http://www.metaways.de)
 *
 */
 
Ext.namespace('Tine.Felamimail');

/**
 * @namespace   Tine.Felamimail
 * @class       Tine.Felamimail.AclsEditDialog
 * @extends     Tine.widgets.dialog.EditDialog
 * 
 * <p>Folder ACL edit dialog</p>
 * <p>
 * </p>
 * 
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * 
 * @param       {Object} config
 * @constructor
 * Create a new Tine.Felamimail.AclsEditDialog
 * 
 */
Tine.Felamimail.AclsEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
    
    /**
     * @private {Ext.data.JsonStore}
     */
    aclsStore: null,
    
    /**
     * @private
     */
    windowNamePrefix: 'AclsEditWindow_',
    loadRecord: false,
    tbarItems: [],
    evalAcls: false,
     
    /**
     * @private
     */
    initComponent: function() {

        this.aclStore =  new Ext.data.JsonStore({
            baseParams: {
                method: 'Felamimail.getFolderAcls',
                accountId: this.initialConfig.accountId,
                globalName: this.initialConfig.globalName
            },
            root: 'results',
            totalProperty: 'totalcount',
            //id: 'id',
            // use account_id here because that simplifies the adding of new records with the search comboboxes
            id: 'account_id',
            fields: Tine.Felamimail.Model.Acl
        });
        this.aclStore.load();
        
       Tine.Felamimail.AclsEditDialog.superclass.initComponent.call(this);
    },
    
    /**
     * init record to edit
     * 
     * - overwritten: we don't have a record here 
     */
    initRecord: function() {
    },
    
    /**
     * returns dialog
     */
    getFormItems: function() {
        this.aclsGrid = new  Tine.Felamimail.AclsGrid({
            store: this.aclStore
        }); 
        
        return this.aclsGrid;
    },
    
    /**
     * @private
     */
    onApplyChanges: function(button, event, closeWindow) {
        Ext.MessageBox.wait(_('Please wait'), _('Updating Grants'));
        
        var acls = [];
        this.aclStore.each(function(_record){
            acls.push(_record.data);
        });
        
        Ext.Ajax.request({
            params: {
                method: 'Felamimail.setFolderAcls',
                accountId:this.initialConfig.accountId,
                globalName: this.initialConfig.globalName,
                acls: acls
            },
            scope: this,
            success: function(_result, _request){
                Ext.MessageBox.hide();
                if (closeWindow) {
                    this.purgeListeners();
                    this.window.close();
                    return;
                }
                
                var grants = Ext.util.JSON.decode(_result.responseText);
                this.grantsStore.loadData(grants, false);
            },
            failure: function(response, options) {
                var responseText = Ext.util.JSON.decode(response.responseText);
                
                if (responseText.data.code == 505) {
                    Ext.Msg.show({
                       title:   _('Error'),
                       msg:     _('You are not allowed to remove all admins for this container!'),
                       icon:    Ext.MessageBox.ERROR,
                       buttons: Ext.Msg.OK
                    });
                    
                } else {
                    // call default exception handler
                    var exception = responseText.data ? responseText.data : responseText;
                    Tine.Tinebase.ExceptionHandler.handleRequestException(exception);
                }                
            }
        });
    }
});

/**
 * grants dialog popup / window
 */
Tine.Felamimail.AclsEditDialog.openWindow = function (config) {
    
    this.account = config.accountId;
    this.folderId = config.globalName;
    var window = Tine.WindowFactory.getWindow({
        width: 700,
        height: 450,
        name: Tine.Felamimail.AclsEditDialog.windowNamePrefix + Ext.id(),
        contentPanelConstructor: 'Tine.Felamimail.AclsEditDialog',
        contentPanelConstructorConfig: config,
        modal: true
    });
    return window;
};

