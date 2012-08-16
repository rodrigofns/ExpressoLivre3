
Ext.ns('Tine.Webconference');


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
        
        Tine.Webconference.isMeetingActive(roomName, url,  function(response) {
            if(response.active){
                
                if(Tine.Tinebase.appMgr.get('Webconference').roomActive){
                    Ext.MessageBox.confirm('', _('Cancel active webconference') + ' ?', function(btn) {
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
    
//    ,fixFlash:function() {
//        var embed = document.getElementsByTagName('embed');
//        for(var i = 0; i < embed.length; i++){
//            embed[i].setAttribute('wmode','transparent');
//        }
//        // FF does a "live" array when working directly with elements,
//        // so "els" changes as we add/remove elements; to avoid problems
//        // with indexing, copy to a temporary array
//        var els = document.getElementsByTagName('object');
//        var obj = [];
//        for(var i = 0; i < els.length; i++){
//            obj[i] = els[i];
//        }
//        for(var i = 0; i < obj.length; i++){
//            var param = document.createElement('param');
//            param.setAttribute('name','wmode');
//            param.setAttribute('value','transparent');
//            obj[i].appendChild(param);
//
//            var wrapper = document.createElement('div');
//            obj[i].parentNode.appendChild(wrapper);
//
//            if(obj[i].outerHTML){
//                // IE
//                var html = obj[i].outerHTML;
//                obj[i].parentNode.removeChild(obj[i]);
//                wrapper.innerHTML = html;
//            }else{
//                // ff/chrome
//                obj[i].parentNode.removeChild(obj[i]);
//                wrapper.appendChild(obj[i]);
//            }
//        }
//      
//    }
    
    
	
});


Ext.ux.IFrameComponent = Ext.extend(Ext.BoxComponent, {
    onRender : function(ct, position){
        this.el = ct.createChild({
            tag: 'iframe', 
            id: 'webconference-iframe', 
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

