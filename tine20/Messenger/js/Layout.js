
Ext.ns('Tine.Messenger');

Tine.Messenger.ClientDialog = function(args){
    var app = Tine.Tinebase.appMgr.get('Messenger');
    var ClientLayout = {
            id:'ClientDialog',
            title: app.i18n._('Expresso Messenger'),
            iconCls: 'messenger-icon-off',
            connected: false,
            status: '',
            width: 220,
            minWidth: 220,
            height: 420,
            minHeight: 270,
            closeAction: 'hide', //'close' - destroy the component
            collapsible: true,
            plain: true,
            autoScroll:   true,
            border: false,
            layout: 'border', // 'fit'
            listeners: {
                move: function(_box){
                    Tine.Messenger.Window._onMoveWindowAction(_box);
                }
            },
            tbar: {
                    cls: 'messenger-client-tbar',
                    items:[
                        {
                            id: 'messenger-menu-actions',
                            text: app.i18n._('Actions'),
                            menu: {
                                    id: "BuddysMenu",
                                    items:[{
                                            id: 'messenger-contact-add',
                                            icon: '/images/messenger/user_add.png',
                                            text: app.i18n._('Add Contact'),
                                            disabled: true,
                                            handler: function(){
                                                Tine.Messenger.Window.AddBuddyWindow();
                                            }
                                    },
                                    {
                                            id: 'messenger-group-mngt-add',
                                            text: app.i18n._('Add Group'),
                                            icon: '/images/messenger/group_add.png',
                                            disabled: true,
                                            handler: function() {
                                                new Tine.Messenger.WindowConfig(Tine.Messenger.WindowLayout.Groups).show();
                                            }
                                     },
                                     {
                                         id: 'messenger-logout',
                                         text: app.i18n._('Logout'),
                                         disabled: true,
                                         handler: function() {
                                             Tine.Messenger.ChatHandler.disconnect();
                                         }
                                     }
                                    ]
                                }
                        }]
            },
            items:[{
			region:'center',
			border:false,
                        bodyStyle:'padding:6px 3px 0 3px;',
			layout:'fit',
                        items: Tine.Messenger._Roster
                    } 
                    ,{
                        id: 'messenger-connect-display',
                        html: '<img src="/images/messenger/loading_animation_liferay.gif" style="display:none" />',
                        cls: 'messenger-connect-display',
                        region:'center',
                        border: false,
                        buttons: [
                                {
                                    id: 'messenger-connect-cmd',
                                    text: app.i18n._('Connect'),
                                    region:'center',
                                    cls: 'messenger-connect-cmd',
                                    handler: function() {
                                        Tine.Messenger.ChatHandler.connect();
                                    }
                                }
                            ]
                    }
		]
            ,bbar:{
                id: 'status-container',
                height: 27,
                cls: 'messenger-client-tbar',
                layout: 'hbox',
                items: [{   
                        id: 'messenger-change-status-button',
                        icon: '/images/messenger/user_offline.png',
                        listeners: {
                            click: function (field, ev) {
                                statusMenu(this);
                            }
                        },
                        flex: 1
                    },
                    {xtype: 'tbspacer', width: 5},
                    {
                        xtype:'textfield',
//                        store: Tine.Messenger.factory.statusStore,
                        displayField:'text',
                        valueField:'value',
                        typeAhead: true,
                        name:'message',
                        mode: 'local',
                        triggerAction: 'all',
                        id:'messenger-status-box',
                        emptyText:app.i18n._('your Status') + '...' 
                                                            + '(' + app.i18n._('press ENTER after') + ')',
                        selectOnFocus:true,
                        listeners: {
                            specialkey: function (field, ev) {
                                if (ev.getKey() == ev.ENTER) {
                                    changeStateText(this);
                                }
                            }
                        },
                        flex: 9
                    }
                ]
            }
    };
    
    var changeStateText = function(_box){
        Tine.Messenger.RosterHandler.changeStatus(Ext.getCmp('ClientDialog').status, 
                                                    _box.getValue());
    }
    
    var changeStateHandler = function(_e){
        Tine.Messenger.RosterHandler.changeStatus(_e.value, 
                                                    Ext.get('messenger-status-box').getValue());
    }
    
    var statusMenu = function(_box){
            var items = Array(),
                statusItems = Tine.Messenger.factory.statusStore.data.items;
            /**
             * Traduções dos status
             * _('Online')
             * _('Away')
             * _('Do Not Disturb')
             * _('Unavailable')
             */
            for(var i=0; i < statusItems.length; i++){
                var text = app.i18n._(statusItems[i].data.text),
                    value = statusItems[i].data.value;
                items.push({text: app.i18n._(text),
                            value: value,
                            icon: '/images/messenger/user_'+value+'.png',
                            handler: changeStateHandler
                      });
            }
            
            var menu = new Ext.menu.Menu({
                            items: items
                    });
            menu.show(_box.getPositionEl());
    }

    Tine.Messenger.WindowConfig.superclass.constructor.call(this,
        Ext.apply(ClientLayout, args || {})
    );
};

Ext.extend(Tine.Messenger.ClientDialog, Ext.Window);

Tine.Messenger._Roster = 
    new Ext.tree.TreePanel({
                                    id:           'messenger-roster',
                                    loader:       new Ext.tree.TreeLoader(),
                                    border:       false,
                                    cls:          'messenger-treeview',
                                    rootVisible:  false,
                                    root: new Ext.tree.AsyncTreeNode({
                                        expanded: true,
                                        leaf:     false
                                    })
                                });
                                
Tine.Messenger._ChatRoster = 
    new Ext.tree.TreePanel({
                                    loader:       new Ext.tree.TreeLoader(),
                                    border:       false,
                                    cls:          'messenger-groupchat-roster',
                                    rootVisible:  false,
                                    root: new Ext.tree.AsyncTreeNode({
                                        expanded: true,
                                        leaf:     false,
                                        cls:      'messenger-groupchat-roster-tree'
                                    })
                                });
                                
Tine.Messenger.SimpleDialog = function(_config){
    var extDialog=null;
    var config=_config;
    var opener=Ext.getBody();
    var createDialog=function(){
        extDialog=new Ext.Window(config);
        console.log(opener);
        extDialog.show(opener);
        extDialog.doLayout();
        return extDialog;
    }
    return{
        init:function(){
            if(!extDialog){
                return createDialog();
            }
        }
    }
}

var configWindow = null;
    
Tine.Messenger.Config = {
    
    ClientLayout : {
            id:'ClientDialog',
            title: 'Expresso Messenger',
            iconCls: 'messenger-icon-off',
            connected: false,
            status: '',
            width: 220,
            minWidth: 220,
            height: 420,
            minHeight: 270,
            closeAction: 'hide', //'close' - destroy the component
            collapsible: true,
            plain: true,
            autoScroll:   true,
            border: false,
            layout: 'border', // 'fit'
            listeners: {
                move: function(_box){
                    Tine.Messenger.Window._onMoveWindowAction(_box);
                }
            },
            tbar: {
                    cls: 'messenger-client-tbar',
                    items:[
                        {
                            //text: Tine.Tinebase.appMgr.get('Messenger').i18n.ngettext('Action', 'Actions', 1),
                            id: 'messenger-menu-actions',
                            text: 'Actions',
                            menu: {
                                    id: "BuddysMenu",
                                    items:[{
                                            id: 'messenger-contact-add',
                                            icon: '/images/messenger/user_add.png',
                                            //text: Tine.Tinebase.appMgr.get('Messenger').i18n.ngettext('Add Contact', 'Add Contact', 1),
                                            text: 'Add Contact',
                                            disabled: true,
                                            handler: function(){
                                                Tine.Messenger.Window.AddBuddyWindow();
                                            }
                                    },
                                    {
                                            id: 'messenger-group-mngt-add',
                                            //text: Tine.Tinebase.appMgr.get('Messenger').i18n.ngettext('Add Group', 'Add Group', 1),
                                            text: 'Add Group',
                                            icon: '/images/messenger/group_add.png',
                                            disabled: true,
                                            handler: function() {
                                                new Tine.Messenger.WindowConfig(Tine.Messenger.Window.Groups).show();
                                            }
                                     },
                                     {
                                         id: 'messenger-logout',
                                         //text: Tine.Tinebase.appMgr.get('Messenger').i18n.ngettext('Logout', 'Logout', 1),
                                         text: 'Logout',
                                         disabled: true,
                                         handler: function() {
                                             Tine.Messenger.ChatHandler.disconnect();
                                         }
                                     }
                                    ]
                                }
                        },
                        {
                            //text: Tine.Tinebase.appMgr.get('Messenger').i18n.ngettext('Preference', 'Preferences', 1),
                            id: 'messenger-menu-prefs',
                            text: 'Preferences',
                            handler: function () {
                                if (configWindow == null)
                                    configWindow = new Tine.Messenger.ConfigWindow();
                                
                                configWindow.show();
                            }
                        }]
            },
            items:[{
			region:'center',
			border:false,
                        bodyStyle:'padding:6px 3px 0 3px;',
			layout:'fit',
                        items: Tine.Messenger._Roster
                    } 
                    ,{
                        id: 'messenger-connect-display',
                        html: '<img src="/images/messenger/loading_animation_liferay.gif" style="display:none" />',
                        cls: 'messenger-connect-display',
                        region:'center',
                        border: false,
                        buttons: [
                                {
                                    id: 'messenger-connect-cmd',
                                    text: 'Connect',
                                    region:'center',
                                    cls: 'messenger-connect-cmd',
                                    handler: function() {
                                        Tine.Messenger.ChatHandler.connect();
                                    }
                                }
                            ]
                    }
		]
            ,bbar:{
                id: 'status-container',
                height: 27,
                cls: 'messenger-client-tbar',
                items: [{   
                        id: 'messenger-change-status-button',
                        icon: '/images/messenger/user_offline.png'
                    },
                    {xtype: 'tbspacer', width: 5},
                    {
                        xtype:'textfield',
//                        store: Tine.Messenger.factory.statusStore,
                        displayField:'text',
                        width: 175,
                        valueField:'value',
                        typeAhead: true,
                        name:'message',
                        mode: 'local',
                        triggerAction: 'all',
                        id:'messenger-status-box',
                        emptyText:'your Status... (press ENTER after)',
                        selectOnFocus:true
                    }
                ]
            }
    }
    
    , ChatWindowLayout : {
        iconCls:     'messenger-icon',
        cls:         'messenger-chat-window',
        width:       460,
        minWidth:    400,
        height:      360,
        minHeight:   280,
        closeAction: 'hide', //'close' - destroy the component
        collapsible: true,
        plain:       true,
        layout:      'border',
        listeners: {
            beforerender: function(_box){
                Tine.Messenger.AddItems(_box);
            },
            resize: function(_box, _width, _height){
                Tine.Messenger.ChatHandler.adjustChatAreaHeight(_box.id, _width, _height);
            },
            show: function () {
                this.setTextfieldFocus();
            },
            activate: function () {
                this.setTextfieldFocus();
            },
            expand: function () {
                this.setTextfieldFocus();
            }
        }
  }
    
}

Tine.Messenger.AddItems = function(_box) {
    if(!_box.items){
        var items = Array();
        var colW = 1,
            bodyroster = {},
            styleCls = '';
        if(_box.type == 'groupchat' && !_box.privy){
            colW = .75;
            styleCls += 'border-right-width: 2px;';
            bodyroster = ({
                            itemId: 'messenger-chat-body-roster',
                            columnWidth: .2,
                            border: false,
                            items: new Ext.tree.TreePanel({
                                    loader:       new Ext.tree.TreeLoader(),
                                    border:       false,
                                    cls:          'messenger-groupchat-roster',
                                    rootVisible:  false,
                                    
                                    root: new Ext.tree.AsyncTreeNode({
                                        expanded: true,
                                        leaf:     false,
                                        cls:      'messenger-groupchat-roster-tree'
                                    })
                                })
                        });
        }
        
        items.push(
                {
                    itemId: 'messenger-chat-table',
                    layout: 'column',
                    region: 'center',
                    minWidth: 210,
                    border: false,
                    autoScroll: true,
                    items: [{
                                itemId: 'messenger-chat-body',
                                xtype: 'panel',
                                border: styleCls ? true : false,
                                autoScroll: true,
                                cls: 'messenger-chat-body',
                                style: styleCls,
                                columnWidth: colW
                            }
                            ,bodyroster
                        ]
                }
            );
        items.push(
                {
                    itemId: 'messenger-chat-notifications',
                    cls: 'messenger-chat-notifications',
                    border: false,
                    html: ''  
                },
                {
                    region: 'south',
                    xtype: 'textfield',
                    height: 30,
                    cls:   'text-sender messenger-chat-field',
                    handleMouseEvents: true,
                    enableKeyEvents: true,
                    listeners: {
                        scope: this,
            //                        specialkey: function (field, ev) {
            //                             if (ev.getKey() == ev.ENTER && field.getValue().trim() != '') {
            //                                 Tine.Messenger.ChatHandler.sendMessage(field.getValue(), this.id);
            //                                 field.setValue("");
            //                                 Tine.Messenger.Chat.textToSend = '';
            //                             }
            //                        },
                        afterrender: function (field) {
                            field.focus(true, 200);
                        },
                        keypress: function (field, ev) {
                            var chatId = field.ownerCt.id,
                                type = field.ownerCt.type,
                                privy = field.ownerCt.privy,
                                old_id = field.ownerCt.initialConfig.id;
                            if(type == 'chat' || privy){
                                if(type == 'chat')
                                    Tine.Messenger.ChatHandler.sendState(chatId, 'composing');
                                if(type == 'groupchat')
                                    try{
                                        Tine.Messenger.Groupie.sendState(chatId, 'composing');
                                    }catch(err){
                                        Tine.Messenger.Log.error(err);
                                    }
                                if (ev.getKey() != ev.ENTER) {
//                                    if (Tine.Messenger.Chat.checkPauseInterval == null) {
//                                        Tine.Messenger.Chat.checkPauseInterval = setInterval(
//                                            function () {
//                                                Tine.Messenger.Log.debug('Set Interval '+Date());
//        //                                        console.log(Tine.Messenger.Chat.textToSend);
//                                                if (field.getValue() == Tine.Messenger.Chat.textToSend) {
//                                                    Tine.Messenger.ChatHandler.sendState(chatId, 'paused');
//                                                } else {
//                                                    Tine.Messenger.Chat.textToSend = field.getValue();
//                                                }
//                                            },
//                                            1000
//                                        );
//                                            //TODO: rever essa funcao. manda paused direto
//                                        setTimeout(
//                                            function(){
//                                                Tine.Messenger.Log.debug('Set Timeout: '+Date());
//                                                clearInterval(Tine.Messenger.Chat.checkPauseInterval);
//                                            },
//                                            3000
//                                        );
//                                    }
                                } else if (field.getValue().trim() != '') {
                                    Tine.Messenger.Chat.checkPauseInterval = null;
                                    if(type == 'chat')
                                        Tine.Messenger.ChatHandler.sendMessage(field.getValue(), chatId);
                                    if(type == 'groupchat')
                                        Tine.Messenger.Groupie.sendPrivMessage(field.getValue(), chatId, old_id);
                                    field.setValue("");
                                    Tine.Messenger.Chat.textToSend = '';
                                }
                            } else if (ev.getKey() == ev.ENTER && field.getValue().trim() != '') {
                                if(privy)
                                    Tine.Messenger.Groupie.sendPrivMessage(field.getValue(), chatId);
                                else
                                    Tine.Messenger.Groupie.sendPublMessage(field.getValue(), chatId);
                                field.setValue("");
                            }
                        }
                    }
                }
            );
//        return items;
         _box.add(items);
    }

};

Tine.Messenger.WindowLayout = {
    Buddy   : 'AddBuddyLayout',
    Groups  : 'AddGroupLayout',
    Chat    : 'JoinChatLogin'
};

Tine.Messenger.WindowConfig = function(window, args) {
    var app = Tine.Tinebase.appMgr.get('Messenger');
    var AddBuddyLayout = {
        id: 'messenger-contact-add-client',
        closeAction: 'close',
        layout: 'fit',
        plain: true,
        modal: true,
        title: app.i18n._('Add Contact'),
        listeners: {
            render: function(e){
                Ext.getCmp('messenger-contact-add-group').store
                    .loadData(
                        Tine.Messenger.RosterTree()
                        .getGroupsFromTree()
                    );
            }
        },
        items: [
            {
                xtype: 'form',
                border: false,
                items: [
                    {
                        xtype: 'textfield',
                        id: 'messenger-contact-add-jid',
                        fieldLabel: app.i18n._('JID'),
                        value: '',
                        disabled: false
                    },
                    {
                        xtype: 'textfield',
                        id: 'messenger-contact-add-name',
                        fieldLabel: app.i18n._('Name')
                    },
                    {
                        xtype: 'combo',
                        id: 'messenger-contact-add-group',
                        fieldLabel: app.i18n._('Group'),
                        store: new Ext.data.SimpleStore({
//                                        data: Tine.Messenger.RosterTree().getGroupsFromTree(),
                                        id: 0,
                                        fields: ['text']
                                }),
                        emptyText: app.i18n._('Select a group') + '...',
                        valueField: 'text',
                        displayField: 'text',
                        triggerAction: 'all',
                        editable: false,
                        mode : 'local'
                    },
                    {
                        xtype: 'button',
                        id: 'messenger-contact-add-button',
                        text: app.i18n._('Add'),
                        listeners: {
                            click: function () {
                               Tine.Messenger.Window.AddBuddyHandler(
                                                        Ext.getCmp('messenger-contact-add-client')
                                                    );
                            }
                        }
                    }
                ],
                keys: [
                    {
                        key: [Ext.EventObject.ENTER],
                        handler: function () {
                            Tine.Messenger.Window.AddBuddyHandler(
                                                    Ext.getCmp('messenger-contact-add-client')
                                                );
                        }
                    }
                ]
            }
        ]
    };
    
    var AddGroupLayout = {
        id: 'messenger-group-add-client',
        closeAction: 'close',
        layout: 'fit',
        plain: true,
        modal: true,
        title: app.i18n._('Add Group'),
        items: [{
                xtype: 'form',
                border: false,
                items: [
                    {
                        xtype: 'textfield',
                        id: 'messenger-group-mngt-name',
                        fieldLabel: app.i18n._('Name')
                    },
                    {
                        xtype: 'button',
                        id: 'messenger-group-mngt-button',
                        text: app.i18n._('Add'),
                        listeners: {
                            click: function () {
                                Tine.Messenger.Window.AddGroupHandler(
                                                        Ext.getCmp('messenger-group-add-client')
                                                    );
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
                    Tine.Messenger.Window.AddGroupHandler(
                                            Ext.getCmp('messenger-group-add-client')
                                        );
                }
            }
        ]
        
    };
    
    var JoinChatLogin = {
        id: 'messenger-groupchat',
        layout: 'anchor',
        closeAction: 'close',
        plain: true,
        width: 300,
        height: 150,
        minHeight: 150,
        title: app.i18n._('Join Groupchat'),
        modal: true,
        items: {
            xtype: 'form',
            border: false,
            items: [
                {
                    xtype: 'textfield',
                    id: 'messenger-groupchat-identity',
                    fieldLabel: app.i18n._('Identity'),
                    disabled: true
                },
                {
                    xtype: 'textfield',
                    id: 'messenger-groupchat-host',
                    fieldLabel: app.i18n._('Host')
                },
                {
                    xtype: 'textfield',
                    id: 'messenger-groupchat-room',
                    fieldLabel: app.i18n._('Room')
                },
                {
                    xtype: 'textfield',
                    id: 'messenger-groupchat-nick',
                    fieldLabel: app.i18n._('Nickname')
                },
                {
                    xtype: 'textfield',
                    inputType: 'password',
                    id: 'messenger-groupchat-pwd',
                    fieldLabel: app.i18n._('Password')
                },
                {
                    xtype: 'button',
                    text: app.i18n._('Join'),
                    listeners: {
                        click: function (ev, data) {
                            Tine.Messenger.Groupie.MUCLogin(Ext.getCmp('messenger-groupchat'));
                        }
                    }
                }
            ],

            keys: [
                {
                    key: [Ext.EventObject.ENTER],
                    handler: function () {
                        Tine.Messenger.Groupie.MUCLogin(Ext.getCmp('messenger-groupchat'));
                    }
                }
            ]
        }
    };
    
    var config = {};
    
    switch(window){
        case Tine.Messenger.WindowLayout.Buddy:
            config = AddBuddyLayout;
            break;
        case Tine.Messenger.WindowLayout.Groups:
            config = AddGroupLayout;
            break;
        case Tine.Messenger.WindowLayout.Chat:
            config = JoinChatLogin;
            break;
    }
    
    Tine.Messenger.WindowConfig.superclass.constructor.call(this,
        Ext.apply(config, args || {})
    );
};

Ext.extend(Tine.Messenger.WindowConfig, Ext.Window);
