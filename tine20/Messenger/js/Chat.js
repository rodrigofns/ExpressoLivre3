Ext.ns('Tine.Messenger');

Tine.Messenger.Chat = Ext.extend(Ext.Window, {
    
    constructor: function () {
        Ext.apply(this, {
        iconCls:     'messenger-icon',
        cls:         'messenger-chat-window',
        width:       460,
        minWidth:    400,
        height:      360,
        minHeight:   280,
        closeAction: 'hide', //'close' - destroy the component
        collapsible: true,
        plain:       true,
        layout:      'border',
        tbar: {
            items:[
                {
                    id: 'messenger-chat-options',
                    text: Tine.Tinebase.appMgr.get('Messenger').i18n._('Options'),
                    menu: {
                            items:[{
                                        id: 'messenger-chat-send',
                                        icon: '/images/messenger/page_go.png',
                                        text: Tine.Tinebase.appMgr.get('Messenger').i18n._('Send file'),
                                        disabled: true,
                                        handler: function(){
                                            
                                        }
                                    },
                                    {
                                        id: 'messenger-chat-video',
                                        icon: '/images/messenger/webcam.png',
                                        text: Tine.Tinebase.appMgr.get('Messenger').i18n._('Start video chat'),
                                        disabled: true,
                                        handler: function() {
                                            
                                        }
                                     },
                                ]
                        }
                }]
        },
        listeners: {
            beforerender: function(_box){
                Tine.Messenger.AddItems(_box);
            },
            resize: function(_box, _width, _height){
                Tine.Messenger.ChatHandler.adjustChatAreaHeight(_box.id, _width, _height);
            },
            show: function () {
                this.setTextfieldFocus();
            },
            activate: function () {
                this.setTextfieldFocus();
            },
            expand: function () {
                this.setTextfieldFocus();
            }
        }
  });
        Tine.Messenger.Chat.superclass.constructor.apply(this, arguments);
    },
    
    setTextfieldFocus: function () {
        this.getComponent(2).focus(false, 200); // foco no textfield
    }
    
});