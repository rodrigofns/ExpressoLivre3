Ext.ns('Tine.Messenger');

Tine.Messenger.ConfigWindow = Ext.extend(Ext.Window, {
    
    constructor: function (config) {
        config = Ext.apply({
            id: 'messenger-config-window',
            title: _('Preferences'),
            closeAction: 'hide',
            resizable: false,
            autoHeight: true,
            width: 350,
            defaults: {
                style: {
                    marginLeft: '4px',
                    marginRight: '4px'
                }
            },
            items: [
                {
                    xtype: 'fieldset',
                    title: _('Notifications'),
                    items: [
                        {
                            xtype: 'checkbox',
                            id: 'messenger-config-window-notifications',
                            labelSeparator: '',
                            boxLabel: _('Show notifications'),
                            hideLabel: true,
                            style: {
                                position: 'relative',
                                top: '2px'
                            }
                        }
                    ]
                },
                {
                    xtype: 'fieldset',
                    title: _('History'),
                    layout: 'auto',
                    //scope: this,
                    items: [{
                        xtype: 'radiogroup',
                        id: 'messenger-config-window-history',
                        columns: 1,
                        items: [
                            {
                                boxLabel: _("Don't save history chat"),
                                name: 'config-history',
                                inputValue: this.HISTORY.DONT_SAVE,
                                checked: true
                            },
                            {
                                boxLabel: _('Download history chat'),
                                name: 'config-history',
                                inputValue: this.HISTORY.DOWNLOAD
                            },
                            {
                                boxLabel: _('Send history chat to e-mail'),
                                name: 'config-history',
                                inputValue: this.HISTORY.SEND_EMAIL
                            }
                        ]
                    }]
                },
                {
                    xtype: 'fieldset',
                    layout: 'fit',
                    title: _('Custom Name'),
                    disabled: (Tine.Tinebase.registry.get('messenger').messenger.format != 'custom'),
                    items: [
                        {
                            xtype: 'textfield',
                            id: 'messenger-config-window-customname',
                            fieldLabel: _('Login'),
                            labelSeparator: '',
                            value: Tine.Messenger.Util.getJidFromConfigNoResource(),
                            style: {
                                marginBottom: '4px'
                            }
                        }
                    ]
                }
            ],
            buttons: [
                {
                    xtype: 'button',
                    text: _('Save')
                },
                {
                    xtype: 'button',
                    text: _('Cancel'),
                    listeners: {
                        scope: this,
                        click: function () {
                            configWindow.hide();
                        }
                    }
                }
            ]
        }, config);
        
        Tine.Messenger.ConfigWindow.superclass.constructor.call(this, config);
    },
    
    HISTORY: {
        DONT_SAVE: 'none',
        DOWNLOAD: 'download',
        SEND_EMAIL: 'email'
    }
    
});