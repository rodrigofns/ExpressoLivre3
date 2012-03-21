Ext.ns('Tine.Messenger');

Tine.Messenger.RosterHandler = {
    onStartRoster: function(iq) {
        Tine.Messenger.Log.info("Getting roster...");
        
        try {
            // Building initial Users and Groups Tree
//            new Tine.Messenger.Window.RosterTree(iq).init();

            // Send user presence
            Tine.Messenger.Application.connection.send($pres());
            // Modify Main Menu status
            Tine.Tinebase.MainScreen.getMainMenu().onlineStatus.setStatus('online');
            // Adding handler for roster presence
//            Tine.Tinebase.appMgr.get('Messenger').getConnection().addHandler(
//                Tine.Messenger.LogHandler.getPresence, 'jabber:client', 'presence'
//            );
        } catch (e) {
            alert('Something went wrong!\n'+e.getMessage());
            console.log(e);
        }
        
        Tine.Messenger.Log.info("ROSTER OK");
        
        return true;
    },
    
    onRosterUpdate: function (iq) {
        
        try {
            var query = $(iq).find('query[xmlns="jabber:iq:roster"]');

            if (query.length > 0) {
                var items = $(query).find('item');

                items.each(function () {
                    var jid = $(this).attr('jid'),
                        subscription = $(this).attr('subscription'),
                        contact = Tine.Messenger.RosterHandler.getContactElement(jid);
                    Tine.Messenger.Log.debug("Subsc:"+subscription);    
                    if (contact) {
                        var name = $(this).attr('name') || jid,
                            ask = $(this).attr('ask') || '',
                            group = $(this).find('group').text();
                        
                        switch(subscription){
                            case 'remove':
                                Tine.Messenger.RosterHandler.removeContactElement(jid);
                                break;
                            case 'none':
                                if(ask == 'subscribe'){
                                    Tine.Messenger.Window.RosterTree().updateBuddy(jid, ST_UNAVAILABLE, SB_SUBSCRIBE);
                                } else {
                                    Tine.Messenger.Window.RosterTree().updateBuddy(jid, ST_UNAVAILABLE, SB_NONE);
                                }
                                break;
//                            case 'to':
//                                // Subscribe automatically
//                                Tine.Messenger.LogHandler.sendSubscribeMessage(jid, 'subscribed');
//                                break;
                            case 'from':
                                Tine.Messenger.LogHandler.sendSubscribeMessage(jid, 'subscribe');
                                break;
                            default:
                                // Update the buddy name
                                contact.setText(name);
                                if(group && contact.parentNode.text != group){
                                    Tine.Messenger.RosterHandler.moveContactFromGroups(jid, group);
                                }
                        }
                    } else if(subscription == 'from'){
                        Tine.Messenger.Window.AddBuddyWindow(jid);
                        Tine.Messenger.LogHandler.sendSubscribeMessage(jid, 'subscribe');
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
    
    /**
     * @Deprecated
     */
    changeStatus: function (jid, status, status_text, message) {
        var contact;

        if (typeof jid == 'string')
            contact = Tine.Messenger.RosterHandler.getContactElement(jid);
        else
            contact = jid;
        
        Tine.Messenger.RosterHandler.resetStatus(contact.ui);
        contact.ui.addClass(status);
        contact.ui.textNode.setAttribute('qtip', "JID : "+jid+"<br>"+
                                        _('Status')+" : "+(status_text ? status_text : '')+"<br>"+
                                        _('Subscription')+" : "+ contact.attributes.subscription+
                                        (message ? '<br>'+message : ''));
        
        Tine.Messenger.Window.RosterTree().updateAskSubscriptionButton(jid, status);
    },
    
    /**
     * @Deprecated
     */
    resetStatus: function (contact) {
        contact.removeClass(AVAILABLE_CLASS);
        contact.removeClass(UNAVAILABLE_CLASS);
        contact.removeClass(AWAY_CLASS);
        contact.removeClass(XA_CLASS);
        contact.removeClass(DONOTDISTURB_CLASS);        
        contact.removeClass(WAITING_CLASS);
        contact.removeClass(UNSUBSCRIBED_CLASS);
        contact.removeClass(SUBSCRIBE_CLASS);
        contact.removeClass(FROM_CLASS);
        contact.removeClass(NONE_CLASS);
    },
    
    addContactElement: function (jid, name, group) {
//        var NO_GROUP = Tine.Messenger.Window.RosterTree().getNoGroup();
//        var jid_group = group || NO_GROUP,
//            groupNode = Ext.getCmp('messenger-roster').getRootNode().findChild('text', jid_group),
//            newNode = new Ext.tree.TreeNode({
//                id: jid,
//                text: name,
//                cls: 'messenger-contact',
//                allowDrag: true,
//                allowDrop: false
//            });
//            
//        newNode.on("dblclick",Tine.Messenger.RosterHandler.openChat);
//        newNode.on('contextmenu', function (el) {
//            contextMenu.contactId = el.id;
//            contextMenu.show(el.ui.getEl());
//        });
        
//        groupNode.appendChild(newNode);
//        Tine.Messenger.RosterHandler.changeStatus(newNode, WAITING_CLASS);
        var label = name || jid;
        var xml = "<iq><item subscription='to' name='"+label+"' jid='"+jid+"'>"+
			"	<group>"+((group) ? group : '')+"</group>"+
			"</item></iq>";
        Tine.Messenger.Window.RosterTree().addBuddy(xml);
    },
    
    /**
     * @Deprecated
     */
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
        Tine.Messenger.Log.error('getContactElement returned null'); 
        return null;
    },
    
    getContactElementGroup: function (jid) {
        var group = Tine.Messenger.RosterHandler.getContactElement(jid).parentNode.text;
        var NO_GROUP = Tine.Messenger.Window.RosterTree().getNoGroup();
        
        return (group == NO_GROUP) ? null : group;
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
        return (contact.ui.textNode.getAttribute('status') == _(ST_AVAILABLE) ? true : false);
//        return Ext.fly(contact.ui.elNode).hasClass(AVAILABLE_CLASS);
    },
    
    isContactUnavailable: function (jid) {
        var contact = Tine.Messenger.RosterHandler.getContactElement(jid);
        Tine.Messenger.Log.debug("Status: "+contact.ui.textNode.getAttribute('status'));
        return (contact.ui.textNode.getAttribute('status') == _(ST_UNAVAILABLE) ? true : false);
//        return Ext.fly(contact.ui.elNode).hasClass(UNAVAILABLE_CLASS);
    },
    
    isContactAway: function (jid) {
        var contact = Tine.Messenger.RosterHandler.getContactElement(jid);
        return (contact.ui.textNode.getAttribute('status') == _(ST_AWAY) ? true : false);
//        return Ext.fly(contact.ui.elNode).hasClass(AWAY_CLASS);
    },
    
    isContactDoNotDisturb: function (jid) {
        var contact = Tine.Messenger.RosterHandler.getContactElement(jid);
        return (contact.ui.textNode.getAttribute('status') == _(ST_DONOTDISTURB) ? true : false);
//        return Ext.fly(contact.ui.elNode).hasClass(DONOTDISTURB_CLASS);
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

         try{
        // Add buddy to server
        Tine.Tinebase.appMgr.get('Messenger').getConnection().sendIQ(iq);
        
        // Add buddy to list
        Tine.Messenger.RosterHandler.addContactElement(jid, name, group);
        
        // Ask subscription
        Tine.Messenger.LogHandler.sendSubscribeMessage(jid, 'subscribe');
        
         }catch(e){
             Tine.Messenger.Log.error(e.getMessage());
         }
            
//        Tine.Messenger.RosterHandler.contact_added = jid;
    },
    
    renameContact: function (jid, name, group) {
        if(group == null || group == ''){
            group = Tine.Messenger.RosterHandler.getContactElementGroup(jid);
        }
        var iq = $iq({type: "set"})
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
    
   /**
    * @method modifyContacts
    * @public
    * @param  buddys (type: array)
    * @description 
    */
    modifyContacts: function  (buddys){
        var NO_GROUP = Tine.Messenger.Window.RosterTree().getNoGroup();
        for(i=0; i<buddys.length; i++){
            var attr = buddys[i];
            attr[2] = (attr[2] != NO_GROUP) ? attr[2] : null;
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
        var _groups = Tine.Messenger.Window.RosterTree().getGroupsFromTree();
        var NO_GROUP = Tine.Messenger.Window.RosterTree().getNoGroup();
        if($.inArray(n_gname, _groups) == -1 && n_gname != NO_GROUP){
            var grpNode = Ext.getCmp('messenger-roster').getRootNode().findChild('text',gname);
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
        } else {
            Tine.Messenger.Log.info("Group name already exist");
        }
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
        var NO_GROUP = Tine.Messenger.Window.RosterTree().getNoGroup();
        if(!Ext.getCmp('messenger-roster').getRootNode().findChild('text', NO_GROUP)){
            Tine.Messenger.Window.RosterTree().addGroup(NO_GROUP);
        }
        var grpNewNode = Ext.getCmp('messenger-roster').getRootNode().findChild('text', NO_GROUP);
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
    },
    
    onRosterResult: function(iq){
        
        var from = $(iq).attr("from"),
            to = $(iq).attr("to"),
            xmlns = $(iq).attr("xmlns");
            
            from = Strophe.getBareJidFromJid(from);
            to = Strophe.getBareJidFromJid(to);
        
            if(from == to && xmlns == "jabber:client"){
                
                // Building initial Users and Groups Tree
                new Tine.Messenger.Window.RosterTree().init(iq);
                
                $(iq).find("item").each(function(){
                    var jid = $(this).attr("jid");
                    if($(this).attr("subscription") == "none"){
//                        if($(this).attr("ask") == 'subscribe'){
//                            Tine.Messenger.Window.RosterTree().updateBuddy(jid, ST_UNAVAILABLE, SB_SUBSCRIBE);
//                        } else {
                            Tine.Messenger.Window.RosterTree().updateBuddy(jid, ST_UNAVAILABLE, SB_NONE);
//                        }
                    }else  if($(this).attr("subscription") == "from"){
                        Tine.Messenger.Window.RosterTree().updateBuddy(jid, ST_UNAVAILABLE, SB_FROM);
                    }else  if($(this).attr("subscription") == "to"){
                        Tine.Messenger.Window.RosterTree().updateBuddy(jid, ST_UNAVAILABLE, SB_SUBSCRIBE);
                    }
                });
            }
        return true;
    }
}