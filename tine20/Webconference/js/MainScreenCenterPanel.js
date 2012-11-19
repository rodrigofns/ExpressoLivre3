/* 
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Marcelo Teixeira <marcelo.teixeira@serpro.gov.br>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 */

Ext.ns('Tine.Webconference');

const WebconferenceRole = {
    'M' : 'Moderator',
    'A' : 'Attendee',
    'O' : 'Owner'
}

Tine.Webconference.MainScreenCenterPanel = Ext.extend(Ext.Panel, {
    border: false,
    //layout: 'border',
    app: null,
    id: 'webconference-mainscreen-panel',
    createForm: null,
    grid: null,
    
    layout			: 'hbox',
    layoutConfig	: {
	align: 'stretch'
    },
       
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
    
    
    
    initLayout: function () {
	
	this.grid = new Tine.Webconference.RoomsGridPanel();
	this.items = [ 
	    this.grid
	];
	
    },
    onRender: function(ct, position) {
	Tine.Webconference.MainScreenCenterPanel.superclass.onRender.apply(this, arguments);
    }
    
    
});


Tine.Webconference.RoomsGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
    
    
    recordClass: Tine.Webconference.Model.Room,
    hasQuickSearchFilterToolbarPlugin: false,
    flex : 1,
    bodyStyle	: 'border-width:1px;',
    viewConfig	: {
	forceFit:true
    },
    disableSelectAllPages: true,
    
    getContextMenu: function() {
	//return new Ext.menu.Menu({items: []});
	return null;
    },
    
    evalGrants: false,
    
    initComponent: function() {
	this.app = Tine.Tinebase.appMgr.get('Webconference');
	this.title = this.app.i18n._('Available Webconference Rooms'),
	
        this.recordProxy = Tine.Webconference.roomRecordBackend;
        
        this.gridConfig.cm = this.getColumnModel();
        
	Tine.Webconference.RoomsGridPanel.superclass.initComponent.call(this);
	
    },
    onRowClick: function(grid, row, e) {
	var record = grid.getSelectionModel().getSelected().data;
	
	//console.debug(record);
	
	Ext.MessageBox.confirm('', 
                    String.format(this.app.i18n._('Do you want to join the room {0} with title {1}'), 
			record.room_name, record.title)+ ' ?', 
		    function(btn) {
                        if(btn == 'yes') { 
                            Tine.Tinebase.appMgr.get('Webconference').bbbUrl = record.room_url;
                            Tine.Tinebase.appMgr.get('Webconference').roomName = record.room_name;
			    Tine.Tinebase.appMgr.get('Webconference').roomId = record.id;
                            Tine.Tinebase.appMgr.get('Webconference').moderator = record.conference_role === 'O' || record.conference_role === 'M';
                            
                            Tine.Tinebase.appMgr.get('Webconference').onJoinAvailableWebconference();
                        }
                
                    }, this);
    },
    roleRenderer: function(role,metadata) {
        //return mod == true ? this.app.i18n._('Moderator') : this.app.i18n._('Attendee');
	metadata.attr = 'ext:qtip="' + Tine.Tinebase.appMgr.get('Webconference').i18n._('Click to join') + '"';
	return this.app.i18n._(WebconferenceRole[role]);
    },
    tooltipRenderer : function(value, metadata) {
        metadata.attr = 'ext:qtip="' + Tine.Tinebase.appMgr.get('Webconference').i18n._('Click to join') + '"';
        return value;
    },
    
    
     
     getColumnModel: function(){
        return new Ext.grid.ColumnModel({ 
            defaults: {
                sortable: true,
                resizable: true
            },
            columns: [{
                id: 'title',
                header: this.app.i18n._("Title"),
                width: 100,
                sortable: true,
                dataIndex: 'title',
		renderer: this.tooltipRenderer.createDelegate(this)
            }, {
                id: 'room_name',
                header: this.app.i18n._("Room name"),
                width: 150,
                sortable: true,
                dataIndex: 'room_name',
		renderer: this.tooltipRenderer.createDelegate(this)
            },{
                id: 'conference_role',
                header: this.app.i18n._("Webconference Role"),
                width: 350,
                sortable: true,
                dataIndex: 'conference_role',
		renderer: this.roleRenderer.createDelegate(this)
            }].concat(this.getModlogColumns())
        });
    }  
    
});
