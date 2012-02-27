Ext.ns('Tine.Messenger');

Tine.Messenger.ChatHandler = {
    jidToId: function (jid) {
        return jid.replace(/@/g, "_").replace(/\./g, "-");
    },
    
    idToJid: function (id) {
        return id.replace(/_/g, "@").replace(/\-/g, ".");
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
    
    onIncomingMessage: function (message) {
        var raw_jid = $(message).attr("from");
        var jid = Strophe.getBareJidFromJid(raw_jid);
        var id = Tine.Messenger.ChatHandler.jidToId(jid);
        var name = $(message).attr("name") || raw_jid;
        var chat_id = "#messenger-chat-"+id;
        var chat_sender = chat_id+" .text-sender";
        
        // Shows the chat specifc chat window
        Tine.Messenger.ChatHandler.showChatWindow(chat_id, name);
        var chat_area = Ext.getCmp(chat_id).items.items[0];
        
        // Capture the message body element, 
        // extract text and append to chat area
        var body = $(message).find("html > body");
        if (body.length === 0) {
            body = $(message).find("body");
        }
        var space = '&nbsp;&nbsp;&nbsp;&nbsp;',
            msg = body.text(),
            txt = "<span class=\"recv\">&lt;"+name+"&gt;"+space+msg+"</span><br/>";
        chat_area.add({
            xtype: 'panel',
            html: txt
        });
        chat_area.doLayout();
        var panel_id = '#'+chat_area.getId()+' .x-panel-body';
        $(panel_id).scrollTop($(panel_id).get(0).scrollHeight);
        
        Tine.Messenger.Log.debug(txt);

        return true;
    },
    
    onOutgoingMessage: function (message) {
        return true;
    }
}