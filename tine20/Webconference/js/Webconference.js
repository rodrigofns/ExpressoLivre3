/* 
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 */

Ext.ns('Tine.Webconference');

/**
 * Enum with the list of options available to access the application.
 * MENU: The user start/activate the application via the main menu.
 * EMAIL: The user start/activate the application via an invitation received by email.
 */
const WebconferenceOrigin = {
    MENU : 0,
    EMAIL : 1
}


/**
 * Webconference Application Object
 * 
 * @namespace   Tine.Webconference
 * @class       Tine.Webconference.Application
 * @extends     Tine.Tinebase.Application
 * 
 * <p>Webconference Application Object</p>
 * <p><pre>
 * </pre></p> * 
 *
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Marcelo Teixeira <marcelo.teixeira@serpro.gov.br>
 * @copyright   Copyright (c) 2007-2012 Metaways Infosystems GmbH (http://www.metaways.de)
 * 
 */
Tine.Webconference.Application = Ext.extend(Tine.Tinebase.Application, {

    /**
     * The URL of the BigBlueButton webconference room used in center-panel iframe.
     */
    bbbUrl : '',
    
    /**
     * Indicates if the user is moderator in the webconference.
     */
    moderator : false,
    
    /**
     * Indicates if the user is connected to an active webconference room.
     */
    roomActive: false,
    
    /**
     * The room name.
     */
    roomName: '',
    
    /**
     * The room Id.
     */
    roomId: '',
    
    /**
     * The webconference application origin (where the user started the application from).
     */
    origin: null,
    
    /**
     * A global mask for the application.
     */
    loadMask: null,
    
    onMainScreen: true,
    
    /**
     * Get translated application title of the webconference application
     * 
     * @return {String}
     */
    getTitle: function() {
        return this.i18n.gettext('Webconference');
    },
    
    /**
     * Get the roomActive property.
     * 
     * @return {Boolean}
     */
    isRoomActive: function(){
        return this.roomActive;
    },
    
    /**
     * Set the loadMask property.
     * 
     * @param {Ext.LoadMask} mask
     */
    setLoadMask: function(mask){
        this.loadMask = mask;
    },
    
    init: function() {

	this.origin = WebconferenceOrigin.MENU;
         
        if (Tine.Felamimail) {
            Tine.Felamimail.MimeDisplayManager.register('text/webconference', Tine.Webconference.EmailDetailsPanel);
        }
      
    
        // binds click event to join webconference invite inside email
        /*Ext.getBody().on('click', function(event, target){
            //target            => html node
            //Ext.get(target)   => ext element
            
            var url = Ext.get(target.parentNode).first('span',true).className;
            Tine.Tinebase.appMgr.get('Webconference').onJoinWebconferenceFromEmail(url);
	    
	    
        }, null, {
            delegate: 'a.x-tab-strip-close'
        });*/
        
       
    },

    
        
    onBeforeActivate: function(){

        
        if(!this.roomActive && this.origin == WebconferenceOrigin.MENU ){
            //this.createRoom();
            
        }

        Ext.get('west').hide(); // this is west panel region
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
	
	
	//this.getMainScreen().updateContentPanel();
	//this.getMainScreen().show();
	
	if(this.loadMask != null)
	    this.loadMask.hide();
	
    
        if (this.origin == WebconferenceOrigin.EMAIL && !this.roomActive){
            this.joinRoom();
        }
    },
            
    onBeforeDeActivate: function(){
    	
        Ext.get('west').show(); // this is west panel region
        var westComponent = Ext.getCmp('west'); // this is west panel region component
        westComponent.expand();
        westComponent.doLayout();
        
        if(Ext.fly('webconference-panel')){
            var bbb = Ext.fly('webconference-panel');
            bbb.setWidth(0);
            bbb.setHeight(0);
        }
        
	
	

    },
    onDeActivate: function(){
	
    },
    
    joinRoom: function(){
        
        Ext.get('webconference-iframe').dom.src = this.bbbUrl;
        this.roomActive = true;
        this.loadMask.hide();
        
	
    },
    /**
     * This method is executed when the users click "Enter" webconference from an email invite.
     * If the room with the meetingId (roomName) exists, it activates the webconference module and join the user.
     *
     */
    onJoinWebconferenceFromEmail: function(url, moderator, roomId, roomName){
        
        var loadMask = new Ext.LoadMask(Tine.Tinebase.appMgr.getActive().getMainScreen().getCenterPanel().getEl(), {
            msg: String.format(_('Please wait'))
        });
        loadMask.show();
        
        var app = Tine.Tinebase.appMgr.get('Webconference');
		
        Tine.Webconference.isMeetingActive(roomId, url,  function(response) {
            if(response.active){
                
                if(Tine.Tinebase.appMgr.get('Webconference').roomActive){
                    Ext.MessageBox.confirm('', 
                    app.i18n._("You are already in a webconference. Accepting this invitation will make you leave the existing one.")+" "+
                    app.i18n._('Proceed') + ' ?', function(btn) {
                        if(btn == 'yes') { 
                            Tine.Tinebase.appMgr.get('Webconference').origin = WebconferenceOrigin.EMAIL;
                            Tine.Tinebase.appMgr.get('Webconference').bbbUrl = url;
                            Tine.Tinebase.appMgr.get('Webconference').roomName = roomName;
			    Tine.Tinebase.appMgr.get('Webconference').roomId = roomId;
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
		    
		    Tine.Tinebase.appMgr.get('Webconference').onMainScreen = false;
		    Tine.Tinebase.appMgr.get('Webconference').getMainScreen().updateContentPanel();
		    Tine.Tinebase.appMgr.get('Webconference').getMainScreen().show();
		    
                    
                    Tine.Tinebase.appMgr.activate( Tine.Tinebase.appMgr.get('Webconference') );  
                    
                }
                
                
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

    createRoom: function(title){
        
        Ext.Ajax.request({
            params: {
                method: 'Webconference.createRoom',
		title: title
                
            },
            scope: this,
            success: function(_result, _request){
                var result = Ext.util.JSON.decode(_result.responseText);
                this.bbbUrl = result.bbbUrl;
                this.roomName = result.roomName;
		this.roomId = result.roomId;
                this.roomActive = true;
            
		if(!this.onMainScreen){
		    // ensure that panel gets visible when changing between tabs
		    Ext.fly('webconference-panel').setWidth('100%'); 
		}
		Ext.get('webconference-iframe').dom.src = this.bbbUrl;
                this.loadMask.hide();
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
    
    onNewWebconference: function(title){
		
	var app = Tine.Tinebase.appMgr.get('Webconference');
	
	app.onMainScreen = false;
	app.moderator = true;
               
	app.getMainScreen().updateContentPanel();
	app.getMainScreen().show();
	
	app.loadMask.show();
	app.createRoom(title);
	
	
	
	
    },
    
    onExit: function(btn){
        
//        var tabs = Ext.query('.tine-mainscreen-apptabs'); // as configured in Tinebase/js/MainScreen.js
//        var apptabs = Ext.getCmp(tabs[0].id); // apptabs component
//        var tabPanel = apptabs.items.items[0]; // TabPanel (Tine.Tinebase.AppTabsPanel)
//        var tabid = tabPanel.app2id('Webconference');
//       
//        var tab = Ext.getCmp(tabid);
//        tabPanel.remove(tab); // remove the webconference tab
        var app = Tine.Tinebase.appMgr.get('Webconference');
        app.roomActive = false;
	app.onMainScreen = true;
        app.origin = WebconferenceOrigin.MENU;
	
	Ext.get('webconference-iframe').dom.src = '';
        
	
	
	app.getMainScreen().updateContentPanel();
	app.getMainScreen().show();
	
	Ext.fly('webconference-mainscreen-panel').setWidth('100%'); 
	
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
    
	
});

/**
 * Component for the iframe component of the webconference application.
 *
 */
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
    
    this.initPanels();
    
    Tine.Webconference.MainScreen.superclass.constructor.apply(this, arguments);
    
};

Ext.extend(Tine.Webconference.MainScreen, Tine.widgets.MainScreen, {
    
    mainScreenPanel: null,
    
    webconferencePanel: null,
    
    actions : {
        addUser : null,
        exit : null,
        terminate : null
    },
    
    initActions: function() {
//	console.debug('---------------');
//	console.debug(this.app.moderator);
//	console.debug(this.app.onMainScreen);
	
        this.actions.addUser = new Ext.Action({
            text: this.app.i18n._('Add User'),
            handler: this.app.onAddUser,
            hidden: ! this.app.moderator || this.app.onMainScreen,
            tooltip : this.app.i18n._('Invite an User to the Webconference'),
            iconCls: 'action_addContact'
            
        });
        this.actions.exit = new Ext.Action({
            text: this.app.i18n._('Exit'),
            handler: this.app.onExit,
            disabled: this.app.onMainScreen,
            tooltip : this.app.i18n._('Left Webconference'),
            iconCls: 'action_logOut'
            
        });
        this.actions.terminate = new Ext.Action({
            //requiredGrant: 'addGrant',
            text: this.app.i18n._('Terminate'),
            handler: this.app.onTerminate,
            hidden: ! this.app.moderator || this.app.onMainScreen,
            tooltip : this.app.i18n._('Terminate Webconference kicking all users out'),
            iconCls: 'action_terminate'
            
        });
        
        
    },
    updateContentPanel: function(){
	
	if( this.app.onMainScreen)
	    this.contentPanel = this.mainScreenPanel;
	else{
	    this.contentPanel = this.webconferencePanel;
	}
	    
    },
    
    initPanels: function(){
	
	this.mainScreenPanel = new Tine.Webconference.MainScreenCenterPanel();
	
        this.webconferencePanel = new Ext.Panel({
                id: 'webconference-panel',
                header: false,
                closable:false,
                hideMode:'visibility', // to work with flash
                layout:'fit', 
                // add iframe as the child component
                items: [ new Ext.ux.IFrameComponent({
                    id: 'webconference-iframe-cmp', 
                    url: ''
                }) ]
        });
	
	this.contentPanel = this.mainScreenPanel;
        
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
        
        
        if(!this.app.roomActive && !this.app.onMainScreen){
            var loadMask = new Ext.LoadMask(this.getCenterPanel().getEl(), {
		msg: String.format(_('Please wait'))
	    });
	    loadMask.show();
            this.app.setLoadMask(loadMask);
            
        }
        return this;
        
    }
   
	   
});

