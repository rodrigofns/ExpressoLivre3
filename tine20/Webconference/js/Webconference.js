
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
    roomCreated: false,
    roomName:'',
    loadMask: null,
    origin:null,
    
    /**
     * Get translated application title of the webconference application
     * 
     * @return {String}
     */
    getTitle: function() {
        return this.i18n.gettext('Webconference');
    },
    isRoomCreated: function(){
        return this.roomCreated;
    },
    getBbbUrl: function(){
        return this.bbbUrl;
    },
    getLoadMask: function(){
        return this.loadMask;
    },
    setLoadMask: function(mask){
        this.loadMask = mask;
    },
    init: function() {
        //this.roomCreated = false;
        
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
        
      
        this.origin = WebconferenceOrigin.MENU;
      
      
        // binds click event to join webconference invite inside email
        Ext.getBody().on('click', function(event, target){

            //target            => html node
            //Ext.get(target)   => ext element
            
            var url = Ext.get(target.parentNode).first('span',true).className;
            Tine.Tinebase.appMgr.get('Webconference').onJoinWebconferenceFromEmail(url);


        }, null, {
            delegate: 'span.tinebase-webconference-link'
        });
        
       
    },
    //onJoinInvite: function(e){
    //console.debug(String.format('<p><i>{0}</i></p>', e.data));
    //},
    
    onJoinWebconferenceFromEmail: function(url){
        
        
        if(Tine.Tinebase.appMgr.get('Webconference').roomCreated){
            Ext.MessageBox.confirm('', this.i18n._('Cancel active webconference') + ' ?', function(btn) {
                if(btn == 'yes') { 
                    this.origin = WebconferenceOrigin.EMAIL;
                    this.bbbUrl = url;
                    Ext.get('iframe-bbb').dom.src = this.bbbUrl;
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
        
        
        if(!this.roomCreated && this.origin == WebconferenceOrigin.MENU ){
            this.createRoom();
            
        }
       
        
               
    	
        Ext.getCmp('west').collapse( Ext.Component.DIRECTION_LEFT );
        var west = Ext.get('west'); // this is west panel region
        west.hide();
    	
        var westx = Ext.getCmp('west'); // this is west panel region
        westx.doLayout();
        
        if(this.roomCreated)
        {
            var bbb = Ext.fly('bbb-panel'); 
            bbb.setWidth('100%');
            bbb.setHeight('100%');
        }
    	
    },
    onActivate: function(){
        if (this.origin == WebconferenceOrigin.EMAIL && !this.roomCreated){
            this.joinRoom();
        }
    },
            
    onBeforeDeActivate: function(){
    	
        var west = Ext.get('west'); // this is west panel region
        west.show();
        //Ext.getCmp('west').toggleCollapse();
        //Ext.getCmp('west').showVerticalScroller();
        
        
        //Ext.getCmp('west').expand();

        var westx = Ext.getCmp('west'); // this is west panel region
        westx.expand();
        westx.doLayout();
        
        var bbb = Ext.fly('bbb-panel');
        bbb.setWidth(0);
        bbb.setHeight(0);
        

    },

    createRoom: function(){
        console.debug('creating webconference room...');
        // console.debug(this.getMainScreen().getCenterPanel());
        
        
        Ext.Ajax.request({
            params: {
                method: 'Webconference.createRoom'
                
            },
            scope: this,
            success: function(_result, _request){
                var result = Ext.util.JSON.decode(_result.responseText);
                this.bbbUrl = result.bbbUrl;
                this.roomName = result.roomName;
                
                Tine.log.debug(this.bbbUrl);
                this.roomCreated = true;
                
                Ext.get('iframe-bbb').dom.src = this.bbbUrl;
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
        
        Ext.get('iframe-bbb').dom.src = this.bbbUrl;
        this.roomCreated = true;
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
                    console.debug('update called in webconference...');
                    //console.debug(record);
                   
                   
                }
                
                
            }
        });
  
    	
    }
	
});


Ext.ux.IFrameComponent = Ext.extend(Ext.BoxComponent, {
    onRender : function(ct, position){
        this.el = ct.createChild({
            tag: 'iframe', 
            id: 'iframe-bbb', 
            frameBorder: 0, 
            src: this.url
        });
    }
});


/**
 * @namespace   Tine.Webconference
 * @class       Tine.Webconference.MainScreen
 * @extends     Tine.widgets.MainScreen
 * 
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 */

Tine.Webconference.MainScreen = function(config) {
    Ext.apply(this, config);
    
    Tine.Webconference.MainScreen.superclass.constructor.apply(this, arguments);
    
};

Ext.extend(Tine.Webconference.MainScreen, Tine.widgets.MainScreen, {
   
    
    getNorthPanel: function(contentType) {
        contentType = contentType || this.getActiveContentType();
        
        if (! this[contentType + 'ActionToolbar']) {
            try {
                //this[contentType + 'ActionToolbar'] = this[contentType + this.centerPanelClassNameSuffix].getActionToolbar();
                
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
        if (! this.contentPanel) {
            
            //var uri = window.location;
            if(this.app.isRoomCreated())
                var uri = this.app.getBbbUrl();
            else
                var uri = window.location;
        
        	
            this.contentPanel = new Ext.Panel({
                id: 'bbb-panel',
                title: 'bbb',
                header: false,
                closable:false,
                hideMode:'visibility',
                
                // layout to fit child component
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
        if(!this.app.isRoomCreated()){
            loadMask.show();
            this.app.setLoadMask(loadMask);
        }
        return this;
        
    }
   
	   
});

