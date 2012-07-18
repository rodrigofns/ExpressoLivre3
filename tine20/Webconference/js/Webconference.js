
Ext.ns('Tine.Webconference');


const WebconferenceOrigin = {
    MENU : 0,
    EMAIL : 1
}


/**
 * @namespace   Tine.Webconference
 * @class       Tine.Webconference.Application
 * @extends     Tine.Tinebase.Application
 * 
 * Webconference Application Object <br>
 * 
 * @author      Marcelo Teixeira <marcelo.teixeira@serpro.gov.br>
 */
Tine.Webconference.Application = Ext.extend(Tine.Tinebase.Application, {
	
    bbbUrl : '',
    moderator : false,
    roomActive: false,
    roomName: '',
    origin: null,
    
    loadMask: null,
    
    
    /**
     * Get translated application title of the webconference application
     * 
     * @return {String}
     */
    getTitle: function() {
        return this.i18n.gettext('Webconference');
    },
    isRoomActive: function(){
        return this.roomActive;
    },
    setLoadMask: function(mask){
        this.loadMask = mask;
    },
    init: function() {
        
        this.origin = WebconferenceOrigin.MENU;
         
        if (Tine.Felamimail) {
            Tine.Felamimail.MimeDisplayManager.register('text/webconference', Tine.Webconference.EmailDetailsPanel);
        }
        

    //this.roomActive = false;
        
    /*
        var pollA = new Ext.direct.PollingProvider({
            type:'polling',
            url: 'index.php',
            interval: 10000, // 10 seconds
            baseParams: {
                method: 'Webconference.getJoinInvites'
            }
            
        });
        Ext.Direct.addProvider(pollA);
        //pollA.disconnect();
        
        Ext.Direct.on('joinInvite', this.onJoinInvite);
        */
        
      
       
      
      
    /*
        // binds click event to join webconference invite inside email
        Ext.getBody().on('click', function(event, target){
            //target            => html node
            //Ext.get(target)   => ext element
            
            var url = Ext.get(target.parentNode).first('span',true).className;
            Tine.Tinebase.appMgr.get('Webconference').onJoinWebconferenceFromEmail(url);
        }, null, {
            delegate: 'span.tinebase-webconference-link'
        });
        */
       
    },

    
        
    onBeforeActivate: function(){

        
        if(!this.roomActive && this.origin == WebconferenceOrigin.MENU ){
            this.createRoom();
            
        }

        var west = Ext.get('west'); // this is west panel region
        west.hide(); 
        var westComponent = Ext.getCmp('west'); // this is west panel region component
        westComponent.collapse( Ext.Component.DIRECTION_LEFT );
        westComponent.doLayout();


       
        if(this.roomActive && Ext.fly('webconference-panel'))
        {
            var bbb = Ext.fly('webconference-panel'); 
            bbb.setWidth('100%');
            bbb.setHeight('100%');
        }
        
    },
    onActivate: function(){

    
        if (this.origin == WebconferenceOrigin.EMAIL && !this.roomActive){
            this.joinRoom();
        }
    },
            
    onBeforeDeActivate: function(){
    	
        var west = Ext.get('west'); // this is west panel region
        west.show();
        var westComponent = Ext.getCmp('west'); // this is west panel region component
        westComponent.expand();
        westComponent.doLayout();
        
        if(Ext.fly('webconference-panel')){
            var bbb = Ext.fly('webconference-panel');
            bbb.setWidth(0);
            bbb.setHeight(0);
        }
        

    },
    /**
     * This method is executed when the users click "Enter" webconference from an email invite.
     * If the room with the meetingId (roomName) exists, it activates the webconference module and join the user.
     *
     */
    onJoinWebconferenceFromEmail: function(url, moderator, roomName){
        
        var loadMask = new Ext.LoadMask(Tine.Tinebase.appMgr.getActive().getMainScreen().getCenterPanel().getEl(), {
            msg: String.format(_('Please wait'))
        });
        loadMask.show();
        
        var app = Tine.Tinebase.appMgr.get('Webconference');
        Tine.Webconference.isMeetingActive(roomName, url,  function(response) {
            if(response.active){
                
                if(Tine.Tinebase.appMgr.get('Webconference').roomActive){
                    Ext.MessageBox.confirm('', 
                    app.i18n._("You are already in a webconference. Accepting this invitation will make you leave the existing one.")+" "+
                    app.i18n._('Proceed') + ' ?', function(btn) {
                        if(btn == 'yes') { 
                            Tine.Tinebase.appMgr.get('Webconference').origin = WebconferenceOrigin.EMAIL;
                            Tine.Tinebase.appMgr.get('Webconference').bbbUrl = url;
                            Tine.Tinebase.appMgr.get('Webconference').roomName = roomName;
                            Tine.Tinebase.appMgr.get('Webconference').moderator = moderator;
                            Ext.get('webconference-iframe').dom.src = Tine.Tinebase.appMgr.get('Webconference').bbbUrl;
                            
                            Tine.Tinebase.appMgr.activate( Tine.Tinebase.appMgr.get('Webconference') );
                        }
                
                    }, this);
                }
                else {
                    Tine.Tinebase.appMgr.get('Webconference').origin = WebconferenceOrigin.EMAIL;
                    Tine.Tinebase.appMgr.get('Webconference').bbbUrl = url;
                    Tine.Tinebase.appMgr.get('Webconference').roomName = roomName;
                    Tine.Tinebase.appMgr.get('Webconference').moderator = moderator;
                    
                    Tine.Tinebase.appMgr.activate( Tine.Tinebase.appMgr.get('Webconference') );  
                    
                }
                
                
                Tine.Tinebase.appMgr.get('Webconference').getMainScreen().showNorthPanel();
                
            }
            else{
                Ext.MessageBox.show({
                    title: Tine.Tinebase.appMgr.get('Webconference').i18n._('Webconference'), 
                    msg: response.message,
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.INFO
                });
            }
            
            loadMask.hide();
        }); 
        
       
    },

    createRoom: function(){
        
        Ext.Ajax.request({
            params: {
                method: 'Webconference.createRoom'
                
            },
            scope: this,
            success: function(_result, _request){
                var result = Ext.util.JSON.decode(_result.responseText);
                this.bbbUrl = result.bbbUrl;
                this.roomName = result.roomName;
                this.roomActive = true;
                this.moderator = true;
                
                Ext.get('webconference-iframe').dom.src = this.bbbUrl;
                this.loadMask.hide();
                
                //this.getMainScreen().getNorthPanel().setDisabled(false);
                this.getMainScreen().showNorthPanel();
                
            //this.fixFlash();
            
            },

            failure: function(response, options) {
                var responseText = Ext.util.JSON.decode(response.responseText);
                var exception = responseText.data ? responseText.data : responseText;
                
                Ext.MessageBox.show({
                    title: this.i18n._('Webconference'), 
                    msg: exception.message,
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.INFO
                });
                
                this.onExit();
                
            }
        });
        
        
        
    },
    joinRoom: function(){
        
        Ext.get('webconference-iframe').dom.src = this.bbbUrl;
        this.roomActive = true;
        this.loadMask.hide();
        this.getMainScreen().getNorthPanel().setDisabled(false);
    },
    
    onAddUser: function(btn) {
        
        //Tine.Tinebase.appMgr.get('Webconference').fixFlash(); 
        Tine.Tinebase.appMgr.get('Webconference').getMainScreen().getCenterPanel().hide();
        
        Tine.Webconference.ContactPickerDialog.openWindow({
            //record: new Tine.Felamimail.Model.Message(Tine.Felamimail.Model.Message.getDefaultData(), 0),
            listeners: {
                scope: this,
                //                'update': function(record) {
                //                    Tine.Tinebase.appMgr.get('Webconference').getMainScreen().getCenterPanel().show();
                //                },
                'cancel':function(win){
                    Tine.Tinebase.appMgr.get('Webconference').getMainScreen().getCenterPanel().show();
                },
                'destroy':function(win){
                    Tine.Tinebase.appMgr.get('Webconference').getMainScreen().getCenterPanel().show();
                }
            }
        });
    },
    
    onExit: function(btn){
        
        var tabs = Ext.query('.tine-mainscreen-apptabs'); // as configured in Tinebase/js/MainScreen.js
        var apptabs = Ext.getCmp(tabs[0].id); // apptabs component
        var tabPanel = apptabs.items.items[0]; // TabPanel (Tine.Tinebase.AppTabsPanel)
        var tabid = tabPanel.app2id('Webconference');
       
        var tab = Ext.getCmp(tabid);
        tabPanel.remove(tab); // remove the webconference tab
       
        Tine.Tinebase.appMgr.get('Webconference').roomActive = false;
        Tine.Tinebase.appMgr.get('Webconference').origin = WebconferenceOrigin.MENU;
    
        Ext.getCmp('webconference-panel').destroy(); // destroy the webconference panel component
        
        Tine.Tinebase.appMgr.get('Webconference').getMainScreen().getNorthPanel().hide();
    },
    
    onTerminate: function(btn){
        
        Tine.Tinebase.appMgr.get('Webconference').getMainScreen().getCenterPanel().hide();
        
        
        Ext.MessageBox.confirm(
            '', 
            Tine.Tinebase.appMgr.get('Webconference').i18n._('This will kick all participants out of the meeting. Terminate webconference') + ' ?', 
            function(btn) {
            
                if(btn == 'yes') { 
                
                    var roomName = Tine.Tinebase.appMgr.get('Webconference').roomName;
                    Ext.Ajax.request({
                        params: {
                            method: 'Webconference.endMeeting',
                            roomName: roomName
                        },
                        scope: this,
                        success: function(_result, _request){
                            //var result = Ext.util.JSON.decode(_result.responseText);
                
                            Tine.Tinebase.appMgr.get('Webconference').roomActive = false;
                            Tine.Tinebase.appMgr.get('Webconference').onExit();
                
            
                        }
                    });
                }
                else {
                    Tine.Tinebase.appMgr.get('Webconference').getMainScreen().getCenterPanel().show();
                }
                
            }, this);
        
       
    }
    
//    ,
//    fixFlash:function() {
//        alert('oi');
//        var iframe = document.getElementById('webconference-iframe');
//        var doc = iframe.contentWindow.document;
//        
//        
//        
//        //console.debug(Ext.get('webconference-iframe').dom.query('object'));
//        //console.debug(Ext.fly('webconference-iframe').dom);
//        
//        console.debug(doc.getElementsByTagName('embed'));
//        
//        // loop through every embed tag on the site
//        var embeds = doc.getElementsByTagName('embed');
//        for (i = 0; i < embeds.length; i++) {
//            embed = embeds[i];
//            var new_embed;
//            // everything but Firefox & Konqueror
//            if (embed.outerHTML) {
//                var html = embed.outerHTML;
//                // replace an existing wmode parameter
//                if (html.match(/wmode\s*=\s*('|")[a-zA-Z]+('|")/i))
//                    new_embed = html.replace(/wmode\s*=\s*('|")window('|")/i, "wmode='transparent'");
//                // add a new wmode parameter
//                else
//                    new_embed = html.replace(/<embed\s/i, "<embed wmode='transparent' ");
//                // replace the old embed object with the fixed version
//                embed.insertAdjacentHTML('beforeBegin', new_embed);
//                embed.parentNode.removeChild(embed);
//            } else {
//                // cloneNode is buggy in some versions of Safari & Opera, but works fine in FF
//                new_embed = embed.cloneNode(true);
//                if (!new_embed.getAttribute('wmode') || new_embed.getAttribute('wmode').toLowerCase() == 'window')
//                    new_embed.setAttribute('wmode', 'transparent');
//                embed.parentNode.replaceChild(new_embed, embed);
//            }
//        } 
//        // loop through every object tag on the site
//        var objects = doc.getElementsByTagName('object');
//        
//        alert(objects.length);
//        
//        for (i = 0; i < objects.length; i++) {
//            object = objects[i];
//            var new_object;
//            // object is an IE specific tag so we can use outerHTML here
//            if (object.outerHTML) {
//                var html = object.outerHTML;
//                // replace an existing wmode parameter
//                if (html.match(/<param\s+name\s*=\s*('|")wmode('|")\s+value\s*=\s*('|")[a-zA-Z]+('|")\s*\/?\>/i))
//                    new_object = html.replace(/<param\s+name\s*=\s*('|")wmode('|")\s+value\s*=\s*('|")window('|")\s*\/?\>/i, "<param name='wmode' value='transparent' />");
//                // add a new wmode parameter
//                else
//                    new_object = html.replace(/<\/object\>/i, "<param name='wmode' value='transparent' />\n</object>");
//                // loop through each of the param tags
//                var children = object.childNodes;
//                for (j = 0; j < children.length; j++) {
//                    try {
//                        if (children[j] != null) {
//                            var theName = children[j].getAttribute('name');
//                            if (theName != null && theName.match(/flashvars/i)) {
//                                new_object = new_object.replace(/<param\s+name\s*=\s*('|")flashvars('|")\s+value\s*=\s*('|")[^'"]*('|")\s*\/?\>/i, "<param name='flashvars' value='" + children[j].getAttribute('value') + "' />");
//                            }
//                        }
//                    }
//                    catch (err) {
//                    }
//                }
//                // replace the old embed object with the fixed versiony
//                object.insertAdjacentHTML('beforeBegin', new_object);
//                object.parentNode.removeChild(object);
//            }
//        }
      
//    }
    
    
	
});


Ext.ux.IFrameComponent = Ext.extend(Ext.BoxComponent, {
    onRender : function(ct, position){
        this.el = ct.createChild({
            tag: 'iframe', 
            id: 'webconference-iframe', 
            name: 'webconference-iframe',
            frameBorder: 0, 
            src: this.url
        });
    }
});

/**
 * @namespace Tine.Webconference
 * @class Tine.Webconference.MainScreen
 * @extends Tine.widgets.MainScreen
 * MainScreen of the Webconference Application <br>
 * 

 * @constructor
 * Constructs mainscreen of the Webconference application
 */

Tine.Webconference.MainScreen = function(config) {
    Ext.apply(this, config);
    
    Tine.Webconference.MainScreen.superclass.constructor.apply(this, arguments);
    
};

Ext.extend(Tine.Webconference.MainScreen, Tine.widgets.MainScreen, {
    
    actions : {
        addUser : null,
        exit : null,
        terminate : null
    },
    
    initActions: function() {
        this.actions.addUser = new Ext.Action({
            text: this.app.i18n._('Add User'),
            handler: this.app.onAddUser,
            hidden: ! this.app.moderator,
            tooltip : this.app.i18n._('Invite an User to the Webconference'),
            iconCls: 'action_addContact'
            
        });
        this.actions.exit = new Ext.Action({
            text: this.app.i18n._('Exit'),
            handler: this.app.onExit,
            disabled: false,
            tooltip : this.app.i18n._('Left Webconference'),
            iconCls: 'action_logOut'
            
        });
        this.actions.terminate = new Ext.Action({
            //requiredGrant: 'addGrant',
            text: this.app.i18n._('Terminate'),
            handler: this.app.onTerminate,
            hidden: ! this.app.moderator,
            tooltip : this.app.i18n._('Terminate Webconference kicking all users out'),
            iconCls: 'action_terminate'
            
        });
        
        
    },
     
    getNorthPanel: function(contentType) {
        
        this.initActions();
        contentType = contentType || this.getActiveContentType();
        
        //if (! this[contentType + 'ActionToolbar'] || this[contentType + 'ActionToolbar']) {
        try {
                
            var actionToolbar = new Ext.Toolbar({
                items: [{
                    xtype: 'buttongroup',
                    columns: 5,
                    items: [
                    Ext.apply( new Ext.Button(this.actions.addUser), {
                        scale: 'medium',
                        rowspan: 2,
                        iconAlign: 'top'
                    })
                    ,{
                        xtype: 'tbspacer', 
                        width: 10
                    }
                    ,Ext.apply(new Ext.Button(this.actions.exit), {
                        scale: 'medium',
                        rowspan: 2,
                        iconAlign: 'top'
                    })
                    ,{
                        xtype: 'tbspacer', 
                        width: 10
                    }
                    ,Ext.apply(new Ext.Button(this.actions.terminate), {
                        scale: 'medium',
                        rowspan: 2,
                        iconAlign: 'top'
                    })
                    ]
                }]
            });
               
                
            this[contentType + 'ActionToolbar'] = new Ext.Panel({
                		
                items: [ actionToolbar]
            });
                
                
        } catch (e) {
            Tine.log.err('Could not create northPanel');
            Tine.log.err(e);
            this[contentType + 'ActionToolbar'] = new Ext.Panel({
                html: 'ERROR'
            });
        }
        //}
        
        return this[contentType + 'ActionToolbar'];
    },
	
    getCenterPanel: function() {
        if (! this.contentPanel || ! Ext.get('webconference-iframe')) {
            
            if(this.app.isRoomActive())
                var uri = this.app.bbbUrl;
            else
                var uri = window.location;
        
        	
            this.contentPanel = new Ext.Panel({
                id: 'webconference-panel',
                header: false,
                closable:false,
                hideMode:'visibility', // to work with flash
                layout:'fit', 
                // add iframe as the child component
                items: [ new Ext.ux.IFrameComponent({
                    id: id, 
                    url: uri
                }) ]
            });
        }
        return this.contentPanel;
    },
    
    getWestPanel: function() {
        if (! this.westPanel) {
            this.westPanel = new Ext.Panel({
                html:''
            });
        }

        return this.westPanel;
    },
    
    
    show: function() {
        if(this.fireEvent("beforeshow", this) !== false){
            this.showWestPanel();
            this.showCenterPanel();
            this.showNorthPanel();

            this.fireEvent('show', this);
        }
        
        var loadMask = new Ext.LoadMask(this.getCenterPanel().getEl(), {
            msg: String.format(_('Please wait'))
        });
        if(!this.app.isRoomActive()){
            loadMask.show();
            this.app.setLoadMask(loadMask);
            this.app.getMainScreen().getNorthPanel().setDisabled(true);
        }
        return this;
        
    }
   
	   
});

