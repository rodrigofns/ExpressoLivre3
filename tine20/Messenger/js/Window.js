Ext.ns('Tine.Messenger');

var roster = new Ext.tree.TreePanel({
     id:           'messenger-roster',
     loader:       new Ext.tree.TreeLoader(),
     border:       false,
     cls:          'messenger-treeview',
     rootVisible:  false,
     renderTo:     Ext.getBody(),
     
     root: new Ext.tree.AsyncTreeNode({
         expanded: true,
         leaf:     false
    })
});



Tine.Messenger.Window = new Ext.Window({
    title:       'Expresso Messenger',
    iconCls:     'messenger-icon',
    width:       250,
    height:      450,
    closeAction: 'hide', //'close' - destroy the component
    plain:       true,
    layout:      'fit',
    
    items:       roster,
    
    buttons: [{
        id: 'messenger-connect-button',
        text: 'Connect',
        handler: function(){
            if (this.getText() == 'Connect') {
                // TODO-EXP: TEMPORARY - Place your jabber login and password
                var login = new Ext.Window({
                    id: 'messenger-connect-window',
                    layout: 'anchor',
                    closeAction: 'close',
                    plain: true,
                    width: 300,
                    height: 100,
                    title: 'Jabber Login',
                    items: {
                        xtype: 'form',
                        border: false,
                        items: [
                            {
                                xtype: 'textfield',
                                id: 'messenger-connect-login',
                                fieldLabel: 'Login'
                            },
                            {
                                xtype: 'textfield',
                                inputType: 'password',
                                id: 'messenger-connect-pwd',
                                fieldLabel: 'Password'
                            },
                            {
                                xtype: 'button',
                                text: 'GO',
                                listeners: {
                                    click: function () {
                                        Tine.Tinebase.registry.add('messengerAccount', {
                                            login: Ext.getCmp('messenger-connect-login').getValue(),
                                            password: Ext.getCmp('messenger-connect-pwd').getValue()
                                        });
                                        Ext.getCmp('messenger-connect-window').close();
                                        Tine.Tinebase.appMgr.get('Messenger').startMessenger();
                                    }
                                }
                            }
                        ]
                    }
                });
                login.show();
                // Commenting up, uncomment down!!
                // Start your engines!
                // Tine.Tinebase.appMgr.get('Messenger').startMessenger();
            } else if (this.getText() == 'Disconnect') {
                Tine.Tinebase.appMgr.get('Messenger').stopMessenger();
                Ext.getCmp('messenger-roster').getRootNode().removeAll();
                this.setText('Connect');
            }
        }
    }]
});


