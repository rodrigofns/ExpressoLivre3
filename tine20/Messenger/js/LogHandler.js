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
    
    status: function(title, message, type){
        var showNotfications = 1;
        
        title   = "<span class='title'>"+title+"</span>";
        message = "<span class='body'>"+message+"</span>";
        
        if(type == 'STATUS'){
            showNotfications = Tine.Messenger.registry.get('preferences').get('showNotifications');
        }
        if(type == 'ERROR'){
            //TODO: implement
        }
        if(type == 'INFO'){
            //TODO: implement
        }
        if(type == 'LOG'){
            title = '';
        }
        
        if(showNotfications == 1){
            var handler = $("<div class='msg'>" + title + message + "</div>");
            $("#messenger-loghandler-status").append(handler);
            handler.delay(8000).fadeOut("slow");
        }
        
    },
    
    /**
     *  @method _getPresence
     *  @param presence
     */
    _getPresence: function(presence) {
        var app = Tine.Tinebase.appMgr.get('Messenger');
        var type = $(presence).attr("type"),
            from = $(presence).attr("from"),
            to = $(presence).attr("to"),
            jid = Strophe.getBareJidFromJid(from),
            show = $(presence).find('show');

        if (type !== 'error'){
            if(to !== from){

                if (type != null && type.match(/subscribe/i)) {
                    Tine.Messenger.LogHandler._subscriptionResponse(presence);
                } else {
                    var contact = Tine.Messenger.RosterHandler.getContactElement(jid);
                    if(contact){
                        var title = contact.text || jid;
                        var status = "";
                        
                        if(type == 'unavailable'){
                            status = app.i18n._('is unavailable');
                            Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_UNAVAILABLE);
                            Tine.Messenger.IM.verifyOfflineContactsDisplay();
                        } else {
                            Tine.Messenger.RosterTree().setResource(from);
                            var show_text = show.text(),
                                status_text = $(presence).find('status').text() ? 
                                              app.i18n._('Status text')+': '+ $(presence).find('status').text() : '';
                            if(show_text == 'away') {
                                status = app.i18n._('is away');
                                Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_AWAY, '', status_text);
                            }else if(show_text == 'dnd'){
                                status = app.i18n._('is busy');
                                Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_DONOTDISTURB, '', status_text);
                            } else if(show_text == 'xa'){
                                status = app.i18n._('auto status (idle)');
                                Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_XA, '', status_text);
                            } else {
                                $('div.available').show();
                                status = app.i18n._('is on-line');
                                Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_AVAILABLE, '', status_text);
                            }
                        }
                        if(status && (show.length > 0 || type == 'unavailable')){
                            Tine.Messenger.LogHandler.status(title, status, 'STATUS');
                            Tine.Messenger.LogHandler.onChatStatusChange(from, title+" "+status);
                        }
                    }
                }
            }
        } else {
            var err_msg = $(presence).find('error').children().get(0).tagName,
                message = '';
                
            switch(err_msg){
                case 'recipient-unavailable':
                    message = app.i18n._('The intended recipient is temporarily unavailable.');
                    break;
                case 'remote-server-not-found':
                    message = app.i18n._('The remote server does not exist or could not be reached.');
                    break;
                case 'remote-server-timeout':
                    message = app.i18n._('Communication with the remote server has been interrupted.');
                    break;
                default:
                    message = err_msg;
            }
            Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_UNAVAILABLE, IMConst.SB_WAITING, '', message);
            Tine.Messenger.LogHandler.status(app.i18n._('SERVER ERROR'), message, 'ERROR');
        }

        return true;
    },
    
    /**
     *  @method _subscriptionResponse
     *  @private
     *  @param presence
     */
    _subscriptionResponse: function (presence) {
        var app = Tine.Tinebase.appMgr.get('Messenger');
        var type = $(presence).attr("type"),
            from = $(presence).attr("from"),
            jid = Strophe.getBareJidFromJid(from),
            name = $(presence).attr('name') || $(presence).find('nick').text() || from;
        
        if (type == IMConst.SB_SUBSCRIBED) {
            Tine.Messenger.LogHandler.status(name, app.i18n._('Accept your subscription'));
            Tine.Messenger.LogHandler.status(name, _('Accept your subscription'), 'INFO');
            Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_AVAILABLE, IMConst.SB_BOTH);
        }else if(type == IMConst.SB_SUBSCRIBE){
                var buddy = Tine.Messenger.RosterHandler.getContactElement(jid);
                if(buddy == null){
                    Ext.Msg.buttonText.yes = app.i18n._('Allow');
                    Ext.Msg.buttonText.no = app.i18n._('Deny');
                    Ext.Msg.minWidth = 300;
                    Ext.Msg.confirm(app.i18n._('Subscription Approval') + ' - ' + from,
                                    name + ' ' + app.i18n._('wants to subscribe you.'),
                                    function (id) {
                                        var response;

                                        if (id == 'yes') {
                                              Tine.Messenger.Window.AddBuddyWindow(jid);
                                              response = IMConst.SB_SUBSCRIBED;
                                        } else if (id == 'no') {
                                            response = IMConst.SB_UNSUBSCRIBED;
                                        }
                                        Tine.Messenger.LogHandler.sendSubscribeMessage(from, response);
                                    }
                                );
                } else {
                  //TODO: Send credentials
                  Tine.Messenger.LogHandler.sendSubscribeMessage(from, IMConst.SB_SUBSCRIBED);
                }  
            
        } else {
            Tine.Messenger.LogHandler.status(name, app.i18n._('Denied/Removed your subscription'), 'INFO');
            Tine.Messenger.RosterTree().updateBuddy(from, IMConst.ST_UNAVAILABLE, IMConst.SB_NONE, '', app.i18n._('Not authorized!'));
        }
    },
    
    /**
     *  @method sendSubscribeMessage
     *  @public
     *  @param jid (required)
     *  @param type (required) <b>subscribe</b> or <b>subscribed</b> 
     *                      or <b>unsubscribe</b> or <b>unsubscribed</b>
     */
    sendSubscribeMessage: function(jid, type){
        
        if(type == 'subscribe' || type == 'subscribed' || 
           type == 'unsubscribe' || type == 'unsubscribed')
        {
            var conn = Tine.Tinebase.appMgr.get('Messenger').getConnection();
            conn.send($pres({to: jid, type: type}));
        }
    },
    
    _onErrorMessage: function(message){
        var app = Tine.Tinebase.appMgr.get('Messenger');
        var raw_jid = $(message).attr("from");
        var jid = Strophe.getBareJidFromJid(raw_jid);
        
        var body = $(message).find("html > body");
        if (body.length === 0) {
            body = $(message).find("body");
        }
        if(body.length > 0){
            Tine.Messenger.ChatHandler.setChatMessage(jid, app.i18n._('Error sending: ') + body.text(), app.i18n._('Error'), 'messenger-notify');
        }
        Tine.Messenger.Log.error(app.i18n._('Error number ') + $(message).children("error").attr("code"));
        
        return true;
    },
    
    _onError: function(_iq){
        var app = Tine.Tinebase.appMgr.get('Messenger');
        var err_msg = $(_iq).find('error').children().get(0).tagName,
            message = '';

        switch(err_msg){
            case 'item-not-found':
                message = app.i18n._('Cancel 404: The item was not found.');
                break;
            case 'feature-not-implemented':
                message = app.i18n._('Cancel 501: The feature was not implemented.');
                break;
            case 'internal-server-error':
                message = app.i18n._('Wait 500: Internal server error.');
                break;
            case 'service-unavailable':
                message = app.i18n._('Cancel 503: Service unavailable.');
                break;
            default:
                message = err_msg;
        }
        Tine.Messenger.LogHandler.status(app.i18n._('SERVER ERROR'), message, 'ERROR');
        Tine.Messenger.Log.error(app.i18n._('Error number ') + $(_iq).children("error").attr("code"));
        
        return true;
    },
    
    onChatStatusChange: function(raw_jid, status){
        var app = Tine.Tinebase.appMgr.get('Messenger');
        var jid = Strophe.getBareJidFromJid(raw_jid);
        var chat_id = Tine.Messenger.ChatHandler.formatChatId(jid);
        
        if(Ext.getCmp(chat_id)){
            Tine.Messenger.ChatHandler.setChatMessage(jid, status, app.i18n._('Info'), 'messenger-notify');
        }
        
        return true;
    }
    
};
