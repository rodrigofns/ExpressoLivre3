Ext.ns('Tine.Messenger');

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

Tine.Messenger.RosterHandler = {
    onStartRoster: function(iq) {
        Tine.Messenger.Log.info("Getting roster...");
        var node = null;
        Tine.Messenger.RosterHandler.getGroupsFromResponse(iq);
        $(iq).find("item").each(function () {
            var jid = $(this).attr("jid"),
                name = $(this).attr("name") || jid,
                subscription = $(this).attr("subscription");

            jid = Strophe.getBareJidFromJid(jid);
            node = new Ext.tree.TreeNode( {text:name, 
                                            cls:'messenger-contact',
                                            id: jid,
                                            leaf: true
                                          } );
            node.on('dblclick', Tine.Messenger.RosterHandler.openChat);
            node.on('contextmenu', function (el) {
                contextMenu.contactId = el.id;
                contextMenu.show(el.ui.getEl());
            });
            
            var rootNode = Ext.getCmp('messenger-roster').getRootNode();
            var i=0;
            if($(this).children("group").length > 0){
                $(this).children("group").each(function(){
                    for(i=0; i < rootNode.childNodes.length; i++){
                        if(rootNode.childNodes[i].text == $(this).text()){
                            rootNode.childNodes[i].appendChild(node).ui.addClass('messenger-contact-unavailable');
                        }
                    }
                });
            } else {
                rootNode.appendChild(node).ui.addClass('messenger-contact-unavailable');
            }
//            Ext.getCmp('messenger-roster').getRootNode().appendChild(node).ui.addClass('messenger-contact-unavailable');
//            Ext.getCmp('messenger-roster')
//               .getRootNode()
//               .findChild('id', jid)
//               .ui.addClass('messenger-contact-unavailable');
        });
        // Send user presence
        Tine.Messenger.Application.connection.send($pres());
        // Modify Main Menu status
        Tine.Tinebase.MainScreen.getMainMenu().onlineStatus.setStatus('online');
        // Adding handler for roster presence
        Tine.Tinebase.appMgr.get('Messenger').getConnection().addHandler(
            Tine.Messenger.LogHandler.getPresence, null, 'presence'
        );
            
        return true;
    },
    
    openChat: function(e, t) {
        Tine.Messenger.ChatHandler.showChatWindow(e.id, e.text);
    },
    
    clearRoster: function () {
        Ext.getCmp('messenger-roster').getRootNode().removeAll();
        Tine.Messenger.Window.toggleConnectionButton();
    },
    
    changeStatus: function (jid, status) {
        var contact = Ext.getCmp('messenger-roster').getRootNode().findChild('id', jid);
        
        Tine.Messenger.RosterHandler.resetStatus(contact.ui);
        contact.ui.addClass('messenger-contact-' + status);
    },
    
    resetStatus: function (contact) {
        contact.removeClass(AVAILABLE_CLASS);
        contact.removeClass(UNAVAILABLE_CLASS);
        contact.removeClass(AWAY_CLASS);
        contact.removeClass(DONOTDISTURB_CLASS);
    },
    
    getContactElement: function (jid) {
        return Ext.getCmp('messenger-roster').getRootNode().findChild('id', jid);
    },
    
    removeContactElement: function (jid) {
        Tine.Messenger.RosterHandler.getContactElement(jid).remove(true);
    },
    
    isContactAvailable: function (jid) {
        var contact = Tine.Messenger.RosterHandler.getContactElement(jid);
        
        return Ext.fly(contact.ui.elNode).hasClass(AVAILABLE_CLASS);
    },
    
    isContactUnavailable: function (jid) {
        var contact = Tine.Messenger.RosterHandler.getContactElement(jid);
        
        return Ext.fly(contact.ui.elNode).hasClass(UNAVAILABLE_CLASS);
    },
    
    isContactAway: function (jid) {
        var contact = Tine.Messenger.RosterHandler.getContactElement(jid);
        
        return Ext.fly(contact.ui.elNode).hasClass(AWAY_CLASS);
    },
    
    isContactDoNotDisturb: function (jid) {
        var contact = Tine.Messenger.RosterHandler.getContactElement(jid);
        
        return Ext.fly(contact.ui.elNode).hasClass(DONOTDISTURB_CLASS);
    },
    
    setStatus: function(status, text) {
        var presence = $pres().c('show').t(status).up().c('status').t(text);
        Tine.Messenger.Application.connection.send(presence);
    },
    
    getGroupsFromResponse : function(el){
        var group_tree = null;
        var arr_groups = [];
        var group_name = '';
        $(el).find("group").each(function(){
            group_name = $(this).text()
            if($.inArray(group_name, arr_groups) === -1){
                arr_groups.push(group_name);
                
                group_tree = new Ext.tree.TreeNode({ //group adden
                                text:group_name,
                                iconCls:"display:none;",
                                expanded:true,
                                expandable:true,
                                allowDrag:false,
                                "gname":group_name
                });
                Ext.getCmp('messenger-roster').getRootNode().appendChild(group_tree);
            }
        });
        return true;
    },
    
    addContact: function(jid, name) {
        
    },
    
    renameContact: function (jid, name) {
        var iq = $iq({type: "set"})
                    .c("query", {"xmlns": "jabber:iq:roster"})
                    .c("item", {
                        jid: jid,
                        name: name
                    });
                    
        Tine.Tinebase.appMgr.get('Messenger').getConnection().sendIQ(iq);
        
        Tine.Messenger.RosterHandler.getContactElement(jid).setText(name);
    },
    
    deleteContact: function (jid) {
        var iq = $iq({type: "set"})
                    .c("query", {"xmlns": "jabber:iq:roster"})
                    .c("item", {
                        jid: jid,
                        subscription: 'remove'
                    });
                    
        Tine.Tinebase.appMgr.get('Messenger').getConnection().sendIQ(iq);
        
        Tine.Messenger.RosterHandler.removeContactElement(jid);
    }
}