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
        $("#messenger-loghandler-status").append(handler);
        handler.delay(8000).fadeOut("slow");
    },
    status: function(title, message){
        var handler = $("<div class='msg'><span class='title'>"+title+"</span><span class='body'>"+message+"</span></div>");
        $("#messenger-loghandler-status").append(handler);
        handler.delay(8000).fadeOut("slow");
    },
    
    /**
     *  @method _getPresence
     *  @param presence
     */
    _getPresence: function(presence) {
        var type = $(presence).attr("type"),
            from = $(presence).attr("from"),
            to = $(presence).attr("to"),
            jid = Strophe.getBareJidFromJid(from);
            
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
                            status = Tine.Tinebase.appMgr.get('Messenger').i18n._('is unavailable');
                            Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_UNAVAILABLE);
                        } else {
                            var show = $(presence).find('show').text(),
                                status_text = $(presence).find('status').text() ? 
                                                Tine.Tinebase.appMgr.get('Messenger').i18n._('Status text')+': '+ $(presence).find('status').text() : '';
                            if(show == 'away') {
                                status = Tine.Tinebase.appMgr.get('Messenger').i18n._('is away');
                                Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_AWAY, '', status_text);
                            }else if(show == 'dnd'){
                                status = Tine.Tinebase.appMgr.get('Messenger').i18n._('is busy');
                                Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_DONOTDISTURB, '', status_text);
                            } else if(show == 'xa'){
                                status = Tine.Tinebase.appMgr.get('Messenger').i18n._('auto status (idle)');
                                Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_XA, '', status_text);
                            } else {
                                status = Tine.Tinebase.appMgr.get('Messenger').i18n._('is on-line');
                                Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_AVAILABLE, '', status_text);
                            }
                        }
                        if(status){
                            Tine.Messenger.LogHandler.status(title, status);
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
                    message = Tine.Tinebase.appMgr.get('Messenger').i18n._('The intended recipient is temporarily unavailable.');
                    break;
                case 'remote-server-not-found':
                    message = Tine.Tinebase.appMgr.get('Messenger').i18n._('The remote server does not exist or could not be reached.');
                    break;
                case 'remote-server-timeout':
                    message = Tine.Tinebase.appMgr.get('Messenger').i18n._('Communication with the remote server has been interrupted.');
                    break;
                default:
                    message = err_msg;
            }
            Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_UNAVAILABLE, IMConst.SB_WAITING, '', message);
            Tine.Messenger.LogHandler.status(Tine.Tinebase.appMgr.get('Messenger').i18n._('SERVER ERROR'), message);
        }

        return true;
    },
    
    /**
     *  @method _subscriptionResponse
     *  @private
     *  @param presence
     */
    _subscriptionResponse: function (presence) {
        var type = $(presence).attr("type"),
            from = $(presence).attr("from"),
            jid = Strophe.getBareJidFromJid(from),
            name = $(presence).attr('name') || $(presence).find('nick').text() || from;
        
        if (type == IMConst.SB_SUBSCRIBED) {
            Tine.Messenger.LogHandler.status(name, Tine.Tinebase.appMgr.get('Messenger').i18n._('Accept your subscription'));
            Tine.Messenger.RosterTree().updateBuddy(jid, IMConst.ST_AVAILABLE, IMConst.SB_BOTH);
        }else if(type == IMConst.SB_SUBSCRIBE){
                var buddy = Tine.Messenger.RosterHandler.getContactElement(jid);
                if(buddy == null){
                    Ext.Msg.buttonText.yes = Tine.Tinebase.appMgr.get('Messenger').i18n._('Allow');
                    Ext.Msg.buttonText.no = Tine.Tinebase.appMgr.get('Messenger').i18n._('Deny');
                    Ext.Msg.minWidth = 300;
                    Ext.Msg.confirm(Tine.Tinebase.appMgr.get('Messenger').i18n._('Subscription Approval') + ' - ' + from,
                                    name + ' ' + Tine.Tinebase.appMgr.get('Messenger').i18n._('wants to subscribe you.'),
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
            Tine.Messenger.LogHandler.status(name, Tine.Tinebase.appMgr.get('Messenger').i18n._('Denied/Removed your subscription'));
            Tine.Messenger.RosterTree().updateBuddy(from, IMConst.ST_UNAVAILABLE, IMConst.SB_NONE, '', Tine.Tinebase.appMgr.get('Messenger').i18n._('Not authorized!'));
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
        var raw_jid = $(message).attr("from");
        var jid = Strophe.getBareJidFromJid(raw_jid);
        
        var body = $(message).find("html > body");
        if (body.length === 0) {
            body = $(message).find("body");
        }
        if(body.length > 0){
            Tine.Messenger.ChatHandler.setChatMessage(jid, Tine.Tinebase.appMgr.get('Messenger').i18n._('Error sending: ') + body.text(), Tine.Tinebase.appMgr.get('Messenger').i18n._('Error'), 'messenger-notify');
        }
        Tine.Messenger.Log.error(Tine.Tinebase.appMgr.get('Messenger').i18n._('Error number ') + $(message).children("error").attr("code"));
        
        return true;
    },
    
    _onError: function(_iq){
        var err_msg = $(_iq).find('error').children().get(0).tagName,
            message = '';

        switch(err_msg){
            case 'item-not-found':
                message = Tine.Tinebase.appMgr.get('Messenger').i18n._('Cancel 404: The item was not found.');
                break;
            case 'feature-not-implemented':
                message = Tine.Tinebase.appMgr.get('Messenger').i18n._('Cancel 501: The feature was not implemented.');
                break;
            case 'internal-server-error':
                message = Tine.Tinebase.appMgr.get('Messenger').i18n._('Wait 500: Internal server error.');
                break;
            case 'service-unavailable':
                message = Tine.Tinebase.appMgr.get('Messenger').i18n._('Cancel 503: Service unavailable.');
                break;
            default:
                message = err_msg;
        }
<<<<<<< HEAD
        Tine.Messenger.LogHandler.status(_('SERVER ERROR'), message);
=======
        Tine.Messenger.LogHandler.status(Tine.Tinebase.appMgr.get('Messenger').i18n._('SERVER ERROR'), message);
>>>>>>> b4e6c5b4ef26f3923ce5ddff8235a867b5f1d9d5
        Tine.Messenger.Log.error(Tine.Tinebase.appMgr.get('Messenger').i18n._('Error number ') + $(_iq).children("error").attr("code"));
        
        return true;
    },
    
    onChatStatusChange: function(raw_jid, status){
        var jid = Strophe.getBareJidFromJid(raw_jid);
        var chat_id = Tine.Messenger.ChatHandler.formatChatId(jid);
        
        if(Ext.getCmp(chat_id)){
            Tine.Messenger.ChatHandler.setChatMessage(jid, status, Tine.Tinebase.appMgr.get('Messenger').i18n._('Info'), 'messenger-notify');
        }
        
        return true;
    }
    
};