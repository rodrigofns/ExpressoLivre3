Ext.ns('Tine.Messenger');

// Messenger Application constants
var MESSENGER_CHAT_ID_PREFIX = '#messenger-chat-';

// Not used
var AVAILABLE_CLASS = 'available',
    UNAVAILABLE_CLASS = 'unavailable',
    AWAY_CLASS = 'away',
    XA_CLASS = 'xa',
    DONOTDISTURB_CLASS = 'donotdisturb',
    WAITING_CLASS = 'waiting',
    SUBSCRIBE_CLASS = 'subscribe',
    FROM_CLASS = 'from',
    NONE_CLASS = 'none',
    UNSUBSCRIBED_CLASS = 'unsubscribed';
    
// Status constants
const ST_AVAILABLE = 'available',
      ST_UNAVAILABLE = 'unavailable',
      ST_AWAY = 'away',
      ST_XA = 'auto status (idle)',
      ST_DONOTDISTURB = 'do not disturb';
    
// Subscription constants
const SB_NONE = 'none',
      SB_WAITING = 'waiting',
      SB_SUBSCRIBE = 'subscribe',
      SB_FROM = 'from',
      SB_UNSUBSCRIBED = 'unsubscribed',
      SB_BOTH = 'both';
    
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
            Tine.Messenger.RosterHandler.clearRoster();
            // Disable components
            Tine.Messenger.IM.disableOnDisconnect();
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
                Tine.Messenger.RosterHandler.onRosterResult, 'jabber:client', 'iq', 'result'
            );

            Tine.Messenger.Application.connection.addHandler(
                Tine.Messenger.LogHandler.onErrorMessage, null, 'message', 'error'
            );
            Tine.Tinebase.appMgr.get('Messenger').getConnection().addHandler(
                Tine.Messenger.LogHandler.getPresence, 'jabber:client', 'presence'
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
            Tine.Messenger.RosterHandler.clearRoster();
            // Disable components
            Tine.Messenger.IM.disableOnDisconnect();
            
            Ext.Msg.alert('Expresso Messenger', 'Messenger has been disconnected!');
            window.onbeforeunload = null;
            window.onunload = null;
        } else if (status === Strophe.Status.AUTHFAIL) {
            Tine.Messenger.RosterHandler.clearRoster();
            // Disable components
            Tine.Messenger.IM.disableOnDisconnect();
            Ext.Msg.show({
                title:'Error',
                msg: 'Authentication failed!',
                buttons: Ext.Msg.OK,
                icon: Ext.MessageBox.ERROR
            });
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
            .setIcon('/images/messenger/connected.png')
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
            .setIcon('/images/messenger/disconnected.png')
            .setTooltip('Connect');
            
        // Close all chats
        var chats = Ext.query('.messenger-chat-window');
        Ext.each(chats, function (item, index) {
            Ext.getCmp(item.id).close();
        });
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
    },
    getStatusClass: function(status){
        var AVAILABLE_CLS = 'available',
            UNAVAILABLE_CLS = 'unavailable',
            AWAY_CLS = 'away',
            XA_CLS = 'xa',
            DONOTDISTURB_CLS = 'donotdisturb';
        switch(status){
            case ST_AVAILABLE:
                return AVAILABLE_CLS;
            case ST_UNAVAILABLE:
                return UNAVAILABLE_CLS;
            case ST_AWAY:
                return AWAY_CLS;
            case ST_XA:
                return XA_CLS;
            case ST_DONOTDISTURB:
                return DONOTDISTURB_CLS;
            case 'ALL':
                return  AVAILABLE_CLS
                  +','+ UNAVAILABLE_CLS
                  +','+ AWAY_CLS
                  +','+ XA_CLS
                  +','+ DONOTDISTURB_CLS;
            default:
                return '';
        }
        return null;
    },
    getSubscriptionClass: function(subscription){
        var WAITING_CLS = 'waiting',
            SUBSCRIBE_CLS = 'subscribe',
            FROM_CLS = 'from',
            NONE_CLS = 'none',
            UNSUBSCRIBED_CLS = 'unsubscribed';
        switch(subscription){
            case SB_WAITING:
                return WAITING_CLS;
            case SB_SUBSCRIBE:
                return SUBSCRIBE_CLS;
            case SB_FROM:
                return FROM_CLS;
            case SB_NONE:
                return NONE_CLS;
            case SB_UNSUBSCRIBED:
                return UNSUBSCRIBED_CLS;
            case 'ALL':
                return  WAITING_CLS
                  +','+ SUBSCRIBE_CLS
                  +','+ FROM_CLS
                  +','+ NONE_CLS
                  +','+ UNSUBSCRIBED_CLS;
            default:
                return '';
        }
        return null;
    }
}