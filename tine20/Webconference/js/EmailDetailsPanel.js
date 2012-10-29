
Ext.ns('Tine.Webconference');

/**
 * contact grid panel
 * 
 * @namespace   Tine.Webconference
 * @class       Tine.Webconference.EmailDetailsPanel
 * @extends     Tine.widgets.grid.DetailsPanel
 * 
 * <p>Tinebase Webconference EmailDetailsPanel</p>
 * <p><pre>
 * </pre></p>
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Edgar de Lucca <edgar.lucca@serpro.gov.br>, Marcelo Teixeira <marcelo.teixeira@serpro.gov.br>
 * @copyright   Copyright (c) 2007-2012 Metaways Infosystems GmbH (http://www.metaways.de)
 * 
 * Create a new Tine.Webconference.EmailDetailsPanel
 * 
 */
Tine.Webconference.EmailDetailsPanel = Ext.extend(Tine.widgets.grid.DetailsPanel, {
    
    /**
     * @cfg {Object} preparedPart
     * server prepared text/webconference Invite part 
     */
    preparedPart: null,
    
    /**
     * @property actionToolbar
     * @type Ext.Toolbar
     */
    actionToolbar: null,
    
    /**
     * @property WCInviteRecord
     * @type Tine.Webconference.Model.WCInvite
     */
    WCInviteRecord: null,
    
    /**
     * @property statusActions
     * @type Array
     */
    statusActions:[],
    
    /**
     * init this component
     */
    initComponent: function() {
        
        this.app = Tine.Tinebase.appMgr.get('Webconference');

        this.WCInviteRecord = new Tine.Webconference.Model.WCInvite(this.preparedPart.preparedData);
        
        this.initWCInviteToolbar();

        this.on('afterrender', this.showWCInvite, this);

        Tine.Webconference.EmailDetailsPanel.superclass.initComponent.call(this);
    },
    moderatorRenderer: function(mod) {
        return mod == true ? this.app.i18n._('Moderator') : this.app.i18n._('Attendee');
    },
    
    
    /**
     * process WCInvite
     * 
     * @param {String} status
     */
    processEmail: function(status, range) {
        
        var url = this.WCInviteRecord.get('url');
        var moderator = this.WCInviteRecord.get('moderator');
        var roomName = this.WCInviteRecord.get('roomName');
	var roomId = this.WCInviteRecord.get('roomId');
        Tine.Tinebase.appMgr.get('Webconference').onJoinWebconferenceFromEmail(url, moderator, roomId, roomName);
        
        
    },
    
    /**
     * WCInvite action toolbar
     */
    initWCInviteToolbar: function() {
        var singleRecordPanel = this.getSingleRecordPanel();
        
        this.actions = [];
        this.statusActions = [];
        
        
        this.statusActions.push (new Ext.Action({
            text: this.app.i18n._('Enter'),
            handler: this.processEmail.createDelegate(this, 0),
            icon: 'images/oxygen/16x16/actions/ok.png' 
        }));
        this.actions = this.actions.concat(this.statusActions);
        
        // add more actions here (no spam / apply / crush / send event / ...)
        
        this.WCInviteClause = new Ext.Toolbar.TextItem({
            text: ''
        });
        this.tbar = this.actionToolbar = new Ext.Toolbar({
            items: [{
                xtype: 'tbitem',
                cls: 'CalendarIconCls',
                width: 16,
                height: 16,
                style: 'margin: 3px 5px 2px 5px;'
            },
            this.WCInviteClause,
            '->'
            ].concat(this.actions)
        });
    },
    
    /**
     * show/layout WCInvite panel
     */
    showWCInvite: function() {
        
        
        var singleRecordPanel = this.getSingleRecordPanel(),
        
        method = this.WCInviteRecord.get('method'),
        url = this.WCInviteRecord.get('url');
                   
        // reset actions
        Ext.each(this.actions, function(action) {
            action.setHidden(true)
        });
        
        
        this.WCInviteClause.setText(this.app.i18n._('You received an webconference invitation.'));
        Ext.each(this.statusActions, function(action) {
            action.setHidden(false)
        });
        
        
        this.getLoadMask().hide();
        singleRecordPanel.setVisible(true);
        singleRecordPanel.setHeight(150);
        this.record = this.WCInviteRecord;
        singleRecordPanel.loadRecord(this.WCInviteRecord);
    },
    /**
     * main event details panel
     * 
     * @return {Ext.ux.display.DisplayPanel}
     */
    getSingleRecordPanel: function() {
        if (! this.singleRecordPanel) {
            this.singleRecordPanel = new Ext.ux.display.DisplayPanel ({
                //xtype: 'displaypanel',
                layout: 'fit',
                border: false,
                items: [{
                    layout: 'vbox',
                    border: false,
                    layoutConfig: {
                        align:'stretch'
                    },
                    items: [{
                        layout: 'hbox',
                        flex: 0,
                        height: 16,
                        border: false,
                        style: 'padding-left: 5px; padding-right: 5px',
                        layoutConfig: {
                            align:'stretch'
                        },
                        items: []
                    }, {
                        layout: 'hbox',
                        flex: 1,
                        border: false,
                        layoutConfig: {
                            padding:'5',
                            align:'stretch'
                        },
                        defaults:{
                            margins:'0 5 0 0'
                        },
                        items: [{
                            flex: 2,
                            layout: 'ux.display',
                            labelWidth: 60,
                            layoutConfig: {
                                background: 'solid'
                            },
                            items: [
                                {
                                    xtype: 'ux.displayfield',
                                    name: 'roomTitle',
                                    fieldLabel: this.app.i18n._('Room Title')
                                },
                                {
                                    xtype: 'ux.displayfield',
                                    name: 'moderator',
                                    fieldLabel: this.app.i18n._('Type'),
                                    renderer: this.moderatorRenderer.createDelegate(this)
                                }
                            ]
                        }]
                    }]
                }]
            });
        }
        
        return this.singleRecordPanel;
    }
});
