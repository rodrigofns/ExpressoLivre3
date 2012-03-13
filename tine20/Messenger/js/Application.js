Ext.ns('Tine.Messenger');

// Messenger Application constants
var MESSENGER_CHAT_ID_PREFIX = '#messenger-chat-',
    AVAILABLE_CLASS = 'messenger-contact-available',
    UNAVAILABLE_CLASS = 'messenger-contact-unavailable',
    AWAY_CLASS = 'messenger-contact-away',
    DONOTDISTURB_CLASS = 'messenger-contact-donotdisturb',
    WAITING_CLASS = 'messenger-contact-waiting',
    UNSUBSCRIBED_CLASS = 'messenger-contact-unsubscribed';
    
Tine.Messenger.Application = Ext.extend(Tine.Tinebase.Application, {
    // Tinebase.Application configs
    hasMainScreen: false,
    
    // Delayed Tasks
    showMessengerDelayedTask: null,
    startMessengerDelayedTask: null,
    constructWindowDelayedTask: null,
    
    // Upload XML emoticons information
    xml_raw: null,
    
    getTitle: function () {
        return "Expresso Messenger";
    },
    
    init: function () {
        this.showMessengerDelayedTask = new Ext.util.DelayedTask(this.showMessenger, this);
        this.showMessengerDelayedTask.delay(500);
        
        //this.startMessengerDelayedTask = new Ext.util.DelayedTask(this.startMessenger, this);
        //this.startMessengerDelayedTask.delay(500);
    },
    
    showMessenger: function () {
        Tine.Tinebase.MainScreen.getMainMenu().insert(2, {
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
        Tine.Tinebase.appMgr.get('Messenger').getConnection().disconnect();
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
        if (status === Strophe.Status.CONNECTING) {
            Tine.Messenger.Log.debug("Connecting...");
            // When connecting OK, take off the line below
            Ext.getCmp('messenger-connect-button')
                .disable()
                .setIcon('/images/messenger/hourglass.png');
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
        } else if (status === Strophe.Status.CONNECTED) {
            Tine.Messenger.Log.debug("Connected!");
            
            // Enable components
            Tine.Messenger.IM.enableOnConnect();
            
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
                
            // Updating Roster
            Tine.Messenger.Application.connection.addHandler(
                Tine.Messenger.RosterHandler.onRosterUpdate, 'jabber:client', 'iq', 'set'
            );

            Tine.Messenger.Application.connection.addHandler(
                Tine.Messenger.LogHandler.onErrorMessage, null, 'message', 'error'
            );
            
            // Load emoticons.xml
            Tine.Messenger.Application.xml_raw = $.get("/images/messenger/emoticons/emoticons.xml",{dataType: "xml"});
        
            // Start unload events
            window.onbeforeunload = function () {
                return "You're logged in Messenger. If you leave the page, Messenger will disconnect!";
            }

            // Leaving the page cause disconnection
            window.onunload = function () {
                Tine.Messenger.Application.connection.disconnect('Leaving the Expresso Messenger page!');
            }
        } else if (status === Strophe.Status.DISCONNECTED) {
            // Disable components
            Tine.Messenger.IM.disableOnDisconnect();
            
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

Tine.Messenger.IM = {
    enableOnConnect: function(){
        // Change IM icon
        $("#messenger").parent().removeClass("messenger-icon-off").addClass("messenger-icon");
        
        Ext.getCmp('messenger-connect-button').connectionStatus = 'Disconnect';
        Ext.getCmp('messenger-connect-button')
            .enable()
            .setIcon('/images/messenger/disconnect.png')
            .setTooltip('Disconnect');
        Ext.getCmp('messenger-contact-add').enable();
        Ext.getCmp('messenger-change-status-button')
            .enable()
            .setIcon('/images/messenger/user_online.png');
        
        // Enable action Add Group
        Ext.getCmp('messenger-group-mngt-add').enable();
    },
    disableOnDisconnect: function(){
        // Change IM icon
        $("#messenger").parent().removeClass("messenger-icon").addClass("messenger-icon-off");
        
        // Disable action Add Group
        Ext.getCmp('messenger-group-mngt-add').disable();
        Ext.getCmp('messenger-contact-add').disable();
        Ext.getCmp('messenger-change-status-button')
            .disable()
            .setIcon('/images/messenger/user_offline.png');
        Ext.getCmp('messenger-connect-button').connectionStatus = 'Connect';
        Ext.getCmp('messenger-connect-button')
            .enable()
            .setIcon('/images/messenger/connect.png')
            .setTooltip('Connect');
    }
}

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