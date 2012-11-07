/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schüle <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2011 Metaways Infosystems GmbH (http://www.metaways.de)
 */
Ext.ns('Tine.Webconference');

/**
 * ContatoRecord grid panel
 * 
 * @namespace   Tine.Webconference
 * @class       Tine.Webconference.ContatoRecordGridPanel
 * @extends     Tine.widgets.grid.GridPanel
 * 
 * <p>ContatoRecord Grid Panel</p>
 * <p><pre>
 * </pre></p>
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * 
 * @param       {Object} config
 * @constructor
 * Create a new Tine.Webconference.ContatoRecordGridPanel
 */
Tine.Webconference.ConfigGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
    /**
     * record class
     * @cfg {Tine.Webconference.Model.ContatoRecord} recordClass
     */
    recordClass: Tine.Webconference.Model.Config,
    
    hasQuickSearchFilterToolbarPlugin: false,
    
    /**
     * eval grants
     * @cfg {Boolean} evalGrants
     */
    evalGrants: false,
    
    /**
     * grid specific
     * @private
     */
    defaultSortInfo: {field: 'creation_time', direction: 'DESC'},
    gridConfig: {
        autoExpandColumn: 'url'
    },
     
    /**
     * inits this cmp
     * @private
     */
    initComponent: function() {
	this.app = Tine.Tinebase.appMgr.get('Webconference');
	
        this.recordProxy = Tine.Webconference.configRecordBackend;
        this.gridConfig = {
        };
        this.gridConfig.cm = this.getColumnModel();
        
        Tine.Webconference.ConfigGridPanel.superclass.initComponent.call(this);
    },
    
    initLayout: function() {
        this.supr().initLayout.call(this);
        
        this.items.push({
            region : 'north',
            height : 55,
            border : false,
            items  : this.actionToolbar
        });
    },
    
    /**
     * returns cm
     * 
     * @return Ext.grid.ColumnModel
     * @private
     * 
     * TODO    add more columns
     */
    getColumnModel: function(){
        return new Ext.grid.ColumnModel({ 
            defaults: {
                sortable: true,
                resizable: true
            },
            columns: [{
                id: 'url',
                header: this.app.i18n._("Url"),
                width: 100,
                sortable: true,
                dataIndex: 'url'
            }, {
                id: 'salt',
                header: this.app.i18n._("Security Salt"),
                width: 150,
                sortable: true,
                dataIndex: 'salt'
            },{
                id: 'limit_room',
                header: this.app.i18n._("Room Limit"),
                width: 350,
                sortable: true,
                dataIndex: 'limit_room'
            },{
                id: 'description',
                header: this.app.i18n._("Description"),
                width: 100,
                sortable: true,
                dataIndex: 'description'
            }].concat(this.getModlogColumns())
        });
    }   
    
    
});
