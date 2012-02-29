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
    },

    startMessenger: function () {
        Tine.Messenger.Log.debug("Starting Messenger...");
        //var con = new Strophe.Connection("/http-bind");
        Tine.Messenger.Application.connection = new Strophe.Connection("/http-bind");
        Tine.Messenger.Application.connection.connect('marcio@simdev.sdr.serpro/expresso-3.0',
                                                      '12345',
                                                      this.connectionHandler);
    },
    
    connectionHandler: function (status) {
        Tine.Messenger.Log.debug(status);
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
            Tine.Messenger.Application.connection.send($pres());
            
            // START THE HANDLERS
            // Chat Messaging handler
            Tine.Messenger.Application.connection.addHandler(
                Tine.Messenger.ChatHandler.onIncomingMessage, null, 'message', 'chat'
            );
            
            // Getting Roster
            var roster = $iq({"type": "get"}).c("query", {"xmlns": "jabber:iq:roster"});
            Tine.Messenger.Application.connection.sendIQ(
                roster, Tine.Messenger.RosterHandler.onStartRoster
            );
            
            // Roster handler
            Tine.Messenger.Application.connection.addHandler(
                Tine.Messenger.RosterHandler.onStartRoster, null, "iq", null, "myroster"
            );

            // Start unload events
            window.onbeforeunload = function () {
                return "You're logged in Messenger. If you leave the page, Messenger will disconnect!";
            }

            // Leaving the page cause disconnection
            window.onunload = function () {
                Tine.Messenger.Application.connection.disconnect('Leaving the Expresso Messenger page!');
            }
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
    },
    
    bindUnloadEvents: function () {
        // Disconnection warning on leaving the page
        window.onbeforeunload = function () {
            alert('SAINDO...');
            return "You're logged in Messenger. If you leave the page, Messenger will disconnect!";
        }

        // Leaving the page cause disconnection
        window.onunload = function () {
            Tine.Messenger.Application.connection.disconnect('Leaving the Expresso Messenger page!');
        }
    },
    
    unbindUnloadEvents: function () {
        window.onbeforeunload = null;
        window.onunload = null;
    }
    
});

Tine.Messenger.Util = {
    jidToId: function (jid) {
        return jid.replace(/@/g, "_").replace(/\./g, "-");
    },
    
    idToJid: function (id) {
        var clean = (id.indexOf(MESSENGER_CHAT_ID_PREFIX) >= 0) ?
            id.substring(MESSENGER_CHAT_ID_PREFIX.length) :
            id;
        return clean.replace(/_/g, "@").replace(/\-/g, ".");
    }
}