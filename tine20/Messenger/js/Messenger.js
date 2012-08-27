Ext.ns('Tine.Messenger');

// Messenger Application constants
var MESSENGER_CHAT_ID_PREFIX = 'messenger-chat-',
    MESSENGER_DEBUG = false;

Tine.Messenger.factory={
    statusStore : new Ext.data.SimpleStore({
        fields:["value","text"],
        data:[
              ["available","Online"]
             ,["away","Away"]
             ,["dnd","Do Not Disturb"]
             ,["unavailable","Unavailable"]
//             ,["chat","Chat"]
//             ,["xa","XA"]
            ]
        })
};

Tine.Messenger.Credential = {
    
    myJid: function(){
        return '';
    }
  , myNick: function(){
        return 'ME';
    }
  , myAvatar: function(){
        return '/images/empty_photo_male.png';
    }
  , getHtml: function(){
            return '<div id="credential">'+
                    '     <img src="'+ this.myAvatar() +'" />'+
                    '     <span class="name">'+ this.myJid() +'</span>'+
                    '</div>';
    }
};

var IMConst = {
   // Status constants
    ST_AVAILABLE : {id:"available", text:"Available"},
    ST_UNAVAILABLE : {id:"unavailable", text:"Unavailable"},
    ST_AWAY : {id:"away", text:"Away"},
    ST_XA : {id:"xa", text:"Auto Status (idle)"},
    ST_DONOTDISTURB : {id:"dnd", text:"Do Not Disturb"},
    
  // Subscription constants  
    SB_NONE : "none",
    SB_FROM : "from",
    SB_BOTH : "both",
    SB_TO : "to",
    SB_WAITING : "waiting",
    SB_SUBSCRIBE : "subscribe",
    SB_SUBSCRIBED : "subscribed",
    SB_UNSUBSCRIBE : "unsubscribe",
    SB_UNSUBSCRIBED : "unsubscribed"
    
};

Tine.Messenger.Application = Ext.extend(Tine.Tinebase.Application, {
    // Tinebase.Application configs
    hasMainScreen: false,
    appName: 'Messenger',
    
    // Delayed Tasks
    showMessengerDelayedTask: null,
    startMessengerDelayedTask: null,
    
    // Upload XML emoticons information
    xml_raw: null,
    
    getTitle: function () {
        return this.i18n.ngettext('Messenger', 'Messengers', 1);
    },
    
    init: function () {
        // Shows IM window and starts communication
        this.showMessengerDelayedTask = new Ext.util.DelayedTask(this.showMessenger, this);
        this.showMessengerDelayedTask.delay(500);
        this.startMessengerDelayedTask = new Ext.util.DelayedTask(this.startMessenger, this);
        this.startMessengerDelayedTask.delay(500);
        
        // Sets Messenger config panel
        
    },
    
    debugFunction: function () {
        Tine.Messenger.Application.connection.xmlInput = function (xml) {
            console.log('\\/ |\\/| |     |  |\\ |');
            console.log('/\\ |  | |__   |  | \\|');
            console.log(xml);
            console.log('Copy >>> '+(new XMLSerializer()).serializeToString(xml));
            var challenge = $(xml).find('challenge');
            if (challenge.length > 0)
                console.log(challenge.text());
            console.log('============================');
        };
        Tine.Messenger.Application.connection.xmlOutput = function (xml) {
            console.log('\\/ |\\/| |     /==\\ | | ====');
            console.log('/\\ |  | |__   \\__/ |_|   |');
            console.log(xml);
            console.log('Copy >>> '+(new XMLSerializer()).serializeToString(xml));
            var response = $(xml).find('response');
            if (response.length > 0)
                console.log(response.text());
            console.log('============================');
        };
    },
    
    showMessenger: function () {
        Tine.Tinebase.MainScreen.getMainMenu().insert(2, {
            xtype: 'button',
            html: '<span id="messenger">Messenger</span>',
            cls: 'messenger-icon-off',
            listeners: {
                click: function () {
                      if(!Ext.getCmp("ClientDialog")){
                        new Tine.Messenger.ClientDialog();
                      }
                      else{
                        Ext.getCmp("ClientDialog").show();
                      }
                }
            }
        });
        Tine.Tinebase.MainScreen.getMainMenu().doLayout();
        $("body").append('<div id="messenger-loghandler-status"></div>')
                 .append('<iframe id="iframe-upload" src="/upload.html" style="display: none;"></iframe>')
                 .append('<iframe id="iframe-download" src="" style="display: none;"></iframe>')
                 .append('<iframe id="iframe-history" src="" style="display: none;"></iframe>');
        $(window).resize(function(){
            Tine.Messenger.Window._onMoveWindowAction(Ext.getCmp('ClientDialog'));
            // Do to all open chats
            var chats = Ext.query('.messenger-chat-window');
            Ext.each(chats, function (item, index) {
                Tine.Messenger.Window._onMoveWindowAction(Ext.getCmp(item.id));
            });
        });
    },
    
    stopMessenger: function (reason) {
        reason = (reason == null) ? "" : ': ' + reason;
        Tine.Messenger.Log.debug("Stopping Messenger...");
        Tine.Tinebase.appMgr.get('Messenger').getConnection().disconnect('Leaving Messenger' + reason);
        Tine.Messenger.Log.debug("Messenger Stopped!");
    },

    startMessenger: function (status, statusText) {
        Tine.Messenger.Log.debug("Starting Messenger...");
        
        this.getPasswordForJabber();
        
        if(!Ext.getCmp("ClientDialog")){
            new Tine.Messenger.ClientDialog().show();
        }
        Ext.getCmp('ClientDialog').status = (status != null) ? status : IMConst.ST_AVAILABLE.id;
//        Ext.getCmp('ClientDialog').statusText = (statusText != null) ? statusText : Ext.getCmp('ClientDialog').statusText;
    },
    
    getConnection: function () {
        return Tine.Messenger.Application.connection;
    },
    
    getPasswordForJabber: function () {
        Ext.Ajax.request({
            params: {
                method: Tine.Messenger.IM.getLocalServerInfo,
                login: Tine.Tinebase.registry.get('currentAccount').accountLoginName
            },
            
            failure: function () {
                
            },
            
            success: function (response, request) {
                Tine.Tinebase.registry.add('messengerAccount', {
                    JID: Tine.Messenger.Util.getJidFromConfig(),
                    PWD: base64.encode(response.responseText)
                });

                Tine.Messenger.Application.connection = new Strophe.Connection("/http-bind");
                
                if (MESSENGER_DEBUG)
                    Tine.Tinebase.appMgr.get('Messenger').debugFunction();
                
                Tine.Messenger.Application.connection.connect(
                    Tine.Tinebase.registry.get('messengerAccount').JID,
                    Tine.Tinebase.registry.get('messengerAccount').PWD,
                    Tine.Tinebase.appMgr.get('Messenger').connectionHandler
                );
            }
        });
    },
    
    connectionHandler: function (status) {
        console.log('STATUS: ' + status);
        if (status === Strophe.Status.CONNECTING) {
            Tine.Messenger.Log.debug("Connecting...");
            // When connecting OK, take off the line below
            Ext.getCmp('messenger-connect-cmd').setText(IM.i18n()._('Connecting')+'...').disable();
            $('.messenger-connect-display img').css('display','block');
            
        } else if (status === Strophe.Status.CONNFAIL) {
            Tine.Messenger.RosterHandler.clearRoster();
            // Disable components
            Tine.Messenger.IM.disableOnDisconnect();
            Tine.Messenger.Log.error("Connection failed!");
            Ext.Msg.show({
                title: _('Error'),
                msg: _('Authentication failed')+'!',
                buttons: Ext.Msg.OK,
                icon: Ext.MessageBox.ERROR
            });
        } else if (status === Strophe.Status.AUTHENTICATING) {
            Tine.Messenger.Log.debug("Authenticating...");
            // When connecting OK, take off the line below
        } else if (status === Strophe.Status.CONNECTED || status == Strophe.Status.ATTACHED) {
            Tine.Messenger.Log.debug("Connected!");
            var XMPPConnection = Tine.Tinebase.appMgr.get('Messenger').getConnection();
            console.log(XMPPConnection);
            // Enable components
            Tine.Messenger.IM.enableOnConnect();
            
            // START THE HANDLERS
            // Chat Messaging handler
            XMPPConnection.addHandler(
                Tine.Messenger.ChatHandler.onIncomingMessage, null, 'message', 'chat'
            );
                
            // File Transfer
            XMPPConnection.addHandler(
                Tine.Messenger.FileTransfer.onRequest, null, 'message', 'filetransfer'
            );
                
            // Conference handler
            XMPPConnection.addHandler(
                Tine.Messenger.ChatHandler.onMUCMessage, null, 'message', 'normal'
            );
            
            // Getting Roster
            var roster = $iq({"type": "get"}).c("query", {"xmlns": "jabber:iq:roster"});
            XMPPConnection.sendIQ(
                roster, Tine.Messenger.RosterHandler._onStartRoster
            );
                
            // Updating Roster
            XMPPConnection.addHandler(
                Tine.Messenger.RosterHandler._onRosterUpdate, 'jabber:client', 'iq', 'set'
            );
              
            XMPPConnection.addHandler(
                Tine.Messenger.RosterHandler._onRosterGet, 'jabber:client', 'iq', 'get'
            );
                
            XMPPConnection.addHandler(
                Tine.Messenger.RosterHandler._onRosterResult, 'jabber:client', 'iq', 'result'
            );
            
            XMPPConnection.addHandler(
                Tine.Messenger.LogHandler._onError, 'jabber:client', 'iq', 'error'
            );

            XMPPConnection.addHandler(
                Tine.Messenger.LogHandler._onErrorMessage, null, 'message', 'error'
            );
                
            XMPPConnection.addHandler(
                Tine.Messenger.LogHandler._getPresence, 'jabber:client', 'presence'
            );

            // Load emoticons.xml
            Tine.Messenger.Application.xml_raw = $.get("/images/messenger/emoticons/emoticons.xml",{dataType: "xml"});
        
            // Start unload events
            window.onbeforeunload = function () {
                Tine.Tinebase.appMgr.get('Messenger').stopMessenger('Leave page!');
            }

            // Leaving the page cause disconnection
            window.onunload = function () {
                Tine.Tinebase.appMgr.get('Messenger').stopMessenger('Close window!');
            }
        } else if (status === Strophe.Status.DISCONNECTED) {
            Tine.Messenger.RosterHandler.clearRoster();
            // Disable components
            Tine.Messenger.IM.disableOnDisconnect();
            
            Ext.Msg.alert('Expresso Messenger', IM.i18n()._('Messenger has been disconnected!'));
            window.onbeforeunload = null;
            window.onunload = null;
        } else if (status === Strophe.Status.AUTHFAIL) {
            Tine.Messenger.RosterHandler.clearRoster();
            // Disable components
            Tine.Messenger.IM.disableOnDisconnect();
            Ext.Msg.show({
                title: IM.i18n()._('Error'),
                msg: IM.i18n()._('Authentication failed') + '!',
                buttons: Ext.Msg.OK,
                icon: Ext.MessageBox.ERROR
            });
        }
    }
    
});

Tine.Messenger.IM = {
    getLocalServerInfo: 'Messenger.getLocalServerInfo',
    
    enableOnConnect: function(){
        console.log('======> CHEGOU EM enableOnConnect');
        // Change IM icon
        $("#messenger").parent().removeClass("messenger-icon-off").addClass("messenger-icon");
        
        Ext.getCmp("ClientDialog").setIconClass('messenger-icon');
        Ext.getCmp("ClientDialog").connected = true;
        
        Ext.getCmp('messenger-contact-add').enable();
        Ext.getCmp('messenger-change-status-button')
            .enable()
            .setIcon('/images/messenger/user_online.png');
        
        // Enable action Add Group
        Ext.getCmp('messenger-group-mngt-add').enable();
        
        Ext.getCmp('messenger-connect-display').hide();
        
        Ext.getCmp('messenger-logout').enable();
    },
    disableOnDisconnect: function(){
        // Change IM icon
        $("#messenger").parent().removeClass("messenger-icon").addClass("messenger-icon-off");
        
        Ext.getCmp("ClientDialog").setIconClass('messenger-icon-off');
        Ext.getCmp("ClientDialog").connected = false;
        Ext.getCmp("ClientDialog").status = IMConst.ST_UNAVAILABLE.id;
        
        // Disable action Add Group
        Ext.getCmp('messenger-group-mngt-add').disable();
        Ext.getCmp('messenger-contact-add').disable();
        Ext.getCmp('messenger-logout').disable();
        Ext.getCmp('messenger-change-status-button')
            .setIcon('/images/messenger/user_unavailable.png');
            
        // Close all chats
        var chats = Ext.query('.messenger-chat-window');
        Ext.each(chats, function (item, index) {
            Ext.getCmp(item.id).close();
        });
        
        Ext.getCmp('messenger-connect-display').show();
        Ext.getCmp('messenger-connect-cmd').setText(IM.i18n()._('Connect')).enable();
        $('.messenger-connect-display img').css('display','none');
    }
};

Tine.Messenger.Util = {
    
    getJidFromConfig: function () {
        var domain = Tine.Tinebase.registry.get('messenger').messenger.domain,
            resource = Tine.Tinebase.registry.get('messenger').messenger.resource,
            name = Tine.Messenger.Util.getJabberName(Tine.Tinebase.registry.get('messenger').messenger.format);
        
        return name + '@' + domain + '/' + resource;
    },
    
    getJidFromConfigNoResource: function () {
        var domain = Tine.Tinebase.registry.get('messenger').messenger.domain,
            name = Tine.Messenger.Util.getJabberName(Tine.Tinebase.registry.get('messenger').messenger.format),
            jid = '';
            
        if (name != null)
            jid = name + '@' + domain;
            
        return jid;
    },
    
    getJabberName: function (format) {
        var name = '';
        
        switch (format) {
            case 'email':
                name = Tine.Messenger.Util.extractNameFromEmail(Tine.Tinebase.registry.get('userContact').email);
                break;
            case 'login':
                name = Tine.Tinebase.registry.get('userContact').account_id;
                break;
            default:
                name = Tine.Tinebase.registry.get('messenger').messenger.custom_name;
        }
        
        return name;
    },
    
    extractNameFromEmail: function (email) {
        return (email.indexOf('@') >= 0) ? email.substring(0, email.indexOf('@')) : email;
    },
    
    createJabberIDFromName: function () {
        var first_name = Tine.Tinebase.registry.get('userContact').n_given,
            last_name = Tine.Tinebase.registry.get('userContact').n_family;

        return first_name.toLowerCase() + '.' + last_name.toLowerCase();
    },
    
    jidToId: function (jid) {
        return jid.replace(/@/g, "_").replace(/\./g, "-").replace(/\//g, "__");
    },
    
    idToJid: function (id) {
        var clean = (id.indexOf(MESSENGER_CHAT_ID_PREFIX) >= 0) ?
            id.substring(MESSENGER_CHAT_ID_PREFIX.length) :
            id;
        return clean.replace(/\__/g, "/").replace(/\-/g, ".").replace(/_/g, "@");
    },
    
    getStatusClass: function(status){
        
        var AVAILABLE_CLS = 'available',
            UNAVAILABLE_CLS = 'unavailable',
            AWAY_CLS = 'away',
            XA_CLS = 'xa',
            DONOTDISTURB_CLS = 'donotdisturb';
            
        switch(status){
            case IMConst.ST_AVAILABLE:
                return AVAILABLE_CLS;
                
            case IMConst.ST_UNAVAILABLE:
                return UNAVAILABLE_CLS;
                
            case IMConst.ST_AWAY:
                return AWAY_CLS;
                
            case IMConst.ST_XA:
                return XA_CLS;
                
            case IMConst.ST_DONOTDISTURB:
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
            case IMConst.SB_WAITING:
                return WAITING_CLS;
                
            case IMConst.SB_SUBSCRIBE:
            case IMConst.SB_TO:
                return SUBSCRIBE_CLS;
                
            case IMConst.SB_FROM:
                return FROM_CLS;
                
            case IMConst.SB_NONE:
                return NONE_CLS;
                
            case IMConst.SB_UNSUBSCRIBED:
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
    },
    
    getStatusObject: function(_show){
        switch(_show){
            case 'away':
                return IMConst.ST_AWAY;
            case 'dnd':
                return IMConst.ST_DONOTDISTURB;
            case 'xa':
                return IMConst.ST_XA;
            case 'unavailable':
                return IMConst.ST_UNAVAILABLE;
            default:
                return IMConst.ST_AVAILABLE
        }
    },
    
    returnTimestamp: function(stamp){
        const TZ = 3;
        if(stamp){
            var t = stamp.match(/(\d{2})\:(\d{2})\:(\d{2})/);
            return t[1] - TZ + ":" + t[2] + ":" + t[3];
        }
        return Date().match(/\d{2}\:\d{2}\:\d{2}/)[0];
    }
};
