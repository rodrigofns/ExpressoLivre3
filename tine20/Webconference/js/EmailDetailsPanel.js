
Ext.ns('Tine.Webconference');


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
     * @property iMIPrecord
     * @type Tine.Webconference.Model.iMIP
     */
    iMIPrecord: null,
    
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

        this.iMIPrecord = new Tine.Webconference.Model.iMIP(this.preparedPart.preparedData);
        
        this.initIMIPToolbar();

        this.on('afterrender', this.showIMIP, this);

        Tine.Webconference.EmailDetailsPanel.superclass.initComponent.call(this);
    },
    moderatorRenderer: function(mod) {
        return mod == true ? this.app.i18n._('Moderator') : this.app.i18n._('Attendee');
    },
    
    
    /**
     * process IMIP
     * 
     * @param {String} status
     */
    processEmail: function(status, range) {
        
        var url = this.iMIPrecord.get('url');
        Tine.Tinebase.appMgr.get('Webconference').onJoinWebconferenceFromEmail(url);
        
        /*
        if (this.iMIPrecord.get('event').isRecurBase() && status != 'ACCEPTED' && !range) {
            Tine.widgets.dialog.MultiOptionsDialog.openWindow({
                title: this.app.i18n._('Reply to Recurring Event'),
                questionText: this.app.i18n._('You are responding to an recurring event. What would you like to do?'),
                height: 170,
                scope: this,
                options: [
                {
                    text: this.app.i18n._('Respond to whole series'), 
                    name: 'series'
                },

                {
                    text: this.app.i18n._('Do not respond'), 
                    name: 'cancel'
                }
                ],
                
                handler: function(option) {
                    if (option != 'cancel') {
                        this.processEmail(status, option);
                    }
                }
            });
            return;
        }
        */
        
//        Tine.log.debug('Tine.Calendar.iMIPDetailsPanel::processIMIP status: ' + status);
//        this.getLoadMask().show();
        
//        Tine.Calendar.iMIPProcess(this.iMIPrecord.data, status, function(result, response) {
//            this.preparedPart.preparedData = result;
//            if (response.error) {
//                // precondition changed?  
//                //return this.prepareIMIP();
//            }
//            
//            // load result
//            this.iMIPrecord = new Tine.Webconference.Model.iMIP(result);
//            this.iMIPrecord.set('event', Tine.Calendar.backend.recordReader({
//                responseText: Ext.util.JSON.encode(result.event)
//            }));
//            
//            this.showIMIP();
//        }, this);
    },
    
    /**
     * iMIP action toolbar
     */
    initIMIPToolbar: function() {
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
        
        this.iMIPclause = new Ext.Toolbar.TextItem({
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
            this.iMIPclause,
            '->'
            ].concat(this.actions)
        });
    },
    
    /**
     * show/layout iMIP panel
     */
    showIMIP: function() {
        
        
        var singleRecordPanel = this.getSingleRecordPanel(),
        
        method = this.iMIPrecord.get('method'),
        url = this.iMIPrecord.get('url');
                   
        // reset actions
        Ext.each(this.actions, function(action) {
            action.setHidden(true)
        });
        
        
        this.iMIPclause.setText(this.app.i18n._('You received an webconference invitation.'));
        Ext.each(this.statusActions, function(action) {
            action.setHidden(false)
        });
        
        
        this.getLoadMask().hide();
        singleRecordPanel.setVisible(true);
        singleRecordPanel.setHeight(150);
        this.record = this.iMIPrecord;
        singleRecordPanel.loadRecord(this.iMIPrecord);
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
                                    name: 'roomName',
                                    fieldLabel: this.app.i18n._('Room name')
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
