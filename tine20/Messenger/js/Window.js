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
                                        var user = Ext.getCmp('messenger-connect-login').getValue();
                                        
                                        if (user.indexOf('@') < 0) {
                                            user += '@simdev.sdr.serpro/expresso-3.0';
                                        }                                        
                                        if (user.indexOf('expresso-3.0') < 0) {
                                            user += '/expresso-3.0';
                                        }
                                        Tine.Tinebase.registry.add('messengerAccount', {
                                            login: user,
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
                Tine.Messenger.RosterHandler.clearRoster();
                this.setText('Connect');
            }
        }
    }],

    toggleConnectionButton: function () {
        var button = Ext.getCmp('messenger-connect-button');
        if (button.getText() == 'Connect') {
            button.setText('Disconnect');
        } else {
            button.setText('Connect');
        }
    }
});


Tine.Messenger.Window.RosterTree = function(iq){
    var NO_GROUP = "No group";
    
    var createTree = function(xml) {
        addGroupToTree(null,xml);	//add groups
        addBuddyToTree(null,xml);	//add buddys

    }
    var addBuddyToTree = function(f,a){
            
        if(f){
            var item = $(f).find("item");
            var jid = item.attr("jid"),
                label = item.attr("name") || jid,
                subscription = item.attr("subscription");
            var appended = false;
            var status = '';
            var status_text = '';

            jid = Strophe.getBareJidFromJid(jid);

            var _buddy = new Ext.tree.TreeNode({ //buddy adden
                            id:jid,
                            status:status,
                            status_text:status_text,
                            jid:jid,
                            subscription:subscription,
                            hide:false,
                            text:label,
//                            icon:"/images/messenger/icon_"+status+".png",
                            cls:'messenger-contact',
                            allowDrag:true,
                            allowDrop:false
//                            qtip:"JID : "+jid+"<br/>Status : "+status+"<br/>Text : "+status_text+"<br/>Subscription : "+subscription
            });
            _buddy.on("dblclick",Tine.Messenger.RosterHandler.openChat);

            var rootNode = Ext.getCmp('messenger-roster').getRootNode();

            if(item.children("group").length > 0){
                item.children("group").each(function(g){
                    for(i=0; i < rootNode.childNodes.length; i++){
                        if(rootNode.childNodes[i].text == item.text()){
                            rootNode.childNodes[i].appendChild(_buddy).ui.addClass('messenger-contact-unavailable');
                            appended = true;
                        }
                    }
                });
            }
            if(!appended){
                rootNode.appendChild(_buddy).ui.addClass('messenger-contact-unavailable');
            }
        }else{
            $(a).find("item").each(function () {
                var jid = $(this).attr("jid"),
                    label = $(this).attr("name") || jid,
                    subscription = $(this).attr("subscription");
                var status = '';
                var status_text = '';

                jid = Strophe.getBareJidFromJid(jid);

                var _buddy = new Ext.tree.TreeNode({ //buddy adden
                                id:jid,
                                status:status,
                                status_text:status_text,
                                jid:jid,
                                subscription:subscription,
                                hide:false,
                                text:label,
//                                icon:"/images/messenger/icon_"+status+".png",
                                cls:'messenger-contact',
                                allowDrag:true,
                                allowDrop:false
//                                qtip:"JID : "+jid+"<br/>Status : "+status+"<br/>Text : "+status_text+"<br/>Subscription : "+subscription
                });
                _buddy.on("dblclick",Tine.Messenger.RosterHandler.openChat);

                var rootNode = Ext.getCmp('messenger-roster').getRootNode();

                if($(this).children("group").length > 0){
                    var i=0;
                    $(this).children("group").each(function(g){
                        for(i=0; i < rootNode.childNodes.length; i++){
                            if(rootNode.childNodes[i].text == $(this).text()){
                                rootNode.childNodes[i].appendChild(_buddy).ui.addClass('messenger-contact-unavailable');
                                appended = true;
                            }
                        }
                    });
                } else {
                    var hasGroupNoGroup = false;
                    for(i=0; i < rootNode.childNodes.length; i++){
                        if(rootNode.childNodes[i].text == _(NO_GROUP)){
                            hasGroupNoGroup = true;
                        }
                    }
                    if(!hasGroupNoGroup){
                        Tine.Messenger.Window.RosterTree().addGroup(_(NO_GROUP));
                        node = Ext.getCmp('messenger-roster').getRootNode().childNodes.length - 1;
                        Ext.getCmp('messenger-roster').getRootNode().childNodes[node].appendChild(_buddy).ui.addClass('messenger-contact-unavailable');
                    } else {
                        rootNode.appendChild(_buddy).ui.addClass('messenger-contact-unavailable');
                    }
                }
            });
        }
    }
    var addGroupToTree = function(f,a){
        var _group_name = '';
        
        if(f != null){
            _group_name = f;
            if(_group_name.trim() != ''){
                var _group = new Ext.tree.TreeNode({ //group adden
                                text:_group_name,
                                iconCls:"display:none;",
                                expanded:true,
                                expandable:true,
                                allowDrag:false,
                                "gname":_group_name
                });
                Ext.getCmp('messenger-roster').getRootNode().appendChild(_group);
            }
        }else{
            var _arr_groups = [];
            $(a).find("group").each(function(){
                _group_name = $(this).text();
                if($.inArray(_group_name, _arr_groups) === -1){
                    _arr_groups.push(_group_name);
                    var _group = new Ext.tree.TreeNode({ 
                                    text:_group_name,
                                    iconCls:"display:none;",
                                    expanded:true,
                                    expandable:true,
                                    allowDrag:false,
                                    "gname":_group_name
                    });
                    Ext.getCmp('messenger-roster').getRootNode().appendChild(_group);
                }
            });
        }
    }
    return {
        init : function(){
            createTree(iq);
        },
        addBuddy: function(e){
            addBuddyToTree(e)
        },
        addGroup: function(e){
            addGroupToTree(e);
        }
    }
}
