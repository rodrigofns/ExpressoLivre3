Ext.ns('Tine.Messenger');

Tine.Messenger.ChatHandler = {
    jidToId: function (jid) {
        return jid.replace(/@/g, "_").replace(/\./g, "-");
    },
    
    idToJid: function (id) {
        return id.replace(/_/g, "@").replace(/\-/g, ".");
    },
    
    createWindowChat: function (id, name) {
        
    },
    
    onIncomingMessage: function (message) {
        alert($(message).attr("from"));
        
        return true;
    },
    
    onOutgoMessage: function (message) {
        return true;
    }
}