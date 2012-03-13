Ext.ns('Tine.Messenger');

Tine.Messenger.RosterHandler = {
    onStartRoster: function(iq) {
        Tine.Messenger.Log.info("Getting roster...");
        
        try {
            // Building initial Users and Groups Tree
            new Tine.Messenger.Window.RosterTree(iq).init();

            // Send user presence
            Tine.Messenger.Application.connection.send($pres());
            // Modify Main Menu status
            Tine.Tinebase.MainScreen.getMainMenu().onlineStatus.setStatus('online');
            // Adding handler for roster presence
            Tine.Tinebase.appMgr.get('Messenger').getConnection().addHandler(
                Tine.Messenger.LogHandler.getPresence, 'jabber:client', 'presence'
            );
        } catch (e) {
            alert('Something went wrong!\n'+e.getMessage());
            console.log(e);
        }
        
        Tine.Messenger.Log.info("ROSTER OK");
        
        return true;
    },
    
    onRosterUpdate: function (iq) {
        try {
            var query = $(iq).find('query[xmlns="jabber:iq:roster"]'),
                group = ($(iq).find('group').length > 0) ? 
                            $(iq).find('group').text() :
                            null;

            if (query.length > 0) {
                var items = $(query).find('item');

                items.each(function () {
                    var jid = $(this).attr('jid'),
                        name = $(this).attr('name') || jid,
                        subscription = $(this).attr('subscription'),
                        ask = $(this).attr('ask'),
                        contact = Tine.Messenger.RosterHandler.getContactElement(jid);

                    if (contact) {
                        if (subscription == 'remove') {
                            Tine.Messenger.RosterHandler.removeContactElement(jid);
                        } else {
                            Tine.Messenger.RosterHandler.renameContactElement(jid, name);
                        }
                    } else {
                        Tine.Messenger.RosterHandler.addContactElement(jid, name, group);
                    }
                });
            }
        } catch (err) {
            alert('Something go wrong!');
            console.error(err);
        }
        
        return true;
    },
    
    openChat: function(e, t) {
        Tine.Messenger.ChatHandler.showChatWindow(e.id, e.text);
    },
    
    clearRoster: function () {
        Ext.getCmp('messenger-roster').getRootNode().removeAll();
    },
    
    changeStatus: function (jid, status) {
        var contact;

        if (typeof jid == 'string')
            contact = Tine.Messenger.RosterHandler.getContactElement(jid);
        else
            contact = jid;
        
        Tine.Messenger.RosterHandler.resetStatus(contact.ui);
        contact.ui.addClass(status);
    },
    
    resetStatus: function (contact) {
        contact.removeClass(AVAILABLE_CLASS);
        contact.removeClass(UNAVAILABLE_CLASS);
        contact.removeClass(AWAY_CLASS);
        contact.removeClass(DONOTDISTURB_CLASS);        
        contact.removeClass(WAITING_CLASS);
        contact.removeClass(UNSUBSCRIBED_CLASS);
    },
    
    addContactElement: function (jid, name, group) {
        var jid_group = group || _('No group'),
            groupNode = Ext.getCmp('messenger-roster').getRootNode().findChild('text', jid_group),
            newNode = new Ext.tree.TreeNode({
                id: jid,
                text: name,
                cls: 'messenger-contact',
                allowDrag: true,
                allowDrop: false
            });
            
        newNode.on("dblclick",Tine.Messenger.RosterHandler.openChat);
        newNode.on('contextmenu', function (el) {
            contextMenu.contactId = el.id;
            contextMenu.show(el.ui.getEl());
        });
        
        groupNode.appendChild(newNode);
        Tine.Messenger.RosterHandler.changeStatus(newNode, WAITING_CLASS);
    },
    
    renameContactElement: function (jid, name) {
        Tine.Messenger.RosterHandler.getContactElement(jid).setText(name);
    },
    
    getContactElement: function (jid) {
        var rootNode = Ext.getCmp('messenger-roster').getRootNode();
        
        for(var i = 0; i < rootNode.childNodes.length ; i++){
            var buddy = rootNode.childNodes[i].findChild('id', jid);
            if(buddy != null)
                return buddy;
        }
        
        return null;
    },
    
    getContactElementGroup: function (jid) {
        var group = Tine.Messenger.RosterHandler.getContactElement(jid).parentNode.text;
        
        return (group == _('No group')) ? null : group;
    },
    
    getUserGroups: function () {
        var nodes = Ext.getCmp('messenger-roster').getRootNode().childNodes,
            txtNodes = new Array();

        for (var i=0; i<nodes.length; i++) {
            txtNodes.push([nodes[i].text]);
        }

        return txtNodes;
    },
    
    removeContactElement: function (jid) {
        Tine.Messenger.RosterHandler.getContactElement(jid).remove();
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

    addContact: function(jid, name, group) {
        var iq = $iq({type: "set"})
                    .c("query", {"xmlns": "jabber:iq:roster"})
                    .c("item", {
                        jid: jid,
                        name: name
                    })
                    .c("group", {}, group);

        Tine.Tinebase.appMgr.get('Messenger').getConnection().sendIQ(iq);
        Tine.Tinebase.appMgr.get('Messenger').getConnection().send(
            $pres({
                to: jid,
                type: 'subscribe'
            })
        );
            
        Tine.Messenger.RosterHandler.contact_added = jid;
    },
    
    renameContact: function (jid, name) {
        var group = Tine.Messenger.RosterHandler.getContactElementGroup(jid),
            iq = $iq({type: "set"})
                    .c("query", {"xmlns": "jabber:iq:roster"})
                    .c("item", {
                        jid: jid,
                        name: name
                    });
                    
        if (group != null) {
            iq.c('group', {}, group);
        }
                    
        Tine.Tinebase.appMgr.get('Messenger').getConnection().sendIQ(iq);
    },
    
    removeContact: function (jid) {
        var iq = $iq({type: "set"})
                    .c("query", {"xmlns": "jabber:iq:roster"})
                    .c("item", {
                        jid: jid,
                        subscription: 'remove'
                    });
                    
        Tine.Tinebase.appMgr.get('Messenger').getConnection().sendIQ(iq);
    },
    
    modifyContacts: function  (buddys){
        for(i=0; i<buddys.length; i++){
            var attr = buddys[i];
            var iq = $iq({type: "set"})
                            .c("query", {"xmlns": "jabber:iq:roster"})
                            .c("item", {
                                jid: attr[0],
                                name: attr[1]
                            })
                            .c("group", {}, attr[2]);

                Tine.Tinebase.appMgr.get('Messenger').getConnection().sendIQ(iq);
        }
    },
    
    renameGroup: function(gname, n_gname){
        var grpNode = Ext.getCmp('messenger-roster').getRootNode().findChild('text',gname);
        Tine.Messenger.Log.debug("Renaming from '"+gname+"' to '"+n_gname+"'");
        
        var length = grpNode.childNodes.length;
        var buddys = [];
        for(i=0; i < length; i++){
            var buddy = grpNode.childNodes[i];
            var attr = [];
            attr[0] = buddy.attributes.jid;
            attr[1] = buddy.text;
            attr[2] = n_gname;
            buddys[i] = attr;
        }
        Tine.Messenger.RosterHandler.modifyContacts(buddys);
        grpNode.setText(n_gname);
    },
    
    moveContactFromGroups: function(jid, new_group){
        var buddy = Tine.Messenger.RosterHandler.getContactElement(jid);
        var group = Tine.Messenger.RosterHandler.getContactElementGroup(jid);
        if(group != new_group){
            var grpNode = Ext.getCmp('messenger-roster').getRootNode().findChild('text', new_group);
            var buddys = [], attr = [];
            attr[0] = buddy.attributes.jid;
            attr[1] = buddy.text;
            attr[2] = new_group;
            buddys[0] = attr;
            
            Tine.Messenger.RosterHandler.modifyContacts(buddys);
            buddy.parentNode.removeChild(buddy);
            grpNode.appendChild(buddy);
        }

    },
    
    removeGroup: function(gname){
        var grpNode = Ext.getCmp('messenger-roster').getRootNode().findChild('text',gname);
        if(!Ext.getCmp('messenger-roster').getRootNode().findChild('text','No group')){
            Tine.Messenger.Window.RosterTree().addGroup('No group');
        }
        var grpNewNode = Ext.getCmp('messenger-roster').getRootNode().findChild('text','No group');
        Tine.Messenger.Log.debug("Removing group '"+gname);
        var length = grpNode.childNodes.length;
        var buddys = [];
        for(i=0; i < length; i++){
            var buddy = grpNode.childNodes[0];
            grpNewNode.appendChild(buddy);
            var attr = [];
            attr[0] = buddy.attributes.jid;
            attr[1] = buddy.text;
            buddys[i] = attr;
        }
        Tine.Messenger.RosterHandler.modifyContacts(buddys);
        grpNode.remove();

    }
}