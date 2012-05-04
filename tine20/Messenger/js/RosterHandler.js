Ext.ns('Tine.Messenger');

Tine.Messenger.RosterHandler = {
    
    _onStartRoster: function(iq) {
        console.log('======> CHEGOU EM _onStartRoster');
        Tine.Messenger.Log.info("Getting roster...");
        
        try {
            // Send user presence
            Tine.Tinebase.appMgr.get('Messenger').getConnection().send($pres());
            // Modify Main Menu status
            Tine.Tinebase.MainScreen.getMainMenu().onlineStatus.setStatus('online');
            
            Tine.Messenger.RosterHandler.changeStatus(Ext.getCmp('ClientDialog').status);
            
        } catch (e) {
            alert('Something went wrong!\n'+e.getMessage());
            console.log(e);
        }
        
        Tine.Messenger.Log.info("ROSTER OK");
        
        return true;
    },
    
    _onRosterUpdate: function (iq) {
        console.log('======> CHEGOU EM _onRosterUpdate');
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
                                    var chat = Ext.getCmp(Tine.Messenger.ChatHandler.formatChatId(jid));
                                    if(chat){
                                        chat.close();
                                    }
                                }
                                break;
                                
                            case IMConst.SB_NONE:
                                if(ask == IMConst.SB_SUBSCRIBE){
                                    Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_UNAVAILABLE, IMConst.SB_SUBSCRIBE);
                                } else {
                                    Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_UNAVAILABLE, IMConst.SB_NONE);
                                }
                                break;
                                
                            case IMConst.SB_FROM:
                                Tine.Messenger.LogHandler.sendSubscribeMessage(jid, IMConst.SB_SUBSCRIBE);
                                break;
                        }
                        // Update the buddy name
                        contact.setText(name);
                    } else if(subscription == IMConst.SB_FROM){
//                        Tine.Messenger.Window.AddBuddyWindow(jid);
                        Tine.Messenger.Window.AddBuddyWindow(jid);
                        Tine.Messenger.LogHandler.sendSubscribeMessage(jid, IMConst.SB_SUBSCRIBE);
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
        Tine.Messenger.ChatHandler.showChatWindow(e.id, e.text, 'chat');
    },
    
    clearRoster: function () {
        Tine.Messenger.RootNode().removeAll();
    },
    
    getContactElement: function (jid) {
        var rootNode = Tine.Messenger.RootNode();
        for(var i = 0; i < rootNode.childNodes.length ; i++){
            var buddy = rootNode.childNodes[i].findChild('id', jid);
            if(buddy != null)
                return buddy;
        }
        Tine.Messenger.Log.warn('getContactElement returned null'); 
        return null;
    },
    
    getContactElementGroup: function (jid) {
        var group = Tine.Messenger.RosterHandler.getContactElement(jid).parentNode.text;
        var NO_GROUP = Tine.Messenger.RosterTree().getNoGroup();
        
        return (group == NO_GROUP) ? null : group;
    },
    
    isContactAvailable: function (jid) {
        var contact = Tine.Messenger.RosterHandler.getContactElement(jid);
        if(contact)
            return (contact.attributes.status == IMConst.ST_AVAILABLE.id);
        return null;
    },
    
    isContactUnavailable: function (jid) {
        var contact = Tine.Messenger.RosterHandler.getContactElement(jid);
        if(contact)
            return (contact.attributes.status == IMConst.ST_UNAVAILABLE.id);
        return null;
    },
    
    isContactAway: function (jid) {
        var contact = Tine.Messenger.RosterHandler.getContactElement(jid);
        if(contact)
            return (contact.attributes.status == IMConst.ST_AWAY.id);
        return null;
    },
    
    isContactDoNotDisturb: function (jid) {
        var contact = Tine.Messenger.RosterHandler.getContactElement(jid);
        if(contact)
            return (contact.attributes.status == IMConst.ST_DONOTDISTURB.id);
        return null;
    },
    
    setStatus: function(status, text) {
        var presence = $pres().c('show').t(status).up().c('status').t(text);
        Tine.Messenger.Application.connection.send(presence);
    },
    
    changeStatus: function(status, statusText) {
        
        var statusValue = '',
            statusItems = Tine.Messenger.factory.statusStore.data.items;
        statusText = statusText ? statusText : '';
        for(var i=0; i < statusItems.length; i++){
            if(statusItems[i].data.value == status){
                statusValue = statusItems[i].data.text;
            }
        }
        
        if(status != 'unavailable' && !Ext.getCmp('ClientDialog').connected){
            Tine.Messenger.ChatHandler.connect();
        } else {
            switch(status){
                case 'available':
                case 'away':
                case 'dnd':
                    var presence = $pres().c('show').t(status).up().c('status').t(statusText);
                    break;

                case 'unavailable':
                    Tine.Messenger.ChatHandler.disconnect();
                    break;
            }
            if(statusValue != ''){
                Tine.Messenger.Application.connection.send(presence);
                Ext.getCmp('messenger-change-status-button')
                        .setIcon('/images/messenger/user_'+status+'.png')
                        .setTooltip(_(statusValue));
            }
        }
        
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
             if(Tine.Messenger.RosterTree().addBuddy(jid, name, group)){
                // Add buddy to server
                Tine.Tinebase.appMgr.get('Messenger').getConnection().sendIQ(iq);

                // Ask subscription
                Tine.Messenger.LogHandler.sendSubscribeMessage(jid, IMConst.SB_SUBSCRIBE);
                
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
    
    _onRosterGet: function(iq){
        var type = $(iq).find("query").attr("xmlns");
        
        if(type == "http://jabber.org/protocol/disco#info"){
            var iq = $iq({to: 'fulano@simdev.sdr.serpro/expresso-3.0', type: "result"})
                    .c("query", {"xmlns": "http://jabber.org/protocol/disco#info"})
                    .c("feature", {"var": "http://jabber.org/protocol/bytestreams"}).up()
                    .c("feature", {"var": "http://jabber.org/protocol/disco#info"}).up()
                    .c("feature", {"var": "http://jabber.org/protocol/disco#items"}).up()
                    .c("feature", {"var": "http://jabber.org/protocol/muc"}).up()
                    .c("feature", {"var": "http://jabber.org/protocol/si/profile/file-transfer"}).up()
                    .c("feature", {"var": "urn:xmpp:jingle:transports:raw-udp:1"}).up()
                    .c("feature", {"var": "http://www.google.com/xmpp/protocol/session"}).up();

            Tine.Tinebase.appMgr.get('Messenger').getConnection().sendIQ(iq);
            Tine.Messenger.Log.debug("Eniou o iq result");
        }
    },
    
    renameContact: function (jid, name, group) {
        var old_group = Tine.Messenger.RosterHandler.getContactElementGroup(jid);
        if(group == null || group == ''){
            group = old_group ? old_group : '';
        } else {
            if(group != old_group){
                Tine.Messenger.RosterHandler.moveContactFromGroups(jid, group);
            }
        }
        
        var iq = $iq({type: "set"})
                .c("query", {"xmlns": "jabber:iq:roster"})
                .c("item", {
                    jid: jid,
                    name: name || jid
                })
                .c('group', {}, group);
                    
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
                name = attr[1] || jid,
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
    
    renameGroup: function(_et, n_gname, gname){
        
        var NO_GROUP = Tine.Messenger.RosterTree().getNoGroup();
        if(n_gname != NO_GROUP){
            var grpNode = Tine.Messenger.RootNode().findChild('text', n_gname);
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
//            grpNode.setText(n_gname);
            Tine.Messenger.LogHandler.status(_('Successful'), _('The group ') + gname + _(' was successfully renamed to ') + n_gname);
            
            return true;
        } else {
//            Tine.Messenger.LogHandler.status(_('Error'), n_gname + _(' already exist. It was not renamed.'));
            Tine.Messenger.Log.info("Rename to No Group name is not permitted.");
        }
        return false;
    },
    
    moveContactFromGroups: function(jid, new_group){
        var buddy = Tine.Messenger.RosterHandler.getContactElement(jid);
        var grpNode = Tine.Messenger.RootNode().findChild('text', new_group);
        if(!grpNode){
            Tine.Messenger.RosterTree().addGroup(new_group);
            grpNode = Tine.Messenger.RootNode().findChild('text', new_group);
        }
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
            NO_GROUP = Tine.Messenger.RosterTree().getNoGroup();
            
        if(!root_node.findChild('text', NO_GROUP)){
            Tine.Messenger.RosterTree().addGroup(NO_GROUP);
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
            new Tine.Messenger.RosterTree(iq).init();

            $(iq).find("item").each(function(){
                var jid = $(this).attr("jid");
                if($(this).attr("subscription") == "none"){
//                        if($(this).attr("ask") == 'subscribe'){
//                            Tine.Messenger.RosterTree().updateBuddy(jid, ST_UNAVAILABLE, SB_SUBSCRIBE);
//                        } else {
                        Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_UNAVAILABLE, IMConst.SB_NONE);
//                        }
                }else  if($(this).attr("subscription") == "from"){
                    Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_UNAVAILABLE, IMConst.SB_FROM);
                }else  if($(this).attr("subscription") == "to"){
                    Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_UNAVAILABLE, IMConst.SB_SUBSCRIBE);
                }
            });
        }
        return true;
    }
    
}
