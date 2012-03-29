Ext.ns('Tine.Messenger');

Tine.Messenger.RosterTree = function(){
    var NO_GROUP = '(no group)';
    
    var createTree = function(xml) {
        addGroupToTree(xml);	//add groups
        addBuddyToTree(xml);	//add buddys

    }
    
    var buddyContext = function(_node, e){
            
            var items = Array();
            
            items.push({text: 'Rename',
                          handler: renameBuddy,
                          node:_node,
                          icon: '/images/messenger/user_edit.png'});
            items.push({text: 'Remove', 
                          handler: removeBuddy,
                          node:_node, 
                          icon:"/images/messenger/user_delete.png"});
            if( _node.attributes.subscription == "none" || 
                _node.attributes.subscription == "to" || 
                _node.attributes.subscription == "from")
                    items.push({text: 'Subscribe', 
                                  handler: subscribeBuddy,
                                  node:_node,
                                  icon:"images/jame/group_go.png"});
            items.push({text: 'Move to',
                          node:_node,
                          listeners: {
                              render: function(e){
                                  buildSubMenuGrpItems(e);
                              }
                          },
                          icon:"",
                          menu: {xtype: 'menu'}
                      });
            var menu = new Ext.menu.Menu({
                            items: items
                    });
            menu.show(_node.ui.getAnchor());
    }
    
    var renameBuddy = function(_node, e){
            var treeEditor = new Ext.tree.TreeEditor(Ext.getCmp('messenger-roster'), {
                    allowBlank:false,
                    blankText:'A name is required',
                    selectOnFocus:true
            });
            treeEditor.on("complete",Tine.Messenger.RosterHandler.renameContact2, this);
            treeEditor.triggerEdit(_node.node);
    }
    
    var removeBuddy = function(_node, e){
        var jid = _node.node.attributes.jid,
            name = _node.node.attributes.text || jid;

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
    
    var subscribeBuddy = function(_node, e){
        var jid = _node.node.attributes.jid,
            type = 'subscribe';
            
        Tine.Messenger.LogHandler.sendSubscribeMessage(jid, type);
    }
    
    var buildSubMenuGrpItems = function(e){
        var _node = e.node,
            menu_node = e.menu,
            groups = getGroupsFromTree(),
            user_group = _node.parentNode.text,
            jid = _node.attributes.jid;

        menu_node.removeAll();

        for(var i=0; i < groups.length; i++){
            var group = groups[i];
            if(group != user_group){
                menu_node.addItem( 
                    new Ext.menu.Item({
                        text: group,
                        handler: function(choice, ev){
                                    Tine.Messenger.RosterHandler.moveContactFromGroups(jid, choice.text);
                                }
                    })
                );
            } else if(groups.length == 1){
                menu_node.addItem( 
                    new Ext.menu.Item({
                        text: _('Empty'),
                        disabled: true
                    })
                );
            }
        }
        if(user_group != NO_GROUP){
            menu_node.addItem( 
                new Ext.menu.Separator()
            );
            menu_node.addItem( 
                new Ext.menu.Item({
                    text: NO_GROUP,
                    handler: function(choice, ev){
                                Tine.Messenger.RosterHandler.moveContactFromGroups(jid, NO_GROUP);
                            }
                })
            );
        }
    }
    
    var groupContext = function(_node, e){
            var items = Array();
            
            items.push({text: 'Rename',
                          handler: renameGroup,
                          node:_node,
                          icon: '/images/messenger/group_edit.png'});
            items.push({text: 'Remove', 
                          handler: removeGroup,
                          node:_node, 
                          icon:"/images/messenger/group_delete.png"});
            var menu = new Ext.menu.Menu({ 
//                            id: 'contextMenuGroup',
                            items: items
                    }); 
            menu.show(_node.ui.getAnchor());
    }
    
    var renameGroup = function(_node, e){
            var treeEditor = new Ext.tree.TreeEditor(Ext.getCmp('messenger-roster'), {
                    allowBlank:false,
                    blankText:'A name is required',
                    selectOnFocus:true
            });
            treeEditor.on("beforecomplete",renameGroupAction,this);
            treeEditor.on("complete",Tine.Messenger.RosterHandler.renameGroup,this);
            treeEditor.triggerEdit(_node.node);
    }
    var renameGroupAction = function(_e, name){
        if(name && name != _e.startValue){
            if(groupExist(name)){
                Ext.Msg.alert(_('Rename Group'),_('The group already exists!'));
                return false;
            } else {
                return true;
            }
        }
        return false;
    }
    var removeGroup = function(_node, e){
        var grp_name = _node.node.text;
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
    
    var addBuddyToTree = function(xml){
        
            $(xml).find("item").each(function () {
                var jid = $(this).attr("jid"),
                    label = $(this).attr("name") || jid,
                    subscription = $(this).attr("subscription") || '',
                    status = _(IMConst.ST_UNAVAILABLE),
                    status_text = '',
                    cls = Tine.Messenger.Util.getStatusClass(IMConst.ST_UNAVAILABLE);
                cls = (subscription == IMConst.SB_TO ? 
                    Tine.Messenger.Util.getSubscriptionClass(IMConst.SB_TO) : cls)
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
                    
                    _buddy.on("dblclick", Tine.Messenger.RosterHandler.openChat);
//                    _buddy.un("contextmenu");
                    _buddy.on("contextmenu", function(el){
                            buddyContext(el);
//                            buildSubMenuGrpItems(el);
                    });
//                    _buddy.on('contextmenu', function (el) {
//                        contextMenu.contactId = el.id;
//                        contextMenu.show(el.ui.getEl());
//                        Tine.Messenger.Window._BuildSubMenuGrpItems(el.id);
//                    });
                    
                    var rootNode = Tine.Messenger.RootNode();


                    if($(this).children("group").text().trim().length > 0){
                        var i=0;
                        $(this).children("group").each(function(g){
                            for(var i=0; i < rootNode.childNodes.length; i++){
                                if(rootNode.childNodes[i].text == $(this).text()){
                                    addOrderedOnTreeNodeLevel(_buddy, rootNode.childNodes[i]);
                                }
                            }
                        });
                    } else {
                        var hasGroupNoGroup = false,
                            node = -1;
                        for(i=0; i < rootNode.childNodes.length; i++){
                            if(rootNode.childNodes[i].text == _(NO_GROUP)){
                                hasGroupNoGroup = true;
                                node = i;
                            }
                        }
                        if(!hasGroupNoGroup){
                            Tine.Messenger.RosterTree().addGroup(_(NO_GROUP));
                            node = rootNode.childNodes.length - 1;
                        }
                        addOrderedOnTreeNodeLevel(_buddy, rootNode.childNodes[node]);
                    }
                    _buddy.ui.textNode.setAttribute('status', status);
                }
            });
    }
    
    var addGroupToTree = function(xml){
        var _group_name = '';
        
        var _arr_groups = [];
        $(xml).find("group").each(function(){
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
                    if(_group_name != _(NO_GROUP)){
//                        _group.on('contextmenu', function (el) {
//                            contextMenuGrp.gname = el.text;
//                            contextMenuGrp.show(el.ui.getEl());
//                        });
//                        _group.un('contextmenu');
                        _group.on('contextmenu', groupContext, this);
                    }
                    addOrderedOnTreeNodeLevel(_group, Tine.Messenger.RootNode());
                }
            }
        });
        
    }
    
    var addOrderedOnTreeNodeLevel = function(node, parentNode){
        var v_nodes = parentNode.childNodes;
        if(v_nodes.length == 0 || node.text == _(NO_GROUP)){
            parentNode.appendChild(node);
        } else {
            var node_not_inserted = true;
            for(var i=0; i < v_nodes.length && node_not_inserted; i++){
                if(node.text < v_nodes[i].text || v_nodes[i].text == _(NO_GROUP)){
                    parentNode.insertBefore(node, v_nodes[i]);
                    node_not_inserted = false;
                }
            }
            if(node_not_inserted){
                parentNode.appendChild(node);
            }
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
    
    var getGroupsFromTree = function() {
        var groups = new Array();
        var rootNode = Tine.Messenger.RootNode();
        for(var i=0; i < rootNode.childNodes.length ; i++){
            if(rootNode.childNodes[i].text != _(NO_GROUP)){
                groups.push([rootNode.childNodes[i].text]);
            }
        }
        return groups;
    }
    
    var groupExist = function(_group){
        var groups = getGroupsFromTree();
            for(var i=0; i<groups.length; i++){
                if(_group == groups[i][0]){
                    return true;
                }
            }
            return false;
    }
    
    return {
        init : function(iq){
            createTree(iq);
        },
        
        /**
         *  @method addBuddy
         *  @public
         *  @param  jid string (required)
         *  @param  _name string (optional)
         *  @param  _group string (optional)
         *  @description &lt;iq&gt;<br>
         *               &nbsp; &lt;item subscription='to' name='_name' jid='_jid'&gt;<br>
	 *		 &nbsp;&nbsp; &lt;group&gt;_group&lt;/group&gt;<br>
	 *		 &nbsp; &lt;/item&gt;<br>
         *               &lt;iq&gt;
         */
        addBuddy: function(jid, _name, _group){
            if (typeof jid == 'string'){
//                var _buddy = Tine.Messenger.RosterHandler.getContactElement(jid);
//                if(!_buddy){
                    var label = _name || '';
                    var xml = "<iq>"
                            +"  <item subscription='to' name='"+label+"' jid='"+jid+"'>"
                            +"	   <group>"+((_group) ? _group : '')+"</group>"
                            +"  </item>"
                            +"</iq>";
                    addBuddyToTree(xml);
                    return true;
//                }
            }
            return false;
        },
        
        addGroup: function(gname){
            if (typeof gname == 'string'){
                var xml = "<item><group>"+gname+"</group></item>";
                addGroupToTree(xml);
                return true;
            }
            return false;
        },
        
        getGroupsFromTree: function (){
            
            return getGroupsFromTree();
        },
        
        getNoGroup: function(){
            return _(NO_GROUP);
        },
        
        groupExist: function(_group){
            return groupExist(_group);
        },
        
       /**
        * @method updateBuddy
        * @public
        * @param  jid (required)
        * @param  status (required)
        * @param  subscription (optional)
        * @param  status_text (optional)
        * @param  message (optional)
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
                _buddy.attributes.subscription = subscription;
                
                _buddy.ui.textNode.setAttribute('qtip', "JID : "+jid+"<br>"+
                                                _('Status')+" : "+ _(status) +"<br>"+
                                                _('Subscription')+" : "+ _(subscription) +
                                                (status_text.trim() ? '<br>'+status_text : '') +
                                                (message.trim() ? '<br>'+message : ''));
                
//                updateReqAuthorizationButton(jid, subscription);
            } else {
                Tine.Messenger.Log.error('Error while updating '+jid+". Jid not found or class not found can be the cause.");
            }
        }
    }
}