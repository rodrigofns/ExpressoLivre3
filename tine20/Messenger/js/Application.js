Ext.ns('Tine.Messenger');

// Messenger Application constants
var MESSENGER_CHAT_ID_PREFIX = '#messenger-chat-';
    
Tine.Messenger.Application = Ext.extend(Tine.Tinebase.Application, {
    // Tinebase.Application configs
    hasMainScreen: false,
    
    // Delayed Tasks
    showMessengerDelayedTask: null,
    startMessengerDelayedTask: null,
    constructWindowDelayedTask: null,
    
    getTitle: function () {
        return "Expresso Messenger";
    },
    
    init: function () {
        Tine.Tinebase.MainScreen.getMainMenu().onlineStatus.setStatus('offline');
        
        this.showMessengerDelayedTask = new Ext.util.DelayedTask(this.showMessenger, this);
        this.showMessengerDelayedTask.delay(500);
        
        //this.startMessengerDelayedTask = new Ext.util.DelayedTask(this.startMessenger, this);
        //this.startMessengerDelayedTask.delay(500);
    },
    
    showMessenger: function () {
        Tine.Tinebase.MainScreen.getMainMenu().insert(3, {
            xtype: 'button',
            html: '<span id="messenger">Messenger</span>',
            cls: 'messenger-icon-off',
            listeners: {
                click: function () {
                    Tine.Messenger.Window.show();
                }
            }
        });
        Tine.Tinebase.MainScreen.getMainMenu().doLayout();
        $("body").append('<div id="loghandler"></div>');
    },
    
    stopMessenger: function () {
        Tine.Messenger.Log.debug("Stopping Messenger...");
        Tine.Messenger.Application.connection.disconnect();
        Tine.Messenger.Log.debug("Messenger Stopped!");
    },

    startMessenger: function () {
        Tine.Messenger.Log.debug("Starting Messenger...");
        Tine.Messenger.Application.connection = new Strophe.Connection("/http-bind");
        Tine.Messenger.Application.connection.connect(Tine.Tinebase.registry.get('messengerAccount').login,
                                                      Tine.Tinebase.registry.get('messengerAccount').password,
                                                      this.connectionHandler);
    },
    
    getConnection: function () {
        return Tine.Messenger.Application.connection;
    },
    
    connectionHandler: function (status) {
        Tine.Tinebase.MainScreen.getMainMenu().onlineStatus.setStatus('offline');
        if (status === Strophe.Status.CONNECTING) {
            Tine.Messenger.Log.debug("Connecting...");
            // When connecting OK, take off the line below
            Ext.getCmp('messenger-connect-button').disable().setText('Connecting...');
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
            // When connecting OK, take off the line below
            Ext.getCmp('messenger-connect-button').setText('Authenticating...');
        } else if (status === Strophe.Status.CONNECTED) {
            $("#messenger").parent().removeClass("messenger-icon-off").addClass("messenger-icon");
            Tine.Messenger.Log.debug("Connected!");
            // When connecting OK, take off the line below
            Ext.getCmp('messenger-connect-button').enable().setText('Disconnect');
            
            // START THE HANDLERS
            // Chat Messaging handler
            Tine.Messenger.Application.connection.addHandler(
//                Tine.Messenger.ChatHandler.onIncomingMessage, null, 'message', 'chat'
                Tine.Messenger.LogHandler.onIncoming, null, 'message', 'chat'
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

            // Log handlers
//            Tine.Messenger.Application.connection.addHandler(
//                Tine.Messenger.LogHandler.getPresence, null, 'presence'
//            );
            Tine.Messenger.Application.connection.addHandler(
                Tine.Messenger.LogHandler.onErrorMessage, null, 'message', 'error'
            );
            Tine.Messenger.Application.connection.addHandler(
                Tine.Messenger.Util.handle_pong, null, "iq", null, "ping1"
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
            Ext.Msg.alert('Expresso Messenger', 'Messenger has been disconnected!');
            Tine.Messenger.RosterHandler.clear();
            window.onbeforeunload = null;
            window.onunload = null;
        } else if (status === Strophe.Status.AUTHFAIL) {
            Ext.Msg.show({
                title:'Error',
                msg: 'Authentication failed!',
                buttons: Ext.Msg.OK,
                icon: Ext.MessageBox.ERROR
            });
            Ext.getCmp('messenger-connect-button').enable().setText('Connect');
        }
    }
    
});

Tine.Messenger.Util = {
    start_time: null,
    
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