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
                                            id: jid,
                                            leaf: true
                                          } );
            node.on('dblclick', Tine.Messenger.RosterHandler.openChat);
            Ext.getCmp('messenger-roster').getRootNode().appendChild(node);
            Ext.getCmp('messenger-roster')
               .getRootNode()
               .findChild('id', jid)
               .ui.addClass('messenger-contact-unavailable');
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
    }
}