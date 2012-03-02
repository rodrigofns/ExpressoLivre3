Ext.ns('Tine.Messenger');

Tine.Messenger.ChatHandler = {
    
    formatChatId: function (jid) {
        return (jid.indexOf('@') >= 0) ? 
            MESSENGER_CHAT_ID_PREFIX + Tine.Messenger.Util.jidToId(jid) :
            jid;
    },
    
    showChatWindow: function (jid, name) {
        // Transform jid to chat id
        var chat_id = Tine.Messenger.ChatHandler.formatChatId(jid);
        
        // Shows the chat window OR
        if (Ext.getCmp(chat_id)) {
            Ext.getCmp(chat_id).show();
        // Creates it if doesn't exist and show
        } else {
            var chat = new Tine.Messenger.Chat({
                title: _('Chat with ') + name + ' (' + jid + ')',
                id: chat_id
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
    setChatMessage: function (id, msg, name, flow) {
        var chat_id = Tine.Messenger.ChatHandler.formatChatId(id),
            chat_area = Ext.getCmp(chat_id).items.items[0],
            panel_id = '#'+chat_area.getId()+' .x-panel-body';
        
        chat_area.add({
            xtype: 'panel',
            html: Tine.Messenger.ChatHandler.formatMessage(msg, name, flow),
            cls: 'chat-message'
        });
        chat_area.doLayout();

        $(panel_id).scrollTop($(panel_id).get(0).scrollHeight);

        Tine.Messenger.Log.debug(((flow) ? 'Incoming: ' : 'Outgo: ') + msg);
    },
    
    onIncomingMessage: function (message) {
        var raw_jid = $(message).attr("from");
        var jid = Strophe.getBareJidFromJid(raw_jid);
        var name = $(message).attr("name") ||
                   Ext.getCmp('messenger-roster').getRootNode().findChild('id', jid).text;
        
        // Shows the chat specifc chat window
        Tine.Messenger.ChatHandler.showChatWindow(jid, name);
        
        // Capture the message body element, 
        // extract text and append to chat area
        var body = $(message).find("html > body");
        if (body.length === 0) {
            body = $(message).find("body");
        }
        Tine.Messenger.ChatHandler.setChatMessage(jid, body.text(), name, 'messenger-receive');
        
        return true;
    },
    onIncoming: function(message){
        var raw_jid = $(message).attr("from");
        var jid = Strophe.getBareJidFromJid(raw_jid);
        
        var composing = $(message).children("composing");
        var msg = $(message).children("body");
        var paused = $(message).children("paused");

        if(msg.length > 0){
            Tine.Messenger.Log.debug(_("Message received!"));
            Tine.Messenger.ChatHandler.onIncomingMessage(message);
        }else if(paused.length > 0){
            Tine.Messenger.Log.debug(_("Stopped typing!"));
        }else if(composing.length > 0){
            Tine.Messenger.Log.debug(jid + _(" is typing..."));
        }
        
        return true;
    },
    
    sendMessage: function (msg, id) {
        Tine.Messenger.Application.connection.send($msg({
            "to": Tine.Messenger.Util.idToJid(id),
            "type": "chat"
        }).c("body").t(msg));
        Tine.Messenger.ChatHandler.setChatMessage(id, msg, _('ME'));
        
        return true;
    }
    
}