
Ext.ns('Tine.Messenger');

Tine.Messenger.ClientDialog = function(_config){
    var extDialog=null;
    var config=_config;
    var id="ClientDialog";
    var opener=Ext.getBody();
    var status = "";
    var statusText = "";
    var createDialog=function(){
        extDialog=new Ext.Window(config);
//        extDialog.setTitle(Tine.Messenger.Credential.myJid());
        extDialog.show(opener);
//        Ext.getCmp('status-box').on("select", changeState);
        Ext.getCmp('status-box').on("specialkey", changeStateText);
        Ext.getCmp('messenger-change-status-button').on("click", statusMenu);
        extDialog.doLayout();
    }
    
    var changeStateText = function(_box){
        var stText = _box.getValue().trim();
        if(stText != statusText && Ext.getCmp('ClientDialog').connected){
            statusText = stText;
            Tine.Messenger.RosterHandler.changeStatus(status, statusText);
        }
    }
    
    var changeStateHandler = function(_e){
        if(_e.value != status){
            Ext.getCmp('ClientDialog').status = status = _e.value;
            Tine.Messenger.RosterHandler.changeStatus(status, statusText);
        }
    }
    
    var statusMenu = function(_box){
            var items = Array(),
                statusItems = Tine.Messenger.factory.statusStore.data.items;
            
            for(var i=0; i < statusItems.length; i++){
                var text = _(statusItems[i].data.text),
                    value = statusItems[i].data.value;
                items.push({text: text,
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
    
    return{
        init:function(){
            if(!extDialog){
                createDialog();
            }
        }
    }
}

Tine.Messenger._Roster = new Ext.tree.TreePanel({
                                    id:           'messenger-roster',
                                    loader:       new Ext.tree.TreeLoader(),
                                    border:       false,
                                    cls:          'messenger-treeview',
                                    rootVisible:  false,
//                                    renderTo:     Ext.getBody(),
                                    
                                    root: new Ext.tree.AsyncTreeNode({
                                        expanded: true,
                                        leaf:     false
                                    })
                                })
                                
Tine.Messenger._ChatRoster = new Ext.tree.TreePanel({
//                                    id:           'messenger-groupchat-roster',
                                    loader:       new Ext.tree.TreeLoader(),
                                    border:       false,
                                    cls:          'messenger-groupchat-roster',
                                    rootVisible:  false,
//                                    width: 200,
//                                    renderTo:     Ext.getBody(),
                                    
                                    root: new Ext.tree.AsyncTreeNode({
                                        expanded: true,
                                        leaf:     false,
                                        cls:      'messenger-groupchat-roster-tree'
                                    })
                                })
                                
Tine.Messenger.SimpleDialog = function(_config){
    var extDialog=null;
    var config=_config;
    var opener=Ext.getBody();
    var createDialog=function(){
        extDialog=new Ext.Window(config);
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
                            text: _('Actions'),
                            menu: {
                                    id: "BuddysMenu",
                                    items:[{
                                            id: 'messenger-contact-add',
                                            icon: '/images/messenger/user_add.png',
                                            text: _('Add Contact'),
                                            disabled: true,
                                            handler: function(){
                                                Tine.Messenger.Window.AddBuddyWindow();
                                            }
                                    },
                                    {
                                            id: 'messenger-group-mngt-add',
                                            text: _('Add Group'),
                                            icon: '/images/messenger/group_add.png',
                                            disabled: true,
                                            handler: function() {
                                                new Tine.Messenger.SimpleDialog(
                                                        Tine.Messenger.Config.AddGroupLayout
                                                    ).init();
                                            }
                                     },
                                     {
                                         id: 'messenger-logout',
                                         text: _('Logout'),
                                         disabled: true,
                                         handler: function() {
                                             Tine.Messenger.ChatHandler.disconnect();
                                         }
                                     }
                                    ]
                                }
                        },
                        {
                            text: _('Preferences'),
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
                        id:'status-box',
                        emptyText:'your Status... (press ENTER after)',
                        selectOnFocus:true
                    }
                ]
            }
    }
    
    , AddBuddyLayout: {
        id: 'messenger-contact-add-client',
        closeAction: 'close',
        layout: 'fit',
        plain: true,
        modal: true,
        title: 'Add Contact',
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
                        fieldLabel: 'JID',
                        value: '',
                        disabled: false
                    },
                    {
                        xtype: 'textfield',
                        id: 'messenger-contact-add-name',
                        fieldLabel: 'Name'
                    },
                    {
                        xtype: 'combo',
                        id: 'messenger-contact-add-group',
                        fieldLabel: 'Group',
                        store: new Ext.data.SimpleStore({
//                                        data: Tine.Messenger.RosterTree().getGroupsFromTree(),
                                        id: 0,
                                        fields: ['text']
                                }),
                        emptyText: 'Select a group' + '...',
                        valueField: 'text',
                        displayField: 'text',
                        triggerAction: 'all',
                        editable: false,
                        mode : 'local'
                    },
                    {
                        xtype: 'button',
                        id: 'messenger-contact-add-button',
                        text: 'Add',
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
    }
    
    , AddGroupLayout: {
        id: 'messenger-group-add-client',
        closeAction: 'close',
        layout: 'fit',
        plain: true,
        modal: true,
        title: 'Add Group',
        items: [{
                xtype: 'form',
                border: false,
                items: [
                    {
                        xtype: 'textfield',
                        id: 'messenger-group-mngt-name',
                        fieldLabel: 'Name'
                    },
                    {
                        xtype: 'button',
                        id: 'messenger-group-mngt-button',
                        text: 'Add',
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
            }
        }
  }
  
 ,JoinChatLogin : {
    id: 'messenger-groupchat',
    layout: 'anchor',
    closeAction: 'close',
    plain: true,
    width: 300,
    height: 150,
    minHeight: 150,
    title: 'Join Groupchat',
    modal: true,
    items: {
        xtype: 'form',
        border: false,
        items: [
            {
                xtype: 'textfield',
                id: 'messenger-groupchat-identity',
                fieldLabel: 'Identity',
                disabled: true
            },
            {
                xtype: 'textfield',
                id: 'messenger-groupchat-host',
                fieldLabel: 'Host'
            },
            {
                xtype: 'textfield',
                id: 'messenger-groupchat-room',
                fieldLabel: 'Room'
            },
            {
                xtype: 'textfield',
                id: 'messenger-groupchat-nick',
                fieldLabel: 'Nickname'
            },
            {
                xtype: 'textfield',
                inputType: 'password',
                id: 'messenger-groupchat-pwd',
                fieldLabel: 'Password'
            },
            {
                xtype: 'button',
                text: 'Join',
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
                    itemId: 'messenger-chat-field',
                    region: 'south',
                    xtype: 'textfield',
                    height: 30,
                    cls:   'text-sender',
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

}