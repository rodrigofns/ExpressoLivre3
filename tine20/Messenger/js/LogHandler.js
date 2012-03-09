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
                
                if (type != null && type.match(/subscribe/i)) {
                    Tine.Messenger.LogHandler.subscriptionResponse(presence);
                } else {
                    if(type === 'unavailable'){
                        message = _('Unavailable');
                        Tine.Messenger.RosterHandler.changeStatus(contact, 'unavailable');
                    } else {
                        var show = $(presence).find('show').text();
                        if(show === '' || show === 'chat'){
                            message = _('Online');
                            Tine.Messenger.RosterHandler.changeStatus(contact, 'available');
                        } else if(show === 'dnd'){
                            message = _('Do not disturb');
                            Tine.Messenger.RosterHandler.changeStatus(contact, 'donotdisturb');
                        } else {
                            message = _('Away');
                            Tine.Messenger.RosterHandler.changeStatus(contact, 'away');
                        }
                    }
                    Tine.Messenger.LogHandler.status(title, message);
                    Tine.Messenger.LogHandler.onChatStatusChange(from, title+" "+message);
                }
            }
        } 
        return true;
    },
    
    subscriptionResponse: function (presence) {
        var type = $(presence).attr('type'),
            from = $(presence).attr('from'),
            name = $(presence).attr('name') || from,
            subscription = $(presence).attr('subscription');
        
        if (type == 'subscribed') {
            Tine.Messenger.LogHandler.status(name, _('Accept your subscription'));
        } else if (type == 'subscribe') {
            Tine.Messenger.LogHandler.status(name, _('Wants to subscribe you'));
            Ext.Msg.buttonText.yes = _('Allow');
            Ext.Msg.buttonText.no = _('Deny');
            Ext.Msg.minWidth = 300;
            Ext.Msg.confirm(_('Subscription Approval') + ' - ' + from,
                            name + ' ' + _('wants to subscribe you.'),
                            function (id) {
                                var response;
                                
                                if (id == 'yes') {
                                    response = 'subscribed';
                                } else if (id == 'no') {
                                    response = 'unsubscribed';
                                }
                                
                                Tine.Tinebase.appMgr.get('Messenger').getConnection().send(
                                    $pres({
                                        to: from,
                                        type: response
                                    })
                                );
                            }
            );
        } else if (type == 'unsubscribed') {
            Tine.Messenger.LogHandler.status(name, _('Denied/Removed your subscription'));
        } else {
            alert('TYPE: ' + type);
//            Ext.Msg.buttonText.yes = _('Yes');
//            Ext.Msg.buttonText.no = _('No');
//            Ext.Msg.minWidth = 300;
//            Ext.Msg.confirm(_('Unsubscription') + ' - ' + from,
//                            name + ' ' + _('removed you from roster') + '.<br/>' +
//                                _('Do you want to remove this contact from your roster too?'),
//                            function (id) {
//                                if (id == 'yes') {
//                                    Tine.Messenger.RosterHandler.removeContact(from);
//                                } else if (id == 'no') {
//                                    var contact = Tine.Messenger.RosterHandler.getContactElement(from);
//                                    Tine.Messenger.RosterHandler.resetStatus(contact);
//                                    contact.ui.addClass('messenger-contact-unsubscribed');
//                                }
//                            }
//            );
        }
    },
    
    onErrorMessage: function(message){
        var raw_jid = $(message).attr("from");
        var jid = Strophe.getBareJidFromJid(raw_jid);
        
        var body = $(message).find("html > body");
        if (body.length === 0) {
            body = $(message).find("body");
        }
        if(body.length > 0){
            Tine.Messenger.ChatHandler.setChatMessage(jid, _('Error sending: ') + body.text(), _('Error'), 'messenger-notify');
        }
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