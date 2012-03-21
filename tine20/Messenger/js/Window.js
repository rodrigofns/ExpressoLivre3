Ext.ns('Tine.Messenger');

var roster = new Ext.tree.TreePanel({
     id:           'messenger-roster',
     loader:       new Ext.tree.TreeLoader(),
     border:       false,
     cls:          'messenger-treeview',
     rootVisible:  false,
     renderTo:     Ext.getBody(),
     autoScroll:   true,
     
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
    tbar: [{
                text:'Actions',
                menu: {
                    id:"BuddysMenu",
                    items:[
                            {
                                id: 'messenger-contact-add',
                                icon: '/images/messenger/user_add.png',
                                text: 'Add Contact',
                                disabled: true,
                                handler: function () {
                                    var addContactWindow = new Ext.Window({
                                        closeAction: 'close',
                                        layout: 'fit',
                                        plain: true,
                                        modal: true,
                                        title: _('Add Contact'),
                                        items: [
                                            {
                                                xtype: 'form',
                                                border: false,
                                                items: [
                                                    {
                                                        xtype: 'textfield',
                                                        id: 'messenger-contact-add-jid',
                                                        fieldLabel: _('JID')
                                                    },
                                                    {
                                                        xtype: 'textfield',
                                                        id: 'messenger-contact-add-name',
                                                        fieldLabel: _('Name')
                                                    },
                                                    {
                                                        xtype: 'combo',
                                                        id: 'messenger-contact-add-group',
                                                        fieldLabel: _('Group'),
                                                        store: new Ext.data.SimpleStore({
                                                                        data: Tine.Messenger.RosterHandler.getUserGroups(),
                                                                        id: 0,
                                                                        fields: ['text']
                                                                }),
                                                        emptyText: _('Select a group') + '...',
                                                        valueField: 'text',
                                                        displayField: 'text',
                                                        triggerAction: 'all',
                                                        editable: false,
                                                        mode : 'local'
                                                    },
                                                    {
                                                        xtype: 'button',
                                                        id: 'messenger-contact-add-button',
                                                        text: _('Add'),
                                                        listeners: {
                                                            click: function () {
                                                                var jid = Ext.getCmp('messenger-contact-add-jid').getValue(),
                                                                    name = Ext.getCmp('messenger-contact-add-name').getValue(),
                                                                    group = Ext.getCmp('messenger-contact-add-group').getValue();
                                                                Tine.Messenger.RosterHandler.addContact(jid, name, group);
                                                                addContactWindow.close();
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    });
                                    addContactWindow.show();
                                }
                            },
                            {
                                id: 'messenger-group-mngt-add',
                                text: 'Add Group',
                                icon: '/images/messenger/group_add.png',
                                disabled: true,
                                handler: function() {
                                    var addGroupWindow = new Ext.Window({
                                        closeAction: 'close',
                                        layout: 'fit',
                                        plain: true,
                                        modal: true,
                                        title: _('Add Group'),
                                        items: [{
                                                xtype: 'form',
                                                border: false,
                                                items: [
                                                    {
                                                        xtype: 'textfield',
                                                        id: 'messenger-group-mngt-name',
                                                        fieldLabel: _('Name')
                                                    },
                                                    {
                                                        xtype: 'button',
                                                        id: 'messenger-group-mngt-button',
                                                        text: _('Add'),
                                                        listeners: {
                                                            click: function () {
                                                                var name = Ext.getCmp('messenger-group-mngt-name').getValue();
                                                                Tine.Messenger.Window.RosterTree().addGroup(name);
                                                                addGroupWindow.close();
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    });
                                    addGroupWindow.show();
                                }
                                
                        }]
                    }
    }],
    
    items:       roster,
    
    buttons: [
        {
            id: 'messenger-change-status-button',
            icon: '/images/messenger/user_offline.png',
            width: 32,
            disabled: true,
            handler: function(){
                var statusWindow = new Ext.Window({
                    id: 'messenger-change-status-window',
                    closeAction: 'close',
                    plain: true,
                    layout:      'fit',
                    width: 350,
                    height: 150,
                    title: 'Change Status',
                    items: {
                        xtype: 'form',
                        border: false,
                        items: [
                            {
                                xtype: 'combo',
                                id: 'messenger-change-status',
                                fieldLabel: 'Status',
                                store: new Ext.data.SimpleStore({
                                                data: [
                                                        [1, 'Online'],
                                                        [2, 'Offline'],
                                                        [3, 'Away'],
                                                        [4, 'Do not disturb'],
                                                ],
                                                id: 0,
                                                fields: ['value', 'text']
                                        }),
                                emptyText:'Select a status...',
                                valueField: 'value',
                                displayField: 'text',
                                triggerAction: 'all',
                                editable: false,
                                mode : 'local'
                            },
                            {
                                xtype: 'textarea',
                                id: 'messenger-change-status-message',
                                fieldLabel: 'Message',
                                width: 200,
                                height: 100
                            },
                            {
                                xtype: 'button',
                                text: 'GO',
                                listeners: {
                                    click: function () {
                                        var status = Ext.getCmp('messenger-change-status').getValue();
                                        var message = Ext.getCmp('messenger-change-status-message').getValue();
                                        if (status == 1) {
                                            if (!Tine.Tinebase.appMgr.get('Messenger').getConnection().connected) {
                                                Tine.Messenger.ChatHandler.connect();
                                            } else {
                                                Tine.Messenger.Application.connection.send($pres());
                                            }
                                            Ext.getCmp('messenger-change-status-button')
                                                .enable()
                                                .setIcon('/images/messenger/user_online.png')
                                                .setTooltip(_('Online'));
                                        } else if (status == 2) {
                                            Tine.Messenger.ChatHandler.disconnect();
                                            Ext.getCmp('messenger-change-status-button')
                                                .enable()
                                                .setIcon('/images/messenger/user_offline.png')
                                                .setTooltip(_('Offline'));
                                        } else if (status == 3) {
                                            Tine.Messenger.RosterHandler.setStatus('away', message);
                                            Ext.getCmp('messenger-change-status-button')
                                                .enable()
                                                .setIcon('/images/messenger/user_away.png')
                                                .setTooltip(_('Away'));
                                        } else if (status == 4) {
                                            Tine.Messenger.RosterHandler.setStatus('dnd', message);
                                            Ext.getCmp('messenger-change-status-button')
                                                .enable()
                                                .setIcon('/images/messenger/user_dnd.png')
                                                .setTooltip(_('Do not disturb'));
                                        }
                                        Ext.getCmp('messenger-change-status-window').close();
                                    }
                                }
                            }
                        ]
                    }
                });
                statusWindow.show();
            }
        },
        {
            id: 'messenger-connect-button',
            width: 32,
            tooltip: 'Connect',
            connectionStatus: 'Connect',
            icon: '/images/messenger/disconnected.png',
            handler: function() {
                if (this.connectionStatus == 'Connect') {
                    Tine.Messenger.ChatHandler.connect();
                    // Commenting up, uncomment down!!
                    // Start your engines!
                    // Tine.Tinebase.appMgr.get('Messenger').startMessenger();
                } else if (this.connectionStatus == 'Disconnect') {
                    Tine.Messenger.ChatHandler.disconnect();
                }
            }
    }]
    
});

var contextMenu = new Ext.menu.Menu({
    floating: true,
    items: [
        {
            text: 'Rename',
            icon: '/images/messenger/user_edit.png',
            handler: function (choice, ev) {
                var jid = choice.parentMenu.contactId;

                choice.parentMenu.hide();

                var renameContactWindow = new Ext.Window({
                    closeAction: 'close',
                    layout: 'fit',
                    plain: true,
                    modal: true,
                    title: _('Rename Contact') + ' - ' + jid,
                    items: [
                        {
                            xtype: 'form',
                            border: false,
                            items: [
                                {
                                    xtype: 'textfield',
                                    id: 'messenger-contact-mngt-name',
                                    fieldLabel: _('Name')
                                },
                                {
                                    xtype: 'button',
                                    id: 'messenger-contact-mngt-button',
                                    text: _('Rename'),
                                    listeners: {
                                        click: function () {
                                            var name = Ext.getCmp('messenger-contact-mngt-name').getValue();
                                            Tine.Messenger.RosterHandler.renameContact(jid, name);
                                            renameContactWindow.close();
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                });
                renameContactWindow.show();
            }
        },
        {
            text: 'Remove',
            icon: '/images/messenger/user_delete.png',
            handler: function (choice, ev) {
                var jid = choice.parentMenu.contactId,
                    name = Tine.Messenger.RosterHandler.getContactElement(jid).text;

                choice.parentMenu.hide();

                Ext.Msg.buttonText.yes = _('Yes');
                Ext.Msg.buttonText.no = _('No');
                Ext.Msg.minWidth = 300;
                Ext.Msg.confirm(_('Delete Contact') + ' - ' + jid,
                                    _('Are you sure to delete ' + name + '?'),
                                    function (id) {
                                        if (id == 'yes') {
                                            Tine.Messenger.RosterHandler.removeContact(jid);
                                        }
                                    }
                );
            }
        },
        
        {
            id: 'subMenuGrpItems',
            text: 'Move to',
            icon: '/images/messenger/group_go.png',
            menu: { 
                    xtype: 'menu'
                  }
        },
        
        {
            id: 'req-authorization-button',
            text: 'Request authorization',
            handler: function (choice, ev) {
                var jid = choice.parentMenu.contactId,
                    type = 'subscribe';
                Tine.Messenger.LogHandler.sendSubscribeMessage(jid, type);
            }
            
        }
    ]
});

Tine.Messenger.Window.BuildSubMenuGrpItems = function(jid){
    var node = contextMenu.findById('subMenuGrpItems');
    node.menu.removeAll();
    var groups = Tine.Messenger.Window.RosterTree().getGroupsFromTree();
    var user_group = Tine.Messenger.RosterHandler.getContactElementGroup(jid);
    var NO_GROUP = Tine.Messenger.Window.RosterTree().getNoGroup();
    
    for(i=0; i < groups.length; i++){
        var group = groups[i];
        if(group != user_group){
            node.menu.addItem( 
                new Ext.menu.Item({
                    text: group,
                    handler: function(choice, ev){
                                Tine.Messenger.RosterHandler.moveContactFromGroups(jid, choice.text);
                            }
                })
            );
        } else if(groups.length == 1){
            node.menu.addItem( 
                new Ext.menu.Item({
                    text: _('Empty'),
                    disabled: true
                })
            );
        }
    }
    if(user_group != null){
        node.menu.addItem( 
            new Ext.menu.Separator()
        );
        node.menu.addItem( 
            new Ext.menu.Item({
                text: NO_GROUP,
                handler: function(choice, ev){
                            Tine.Messenger.RosterHandler.moveContactFromGroups(jid, NO_GROUP);
                        }
            })
        );
    }
};

Tine.Messenger.Window.RosterTree = function(){
    var NO_GROUP = '(no group)';
    
    var createTree = function(xml) {
        addGroupToTree(null,xml);	//add groups
        addBuddyToTree(xml);	//add buddys

    }    
    var addBuddyToTree = function(a){
        
            $(a).find("item").each(function () {
                var jid = $(this).attr("jid"),
                    label = $(this).attr("name") || jid,
                    subscription = $(this).attr("subscription") || '',
                    ask = $(this).attr('ask');
                var status = _(ST_UNAVAILABLE);
                var status_text = '';
                var cls = Tine.Messenger.Util.getStatusClass(ST_UNAVAILABLE);
                cls = (subscription == 'to' ? 
                    Tine.Messenger.Util.getSubscriptionClass(SB_SUBSCRIBE) : cls)
                if(jid.length > 0){
                    jid = Strophe.getBareJidFromJid(jid);

                    var _buddy = new Ext.tree.TreeNode({ //buddy adden
                                    id:jid,
                                    status:status,
                                    status_text:status_text,
                                    jid:jid,
                                    subscription:subscription,
                                    hide:false,
                                    text:label,
                                    cls: 'messenger-contact '+cls,
                                    allowDrag:true,
                                    allowDrop:false,
                                    qtip: "JID : "+jid+"<br>"
                                            +_('Status')+" : "+status+"<br>"
                                            +_('Subscription')+" : "+subscription
                    });
                    
                    _buddy.on("dblclick",Tine.Messenger.RosterHandler.openChat);
                    _buddy.on('contextmenu', function (el) {
                        contextMenu.contactId = el.id;
                        contextMenu.show(el.ui.getEl());
                        Tine.Messenger.Window.BuildSubMenuGrpItems(el.id);
                    });
                    
                    var rootNode = Ext.getCmp('messenger-roster').getRootNode();


                    if($(this).children("group").text().trim().length > 0){
                        var i=0;
                        $(this).children("group").each(function(g){
                            for(var i=0; i < rootNode.childNodes.length; i++){
                                if(rootNode.childNodes[i].text == $(this).text()){
                                    rootNode.childNodes[i].appendChild(_buddy);
                                }
                            }
                        });
                    } else {
                        var hasGroupNoGroup = false,
                            node = -1;
                        for(var i=0; i < rootNode.childNodes.length; i++){
                            if(rootNode.childNodes[i].text == _(NO_GROUP)){
                                hasGroupNoGroup = true;
                                node = i;
                            }
                        }
                        if(!hasGroupNoGroup){
                            Tine.Messenger.Window.RosterTree().addGroup(_(NO_GROUP));
                            node = Ext.getCmp('messenger-roster').getRootNode().childNodes.length - 1;
                        }
                        rootNode.childNodes[node].appendChild(_buddy);
                    }
                    _buddy.ui.textNode.setAttribute('status', status);
                }
            });
    }
    var addGroupToTree = function(f,a){
        var _group_name = '';
        
        if(f != null){
            _group_name = f.toString();
            if(_group_name.trim() != ''){
                var _groups = Tine.Messenger.Window.RosterTree().getGroupsFromTree();
                if($.inArray(_group_name, _groups) == -1){
                    var _group = new Ext.tree.TreeNode({ //group adden
                                    text:_group_name,
                                    cls: "messenger-group",
                                    expanded:true,
                                    expandable:true,
                                    allowDrag:false,
                                    "gname":_group_name
                    });
                    if(_group_name != _(NO_GROUP)){
                        _group.on('contextmenu', function (el) {
                            contextMenuGrp.gname = el.text;
                            contextMenuGrp.show(el.ui.getEl());
                        });
                    }
                    Ext.getCmp('messenger-roster').getRootNode().appendChild(_group);
                }
            }
        }else{
            var _arr_groups = [];
            $(a).find("group").each(function(){
                _group_name = $(this).text();
                if(_group_name.trim() != ''){
                    if($.inArray(_group_name, _arr_groups) === -1){
                        _arr_groups.push(_group_name);
                        var _group = new Ext.tree.TreeNode({ 
                                        text:_group_name,
                                        cls:"messenger-group",
                                        expanded:true,
                                        expandable:true,
                                        allowDrag:false,
                                        "gname":_group_name
                        });
                        _group.on('contextmenu', function (el) {
                            contextMenuGrp.gname = el.text;
                            contextMenuGrp.show(el.ui.getEl());
                        });
                        Ext.getCmp('messenger-roster').getRootNode().appendChild(_group);
                    }
                }
            });
        }
    }
    var removeBuddyClasses = function(buddy){
        var old_classes = Tine.Messenger.Util.getStatusClass('ALL') 
                + ','+Tine.Messenger.Util.getSubscriptionClass('ALL');
        var v_class = old_classes.split(',');
        for(var i=0; i < v_class.length; i++){
            buddy.ui.removeClass(v_class[i]);
        }
    }
    var updateReqAuthorizationButton = function(jid, subscription){
        var contact = Tine.Messenger.RosterHandler.getContactElement(jid);
        var reqAuth = contextMenu.items.get('req-authorization-button');
        
        try{
        contact.un('contextMenu');
        contact.on('contextMenu', function(el){
            contextMenu.contactId = el.id;
            reqAuth.hide()
            if(subscription == 'none' || subscription == 'from'){
                reqAuth.show();
            }
            Tine.Messenger.Window.BuildSubMenuGrpItems(el.id);
            contextMenu.show(el.ui.getEl());
        });
        }catch(err){
            Tine.Messenger.Log.error("Error while uptate contextMenu");
        }
    }
    return {
        init : function(iq){
            createTree(iq);
        },
        /**
         *  @method addBuddy
         *  @public
         *  @param  iq
         *  @description &lt;iq&gt;<br>
         *               &nbsp; &lt;item subscription='to' name='_name' jid='_jid'&gt;<br>
	 *		 &nbsp;&nbsp; &lt;group&gt;_group&lt;/group&gt;<br>
	 *		 &nbsp; &lt;/item&gt;<br>
         *               &lt;iq&gt;
         */
        
        addBuddy: function(iq){
            addBuddyToTree(iq)
        },
        addGroup: function(name){
            addGroupToTree(name);
        },
        getGroupsFromTree: function (){
            var groups = new Array();
            var rootNode = Ext.getCmp('messenger-roster').getRootNode();
            for(var i=0; i < rootNode.childNodes.length ; i++){
                if(rootNode.childNodes[i].text != _(NO_GROUP)){
                    groups.push([rootNode.childNodes[i].text]);
                }
            }
            return groups;
        },
        getNoGroup: function(){
            return _(NO_GROUP);
        },
        /**
         * @method updateBuddy
         * @public
         * @param  jid
         * @param  status
         * @param  subscription
         * @param  status_text
         * @param  message
         * @description 
         */
        updateBuddy: function(jid, status, subscription, status_text, message){
            var _buddy;

            if (typeof jid == 'string')
                _buddy = Tine.Messenger.RosterHandler.getContactElement(jid);
            else
                _buddy = jid;
            
            var status_cls = Tine.Messenger.Util.getStatusClass(status);
            
            if(_buddy && status_cls != ''){
                subscription = subscription || 
                               _buddy.ui.textNode.getAttribute('subscription') ||
                               _buddy.attributes.subscription;
                
                
                var subscription_cls = Tine.Messenger.Util.getSubscriptionClass(subscription);
                
                removeBuddyClasses(_buddy);
                
                _buddy.ui.addClass(status_cls);
                _buddy.ui.addClass(subscription_cls);
                
                status_text = status_text ? status_text : '';
                message = message ? message : '';
                _buddy.ui.textNode.setAttribute('status', _(status));
                _buddy.ui.textNode.setAttribute('status_text', status_text);
                _buddy.ui.textNode.setAttribute('subscription', subscription);
                
                _buddy.ui.textNode.setAttribute('qtip', "JID : "+jid+"<br>"+
                                                _('Status')+" : "+ _(status) +"<br>"+
                                                _('Subscription')+" : "+ _(subscription) +
                                                (status_text.trim() ? '<br>'+status_text : '') +
                                                (message.trim() ? '<br>'+message : ''));
                
                updateReqAuthorizationButton(jid, subscription);
            } else {
                Tine.Messenger.Log.error('Error while updating '+jid+". Jid not found or class not found can be the cause.");
            }
        }
    }
}

var contextMenuGrp = new Ext.menu.Menu({
    floating: true,
    items:[{
        text:'edit',
        icon:"/images/messenger/group_edit.png",
        handler: function (choice, ev) {
            var gname = choice.parentMenu.gname;
            choice.parentMenu.hide();

            var renameGroupWindow = new Ext.Window({
                closeAction: 'close',
                layout: 'fit',
                plain: true,
                modal: true,
                title: _('Rename Group') + ' - ' + gname,
                items: [
                    {
                        xtype: 'form',
                        border: false,
                        items: [
                            {
                                xtype: 'textfield',
                                id: 'messenger-group-mngt-name',
                                fieldLabel: _('Name')
                            },
                            {
                                xtype: 'button',
                                id: 'messenger-group-mngt-button',
                                text: _('Rename it!'),
                                        listeners: {
                                            click: function () {
                                                var n_gname = Ext.getCmp('messenger-group-mngt-name').getValue();
                                                //TODO: Check there's no group with same name
                                                Tine.Messenger.RosterHandler.renameGroup(gname, n_gname);
                                                renameGroupWindow.close();
                                            }
                                        }
                            }
                        ]
                    }
                ]
            });
            renameGroupWindow.show();
        }
    },{
        text:'delete',
        icon:"/images/messenger/group_delete.png",
        handler: function (choice, ev) {
            var grp_name = choice.parentMenu.gname;
            choice.parentMenu.hide();

            Ext.Msg.buttonText.yes = _('Yes');
            Ext.Msg.buttonText.no = _('No');
            Ext.Msg.minWidth = 300;
            Ext.Msg.confirm(_('Delete Group') + ' - ' + grp_name,
                                _('Are you sure to delete ' + grp_name + '?'),
                                function (id) {
                                    if (id == 'yes') {
                                        Tine.Messenger.RosterHandler.removeGroup(grp_name);
                                    }
                                }
            );
        }
    }]

});

Tine.Messenger.Window.AddBuddyWindow = function(jid){
    
    Tine.Messenger.RosterHandler.addContactElement(jid);
    
    var addContactWindow = new Ext.Window({
        closeAction: 'close',
        layout: 'fit',
        plain: true,
        modal: true,
        title: _('Add Contact') + jid,
        items: [
            {
                xtype: 'form',
                border: false,
                items: [
                    {
                        xtype: 'textfield',
                        id: 'messenger-contact-add-jid',
                        fieldLabel: _('JID'),
                        value: jid,
                        disabled: true
                    },
                    {
                        xtype: 'textfield',
                        id: 'messenger-contact-add-name',
                        fieldLabel: _('Name')
                    },
                    {
                        xtype: 'combo',
                        id: 'messenger-contact-add-group',
                        fieldLabel: _('Group'),
                        store: new Ext.data.SimpleStore({
                                        data: Tine.Messenger.Window.RosterTree().getGroupsFromTree(),
                                        id: 0,
                                        fields: ['text']
                                }),
                        emptyText: _('Select a group') + '...',
                        valueField: 'text',
                        displayField: 'text',
                        triggerAction: 'all',
                        editable: false,
                        mode : 'local'
                    },
                    {
                        xtype: 'button',
                        id: 'messenger-contact-add-button',
                        text: _('Add'),
                        listeners: {
                            click: function () {
//                                var jid = Ext.getCmp('messenger-contact-add-jid').getValue(),
                                var name = Ext.getCmp('messenger-contact-add-name').getValue(),
                                    group = Ext.getCmp('messenger-contact-add-group').getValue();
                                
//                                Tine.Messenger.RosterHandler.addContactElement(jid, name, group);
                                Tine.Messenger.RosterHandler.renameContact(jid, name, group);
                                addContactWindow.close();
                            }
                        }
                    }
                ]
            }
        ]
    });
    addContactWindow.show();
}