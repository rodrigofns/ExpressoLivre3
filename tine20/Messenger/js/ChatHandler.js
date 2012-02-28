Ext.ns('Tine.Messenger');

Tine.Messenger.ChatHandler = {
    jidToId: function (jid) {
        return jid.replace(/@/g, "_").replace(/\./g, "-");
    },
    
    idToJid: function (id) {
        var clean = (id.indexOf(MESSENGER_CHAT_ID_PREFIX) >= 0) ?
            id.substring(MESSENGER_CHAT_ID_PREFIX.length) :
            id;
        return clean.replace(/_/g, "@").replace(/\-/g, ".");
    },
    
    showChatWindow: function (id, name) {
        // Shows the chat window OR
        if (Ext.getCmp(id)) {
            Ext.getCmp(id).show();
        // Creates it if doesn't exist and show
        } else {
            var chat = new Tine.Messenger.Chat({
                title: _('Chat with ')+name,
                id: id
            });
            chat.show();
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
    setChatMessage: function (chat_id, msg, name, flow) {
        var chat_area = Ext.getCmp(chat_id).items.items[0],
            panel_id = '#'+chat_area.getId()+' .x-panel-body';

        chat_area.add({
            xtype: 'panel',
            html: Tine.Messenger.ChatHandler.formatMessage(msg, name, flow),
            cls: 'chat-message'
        });
        chat_area.doLayout();

        $(panel_id).scrollTop($(panel_id).get(0).scrollHeight);

        Tine.Messenger.Log.debug('Incoming: '+msg);
    },
    
    onIncomingMessage: function (message) {
        var raw_jid = $(message).attr("from");
        var jid = Strophe.getBareJidFromJid(raw_jid);
        var id = Tine.Messenger.ChatHandler.jidToId(jid);
        var name = $(message).attr("name") || raw_jid;
        var chat_id = MESSENGER_CHAT_ID_PREFIX + id;
        
        // Shows the chat specifc chat window
        Tine.Messenger.ChatHandler.showChatWindow(chat_id, name);
        
        // Capture the message body element, 
        // extract text and append to chat area
        var body = $(message).find("html > body");
        if (body.length === 0) {
            body = $(message).find("body");
        }
        Tine.Messenger.ChatHandler.setChatMessage(chat_id, body.text(), name, 'messenger-receive');
        
        return true;
    },
    
    sendMessage: function (msg, id) {
        Tine.Messenger.Application.connection.send($msg({
            "to": Tine.Messenger.ChatHandler.idToJid(id),
            "type": "chat"
        }).c("body").t(msg));
        
        Tine.Messenger.ChatHandler.setChatMessage(id, msg, _('ME'));
        
        return true;
    }
}