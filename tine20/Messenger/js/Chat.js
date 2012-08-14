Ext.ns('Tine.Messenger');

Tine.Messenger.Chat = Ext.extend(Ext.Window, {
    
    constructor: function () {
        Ext.apply(this, Tine.Messenger.Config.ChatWindowLayout);
        Tine.Messenger.Chat.superclass.constructor.apply(this, arguments);
    },
    
    setTextfieldFocus: function () {
        this.getComponent(2).focus(false, 200); // foco no textfield
    }
    
});