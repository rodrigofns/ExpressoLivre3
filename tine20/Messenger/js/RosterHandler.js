Ext.ns('Tine.Messenger');

Tine.Messenger.RosterHandler = {
    onStartRoster: function(iq) {
        Tine.Messenger.Log.info("Getting roster...");
        var node = null;
        $(iq).find("item").each(function () {
            var jid = $(this).attr("jid"),
                name = $(this).attr("name") || jid;

            jid = Strophe.getBareJidFromJid(jid);
            node = new Ext.tree.TreeNode( {text:name, 
                                            cls:'messenger-contact',
                                            icon: 'images/icon-offline.gif',
                                            id: jid
                                          } );
            node.on('dblclick', Tine.Messenger.RosterHandler.openChat);
            Ext.getCmp('messenger-roster').getRootNode().appendChild(node);
        });
        
        return true;
    },
    
    openChat: function(e, t) {
        Tine.Messenger.ChatHandler.showChatWindow(e.id, e.text);
    },
    
    clearRoster: function () {
        Ext.getCmp('messenger-roster').getRootNode().removeAll();
        Tine.Messenger.Window.toggleConnectionButton();
    }
}