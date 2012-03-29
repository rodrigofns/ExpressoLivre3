
Ext.ns('Tine.Messenger');

Tine.Messenger.ClientDialog = function(_config){
    var extDialog=null;
    var config=_config;
    var id="ClientDialog";
    var opener=Ext.getBody();
    var status = "";
    var createDialog=function(){
        extDialog=new Ext.Window(config);
//        extDialog.setTitle(ExtJame.myJid);
        extDialog.show(opener);
        Ext.getCmp('status-box').on("select", changeState);
        Ext.getCmp('status-box').on("specialkey", changeState);
        extDialog.doLayout();
    }
    
    var changeState = function(_box,_data,_val){
//                console.log(_box); console.log(_data); console.log(_val);
                var value = _box.value,
                    valueText = _box.lastSelectionText,
                    message = _box.lastQuery;
		try{
                    if(_data.ENTER){
                        if(_box.lastQuery){
                            changeStateAction(value, valueText, message);
//                                Tine.Messenger.Log.debug("On enter: "+ value+":"+ valueText +" - "+ message);
                        }
                    }else if(_data.data){
                        changeStateAction(value, valueText, message);
//                            Tine.Messenger.Log.debug("On data: "+ value+":"+ valueText +" - "+ message);
                    }
		}catch(e){
			//TODO
		}
	}
    var changeStateAction = function(value, valueText, message) {
        
        if(value != 'unavailable' && !Ext.getCmp('ClientDialog').connected){
            Tine.Messenger.ChatHandler.connect();
        } else {
            switch(value){
                case 'available':
                    value = 'online';
                    break;

                case 'away':
                case 'dnd':
                    Tine.Messenger.RosterHandler.setStatus(value, message);
                    break;

                case 'unavailable':
                    Tine.Messenger.ChatHandler.disconnect();
                    value = 'offline';
                    break;
            }
            Ext.getCmp('messenger-change-status-button')
                    .setIcon('/images/messenger/user_'+value+'.png')
                    .setTooltip(_(valueText));
        }
        
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
                                    autoScroll:   true,
                                    
                                    root: new Ext.tree.AsyncTreeNode({
                                        expanded: true,
                                        leaf:     false
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
Tine.Messenger.Config = {
    
    ClientLayout : {
            id:'ClientDialog',
            title: 'Expresso Messenger',
            iconCls: 'messenger-icon-off',
            connected: false,
            width: 220,
            minWidth: 220,
            height: 420,
            minHeight: 270,
            closeAction: 'hide', //'close' - destroy the component
            collapsible: true,
            plain: true,
            border: false,
            layout: 'border', // 'fit'
            tbar: {
                    cls: 'messenger-client-tbar',
                    items:[
//                        {
//                            id: 'BuddyCredencial',
//                            html: Tine.Messenger.Credential.getHtml(),
//                            width:145
//                        },
                        {
                            text:'Actions',
                            menu: {
                                    id: "BuddysMenu",
                                    items:[{
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
//                                                Tine.Messenger.Window._AddGroupWindow();
                                                new Tine.Messenger.SimpleDialog(
                                                        Tine.Messenger.Config.AddGroupLayout
                                                    ).init();
                                            }
                                        }]
                                }
                        }]
            },
            items:[{
			region:'center',
			minHeight:190,
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
                        
                    ,{
			region:'south',
			id:'status-container',
			height:27,
			bodyStyle:'background:transparent;padding:0px;',
			border:false,
			xtype:'form',
			hideLabels:true,
			bodyBorder:false,
                        tbar: {
                            cls: 'messenger-client-tbar',
                            items: [{   
                                    id: 'messenger-change-status-button',
                                    icon: '/images/messenger/user_offline.png'
                                },
                                {xtype: 'tbspacer', width: 5},
                                {
                                    xtype:'combo',
                                    store: Tine.Messenger.factory.statusStore,
                                    displayField:'text',
                                    valueField:'value',
                                    typeAhead: true,
                                    name:'message',
                                    mode: 'local',
                                    triggerAction: 'all',
                                    id:'status-box',
                                    emptyText:'your Status...',
                                    selectOnFocus:true
                                }
//                                ,{xtype: 'tbspacer'},
//                                {
//                                    id: 'messenger-connect-button',
//                                    width: 32,
//                                    tooltip: 'Connect',
//                                    connectionStatus: 'Connect',
//                                    icon: '/images/messenger/disconnected.png',
//                                    handler: function() {
//                                        if (this.connectionStatus == 'Connect') {
//                                            Tine.Messenger.ChatHandler.connect();
//                                            // Commenting up, uncomment down!!
//                                            // Start your engines!
//                                            // Tine.Tinebase.appMgr.get('Messenger').startMessenger();
//                                        } else if (this.connectionStatus == 'Disconnect') {
//                                            Tine.Messenger.ChatHandler.disconnect();
//                                        }
//                                    }
//                                }
                            ]
                        }
		}]
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
                               Tine.Messenger.Window.AddBuddyHandler(Ext.getCmp('messenger-contact-add-client'));
                            }
                        }
                    }
                ],
                keys: [
                    {
                        key: [Ext.EventObject.ENTER],
                        handler: function () {
                            Tine.Messenger.Window.AddBuddyHandler(Ext.getCmp('messenger-contact-add-client'));
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
                                Tine.Messenger.Window.AddGroupHandler(Ext.getCmp('messenger-group-add-client'));
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
                    Tine.Messenger.Window.AddGroupHandler(Ext.getCmp('messenger-group-add-client'));
                }
            }
        ]
        
    }
    
}