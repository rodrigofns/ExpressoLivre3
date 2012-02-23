Ext.ns('Tine.Messenger');

Tine.Messenger.Application = Ext.extend(Tine.Tinebase.Application, {
    hasMainScreen: false,
    
    showMessengerDelayedTask: null,
    
    startMessengerDelayedTask: null,
    
    startMessengerHandlersDelayedTask: null,
    
    // The XMPP Connection to the BOSH server
    connection: null,
    
    getTitle: function () {
        return "Expresso Messenger";
    },
    
    init: function () {
        this.showMessengerDelayedTask = new Ext.util.DelayedTask(this.showMessenger, this);
        this.showMessengerDelayedTask.delay(500);
        
        this.startMessengerDelayedTask = new Ext.util.DelayedTask(this.startMessenger, this);
        this.startMessengerDelayedTask.delay(500);
    },
    
    showMessenger: function () {
        var el = $('<span id="messenger" class="messenger-icon">Messenger</span>'),
            insertEl = $("#ext-gen52").parent("em");
        
        $('#ext-gen52').html('');
        insertEl.prepend(el);
            
        el.click(function () {
            Tine.Messenger.Window.show();
        });
    },
    
    startMessenger: function () {
        console.log("START MESSENGER");
        var con = new Strophe.Connection("/http-bind");
        con.connect('marcio@simdev.sdr.serpro/expresso-3.0', '12345', function (status) {
            $('#ext-gen52').html('(offline)');
            if (status === Strophe.Status.CONNECTED) {
                $('#ext-gen52').html('(online)');
                // Send user presence
                con.send($pres());
                // Setting the connection property
                Tine.Messenger.Application.connection = con;
                // Start the handlers
                Tine.Messenger.Application.connection.addHandler(
                    Tine.Messenger.ChatHandler.onIncomingMessage, null, 'message', 'chat'
                );
            } else if (status === Strophe.Status.DISCONNECTED) {
                Ext.Msg.alert('Expresso Messenger', 'Disconnected!');
            } else if (status === Strophe.Status.AUTHFAIL) {
                Ext.Msg.show({
                    title:'Error',
                    msg: 'Authentication failed!',
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.ERROR
                });
            }
        });
    }
    
});