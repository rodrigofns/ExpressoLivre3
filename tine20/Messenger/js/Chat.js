Ext.ns('Tine.Messenger');

Tine.Messenger.Chat = Ext.extend(Ext.Window, {
    
    constructor: function () {
        Ext.apply(this, {
            iconCls:     'messenger-icon',
            cls:         'messenger-chat-window',
            width:       350,
            height:      300,
            closeAction: 'hide', //'close' - destroy the component
            plain:       true,
            layout: 'border',            
            items: [
                {
                    region: 'center',
                    xtype: 'panel',
                    style: 'width: 100%;',
                    autoScroll: true
                },
                {
                    region: 'south',
                    xtype: 'textfield',
                    cls:   'text-sender',
                    handleMouseEvents: true,
                    enableKeyEvents: true,
                    listeners: {
                        scope: this,
//                        specialkey: function (field, ev) {
//                             if (ev.getKey() == ev.ENTER && field.getValue().trim() != '') {
//                                 Tine.Messenger.ChatHandler.sendMessage(field.getValue(), this.id);
//                                 field.setValue("");
//                                 Tine.Messenger.Chat.textToSend = '';
//                             }
//                        },
                        keypress: function (field, ev) {
                            Tine.Messenger.ChatHandler.sendState(this.id, 'composing');
                            if (ev.getKey() != ev.ENTER) {
                                var chat_id = this.id;
                                if (Tine.Messenger.Chat.checkPauseInterval == null) {
                                    Tine.Messenger.Chat.checkPauseInterval = setInterval(
                                        function () {
                                            console.log(Tine.Messenger.Chat.textToSend);
                                            if (field.getValue() == Tine.Messenger.Chat.textToSend) {
                                                Tine.Messenger.ChatHandler.sendState(chat_id, 'paused');
                                            } else {
                                                Tine.Messenger.Chat.textToSend = field.getValue();
                                            }
                                        },
                                        2000
                                    );
                                }
                            } else if (field.getValue().trim() != '') {
                                Tine.Messenger.ChatHandler.sendMessage(field.getValue(), this.id);
                                field.setValue("");
                                Tine.Messenger.Chat.textToSend = '';
                            }
                        }
                    }
                }
            ]
        });

        Tine.Messenger.Chat.superclass.constructor.apply(this, arguments);
    }
    
});