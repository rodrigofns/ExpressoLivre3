Tine.Messenger.Window = new Ext.Window({
    title: 'Expresso Messenger',
    iconCls: 'messenger-icon',
    width:250,
    height:450,
    closeAction: 'hide', //'close' - destroy the component
    plain: true,

    buttons: [{
        text: 'Close',
        handler: function(){
            Tine.Messenger.Window.hide();
        }
    }]
});