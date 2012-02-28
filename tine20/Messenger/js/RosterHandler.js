Ext.ns('Tine.Messenger');

Tine.Messenger.RosterHandler = {
    onStartRoster: function(iq) {
        Tine.Messenger.Log.info("Getting roster...");
        $(iq).find("item").each(function () {
            var jid = $(this).attr("jid"),
                name = $(this).attr("name") || jid;

            jid = Tine.Messenger.Util.jidToId(Strophe.getBareJidFromJid(jid));
            node = new Ext.tree.TreeNode( {text:name, 
                                            cls:'messenger-contact',
                                            icon: 'images/icon-offline.gif',
                                            id: jid
                                          } );
            node.on('dblclick', Tine.Messenger.RosterHandler.abreChat);
            Ext.getCmp('roster').getRootNode().appendChild(node);
            console.log(Ext.getCmp('roster'));
        });
        
        //Tine.Messenger.Application.connection.addHandler(Tine.Messenger.NotificationHandler.onPresence, null, "presence");
        
        return true;
    },
    
    abreChat: function(e, t) {
        alert(e.id);
    }
}