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
    
    formatChatTitle: function (jid, name, type) {
        var app = Tine.Tinebase.appMgr.get('Messenger');
        
        if(type == 'groupchat')
            return app.i18n._('Group chat in room') + ' ' + name;
        else
            return app.i18n._('Chat with') + ' ' + name + ' (' + jid + ')';
        return null;
    },
    
    showChatWindow: function (jid, name, type, privy) {
        var app = Tine.Tinebase.appMgr.get('Messenger');
        var title = '',
            _type = type,
            new_chat = false;
        
        if(type == 'groupchat'){
             if(!privy)
                 privy = false;
             else
                 _type = 'chat';
        } else {
            _type = 'chat';
            if(!privy)
                privy = true;
        }
        title = Tine.Messenger.ChatHandler.formatChatTitle(jid, name, _type);
        // Transform jid to chat id
        var chat_id = Tine.Messenger.ChatHandler.formatChatId(jid),
            chat = null;
        
        // Shows the chat window OR
        if (Ext.getCmp(chat_id)) {
            chat = Ext.getCmp(chat_id);
        // Creates it if doesn't exist and show
        } else {
            chat = new Tine.Messenger.Chat({
                title: title,
                id: chat_id,
                type: type,
                privy: privy
            });

            chat.on('hide', function (window_chat) {
                var chat_table = window_chat.getComponent('messenger-chat-table'),
                    chat_area = chat_table.getComponent('messenger-chat-body'),
                    chat_lines = chat_area.items.items;
                    
                var chat_text = '',
                    host = window.location.host,
                    protocol = window.location.protocol;
                if (chat_lines.length > 0 && Tine.Messenger.registry.get('preferences').get('chatHistory') != 'dont') {
                    for (var i = 0; i < chat_lines.length; i++)
                        chat_text += chat_lines[i].body.dom.innerHTML + '<br style="clear: both;"/>';

                    chat_text = chat_text.replace(/src\=\"/gi, 'src="' + protocol + '//' + host);
                    $.ajax('/history', {
                        dataType: 'json',
                        type: 'POST',
                        data: {
                            "chat_conversation": chat_text,
                            "chat_id": chat.id,
                            "chat_title": chat.title
                        },
                        success: function (response) {
                            if (response.code == 0) {
                                switch (Tine.Messenger.registry.get('preferences').get('chatHistory')) {
                                    case 'download': 
                                        Ext.Msg.confirm(
                                            app.i18n._('Chat History'),
                                            app.i18n._('You chose to download the every chat history') + '.<br>' +
                                            app.i18n._('Do you want to download this chat') + '?',
                                            function (id) {
                                                if (id == 'yes')
                                                    $('#iframe-history').attr('src', '/download/' + response.fileName);
                                                else
                                                    $('#iframe-history').attr('src', '/nodownload/' + response.fileName);
                                            }
                                        );
                                        break;
                                    case 'email':
                                        Tine.Messenger.saveForFile();
                                        break;
                                }
                            } else {
                                Ext.Msg.show({
                                    title: app.i18n._('Error'),
                                    msg: app.i18n._('Error downloading Chat History')+'!',
                                    buttons: Ext.Msg.OK,
                                    icon: Ext.MessageBox.ERROR
                                });
                            }
                        },
                        error: function (xhr, status, err) {
                            Ext.Msg.show({
                                title: _('Error'),
                                msg: app.i18n._(status) + ': ' + app.i18n._(err) + '!',
                                buttons: Ext.Msg.OK,
                                icon: Ext.MessageBox.ERROR
                            });
                        }
                    });
                }
            });
            
            new_chat = true;
        }
        chat.show();

        Tine.Messenger.ChatHandler.adjustChatAreaHeight(chat_id);
        
        if (Tine.Messenger.RosterHandler.isContactUnavailable(jid) && new_chat) {
            Tine.Messenger.ChatHandler.setChatMessage(jid, name + ' ' + app.i18n._('is unavailable'), app.i18n._("Info"), 'messenger-notify');
            Tine.Messenger.ChatHandler.setChatMessage(jid, app.i18n._('Your messages will be sent offline'), app.i18n._('Info'), 'messenger-notify');
        }
    
        return chat;
    },
    
    /**
     *
     *  @description Provisory alternative to layout adjustments
     */
    adjustChatAreaHeight: function(_chat_id, _width, _height){
      var chat = Ext.getCmp(_chat_id);
      if(chat.isVisible()){
        var chat_table = chat.getComponent('messenger-chat-table'),
            chat_area = chat_table.getComponent('messenger-chat-body'),
            chat_table_height = chat_table.body.dom.clientHeight,
            chat_area_height = chat_area.body.dom.clientHeight;
        
        if(_height){
            var dif = _height - chat.resizeBox.height;
            chat_area.setHeight(chat_area_height + dif);
        } else {
            chat_area.setHeight(chat_table_height);
        }
      }
    },
    
    formatMessage: function (message, name, flow, stamp, color) {
//        var space = '&nbsp;&nbsp;';
//        flow = flow || 'messenger-send';
//        name = (name) ? "<strong>&lt;" + name + "&gt;</strong>" + space : '';
//        var txt = "<span class=\"" + flow + "\">" + 
//                     name + message.replace(/\n/g, '<br/>') + 
//                  "</span><br/>";
        
        if(!color)
            color = (flow) ? 'color-1' : 'color-2';
        
        var msg = message.replace(/\n/g, '<br/>'),
            nick = name,
            timestamp = Tine.Messenger.Util.returnTimestamp(stamp),
            image = '/images/messenger/no-image.jpg';
        var txt = '<div class="chat-message-balloon '+ color +'">'
                 +'     <div class="chat-user">'
                 +'         <img src="' + image + '" width="30px" height="30px" style="display:none" />'
                 +'         <span class="nick">' + nick + '</span><br />'
                 +'         <span class="chat-user-timestamp">(' + timestamp + ')</span>'
                 +'     </div>'
                 +'     <div class="chat-user-balloon">'
                 +'         <div class="chat-user-msg">'
                 +              msg
                 +'         </div>'
                 +'     </div>'
                 +'</div>';
        if(flow == 'messenger-notify'){
            txt = '<div class="chat-message-notify">'
                 +'    <span class="chat-user-timestamp">(' + timestamp + ')</span>'
                 +'    <span class="chat-user-msg">' + msg + '</span>'
                 +'</div>';
        }
        return txt;
    },
    
    /** flow parameter:
     *      'messenger-send' => message that user send
     *      'messenger-receive' => message that user received
     *      'messenger-notify' => notification that user received
     */
    setChatMessage: function (id, msg, name, flow, stamp, color) {
        var chat_id = Tine.Messenger.ChatHandler.formatChatId(id),
            chat_table = Ext.getCmp(chat_id).getComponent('messenger-chat-table'),
            chat_area = chat_table.getComponent('messenger-chat-body');
            
        var msg_with_emotions = Tine.Messenger.ChatHandler.replaceEmotions(msg);
        
        chat_area.add({
            xtype: 'panel',
            html: Tine.Messenger.ChatHandler.formatMessage(msg_with_emotions, name, flow, stamp, color),
            cls: 'chat-message'
        });
        chat_area.doLayout();
        
        chat_area.body.scroll('down', 500); 
//        $(panel_id).scrollTop($(panel_id).get(0).scrollHeight);
//        Tine.Messenger.Log.debug(((flow) ? 'Incoming: ' : 'Outgo: ') + msg);
    },
    
    onIncomingMessage: function (message) {
        var app = Tine.Tinebase.appMgr.get('Messenger');
        var raw_jid = $(message).attr("from"),
            jid = Strophe.getBareJidFromJid(raw_jid),
            name = $(message).attr("name") ||
                   Tine.Messenger.RosterHandler.getContactElement(jid).text,
            type = $(message).attr("type"),
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
//            Tine.Messenger.Log.debug(_(Tine.Messenger.ChatHandler.PAUSED_STATE));
            Tine.Messenger.ChatHandler.setChatState(jid, app.i18n._(Tine.Messenger.ChatHandler.PAUSED_STATE));
        } else if (composing.length > 0) {
//            Tine.Messenger.Log.debug(_(Tine.Messenger.ChatHandler.COMPOSING_STATE));
            Tine.Messenger.ChatHandler.setChatState(jid, app.i18n._(Tine.Messenger.ChatHandler.COMPOSING_STATE));
        } else if (body.length > 0){
            // Shows the specific chat window
            Tine.Messenger.ChatHandler.showChatWindow(jid, name, type);
            // Set received chat message
            Tine.Messenger.ChatHandler.setChatMessage(jid, body.text(), name, 'messenger-receive');
            Tine.Messenger.ChatHandler.setChatState(jid);
        }
        
        return true;
    },
    
    setChatState: function (id, state) {
        var chat_id = Tine.Messenger.ChatHandler.formatChatId(id),
            chat = Ext.getCmp(chat_id);
       
        if(chat){
            var node = chat.getComponent('messenger-chat-notifications');
            if(state){
                var message = state,
                    html = '',
                    type = '';

                if(state == Tine.Messenger.ChatHandler.COMPOSING_STATE){
                    message = state;
                } else if(state == Tine.Messenger.ChatHandler.PAUSED_STATE){
                    message = state;
                } else {
                    message = state;
                }
                html = Tine.Messenger.ChatHandler.formatChatStateMessage(message, type);
                node.body.dom.innerHTML = html;
                node.show();
                if (state == Tine.Messenger.ChatHandler.PAUSED_STATE) {
                    Tine.Messenger.ChatHandler.clearPausedStateMessage = setTimeout(
                        function () {
                            node.hide();
                        },
                        2000
                    );
                } else {
                    clearTimeout(Tine.Messenger.ChatHandler.clearPausedStateMessage);
                }
            } else {
                node.hide();
            }
        }
    },
    
    formatChatStateMessage: function(message, type){
        var html = '<div class="chat-notification">' 
                  +    message
                  +'</div>';
        return html;
    },
    
    /**
     * 
     * @description deprecated
     */
    resetState: function (chat_id, current_state) {
        var title = Ext.getCmp(chat_id).title,
            new_title = title;
            
        var chat = Ext.getCmp(chat_id),
            message = current_state,
            type = '';
            
        if (title.indexOf(Tine.Messenger.ChatHandler.COMPOSING_STATE) >= 0) {
            new_title = title.substring(0, title.indexOf(Tine.Messenger.ChatHandler.COMPOSING_STATE));
        }
        
        if (title.indexOf(Tine.Messenger.ChatHandler.PAUSED_STATE) >= 0) {
            new_title = title.substring(0, title.indexOf(Tine.Messenger.ChatHandler.PAUSED_STATE));
        }
        
//        Ext.getCmp(chat_id).setTitle(new_title);
//        Tine.Messenger.Log.debug("Vai mudar -"+message);
//        console.log(chat);
        Tine.Messenger.ChatHandler.onNotificationMessage(chat, message, type);
    },
    
    sendMessage: function (msg, id) {
        var myNick = Tine.Messenger.Credential.myNick();
        Tine.Messenger.Application.connection.send($msg({
            "to": Tine.Messenger.Util.idToJid(id),
            "type": 'chat'})
          .c("body").t(msg).up()
          .c("active", {xmlns: "http://jabber.org/protocol/chatstates"}));
        Tine.Messenger.ChatHandler.setChatMessage(id, msg, myNick);
        
        return true;
    },
    
    sendState: function (id, state) {
        var jid = Tine.Messenger.Util.idToJid(id),
            notify = $msg({to: jid, "type": "chat"})
                     .c(state, {xmlns: "http://jabber.org/protocol/chatstates"});
        
//        if (Tine.Messenger.RosterHandler.isContactAvailable(jid)) {
        if (!Tine.Messenger.RosterHandler.isContactUnavailable(jid)){
            Tine.Messenger.Application.connection.send(notify);
        }
          
        return true;
    },
    
    replaceEmotions: function(message){
        var key = '',
            img = '',
            $xml = $(Tine.Messenger.Application.xml_raw.responseText),
            $emoticons = $xml.find("emoticon");
        
        $emoticons.each(function(){ 
            $(this).find("string").each(function(){
                key = $(this).text().trim();
                img = $(this).parent().attr("file").trim();
                message = message.replace(key, "<img src='/images/messenger/emoticons/"+img+".png' alt='"+img+"' />");
            });
        });
        return message;
    },
    
    disconnect: function() {
        Tine.Tinebase.appMgr.get('Messenger').stopMessenger();
        Tine.Messenger.RosterHandler.clearRoster();
    },
    
    onMUCMessage: function (message) {
        var raw_jid = $(message).attr("from"),
            inviter = $(message).find("invite").attr("from"),
            reason = $(message).find("invite").find("reason").text() || '',
            body = $(message).find("body").text() || '',
            jid = $(message).attr("to"),
            nick = Tine.Messenger.Credential.myNick();
            
        var host = Strophe.getDomainFromJid(raw_jid),
            room = Strophe.getNodeFromJid(raw_jid);
            
        var dialog = Ext.getCmp("messenger-groupchat");
        
        if(!dialog)
            dialog = new Tine.Messenger.WindowConfig(Tine.Messenger.WindowLayout.Chat).show();
        
        dialog.findById('messenger-groupchat-identity').setValue(jid);
        dialog.findById('messenger-groupchat-host').setValue(host);
        dialog.findById('messenger-groupchat-room').setValue(room);
        dialog.findById('messenger-groupchat-nick').setValue(nick);
//        dialog.findById('messenger-groupchat-pwd')
        return true;
    },
    
    /**
     * 
     * @description deprecated
     */
    onNotificationMessage: function (chat, message, type){
        var html = '<div class="chat-notification">' 
                  +    message
                  +'</div>';
        var node = chat.getComponent('messenger-chat-notifications');
        node.hide();
//        html.delay(8000).fadeOut("slow");
        node.body.dom.innerHTML = html;
        node.show();
//        chat.body.dom.innerHTML = html;
    },
    
    connect: function(status, statusText) {
        messengerLogin(status, statusText);
    }
    
}

function messengerLogin(status, statusText) {
    Tine.Tinebase.appMgr.get('Messenger').startMessenger(status, statusText);
}

Tine.Messenger.saveForFile = function (options) {
    options = options ? options : {};
    
    var requestOptions = {
        url: '/messenger/sendToFile.php',
        type: 'POST',
        scope: this,
//        params: options.params,
//        callback: options.callback,
        success: function(response) {
            console.log('SUCESS:');
            console.log(response);
        },
        // note incoming options are implicitly jsonprc converted
        failure: function (response, jsonrpcoptions) {
            console.log('ERROR:');
            console.log(response);
        }
    };

    if (options.timeout) {
        requestOptions.timeout = options.timeout;
    }

    this.transId = Ext.Ajax.request(requestOptions);

    return this.transId;
}