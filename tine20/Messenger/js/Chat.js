Ext.ns('Tine.Messenger');

Tine.Messenger.Chat = Ext.extend(Ext.Window, {
    
    constructor: function () {
        var app = Tine.Tinebase.appMgr.get('Messenger');
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
                    itemId: 'messenger-chat-options',
                    text: app.i18n._('Options'),
                    menu: {
                            items:[{
                                        itemId: 'messenger-chat-send',
                                        icon: '/images/messenger/page_go.png',
                                        text: app.i18n._('Send file'),
                                        handler: function(){
                                            var window_chat = this.ownerCt.ownerCt.ownerCt.ownerCt,
                                                id = window_chat.id.substr(MESSENGER_CHAT_ID_PREFIX.length),
                                                jid = Tine.Messenger.Util.idToJid(id);
                                                
                                            Tine.Messenger.FileTransfer.sendRequest(jid);
                                        }
                                    },
                                    {
                                        itemId: 'messenger-chat-video',
                                        icon: '/images/messenger/webcam.png',
                                        text: app.i18n._('Start video chat'),
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
            },
            move: function(_box){
                Tine.Messenger.Window._onMoveWindowAction(_box);
            }
        }
  });
        Tine.Messenger.Chat.superclass.constructor.apply(this, arguments);
    },
    
    setTextfieldFocus: function () {
        this.getComponent(2).focus(false, 200); // foco no textfield
    }
    
});