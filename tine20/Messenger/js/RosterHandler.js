Ext.ns('Tine.Messenger');

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
    getUserFromResponse : function(el){
            if(el.getElementsByTagName("methodResponse")[0]){
                    var response = el.getElementsByTagName("methodResponse")[0];
                    var me = response.getElementsByTagName("you")[0];
                    if(me){
                            ExtJame.myJid = me.getElementsByTagName("name")[0].firstChild.nodeValue;
                            return true;
                    }
            }else{
                    return false;
            }
    },
    getBuddyFromResponse : function(el){
        Tine.Messenger.Log.debug("Chamou o buddy com el=");
            var buddy = el;
            var buddy_attrs = new Object();
            buddy_attrs["jid"] = buddy.attr("jid");
            for(var x=0; x<buddy.childNodes.length; x++){
                    if(buddy.childNodes[x].nodeType == 1){
                            switch(buddy.childNodes[x].nodeName){
                                    case "name" :{
                                            buddy_attrs["name"] = buddy.childNodes[x].firstChild ? buddy.childNodes[x].firstChild.nodeValue : "";
                                            break;
                                    }
                                    case "status":{
                                            buddy_attrs["status"] = buddy.childNodes[x].getAttribute("type")? buddy.childNodes[x].getAttribute("type") : "";
                                            buddy_attrs["subscription"] = buddy.childNodes[x].getAttribute("subscription")? buddy.childNodes[x].getAttribute("subscription") : "";
                                            buddy_attrs["status_text"] =  buddy.childNodes[x].firstChild ?  buddy.childNodes[x].firstChild.nodeValue : "";
                                            break;
                                    }
                                    case "group":{
                                            buddy_attrs["group"] = buddy.childNodes[x].firstChild ? buddy.childNodes[x].firstChild.nodeValue : "";
                                            break;
                                    }
                                    default:break;
                            }
                    }
            }
            return buddy_attrs;
    },
    getBuddysFromResponse : function(el){
            var buddys = el.getElementsByTagName("buddys")[0].childNodes;
            var ret = Array();
            if(buddys.length > 0){ //buddys matching to group adden
                    for(var b=0;b<buddys.length;b++){
                            if(buddys[b].nodeName == "buddy"){
                                    var temp = Tine.Messenger.RosterHandler.getBuddyFromResponse(buddys[b]);
                                    ret.push(temp);
                                    Tine.Messenger.Log.debug("Buddy: "+temp);
                            }
                    }
            }
            return ret;
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
        Tine.Messenger.Log.debug("Acabou de fazer os grupos!!");
        return true;
    }
}