/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2010 Metaways Infosystems GmbH (http://www.metaways.de)
 */
Ext.ns('Tine.Webconference');


/**
 * @namespace   Tine.Webconference
 * @class       Tine.Webconference.Application
 * @extends     Tine.Tinebase.Application
 * 
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 */
Tine.Webconference.Application = Ext.extend(Tine.Tinebase.Application, {
	
    bbbUrl : '',
    roomCreated: false,
    roomName:'',
    loadMask: null,
    /**
     * Get translated application title of the calendar application
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
    getRoomName: function(){
        return this.roomName;  
    },
    getLoadMask: function(){
        return this.loadMask;
    },
    setLoadMask: function(mask){
        this.loadMask = mask;
    },
    init: function() {
        //Tine.Webconference.Application.superclass.init.apply(this, arguments);
        this.roomCreated = false;
       
    },
    onBeforeActivate: function(){
        
        
        if(!this.roomCreated){
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
                            handler: this.onAddUser
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
        
    },
    
    
    onAddUser: function(btn) {
        
        //console.debug(Tine.Tinebase.appMgr.get('Webconference').roomName);
    	
        Ext.Ajax.request({
            params: {
                method: 'Webconference.getTest',
                param1: 'abc'
            },
            scope: this,
            success: function(_result, _request){
                console.debug(_result.responseText);
            }
        });
    	
 
    	
    }
    
       
   
	   
});



