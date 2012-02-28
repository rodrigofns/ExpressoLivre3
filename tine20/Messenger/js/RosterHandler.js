Ext.ns('Tine.Messenger');

Tine.Messenger.RosterHandler = {
    onStartRoster: function(iq) {
        Tine.Messenger.Log.info("Getting roster...");
        $(iq).find("item").each(function () {
            var jid = $(this).attr("jid"),
                name = $(this).attr("name") || jid;

            jid = Tine.Messenger.ChatHandler.jidToId(Strophe.getBareJidFromJid(jid));
            Ext.getCmp('roster').getRootNode().appendChild(new Ext.tree.TreeNode({
                text: name, 
                cls:  'messenger-contact',
                icon: 'images/icon-presence.gif',
                listeners: {
                    dblclick: function (index) {
                        // TODO-EXP: Call window on double click
                    },
                    contextmenu: function (node, ev) {
                        // TODO-EXP: Call context menu
                    }
                }
            }));
            //var contact = "<span id=\""+jid+"\" class=\"roster-contact offline\">"+name+"</span>";
        });
        
        //Tine.Messenger.Application.connection.addHandler(Tine.Messenger.NotificationHandler.onPresence, null, "presence");
        
        return true;
    }
}