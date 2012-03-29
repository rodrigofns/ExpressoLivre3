Ext.ns('Tine.Messenger.Window');

Tine.Messenger.RootNode = function() {
    return Ext.getCmp('messenger-roster').getRootNode();
};

Tine.Messenger.Window.AddGroupHandler = function(dialog){
    var gname = dialog.findById('messenger-group-mngt-name').getValue().trim();
    if(Tine.Messenger.Window._addGroupAction(gname)){
        dialog.close();
    }   
}

Tine.Messenger.Window._addGroupAction = function(name){
    if(name){
        if(!Tine.Messenger.RosterTree().groupExist(name)){
            Tine.Messenger.RosterTree().addGroup(name);
            Tine.Messenger.LogHandler.status(name, _('Group created successfully!'));
            return true;
        } else {
            Ext.Msg.alert(_('Add Group'),_('The group already exists!'));
        }
    }
    return false;
}

Tine.Messenger.Window.AddBuddyWindow = function(_jid){
    
    if(_jid){
        Tine.Messenger.RosterTree().addBuddy(_jid);
    } else {
        _jid = '';
    }
    
    var dialog = new Tine.Messenger.SimpleDialog(Tine.Messenger.Config.AddBuddyLayout).init();
         
    dialog.findById('messenger-contact-add-jid').setValue(_jid).disable();
}

Tine.Messenger.Window.AddBuddyHandler = function(dialog){
    
    var jid = dialog.findById('messenger-contact-add-jid').getValue().trim(),
        name = dialog.findById('messenger-contact-add-name').getValue().trim(),
        group = dialog.findById('messenger-contact-add-group').getValue();

    var result = Tine.Messenger.Window._addBuddyAction(jid, name, group);
    if(result){
        dialog.close();
    }
    
}

Tine.Messenger.Window._addBuddyAction = function(jid, name, group){
    
    var buddy = Tine.Messenger.RosterHandler.getContactElement(jid);
    if(buddy){
        var buddys = new Array();
        buddys.push([jid, name, group]);
//        Tine.Messenger.RosterHandler.renameContact(jid, name, group);
        Tine.Messenger.RosterHandler.modifyBuddys(buddys);
        Tine.Messenger.LogHandler.status(jid || name, _('Added successfuly!'));
        return true;
    } else {
        if(jid){
            if(Tine.Messenger.RosterHandler.addContact(jid, name, group)){
                Tine.Messenger.LogHandler.status(jid || name, _('Added successfuly!'));
            } else {
                Ext.Msg.alert(_('Add Buddy'),_('Buddy not added!'))
            }
            return true;
        }
    }
    return false;
}

/********************************
 * ALL BELOW WAS DEPRECATED 
 ********************************/

/*
var roster = new Ext.tree.TreePanel({
     id:           'messenger-roster',
     loader:       new Ext.tree.TreeLoader(),
     border:       false,
     cls:          'messenger-treeview',
     rootVisible:  false,
     renderTo:     Ext.getBody(),
     autoScroll:   true,
     
     root: new Ext.tree.AsyncTreeNode({
         expanded: true,
         leaf:     false
    })
});

Tine.Messenger.Window = new Ext.Window({
    title:       'Expresso Messenger',
    iconCls:     'messenger-icon',
    width:       250,
    height:      450,
    closeAction: 'hide', //'close' - destroy the component
    collapsible:true,
    plain:       true,
    layout:      'fit',
    tbar: [{
                text:'Actions',
                menu: {
                    id:"BuddysMenu",
                    items:[
                            {
                                id: 'messenger-contact-add',
                                icon: '/images/messenger/user_add.png',
                                text: 'Add Contact',
                                disabled: true,
                                handler: function(){
                                    Tine.Messenger.Window.AddBuddyWindow();
                                }
                            },
                            {
                                id: 'messenger-group-mngt-add',
                                text: 'Add Group',
                                icon: '/images/messenger/group_add.png',
                                disabled: true,
                                handler: function() {
                                    Tine.Messenger.Window._AddGroupWindow();
                                }
                                
                        }]
                    }
    }],
    
    items:       roster,
    
    buttons: [
        {
            id: 'messenger-change-status-button',
            icon: '/images/messenger/user_offline.png',
            width: 32,
            disabled: true,
            handler: function(){
                var statusWindow = new Ext.Window({
                    id: 'messenger-change-status-window',
                    closeAction: 'close',
                    plain: true,
                    layout:      'fit',
                    width: 350,
                    height: 150,
                    title: 'Change Status',
                    items: {
                        xtype: 'form',
                        border: false,
                        items: [
                            {
                                xtype: 'combo',
                                id: 'messenger-change-status',
                                fieldLabel: 'Status',
                                store: new Ext.data.SimpleStore({
                                                data: [
                                                        [1, 'Online'],
                                                        [2, 'Offline'],
                                                        [3, 'Away'],
                                                        [4, 'Do not disturb'],
                                                ],
                                                id: 0,
                                                fields: ['value', 'text']
                                        }),
                                emptyText:'Select a status...',
                                valueField: 'value',
                                displayField: 'text',
                                triggerAction: 'all',
                                editable: false,
                                mode : 'local'
                            },
                            {
                                xtype: 'textarea',
                                id: 'messenger-change-status-message',
                                fieldLabel: 'Message',
                                width: 200,
                                height: 100
                            },
                            {
                                xtype: 'button',
                                text: 'GO',
                                listeners: {
                                    click: function () {
                                        var status = Ext.getCmp('messenger-change-status').getValue();
                                        var message = Ext.getCmp('messenger-change-status-message').getValue();
                                        if (status == 1) {
                                            if (!Tine.Tinebase.appMgr.get('Messenger').getConnection().connected) {
                                                Tine.Messenger.ChatHandler.connect();
                                            } else {
                                                Tine.Messenger.Application.connection.send($pres());
                                            }
                                            Ext.getCmp('messenger-change-status-button')
                                                .enable()
                                                .setIcon('/images/messenger/user_online.png')
                                                .setTooltip(_('Online'));
                                        } else if (status == 2) {
                                            Tine.Messenger.ChatHandler.disconnect();
                                            Ext.getCmp('messenger-change-status-button')
                                                .enable()
                                                .setIcon('/images/messenger/user_offline.png')
                                                .setTooltip(_('Offline'));
                                        } else if (status == 3) {
                                            Tine.Messenger.RosterHandler.setStatus('away', message);
                                            Ext.getCmp('messenger-change-status-button')
                                                .enable()
                                                .setIcon('/images/messenger/user_away.png')
                                                .setTooltip(_('Away'));
                                        } else if (status == 4) {
                                            Tine.Messenger.RosterHandler.setStatus('dnd', message);
                                            Ext.getCmp('messenger-change-status-button')
                                                .enable()
                                                .setIcon('/images/messenger/user_dnd.png')
                                                .setTooltip(_('Do not disturb'));
                                        }
                                        Ext.getCmp('messenger-change-status-window').close();
                                    }
                                }
                            }
                        ]
                    }
                });
                statusWindow.show();
            }
        },
        {
            id: 'messenger-connect-button',
            width: 32,
            tooltip: 'Connect',
            connectionStatus: 'Connect',
            icon: '/images/messenger/disconnected.png',
            handler: function() {
                if (this.connectionStatus == 'Connect') {
                    Tine.Messenger.ChatHandler.connect();
                    // Commenting up, uncomment down!!
                    // Start your engines!
                    // Tine.Tinebase.appMgr.get('Messenger').startMessenger();
                } else if (this.connectionStatus == 'Disconnect') {
                    Tine.Messenger.ChatHandler.disconnect();
                }
            }
    }]
    
});

var contextMenu2 = new Ext.menu.Menu({
    floating: true,
    items: [
        {
            text: 'Rename',
            icon: '/images/messenger/user_edit.png',
            handler: function (choice, ev) {
                var jid = choice.parentMenu.contactId;

                choice.parentMenu.hide();

                var renameContactWindow = new Ext.Window({
                    closeAction: 'close',
                    layout: 'fit',
                    plain: true,
                    modal: true,
                    title: _('Rename Contact') + ' - ' + jid,
                    items: [
                        {
                            xtype: 'form',
                            border: false,
                            items: [
                                {
                                    xtype: 'textfield',
                                    id: 'messenger-contact-mngt-name',
                                    fieldLabel: _('Name')
                                },
                                {
                                    xtype: 'button',
                                    id: 'messenger-contact-mngt-button',
                                    text: _('Rename'),
                                    listeners: {
                                        click: function () {
                                            var name = Ext.getCmp('messenger-contact-mngt-name').getValue();
                                            Tine.Messenger.RosterHandler.renameContact(jid, name);
                                            renameContactWindow.close();
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                });
                renameContactWindow.show();
            }
        },
        {
            text: 'Remove',
            icon: '/images/messenger/user_delete.png',
            handler: function (choice, ev) {
                var jid = choice.parentMenu.contactId,
                    name = Tine.Messenger.RosterHandler.getContactElement(jid).text;

                choice.parentMenu.hide();

                Ext.Msg.buttonText.yes = _('Yes');
                Ext.Msg.buttonText.no = _('No');
                Ext.Msg.minWidth = 300;
                Ext.Msg.confirm(_('Delete Contact') + ' - ' + jid,
                                    _('Are you sure to delete ' + name + '?'),
                                    function (id) {
                                        if (id == 'yes') {
                                            Tine.Messenger.RosterHandler.removeContact(jid);
                                        }
                                    }
                );
            }
        },
        
        {
            id: 'subMenuGrpItems',
            text: 'Move to',
            icon: '/images/messenger/group_go.png',
            menu: { 
                    xtype: 'menu'
                  }
        },
        
        {
            id: 'req-authorization-button',
            text: 'Request authorization',
            handler: function (choice, ev) {
                var jid = choice.parentMenu.contactId,
                    type = 'subscribe';
                Tine.Messenger.LogHandler.sendSubscribeMessage(jid, type);
            }
            
        }
    ]
});

Tine.Messenger.Window._BuildSubMenuGrpItems = function(jid){
    var node = contextMenu.findById('subMenuGrpItems'),
        groups = Tine.Messenger.RosterTree().getGroupsFromTree(),
        user_group = Tine.Messenger.RosterHandler.getContactElementGroup(jid),
        NO_GROUP = Tine.Messenger.RosterTree().getNoGroup();
        
    node.menu.removeAll();
    
    for(var i=0; i < groups.length; i++){
        var group = groups[i];
        if(group != user_group){
            node.menu.addItem( 
                new Ext.menu.Item({
                    text: group,
                    handler: function(choice, ev){
                                Tine.Messenger.RosterHandler.moveContactFromGroups(jid, choice.text);
                            }
                })
            );
        } else if(groups.length == 1){
            node.menu.addItem( 
                new Ext.menu.Item({
                    text: _('Empty'),
                    disabled: true
                })
            );
        }
    }
    if(user_group != null){
        node.menu.addItem( 
            new Ext.menu.Separator()
        );
        node.menu.addItem( 
            new Ext.menu.Item({
                text: NO_GROUP,
                handler: function(choice, ev){
                            Tine.Messenger.RosterHandler.moveContactFromGroups(jid, NO_GROUP);
                        }
            })
        );
    }
};



var contextMenuGrp = new Ext.menu.Menu({
    floating: true,
    items:[{
        text:'edit',
        icon:"/images/messenger/group_edit.png",
        handler: function (choice, ev) {
            var gname = choice.parentMenu.gname;
            choice.parentMenu.hide();

            var renameGroupWindow = new Ext.Window({
                closeAction: 'close',
                layout: 'fit',
                plain: true,
                modal: true,
                title: _('Rename Group') + ' - ' + gname,
                items: [
                    {
                        xtype: 'form',
                        border: false,
                        items: [
                            {
                                xtype: 'textfield',
                                id: 'messenger-group-mngt-name',
                                fieldLabel: _('Name'),
                                value: gname
                            },
                            {
                                xtype: 'button',
                                id: 'messenger-group-mngt-button',
                                text: _('Rename it!'),
                                        listeners: {
                                            click: function () {
                                                var n_gname = Ext.getCmp('messenger-group-mngt-name').getValue().trim();
                                                
                                                if(Tine.Messenger.RosterHandler.renameGroup(gname, n_gname)){
                                                    renameGroupWindow.close();
                                                } else {
                                                    Ext.Msg.alert(_('Add Group'),_('The group name already exists!'));
                                                }
                                            }
                                        }
                            }
                        ],
                        keys: [
                            {
                                key: [Ext.EventObject.ENTER],
                                handler: function () {
                                    var n_gname = Ext.getCmp('messenger-group-mngt-name').getValue().trim();
                                                
                                    if(Tine.Messenger.RosterHandler.renameGroup(gname, n_gname)){
                                        renameGroupWindow.close();
                                    } else {
                                        Ext.Msg.alert(_('Add Group'),_('The group name already exists!'));
                                    }
                                }
                            }
                        ]
                    }
                ]
            });
            renameGroupWindow.show();
        }
    },{
        text:'delete',
        icon:"/images/messenger/group_delete.png",
        handler: function (choice, ev) {
            var grp_name = choice.parentMenu.gname;
            choice.parentMenu.hide();

            Ext.Msg.buttonText.yes = _('Yes');
            Ext.Msg.buttonText.no = _('No');
            Ext.Msg.minWidth = 300;
            Ext.Msg.confirm(_('Delete Group') + ' - ' + grp_name,
                                _('Are you sure to delete ' + grp_name + '?'),
                                function (id) {
                                    if (id == 'yes') {
                                        Tine.Messenger.RosterHandler.removeGroup(grp_name);
                                    }
                                }
            );
        }
    }]

});

Tine.Messenger.Window.AddBuddyWindow_old = function(_jid) {
    
    if(_jid){
        Tine.Messenger.RosterTree().addBuddy(_jid);
    } else {
        _jid = '';
    }
    
    var addContactWindow = new Ext.Window({
        closeAction: 'close',
        layout: 'fit',
        plain: true,
        modal: true,
        title: _('Add Contact') + ' - ' + _jid,
        items: [
            {
                xtype: 'form',
                border: false,
                items: [
                    {
                        xtype: 'textfield',
                        id: 'messenger-contact-add-jid',
                        fieldLabel: _('JID'),
                        value: _jid,
                        disabled: true
                    },
                    {
                        xtype: 'textfield',
                        id: 'messenger-contact-add-name',
                        fieldLabel: _('Name')
                    },
                    {
                        xtype: 'combo',
                        id: 'messenger-contact-add-group',
                        fieldLabel: _('Group'),
                        store: new Ext.data.SimpleStore({
                                        data: Tine.Messenger.RosterTree().getGroupsFromTree(),
                                        id: 0,
                                        fields: ['text']
                                }),
                        emptyText: _('Select a group') + '...',
                        valueField: 'text',
                        displayField: 'text',
                        triggerAction: 'all',
                        editable: false,
                        mode : 'local'
                    },
                    {
                        xtype: 'button',
                        id: 'messenger-contact-add-button',
                        text: _('Add'),
                        listeners: {
                            click: function () {
                                var jid = Ext.getCmp('messenger-contact-add-jid').getValue().trim(),
                                    name = Ext.getCmp('messenger-contact-add-name').getValue().trim(),
                                    group = Ext.getCmp('messenger-contact-add-group').getValue();
                                
                                var result = Tine.Messenger.Window._addBuddyAction(_jid, jid, name, group);
                                if(result){
                                    addContactWindow.close();
                                } 
                            }
                        }
                    }
                ],
                keys: [
                    {
                        key: [Ext.EventObject.ENTER],
                        handler: function () {
                            var jid = Ext.getCmp('messenger-contact-add-jid').getValue().trim(),
                                name = Ext.getCmp('messenger-contact-add-name').getValue().trim(),
                                group = Ext.getCmp('messenger-contact-add-group').getValue();

                            var result = Tine.Messenger.Window._addBuddyAction(_jid, jid, name, group);
                            if(result){
                                addContactWindow.close();
                            }
                        }
                    }
                ]
            }
        ]
    });
    if(!_jid){
        Ext.getCmp('messenger-contact-add-jid').disabled = false;
    }
    addContactWindow.show();
}

Tine.Messenger.Window._AddGroupWindow = function(){
    
    var addGroupWindow = new Ext.Window({
            closeAction: 'close',
            layout: 'fit',
            plain: true,
            modal: true,
            title: _('Add Group'),
            items: [{
                    xtype: 'form',
                    border: false,
                    items: [
                        {
                            xtype: 'textfield',
                            id: 'messenger-group-mngt-name',
                            fieldLabel: _('Name')
                        },
                        {
                            xtype: 'button',
                            id: 'messenger-group-mngt-button',
                            text: _('Add'),
                            listeners: {
                                click: function () {
                                    var gname = Ext.getCmp('messenger-group-mngt-name').getValue().trim();
                                    if(Tine.Messenger.Window._addGroupAction(gname)){
                                        addGroupWindow.close();
                                    }
                                }
                            }
                        }
                    ]
                }
            ],
            keys: [
                {
                    key: [Ext.EventObject.ENTER],
                    handler: function () {
                        var gname = Ext.getCmp('messenger-group-mngt-name').getValue().trim();
                        if(Tine.Messenger.Window._addGroupAction(gname)){
                            addGroupWindow.close();
                        }
                    }
                }
            ]
        });
        
    addGroupWindow.show();
}
*/