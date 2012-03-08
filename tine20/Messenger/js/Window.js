Ext.ns('Tine.Messenger');

var roster = new Ext.tree.TreePanel({
     id:           'messenger-roster',
     loader:       new Ext.tree.TreeLoader(),
     border:       false,
     cls:          'messenger-treeview',
     rootVisible:  false,
     renderTo:     Ext.getBody(),
     
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
    plain:       true,
    layout:      'fit',
    
    items:       roster,
    
    buttons: [{
        id: 'messenger-change-status-button',
        text: 'Change Status',
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
                                            if (!Tine.Tinebase.appMgr.get('Messenger').getConnection().connected)
                                                Tine.Messenger.ChatHandler.connect();
                                            else
                                                Tine.Messenger.Application.connection.send($pres());
                                        } else if (status == 2) {
                                            Tine.Messenger.ChatHandler.diconnect();
                                        } else if (status == 3) {
                                            Tine.Messenger.RosterHandler.setStatus('away', message);
                                        } else if (status == 4) {
                                            Tine.Messenger.RosterHandler.setStatus('dnd', message);
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
            text: 'Connect',
            handler: function() {
                if (this.getText() == 'Connect') {
                    Tine.Messenger.ChatHandler.connect();
                    // Commenting up, uncomment down!!
                    // Start your engines!
                    // Tine.Tinebase.appMgr.get('Messenger').startMessenger();
                } else if (this.getText() == 'Disconnect') {
                    Tine.Messenger.ChatHandler.disconnect();
                }
            }
    }],

    toggleConnectionButton: function () {
        var button = Ext.getCmp('messenger-connect-button');
        if (button.getText() == 'Connect') {
            button.setText('Disconnect');
        } else {
            button.setText('Connect');
        }
    }
    
});

var contextMenu = new Ext.menu.Menu({
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
                                    text: _('Rename it!'),
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
            text: 'Delete',
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
                                            Tine.Messenger.RosterHandler.deleteContact(jid);
                                        }
                                    }
                );
            }
        }
    ]
});

Tine.Messenger.Window.RosterTree = function(iq){
    var NO_GROUP = "No group";
    
    var createTree = function(xml) {
        addGroupToTree(null,xml);	//add groups
        addBuddyToTree(null,xml);	//add buddys

    }
    var addBuddyToTree = function(f,a){
            
        if(f){
            var item = $(f).find("item");
            var jid = item.attr("jid"),
                label = item.attr("name") || jid,
                subscription = item.attr("subscription");
            var appended = false;
            var status = '';
            var status_text = '';

            jid = Strophe.getBareJidFromJid(jid);

            var _buddy = new Ext.tree.TreeNode({ //buddy adden
                            id:jid,
                            status:status,
                            status_text:status_text,
                            jid:jid,
                            subscription:subscription,
                            hide:false,
                            text:label,
//                            icon:"/images/messenger/icon_"+status+".png",
                            cls:'messenger-contact',
                            allowDrag:true,
                            allowDrop:false
//                            qtip:"JID : "+jid+"<br/>Status : "+status+"<br/>Text : "+status_text+"<br/>Subscription : "+subscription
            });
            _buddy.on("dblclick",Tine.Messenger.RosterHandler.openChat);
            _buddy.on('contextmenu', function (el) {
                contextMenu.contactId = el.id;
                contextMenu.show(el.ui.getEl());
            });

            var rootNode = Ext.getCmp('messenger-roster').getRootNode();

            if(item.children("group").length > 0){
                item.children("group").each(function(g){
                    for(i=0; i < rootNode.childNodes.length; i++){
                        if(rootNode.childNodes[i].text == item.text()){
                            rootNode.childNodes[i].appendChild(_buddy).ui.addClass('messenger-contact-unavailable');
                            appended = true;
                        }
                    }
                });
            }
            if(!appended){
                rootNode.appendChild(_buddy).ui.addClass('messenger-contact-unavailable');
            }
        }else{
            $(a).find("item").each(function () {
                var jid = $(this).attr("jid"),
                    label = $(this).attr("name") || jid,
                    subscription = $(this).attr("subscription");
                var status = '';
                var status_text = '';

                jid = Strophe.getBareJidFromJid(jid);

                var _buddy = new Ext.tree.TreeNode({ //buddy adden
                                id:jid,
                                status:status,
                                status_text:status_text,
                                jid:jid,
                                subscription:subscription,
                                hide:false,
                                text:label,
//                                icon:"/images/messenger/icon_"+status+".png",
                                cls:'messenger-contact',
                                allowDrag:true,
                                allowDrop:false
//                                qtip:"JID : "+jid+"<br/>Status : "+status+"<br/>Text : "+status_text+"<br/>Subscription : "+subscription
                });
                _buddy.on("dblclick",Tine.Messenger.RosterHandler.openChat);
                _buddy.on('contextmenu', function (el) {
                    contextMenu.contactId = el.id;
                    contextMenu.show(el.ui.getEl());
                });
                var rootNode = Ext.getCmp('messenger-roster').getRootNode();

                if($(this).children("group").length > 0){
                    var i=0;
                    $(this).children("group").each(function(g){
                        for(i=0; i < rootNode.childNodes.length; i++){
                            if(rootNode.childNodes[i].text == $(this).text()){
                                rootNode.childNodes[i].appendChild(_buddy).ui.addClass('messenger-contact-unavailable');
                                appended = true;
                            }
                        }
                    });
                } else {
                    var hasGroupNoGroup = false;
                    for(i=0; i < rootNode.childNodes.length; i++){
                        if(rootNode.childNodes[i].text == _(NO_GROUP)){
                            hasGroupNoGroup = true;
                        }
                    }
                    if(!hasGroupNoGroup){
                        Tine.Messenger.Window.RosterTree().addGroup(_(NO_GROUP));
                        node = Ext.getCmp('messenger-roster').getRootNode().childNodes.length - 1;
                        Ext.getCmp('messenger-roster').getRootNode().childNodes[node].appendChild(_buddy).ui.addClass('messenger-contact-unavailable');
                    } else {
                        rootNode.appendChild(_buddy).ui.addClass('messenger-contact-unavailable');
                    }
                }
            });
        }
    }
    var addGroupToTree = function(f,a){
        var _group_name = '';
        
        if(f != null){
            _group_name = f;
            if(_group_name.trim() != ''){
                var _group = new Ext.tree.TreeNode({ //group adden
                                text:_group_name,
                                iconCls:"display:none;",
                                expanded:true,
                                expandable:true,
                                allowDrag:false,
                                "gname":_group_name
                });
                Ext.getCmp('messenger-roster').getRootNode().appendChild(_group);
            }
        }else{
            var _arr_groups = [];
            $(a).find("group").each(function(){
                _group_name = $(this).text();
                if($.inArray(_group_name, _arr_groups) === -1){
                    _arr_groups.push(_group_name);
                    var _group = new Ext.tree.TreeNode({ 
                                    text:_group_name,
                                    iconCls:"display:none;",
                                    expanded:true,
                                    expandable:true,
                                    allowDrag:false,
                                    "gname":_group_name
                    });
                    Ext.getCmp('messenger-roster').getRootNode().appendChild(_group);
                }
            });
        }
    }
    
    return {
        init : function(){
            createTree(iq);
        },
        addBuddy: function(e){
            addBuddyToTree(e)
        },
        addGroup: function(e){
            addGroupToTree(e);
        }
    }
}