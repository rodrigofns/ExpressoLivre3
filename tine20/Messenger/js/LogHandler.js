Ext.ns('Tine.Messenger');

// Show Messenger's messages (info, errors, etc)
// in the browsers debugging console
// ex.: Chrome's Developer Tools, Firebug, etc
Tine.Messenger.Log = {
    prefix: 'EXPRESSO MESSENGER: ',
    
    info: function (txt) {
        Tine.log.info(Tine.Messenger.Log.prefix + txt);
    },
    
    error: function (txt) {
        Tine.log.error(Tine.Messenger.Log.prefix + txt);
    },
    
    debug: function (txt) {
        Tine.log.debug(Tine.Messenger.Log.prefix + txt);
    },
    
    warn: function (txt) {
        Tine.log.warn(Tine.Messenger.Log.prefix + txt);
    }
};

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
    getPresence: function(presence) {
        var type = $(presence).attr("type");
        var from = $(presence).attr("from");
        var to = $(presence).attr("to");
        
        if (type !== 'error'){
            if(to !== from){
                //var contact = Tine.Messenger.Util.jidToId(from);
                var contact = Strophe.getBareJidFromJid(from);
                var title = $(presence).attr("name") || contact;
                var message = "";
                if(type === 'unavailable'){
                    message = _('unavailable');
                    Tine.Messenger.RosterHandler.changeStatus(contact, 'unavailable');
                } else {
                    var show = $(presence).find('show').text();
                    if(show === '' || show === 'chat'){
                        message = _('online');
                        Tine.Messenger.RosterHandler.changeStatus(contact, 'available');
                    } else if(show === 'dnd'){
                        message = _('dnd');
                        Tine.Messenger.RosterHandler.changeStatus(contact, 'donotdisturb');
                    } else {
                        message = _('away');
                        Tine.Messenger.RosterHandler.changeStatus(contact, 'away');
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
        var body = $(message).children("body");

        Tine.Messenger.ChatHandler.setChatMessage(jid, _('Error sending: ') + body.text(), _('Error'), 'messenger-notify');
        Tine.Messenger.Log.error(_('Error number ') + $(message).children("error").attr("code"));
        
        return true;
    },
    onChatStatusChange: function(raw_jid, status){
        var jid = Strophe.getBareJidFromJid(raw_jid);
        var chat_id = Tine.Messenger.ChatHandler.formatChatId(jid);
        
        if(Ext.getCmp(chat_id)){
            Tine.Messenger.ChatHandler.setChatMessage(jid, status, _('Info'), 'messenger-notify');
        }
        
        return true;
    }

};