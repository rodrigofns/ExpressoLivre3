Ext.ns('Tine.Messenger');

var timeout = null;

Tine.Messenger.Chat = Ext.extend(Ext.Window, {
    
    constructor: function () {
        Ext.apply(this, {
            iconCls:     'messenger-icon',
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
                        specialkey: function (field, ev) {
                             if (ev.getKey() == ev.ENTER && ev.getKey().trim() != "") {
                                 Tine.Messenger.ChatHandler.sendMessage(field.getValue(), this.id);
                                 field.setValue("");
                             }
                        },
                        keypress: function (field, ev) {
                            Tine.Messenger.ChatHandler.sendState(this.id, 'composing');
                            if (ev.getKey() == ev.ENTER) {
                                Tine.Messenger.ChatHandler.sendState(this.id, 'paused');
                            }
                            var chat_id = this.id;
                            timeout = setTimeout(
                                function () {
                                    Tine.Messenger.ChatHandler.sendState(chat_id, 'paused');
                                },
                                3000
                            );
                        }
                    }
                }
            ]
        });

        Tine.Messenger.Chat.superclass.constructor.apply(this, arguments);
    }
    
});