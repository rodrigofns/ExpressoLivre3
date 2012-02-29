Ext.ns('Tine.Messenger');

// Messenger Application constants
var MESSENGER_CHAT_ID_PREFIX = '#messenger-chat-';
    

// Show Messenger's messages (info, errors, etc)
// in the browsers debugging console
// ex.: Chrome's Developer Tools, Firebug, etc
Tine.Messenger.Log = {
    prefix: 'EXPRESSO MESSENGER: ',
    
    info: function (txt) {
        Tine.log.info(Tine.Messenger.Log.prefix + txt);
    },
    
    error: function (txt) {
        Tine.log.error(Tine.Messenger.Log.prefix + txt);
    },
    
    debug: function (txt) {
        Tine.log.debug(Tine.Messenger.Log.prefix + txt);
    },
    
    warn: function (txt) {
        Tine.log.warn(Tine.Messenger.Log.prefix + txt);
    }
};

Tine.Messenger.Application = Ext.extend(Tine.Tinebase.Application, {
    // Tinebase.Application configs
    hasMainScreen: false,
    
    // Delayed Tasks
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
        Tine.Tinebase.MainScreen.getMainMenu().insert(3, {
            xtype: 'button',
            html: '<span id="messenger">Messenger</span>',
            cls: 'messenger-icon',
            handler: function (bt, ev) {
                Tine.Messenger.Window.show();
            }
        });
        Tine.Tinebase.MainScreen.getMainMenu().doLayout();
        $("body").append('<div id="loghandler"></div>');
    },
    
    startMessenger: function () {
        Tine.Messenger.Log.debug("Starting Messenger...");
        var con = new Strophe.Connection("/http-bind");
        con.connect('marcio@simdev.sdr.serpro/expresso-3.0', '12345', function (status) {
            Tine.Tinebase.MainScreen.getMainMenu().onlineStatus.setStatus('offline');
            if (status === Strophe.Status.CONNECTING) {
                Tine.Messenger.Log.debug("Connecting...");
            } else if (status === Strophe.Status.CONNFAIL) {
                Tine.Messenger.Log.error("Connection failed!");
                Ext.Msg.show({
                    title:'Error',
                    msg: 'Authentication failed!',
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.ERROR
                });
            } else if (status === Strophe.Status.AUTHENTICATING) {
                Tine.Messenger.Log.debug("Authenticating...");
            } else if (status === Strophe.Status.CONNECTED) {
                Tine.Messenger.Log.debug("Connected!");
                Tine.Tinebase.MainScreen.getMainMenu().onlineStatus.setStatus('online');
                // Send user presence
                con.send($pres());
                // Setting the connection property
                Tine.Messenger.Application.connection = con;
                
                // START THE HANDLERS
                // Chat Messaging handler
                Tine.Messenger.Application.connection.addHandler(
                    Tine.Messenger.ChatHandler.onIncomingMessage, null, 'message', 'chat'
                );
                Tine.Messenger.Application.connection.addHandler(
                    Tine.Messenger.LogHandler.getPresence, null, 'presence'
                );
                Tine.Messenger.Application.connection.addHandler(
                    Tine.Messenger.LogHandler.onErrorMessage, null, 'message','error'
                );
                
                var roster = $iq({"type": "get"}).c("query", {"xmlns": "jabber:iq:roster"});
                con.sendIQ(roster, Tine.Messenger.RosterHandler.onStartRoster);
                Tine.Messenger.Application.connection.addHandler(
                    Tine.Messenger.RosterHandler.onStartRoster, null, "iq", null, "myroster"
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