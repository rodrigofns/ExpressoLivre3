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
	
		
    /**
     * Get translated application title of the calendar application
     * 
     * @return {String}
     */
    getTitle: function() {
        return this.i18n.gettext('Webconference');
    },
        
    onBeforeActivate: function(){
    	
    	
    	Ext.getCmp('west').collapse( Ext.Component.DIRECTION_LEFT );
    	
    	
    	var west = Ext.get('west'); // this is west panel region
    	west.hide();
    	
    	var westx = Ext.getCmp('west'); // this is west panel region
    	westx.doLayout();

    	
    	
    },
    
    onBeforeDeActivate: function(){
    	
    	var west = Ext.get('west'); // this is west panel region
    	west.show();
    	//Ext.getCmp('west').toggleCollapse();
    	Ext.getCmp('west').expand();
    	//Ext.getCmp('west').showVerticalScroller();


    	var westx = Ext.getCmp('west'); // this is west panel region
    	westx.doLayout();

    	
    }

	
});



Ext.ux.IFrameComponent = Ext.extend(Ext.BoxComponent, {
    onRender : function(ct, position){
         this.el = ct.createChild({tag: 'iframe', id: 'iframe-'+ this.id, frameBorder: 0, src: this.url});
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
//                        columns: 3 + (Ext.isArray(additionalItems) ? additionalItems.length : 0),
                        plugins: [{
                            ptype: 'ux.itemregistry',
                            key:   this.app.appName + '-GridPanel-ActionToolbar-leftbtngrp'
                        }],
                        items: [
                           
                            Ext.apply(new Ext.Button(), {
                                scale: 'medium',
                                rowspan: 2,
                                iconAlign: 'top',
                                iconCls: 'action_add',
                                text: this.app.i18n._('Add User'),
                                handler: this.onAddUser,
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
                this[contentType + 'ActionToolbar'] = new Ext.Panel({html: 'ERROR'});
            }
        }
        
        return this[contentType + 'ActionToolbar'];
    },
	
    getCenterPanel: function() {
        if (! this.contentPanel) {
            //this.contentPanel = new Ext.Button({text:'BBB'});
        	var uri = 'http://10.200.118.61/';
        	
        	this.contentPanel = new Ext.Panel({
        	     id: 'bbb',
        	     title: 'bbb',
        	     header: false,
        	     closable:false,
        	     hideMode:'visibility',
        	     // layout to fit child component
        	     layout:'fit', 
        	     // add iframe as the child component
        	     items: [ new Ext.ux.IFrameComponent({ id: id, url: uri }) ]
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
    
    onAddUser: function(btn) {
    	//alert('add user');
    	
    	
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
    	
    	
    	
//        var popupWindow = Tine.widgets.dialog.ImportDialog.openWindow({
//            appName: 'Addressbook',
//            // update grid after import
//            listeners: {
//                scope: this,
//                'update': function(record) {
//                    this.loadGridData({
//                        preserveCursor:     false, 
//                        preserveSelection:  false, 
//                        preserveScroller:   false,
//                        removeStrategy:     'default'
//                    });
//                }
//            },
//            record: new Tine.Tinebase.Model.ImportJob({
//                // TODO get selected container -> if no container is selected use default container
//                container_id: Tine.Addressbook.registry.get('defaultAddressbook'),
//                model: this.recordClass,
//                import_definition_id:  Tine.Addressbook.registry.get('defaultImportDefinition').id
//            }, 0)
//        });
    	
    },
    
       
   
	   
});



