Ext.ns('Tine.Messenger');

Tine.Messenger.Chat = Ext.extend(Ext.Window, {
    iconCls:     'messenger-icon',
    width:       350,
    height:      300,
    closeAction: 'hide', //'close' - destroy the component
    plain:       true,
    
    items: [
        {xtype: 'htmleditor'}
    ],

    constructor: function () {
        Ext.apply(this, {
            iconCls:     this.iconCls,
            width:       this.width,
            height:      this.height,
            closeAction: this.closeAction,
            plain:       this.plain,
            items:       this.items
        });

        Tine.Messenger.Chat.superclass.constructor.apply(this, arguments);
    }
});