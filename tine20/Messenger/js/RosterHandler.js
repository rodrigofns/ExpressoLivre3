Ext.ns('Tine.Messenger');

var contextMenu = new Ext.menu.Menu({
    floating: true,
    items: [
        {
            text: 'Rename',
            handler: function (choice, ev) {
                alert(choice.parentMenu.contactId);
                choice.parentMenu.hide();
            }
        },
        {
            text: 'Delete',
            handler: function (choice, ev) {
                alert(choice.parentMenu.contactId);
                choice.parentMenu.hide();
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
        contact.removeClass('messenger-contact-available');
        contact.removeClass('messenger-contact-unavailable');
        contact.removeClass('messenger-contact-away');
        contact.removeClass('messenger-contact-donotdisturb');
    },
    
    getContactElement: function (jid) {
        return Ext.getCmp('messenger-roster').getRootNode().findChild('id', jid);
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
    }
}