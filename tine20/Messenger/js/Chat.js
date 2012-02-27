Ext.ns('Tine.Messenger');

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
                    style: 'width: 100%;',
                    cls:   'text-sender',
                    handleMouseEvents: true,
                    listeners: {
                        scope: this,
                        specialkey: function (field, ev) {
                             if (ev.getKey() == ev.ENTER){
                                 field.setValue("");
                             }  
                        }
                    }
                }
            ]
        });

        Tine.Messenger.Chat.superclass.constructor.apply(this, arguments);
    }
    
});