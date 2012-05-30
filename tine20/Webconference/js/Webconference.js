
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
 * @author      Marcelo Teixeira <marcelo.teixeira@serpro.gov.br>
 */
Tine.Webconference.Application = Ext.extend(Tine.Tinebase.Application, {
	
    bbbUrl : '',
    roomActive: false,
    roomName:'',
    origin:null,
    
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
        
    onJoinWebconferenceFromEmail: function(url){
        
        
        if(Tine.Tinebase.appMgr.get('Webconference').roomActive){
            Ext.MessageBox.confirm('', this.i18n._('Cancel active webconference') + ' ?', function(btn) {
                if(btn == 'yes') { 
                    this.origin = WebconferenceOrigin.EMAIL;
                    this.bbbUrl = url;
                    Ext.get('webconference-iframe').dom.src = this.bbbUrl;
                    Tine.Tinebase.appMgr.activate( Tine.Tinebase.appMgr.get('Webconference') );
                }
                
            }, this);
        }
        else {
            this.origin = WebconferenceOrigin.EMAIL;
            this.bbbUrl = url;
            Tine.Tinebase.appMgr.activate( Tine.Tinebase.appMgr.get('Webconference') );  
        }
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
                
                Ext.get('webconference-iframe').dom.src = this.bbbUrl;
                this.loadMask.hide();
            
            }
            ,
            failure: function(response, options) {
                var responseText = Ext.util.JSON.decode(response.responseText);
                var exception = responseText.data ? responseText.data : responseText;
                Tine.Tinebase.ExceptionHandler.handleRequestException(exception);

            }
        });
        
        
        
    },
    joinRoom: function(){
        
        Ext.get('webconference-iframe').dom.src = this.bbbUrl;
        this.roomActive = true;
        this.loadMask.hide();
    },
    
    onAddUser: function(btn) {
        
        //console.debug(Tine.Tinebase.appMgr.get('Webconference').roomName);
        //Tine.Tinebase.appMgr.activate( Tine.Tinebase.appMgr.get('Admin') );
        //        
        //        selectedContactStore = new Tine.Tinebase.data.RecordStore({
        //             recordClass: Tine.Addressbook.Model.Contact
        //        });
        
        Tine.Webconference.ContactPickerDialog.openWindow({
            //record: new Tine.Felamimail.Model.Message(Tine.Felamimail.Model.Message.getDefaultData(), 0),
            listeners: {
                scope: this,
                'update': function(record) {
                  
                   
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
       
       
       //Ext.get('webconference-iframe').remove(); // remove the iframe element
       Ext.getCmp('webconference-panel').destroy(); // destroy the webconference panel component
       
       Tine.Tinebase.appMgr.get('Webconference').roomActive = false;
       Tine.Tinebase.appMgr.get('Webconference').origin = WebconferenceOrigin.MENU;
    
        
    }
    
	
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


Tine.Webconference.MainScreen = function(config) {
    Ext.apply(this, config);
    
    Tine.Webconference.MainScreen.superclass.constructor.apply(this, arguments);
    
};

Ext.extend(Tine.Webconference.MainScreen, Tine.widgets.MainScreen, {
   
    
    getNorthPanel: function(contentType) {
        contentType = contentType || this.getActiveContentType();
        
        if (! this[contentType + 'ActionToolbar']) {
            try {
                
                var actionToolbar = new Ext.Toolbar({
                    items: [{
                        xtype: 'buttongroup',
                        columns: 1,
                        items: [
                           
                        Ext.apply(new Ext.Button(), {
                            scale: 'medium',
                            rowspan: 2,
                            iconAlign: 'top',
                            iconCls: 'action_add',
                            text: this.app.i18n._('Add User'),
                            handler: this.app.onAddUser
                        })
                        
                        ,Ext.apply(new Ext.Button(), {
                            scale: 'medium',
                            rowspan: 2,
                            iconAlign: 'top',
                            iconCls: 'action_logOut',
                            text: this.app.i18n._('Exit'),
                            handler: this.app.onExit
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
        }
        
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
                title: 'bbb',
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
        }
        return this;
        
    }
   
	   
});

