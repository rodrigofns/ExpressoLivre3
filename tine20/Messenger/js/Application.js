Ext.ns('Tine.Messenger');

Tine.Messenger.Application = Ext.extend(Tine.Tinebase.Application, {
    hasMainScreen: false,
    
    showMessengerDelayedTask: null,
    
    startMessengerDelayedTask: null,
    
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
        
        insertEl.prepend(el);
            
        el.click(function () {
            Tine.Messenger.Window.show();
        });
    },
    
    startMessenger: function () {
        var con = new Strophe.Connection("/http-bind");
        con.connect('marcio@simdev.sdr.serpro/expresso-3.0', '12345', function (status) {
            if (status === Strophe.Status.CONNECTED) {
                alert("connected");
            } else if (status === Strophe.Status.DISCONNECTED) {
                alert("disconnected");
            } else {
                alert("STATUS: "+status);
            }
        });
        
        this.connection = con;
    }
});