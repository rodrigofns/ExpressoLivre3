Ext.ns('Tine.Messenger');

Tine.Messenger.RosterHandler = {
    _onStartRoster: function(iq) {
        Tine.Messenger.Log.info("Getting roster...");
        
        try {
            // Send user presence
            Tine.Messenger.Application.connection.send($pres());
            // Modify Main Menu status
            Tine.Tinebase.MainScreen.getMainMenu().onlineStatus.setStatus('online');
            
        } catch (e) {
            alert('Something went wrong!\n'+e.getMessage());
            console.log(e);
        }
        
        Tine.Messenger.Log.info("ROSTER OK");
        
        return true;
    },
    
    _onRosterUpdate: function (iq) {
        
        try {
            var query = $(iq).find('query[xmlns="jabber:iq:roster"]');

            if (query.length > 0) {
                var items = $(query).find('item');

                items.each(function () {
                    var jid = $(this).attr('jid'),
                        subscription = $(this).attr('subscription'),
                        contact = Tine.Messenger.RosterHandler.getContactElement(jid);
                    
                    if (contact) {
                        var name = $(this).attr('name') || jid,
                            ask = $(this).attr('ask') || '';
                        switch(subscription){
                            case 'remove':
//                                Tine.Messenger.RosterHandler.removeContactElement(jid);
                                if(contact.remove()){
                                    var label = contact.text || jid;
                                    Tine.Messenger.LogHandler.status(label, _('was successfully removed!'));
                                }
                                break;
                            case 'none':
                                if(ask == 'subscribe'){
//                                    Tine.Messenger.Window.RosterTree().updateBuddy(jid, ST_UNAVAILABLE, SB_SUBSCRIBE);
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
                        }
                        // Update the buddy name
                        contact.setText(name);
                    } else if(subscription == 'from'){
                        Tine.Messenger.Window.AddBuddyWindow(jid);
                        Tine.Messenger.LogHandler.sendSubscribeMessage(jid, SB_SUBSCRIBE);
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
        Tine.Messenger.RootNode().removeAll();
    },
    
    /**
     *
     * @description <b>deprecated</b>
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
     *
     * @description <b>deprecated</b>
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
    
    /**
     *
     * @description <b>deprecated</b>
     */
    addContactElement: function (jid, name, group) {
        var NO_GROUP = Tine.Messenger.Window.RosterTree().getNoGroup();
        var jid_group = group || NO_GROUP,
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
    
    /**
     *
     * @description <b>deprecated</b>
     */
    renameContactElement: function (jid, name) {
        Tine.Messenger.RosterHandler.getContactElement(jid).setText(name);
    },
    
    getContactElement: function (jid) {
        var rootNode = Tine.Messenger.RootNode();
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
    
    /**
     *
     * @description <b>deprecated</b>
     */
    getUserGroups: function () {
        var nodes = Ext.getCmp('messenger-roster').getRootNode().childNodes,
            txtNodes = new Array();

        for (var i=0; i<nodes.length; i++) {
            txtNodes.push([nodes[i].text]);
        }

        return txtNodes;
    },
    
    /**
     *
     * @description <b>deprecated</b>
     */
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
             // Add buddy to list
             if(Tine.Messenger.Window.RosterTree().addBuddy(jid, name, group)){
                // Add buddy to server
                Tine.Tinebase.appMgr.get('Messenger').getConnection().sendIQ(iq);

                // Ask subscription
                Tine.Messenger.LogHandler.sendSubscribeMessage(jid, 'subscribe');
                
                return true;
             }
            return false;
         }catch(e){
             Tine.Messenger.Log.error(e.getMessage());
             return false;
         }
         return false;
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
    * @method modifyBuddys
    * @public
    * @param  buddys (array)
    * @description buddys[][0] = jid of buddy<br>
    *              buddys[][1] = name of buddy <br>
    *              buddys[][2] = group of buddy
    */
    modifyBuddys: function(buddys){
        
        for(var i=0; i<buddys.length; i++){
            var attr = buddys[i];
            var jid = attr[0],
                name = attr[1],
                group = attr[2];
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
        }
    },
    
    renameGroup: function(gname, n_gname){
        var NO_GROUP = Tine.Messenger.Window.RosterTree().getNoGroup(),
            group_exist = Tine.Messenger.Window.RosterTree().groupExist(n_gname);
        
        if(!group_exist && n_gname != NO_GROUP){
            var grpNode = Tine.Messenger.RootNode().findChild('text',gname);
            var length = grpNode.childNodes.length;
            var buddys = [];
            for(var i=0; i < length; i++){
                var buddy = grpNode.childNodes[i];
                var attr = [];
                attr[0] = buddy.attributes.jid;
                attr[1] = buddy.text;
                attr[2] = n_gname;
                buddys[i] = attr;
            }
            Tine.Messenger.RosterHandler.modifyBuddys(buddys);
            grpNode.setText(n_gname);
            Tine.Messenger.LogHandler.status(_('Successful'), _('The group ') + gname + _(' was successfully renamed to ') + n_gname);
            
            return true;
        } else {
//            Tine.Messenger.LogHandler.status(_('Error'), n_gname + _(' already exist. It was not renamed.'));
            Tine.Messenger.Log.info("Group name already exist");
        }
        return false;
    },
    
    moveContactFromGroups: function(jid, new_group){
        var buddy = Tine.Messenger.RosterHandler.getContactElement(jid);
        var grpNode = Tine.Messenger.RootNode().findChild('text', new_group);
        if(grpNode && buddy){
            var buddys = new Array(), 
                attr = [];
                
            attr[0] = jid;
            attr[1] = buddy.text;
            attr[2] = grpNode.text;
            buddys.push(attr);
            
            buddy.parentNode.removeChild(buddy);
            grpNode.appendChild(buddy);
            Tine.Messenger.RosterHandler.modifyBuddys(buddys);
        }

    },
    
    removeGroup: function(gname){
        var root_node = Tine.Messenger.RootNode(),
            grpNode = root_node.findChild('text',gname),
            NO_GROUP = Tine.Messenger.Window.RosterTree().getNoGroup();
            
        if(!root_node.findChild('text', NO_GROUP)){
            Tine.Messenger.Window.RosterTree().addGroup(NO_GROUP);
        }
        var grpNewNode = root_node.findChild('text', NO_GROUP);
        var length = grpNode.childNodes.length;
        var buddys = [];
        for(var i=0; i < length; i++){
            var buddy = grpNode.childNodes[0];
            grpNewNode.appendChild(buddy);
            var attr = [];
            attr[0] = buddy.attributes.jid;
            attr[1] = buddy.text;
            buddys[i] = attr;
        }
        Tine.Messenger.RosterHandler.modifyBuddys(buddys);
        if(grpNode.remove()){
            Tine.Messenger.LogHandler.status(_('Successful'), _('The group ') + gname + _(' was successfully removed!'));
        } else {
            Tine.Messenger.LogHandler.status(_('Error'), _('The group ') + gname + _(' was not removed!'));
        }
    },
    
    _onRosterResult: function(iq){
        
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