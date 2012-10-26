/* 
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Marcelo Teixeira <marcelo.teixeira@serpro.gov.br>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 */

Ext.ns('Tine.Webconference');

Tine.Webconference.MainScreenCenterPanel = Ext.extend(Ext.Panel, {
    border: false,
    layout: 'border',
    app:null,
    id: 'webconference-mainscreen-panel',
    
       
    initComponent: function () {
	var me = this;
        
	this.app = Tine.Tinebase.appMgr.get('Webconference');
	
		
	//this.recordClass = Tine.Calendar.Model.Event;
        
	this.initActions();
	this.initLayout();
        
       
    
	Tine.Webconference.MainScreenCenterPanel.superclass.initComponent.call(this);
    },
    
    initActions: function () {
        
       
    },
    
        
    getActionToolbar: Tine.widgets.grid.GridPanel.prototype.getActionToolbar,
    
    getActionToolbarItems: function() {
	return {
	    xtype: 'buttongroup',
	    items: [
                
	]
	};
    },
    
    
    initLayout: function () {
	
	 // create form
        this.createForm = new Ext.FormPanel({
            width: 460,
            frame: true,
            labelWidth: 90,
            name:'createForm',
            
            items: [
                {
                    xtype: 'label',
                    cls: 'tb-webconference-big-label',
                    text: _('New Webconference')
                },
                {
		    xtype: 'textfield',
                    id:'title', 
                    name: 'title',
                    fieldLabel: this.app.i18n._('Title')
                    
                }
            ],            
            buttonAlign: 'center',
            buttons: [{
                    xtype: 'button',
                    width: 120,
                    text: _('Create'),
                    scope: this,
                    handler: this.onNewWebconference
            }]
        });
	
	
	this.items = [{
	    xtype:'panel',
	    region: 'center',
	    layout:'hbox',
	    layoutConfig: {
		padding:'5',
		pack:'center',
		align:'middle'
	    },
	    border: false,
	    
	    items: [
	    
		this.createForm
		
	    ]
	}];
    },
    
    /**
     * @private
     */
    onRender: function(ct, position) {
	Tine.Webconference.MainScreenCenterPanel.superclass.onRender.apply(this, arguments);
        
	
    },
    onNewWebconference: function(btn){
	this.app.onNewWebconference( Ext.get('title').getValue() );
    }
    
    
    

    
    
});
