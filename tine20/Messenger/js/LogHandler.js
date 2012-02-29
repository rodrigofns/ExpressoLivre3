Ext.ns('Tine.Messenger');

Tine.Messenger.LogHandler = {
    
    log: function (msg) {
        var handler = $("<div class='msg'>"+msg+"</div>");
        $("#loghandler").append(handler);
        handler.delay(5000).fadeOut("slow");
    },
    status: function(title, message){
        var handler = $("<div class='msg'><span class='title'>"+title+"</span><span class='body'>"+message+"</span></div>");
        $("#loghandler").append(handler);
        handler.delay(8000).fadeOut("slow");
    },
    rawInputLog: function(data) {
        alert("Input: "+data);
    },
    rawOutputLog: function(data) {
        atert("Output: "+data);
    },
    getPresence: function(presence) {
        var type = $(presence).attr("type");
        var from = $(presence).attr("from");
        var to = $(presence).attr("to");
        
        if (type !== 'error'){
            if(to !== from){
                var contact = Tine.Messenger.Util.jidToId(from);
                contact = Strophe.getBareJidFromJid(from);
                var title = $(presence).attr("name") ||contact;
                var message = "";
                if(type === 'unavailable'){
                    message = "está desconectado";
                } else {
                    var show = $(presence).find("show").text();
                    if(show === "" || show === "chat"){
                        message = "está online";
                    } else {
                        message = "está ausente";
                    }
                }
                Tine.Messenger.LogHandler.status(title, message);
                Tine.Messenger.LogHandler.onChatStatusChange(from, title+" "+message);
            }
        } 
        return true;
    },
    onErrorMessage: function(message){
        var raw_jid = $(message).attr("from");
        var jid = Strophe.getBareJidFromJid(raw_jid);
        var id = Tine.Messenger.Util.jidToId(jid);
        var chat_id = MESSENGER_CHAT_ID_PREFIX + id;
        
        var body = $(message).find("html > body");
        if (body.length === 0) {
            body = $(message).find("body");
        }
        
        Tine.Messenger.ChatHandler.setChatMessage(chat_id, "Não foi possível enviar: "+body.text(), _('Erro'), 'messenger-notify');
        
        return true;
    },
    onChatStatusChange: function(raw_jid, status){
        var jid = Strophe.getBareJidFromJid(raw_jid);
        var id = Tine.Messenger.Util.jidToId(jid);
        var chat_id = MESSENGER_CHAT_ID_PREFIX + id;
        
        if(Ext.getCmp(chat_id)){
            Tine.Messenger.ChatHandler.setChatMessage(chat_id, status, _('Info'), 'messenger-notify');
        }
        
        return true;
    }
};