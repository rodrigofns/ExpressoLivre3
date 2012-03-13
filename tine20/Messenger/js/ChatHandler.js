Ext.ns('Tine.Messenger');

Tine.Messenger.ChatHandler = {
    // Chat State Messages
    COMPOSING_STATE: " is typing...",
    PAUSED_STATE: " stopped typing!",
    
    formatChatId: function (jid) {
        return (jid.indexOf('@') >= 0) ? 
            MESSENGER_CHAT_ID_PREFIX + Tine.Messenger.Util.jidToId(jid) :
            jid;
    },
    
    showChatWindow: function (jid, name) {
        // Transform jid to chat id
        var chat_id = Tine.Messenger.ChatHandler.formatChatId(jid),
            chat = null;
        
        // Shows the chat window OR
        if (Ext.getCmp(chat_id)) {
            chat = Ext.getCmp(chat_id);
        // Creates it if doesn't exist and show
        } else {
            chat = new Tine.Messenger.Chat({
                title: _('Chat with ') + name + ' (' + jid + ')',
                id: chat_id
            });
        }
        
        chat.show();
        
        if (Tine.Messenger.RosterHandler.isContactUnavailable(jid)) {
            Tine.Messenger.ChatHandler.setChatMessage(jid, name + ' is unavailable', _("Info"), 'messenger-notify');
            Tine.Messenger.ChatHandler.setChatMessage(jid, 'Your messages will be sent offline', _('Info'), 'messenger-notify');
        }
    },
    
    formatMessage: function (message, name, flow) {
        var space = '&nbsp;&nbsp;';
        flow = flow || 'messenger-send';
        name = (name) ? "<strong>&lt;" + name + "&gt;</strong>" + space : '';
        var txt = "<span class=\"" + flow + "\">" + 
                     name + message.replace(/\n/g, '<br/>') + 
                  "</span><br/>";
              
        return txt;
    },
    
    /** flow parameter:
     *      'messenger-send' => message that user send
     *      'messenger-receive' => message that user received
     *      'messenger-notify' => notification that user received
     */
    setChatMessage: function (id, msg, name, flow) {
        var chat_id = Tine.Messenger.ChatHandler.formatChatId(id),
            chat_area = Ext.getCmp(chat_id).items.items[0],
            panel_id = '#'+chat_area.getId()+' .x-panel-body';
        var msg_with_emotions = Tine.Messenger.ChatHandler.replaceEmotions(msg);
        chat_area.add({
            xtype: 'panel',
            html: Tine.Messenger.ChatHandler.formatMessage(msg_with_emotions, name, flow),
            cls: 'chat-message'
        });
        chat_area.doLayout();

        $(panel_id).scrollTop($(panel_id).get(0).scrollHeight);

        Tine.Messenger.Log.debug(((flow) ? 'Incoming: ' : 'Outgo: ') + msg);
    },
    
    onIncomingMessage: function (message) {
        var raw_jid = $(message).attr("from"),
            jid = Strophe.getBareJidFromJid(raw_jid),
            name = $(message).attr("name") ||
                   Tine.Messenger.RosterHandler.getContactElement(jid).text,
            composing = $(message).find("composing"),
            paused = $(message).find("paused");
        
        // Capture the message body element, 
        // extract text and append to chat area
        var body = $(message).find("html > body");
        if (body.length === 0) {
            body = $(message).find("body");
        }

        // Typing events
        if (paused.length > 0) {
            Tine.Messenger.Log.debug(_(Tine.Messenger.ChatHandler.PAUSED_STATE));
            Tine.Messenger.ChatHandler.setChatState(jid, _(Tine.Messenger.ChatHandler.PAUSED_STATE));
        } else if (composing.length > 0) {
            Tine.Messenger.Log.debug(_(Tine.Messenger.ChatHandler.COMPOSING_STATE));
            Tine.Messenger.ChatHandler.setChatState(jid, _(Tine.Messenger.ChatHandler.COMPOSING_STATE));
        } else if (body.length > 0){
            // Shows the specific chat window
            Tine.Messenger.ChatHandler.showChatWindow(jid, name);
            // Set received chat message
            Tine.Messenger.ChatHandler.setChatMessage(jid, body.text(), name, 'messenger-receive');
        }
        
        return true;
    },
    
    setChatState: function (id, state) {
        var chat_id = Tine.Messenger.ChatHandler.formatChatId(id);
        if(Ext.getCmp(chat_id)){
            Tine.Messenger.ChatHandler.resetState(chat_id);
            Ext.getCmp(chat_id).setTitle(Ext.getCmp(chat_id).title + state);
            setTimeout(
                function () {
                    Tine.Messenger.ChatHandler.resetState(chat_id);
                },
                3000
            );
        }
    },
    
    resetState: function (chat_id) {
        var title = Ext.getCmp(chat_id).title,
            new_title = title;
        
        if (title.indexOf(Tine.Messenger.ChatHandler.COMPOSING_STATE) >= 0) {
            new_title = title.substring(0, title.indexOf(Tine.Messenger.ChatHandler.COMPOSING_STATE));
        }
        
        if (title.indexOf(Tine.Messenger.ChatHandler.PAUSED_STATE) >= 0) {
            new_title = title.substring(0, title.indexOf(Tine.Messenger.ChatHandler.PAUSED_STATE));
        }
        
        Ext.getCmp(chat_id).setTitle(new_title);
    },
    
    sendMessage: function (msg, id) {
        Tine.Messenger.Application.connection.send($msg({
            "to": Tine.Messenger.Util.idToJid(id),
            "type": "chat"})
          .c("body").t(msg).up()
          .c("active", {xmlns: "http://jabber.org/protocol/chatstates"}));
        Tine.Messenger.ChatHandler.setChatMessage(id, msg, _('ME'));
        
        return true;
    },
    
    sendState: function (id, state) {
        var jid = Tine.Messenger.Util.idToJid(id),
            notify = $msg({to: jid, "type": "chat"})
                     .c(state, {xmlns: "http://jabber.org/protocol/chatstates"});
        
        if (Tine.Messenger.RosterHandler.isContactAvailable(jid)) {
            Tine.Messenger.Application.connection.send(notify);
        }
          
        return true;
    },
    replaceEmotions: function(message){
        var key = '';
        var img = '';
        var $xml = $(Tine.Messenger.Application.xml_raw.responseText);
        var $emoticons = $xml.find("emoticon");
        
        $emoticons.each(function(){ 
            $(this).find("string").each(function(){
                key = $(this).text().trim();
                img = $(this).parent().attr("file").trim();
                message = message.replace(key, "<img src='/images/messenger/emoticons/"+img+".png' alt='"+key+"' />");
                });
            });
        return message;
    },
    
    disconnect: function() {
        Tine.Tinebase.appMgr.get('Messenger').stopMessenger();
        Tine.Messenger.RosterHandler.clearRoster();
    },
    
    connect: function() {
        // TODO-EXP: TEMPORARY - Place your jabber login and password
        var login = new Ext.Window({
            id: 'messenger-connect-window',
            layout: 'anchor',
            closeAction: 'close',
            plain: true,
            width: 300,
            height: 100,
            title: 'Expresso Messenger Login',
            modal: true,
            items: {
                xtype: 'form',
                border: false,
                items: [
                    {
                        xtype: 'textfield',
                        id: 'messenger-connect-login',
                        fieldLabel: 'Login'
                    },
                    {
                        xtype: 'textfield',
                        inputType: 'password',
                        id: 'messenger-connect-pwd',
                        fieldLabel: 'Password'
                    },
                    {
                        xtype: 'button',
                        text: 'GO',
                        listeners: {
                            click: function () {
                                messengerLogin();
                            }
                        }
                    }
                ],
                
                keys: [
                    {
                        key: [Ext.EventObject.ENTER],
                        handler: function () {
                            messengerLogin();
                        }
                    }
                ]
            }
        });
        login.show();
    }
    
}

function messengerLogin() {
    var user = Ext.getCmp('messenger-connect-login').getValue(),
        pwd = Ext.getCmp('messenger-connect-pwd').getValue();

    if (user.indexOf('@') < 0) {
        user += '@simdev.sdr.serpro/expresso-3.0';
    }                                        
    if (user.indexOf('expresso-3.0') < 0) {
        user += '/expresso-3.0';
    }
    Tine.Tinebase.registry.add('messengerAccount', {
        login: user,
        password: pwd
    });
    Ext.getCmp('messenger-connect-window').close();
    Tine.Tinebase.appMgr.get('Messenger').startMessenger();
}