
Tine.Messenger.Groupie = {
    
    connection: null,
    room: null,
    nickname: null,
    NS_MUC: "http://jabber.org/protocol/muc",
    joined: null,
    chat_room: null,
    participants: null,
    part_colors: {},
    
    startMUC: function(_muc){
        try{
            Tine.Messenger.Groupie.connection = new Strophe.Connection("/http-bind");
            Tine.Messenger.Groupie.connection.connect(Tine.Tinebase.registry.get(_muc).login,
                                                        Tine.Tinebase.registry.get(_muc).password,
                                                        Tine.Messenger.Groupie.conectionHandler);
        }catch (err){
            Tine.Messenger.Log.error(err);
        }
    },
    
    stopMUC: function(_muc){
        
    },
    
    conectionHandler: function(status){
        if (status === Strophe.Status.CONNECTED) {
            Tine.Messenger.Log.debug("Connected MUC");
            
            var _jid = Tine.Messenger.Groupie.room,
                _name = Strophe.getNodeFromJid(_jid);
            
            Tine.Messenger.RosterTree().addGroupChat(_jid, _name)
            
            Tine.Messenger.Groupie.joined = false;
            Tine.Messenger.Groupie.participants = new Array();
            
            Tine.Messenger.Groupie.connection.send($pres().c('priority').t('-1'));
            Tine.Messenger.Groupie.connection.send(
                                        $pres({
                                            to: Tine.Messenger.Groupie.room + '/' 
                                                + Tine.Messenger.Groupie.nickname
                                        }).c('x', {xmlns: Tine.Messenger.Groupie.NS_MUC}));
           // START THE HANDLERS
            Tine.Messenger.Groupie.connection.addHandler(
                Tine.Messenger.Groupie.handlers.onStartMUC, 'jabber:client', 'iq', 'result'
            );
            // Groupchat Messaging handler
            Tine.Messenger.Groupie.connection.addHandler(
                Tine.Messenger.Groupie.handlers.onIncomingGroupMessage, null, 'message'
            );
            
            // Groupchat Presence handler
            Tine.Messenger.Groupie.connection.addHandler(
                Tine.Messenger.Groupie.handlers.onPresence, null, 'presence'
            );
            
            
            var room = Tine.Messenger.Groupie.room,
                room_name = Strophe.getBareJidFromJid(room),
                chat = Tine.Messenger.ChatHandler.showChatWindow(room, room_name, 'groupchat');
            chat.addListener('hide', Tine.Messenger.Groupie.disconnect);
            Tine.Messenger.Groupie.chat_room = chat;
            
            Tine.Messenger.Groupie.Roster().init();
            
        } else if(status === Strophe.Status.DISCONNECTED){
            Tine.Messenger.Log.debug("Disconnected MUC");
            Tine.Messenger.RosterHandler.getContactElement(
                                            Tine.Messenger.Groupie.room
                                        ).remove();
            Tine.Messenger.Groupie.participants = 
                Tine.Messenger.Groupie.room = 
                Tine.Messenger.Groupie.joined = 
                Tine.Messenger.Groupie.nickname = null;
            
            // Close all chats
            var chats = Ext.query('.messenger-chat-window');
            Ext.each(chats, function (item, index) {
                var chat = Ext.getCmp(item.id);
                if(chat.type == 'groupchat')
                    chat.close();
            });
            
        } else if (status === Strophe.Status.CONNFAIL) {
            Tine.Messenger.Log.error("Connection failed!");
            Ext.Msg.show({
                title:'Error',
                msg: 'Authentication failed!',
                buttons: Ext.Msg.OK,
                icon: Ext.MessageBox.ERROR
            });
        } else if (status === Strophe.Status.CONNECTING) {
            Tine.Messenger.Log.debug("Connecting...")
        }
    },
    
    MUCLogin: function(dialog) {
        var host = dialog.findById('messenger-groupchat-host').getValue(),
            room = dialog.findById('messenger-groupchat-room').getValue(),
            nick = dialog.findById('messenger-groupchat-nick').getValue(),
            pwd = dialog.findById('messenger-groupchat-pwd').getValue(),
            identity = dialog.findById('messenger-groupchat-identity').getValue(),
            muc = room + '@' + host;
            
        Tine.Messenger.Groupie.room = muc;
        Tine.Messenger.Groupie.nickname = nick;
        
        Tine.Tinebase.registry.add(muc, {
            login: identity,
            password: pwd
        });
        
        Tine.Messenger.Groupie.startMUC(muc);
    //    Tine.Tinebase.appMgr.get('Messenger').startMessenger();
        dialog.close();
    },
    
    sendPublMessage: function(msg, id){
        Tine.Messenger.Groupie.connection.send(
            $msg({
            to: Tine.Messenger.Util.idToJid(id),
            type: "groupchat"}).c('body').t(msg));
        return true;
    },
    
    sendPrivMessage: function(msg, id, old_id){
        var myNick = Tine.Messenger.Credential.myNick();
        Tine.Messenger.Groupie.connection.send(
            $msg({
            "to": Tine.Messenger.Util.idToJid(id),
            "type": "chat"})
          .c('body').t(msg).up()
          .c("active", {xmlns: "http://jabber.org/protocol/chatstates"}));
          
        Tine.Messenger.ChatHandler.setChatMessage(old_id, msg, myNick);
        
        return true;
    },
    
    sendState: function (id, state) {
        var jid = Tine.Messenger.Util.idToJid(id),
            _name = Strophe.getResourceFromJid(jid),
            notify = $msg({to: jid, "type": "chat"})
                     .c(state, {xmlns: "http://jabber.org/protocol/chatstates"});
        
        var contact = Tine.Messenger.Groupie.Roster().getParticipant(_name);
        if(contact)
            Tine.Messenger.Groupie.connection.send(notify);
          
        return true;
    },
    
    disconnect: function(){
        Tine.Messenger.Groupie.connection.send(
            $pres({to: Tine.Messenger.Groupie.room + '/' + Tine.Messenger.Groupie.nickname,
            type: 'unavailable'}));
    },
    
    sendNotifyMessage: function(room, msg){
        Tine.Messenger.ChatHandler.setChatMessage(room, msg, null, 'messenger-notify');
        return true;
    },
    
    openPrivChat: function(e, t) {
        if(e.text != Tine.Messenger.Groupie.nickname)
            Tine.Messenger.ChatHandler.showChatWindow(e.id, e.text, 'groupchat', true);
        return true;
    }
    
};

Tine.Messenger.Groupie.handlers = {
    
    onIncomingGroupMessage: function(message){
        var raw_jid = $(message).attr("from"),
            type = $(message).attr("type"),
            room = Strophe.getBareJidFromJid(raw_jid),
            name = Strophe.getResourceFromJid(raw_jid),
            stamp = $(message).find('delay').attr("stamp"),
            color = Tine.Messenger.Groupie.Roster().getParticipantColor(name);
        Tine.Messenger.Log.debug(name+' > '+color);
        // Capture the message body element, 
        // extract text and append to chat area
        var body = $(message).find("html > body");
        if (body.length === 0) {
            body = $(message).find("body");
        }
        
        if(room == Tine.Messenger.Groupie.room){
            if(type != 'error'){
                if(type == 'groupchat'){
                    if (body.length > 0)
                        Tine.Messenger.ChatHandler.setChatMessage(room, body.text(), name, '' , stamp, color);
                } else {
                    var composing = $(message).find("composing"),
                    paused = $(message).find("paused");

                    // Typing events
                    if (paused.length > 0) {
                        Tine.Messenger.Log.debug(_(Tine.Messenger.ChatHandler.PAUSED_STATE));
                        Tine.Messenger.ChatHandler.setChatState(raw_jid, _(Tine.Messenger.ChatHandler.PAUSED_STATE));
                    } else if (composing.length > 0) {
                        Tine.Messenger.Log.debug(_(Tine.Messenger.ChatHandler.COMPOSING_STATE));
                        Tine.Messenger.ChatHandler.setChatState(raw_jid, _(Tine.Messenger.ChatHandler.COMPOSING_STATE));
                    } else {
                        if (body.length > 0){
                            // Set received chat message
                            //Tine.Messenger.ChatHandler.setChatMessage(room, '@@'+body.text()+'@@', name, '' , stamp, color);
                            var p = Tine.Messenger.Groupie.Roster().getParticipant(name),
                                jid = p.attributes.id,
                                chat_id = Tine.Messenger.ChatHandler.formatChatId(jid);
                                
                            if (Ext.getCmp(chat_id)) {
                                Tine.Messenger.ChatHandler.setChatMessage(jid, body.text(), name, 'messenger-receive');
                                Tine.Messenger.ChatHandler.setChatState(jid);
                            } else {
                                Tine.Messenger.ChatHandler.showChatWindow(raw_jid, name, 'groupchat', true);
                                Tine.Messenger.ChatHandler.setChatMessage(raw_jid, body.text(), name, 'messenger-receive');
                                Tine.Messenger.ChatHandler.setChatState(raw_jid);
                            }
                            
                        }
                    }
                }
            }
        }
        
        return true;
    },
    
    onPresence: function(presence){
        var raw_jid = $(presence).attr("from"),
            room = Strophe.getBareJidFromJid(raw_jid),
            participants = Tine.Messenger.Groupie.participants;
        
        if(Tine.Messenger.Groupie.room == room){
            var name = Strophe.getResourceFromJid(raw_jid),
                role = $(presence).children().find('item').attr('role'),
                type = $(presence).attr('type');
                
            if(type === 'error' && !Tine.Messenger.Groupie.joined){
                Tine.Messenger.Log.error('Error joinning room. Reset app.');
                Tine.Messenger.Groupie.connection.disconnect();
            } else if( $.inArray(name, participants)  == -1 && type != 'unavailable'){
//                Tine.Messenger.Groupie.participants[name] = true;
                Tine.Messenger.Groupie.Roster().addParticipant(presence);
                Tine.Messenger.Groupie.sendNotifyMessage(room, name + _(' has joined the room as a '+role+'.'));
            } else if( $.inArray(name, participants) != -1){
                var show = $(presence).find('show').text() || '',
                    status = Tine.Messenger.Util.getStatusObject(show),
                    status_text = $(presence).find('status').text() || '',
                    nick = $(presence).children().find('item').attr('nick') || name;
                if(type == 'unavailable'){
                    if ($(presence).find("status[code='303']").length > 0){
                        Tine.Messenger.Groupie.Roster().updateParticipantNick(raw_jid, nick);
                        Tine.Messenger.Groupie.sendNotifyMessage(room, name + _(' is now known as ') + nick);
                    } else {
                        Tine.Messenger.Groupie.Roster().removeParticipant(name);
                        Tine.Messenger.Groupie.sendNotifyMessage(room, name + _(' has left the room.'));
                    }
                } else {
                    Tine.Messenger.Groupie.Roster().updateParticipant(raw_jid, role, status, status_text);
                }
            }
            if(type !== 'error' && !Tine.Messenger.Groupie.joined){
                if ($(presence).find("status[code='110']").length > 0) {
                    // check if server changed our nick
                    if ($(presence).find("status[code='210']").length > 0) {
                        Tine.Messenger.Groupie.nickname = name;
                    }
                    // room join complete
                    Tine.Messenger.Groupie.joined = true;
                }
            }
            
            if(Tine.Messenger.Groupie.nickname == name && role == 'none')
                Tine.Messenger.Groupie.connection.disconnect();
        }
        
        return true;
    }
};

Tine.Messenger.Groupie.Roster = function() {
    var chat = Tine.Messenger.Groupie.chat_room,
        rootNode = chat.getComponent('messenger-chat-table')
                            .getComponent('messenger-chat-body-roster')
                               .initialConfig.items.getRootNode();
    var default_groups = ['Moderators'
                         ,'Participants'
//                         ,'Visitors'
                     ];
    var MAX_COLORS = 7,
        COLOR_CLS = 'color-';
    
    var addGroupsToTree = function(_groups){
        
        for(var i=0; i < _groups.length; i++){
            var _group_name = _groups[i];
            if(!getGroupFromTree(_group_name)){
                var _group = new Ext.tree.TreeNode({
                                    id: _group_name,
                                    text: _(_group_name),
                                    cls: 'messenger-group',
                                    expanded:true,
                                    expandable:true,
                                    allowDrag:false
                                });
                rootNode.appendChild(_group);
            }
        }
    }
    
    var getGroupFromTree = function(_name) {
        for(var i=0; i < rootNode.childNodes.length ; i++)
            if(_name == rootNode.childNodes[i].text)
                return rootNode.childNodes[i];
        return null;
    }
    
    var getParticipantFromTree = function(_name, _id) {
        for(var i=0; i < rootNode.childNodes.length ; i++){
            var group = rootNode.childNodes[i];
            for(var j=0; j < group.childNodes.length ; j++){
                if(_name == group.childNodes[j].text)
                    return group.childNodes[j];
                if(_id == group.childNodes[j].id)
                    return group.childNodes[j];
            }
        }
        return null;
    }
    
    var addParticipantToTree = function(xml){
        
        var jid = $(xml).attr("from"),
            label = Strophe.getResourceFromJid(jid),
            status = Tine.Messenger.Util.getStatusObject($(xml).children('show').text()),
            status_text = $(xml).children('status').text() || '',
            role = _( $(xml).children().find('item').attr('role') ),
            cls = participantColor(label, true) + ' '
                  + Tine.Messenger.Util.getStatusClass(status) + ' '
                  + 'chat-user '
                  + 'messenger-contact ';
        if(!getParticipantFromTree(label)){
            var _participant = new Ext.tree.TreeNode({ //buddy adden
                            id: jid,
                            status: status.id,
                            status_text: status_text,
                            jid: jid,
                            hide: false,
                            text: label,
                            role: role,
                            cls: cls,
                            allowDrag: true,
                            allowDrop: false,
                            qtip: "JID : "+jid+"<br>"
                                    +_('Status')+" : "+_(status.text)+"<br>"
                                    +_('Role')+" : "+role
                                    +(status_text.trim() ? '<br>'+status_text : '')
            });

            _participant.on("dblclick", Tine.Messenger.Groupie.openPrivChat);
//                    _participant.on("contextmenu", buddyContext);
            var node = rootNode,
                _group_name = '';
            switch(role){
                case 'moderator':
                    _group_name = 'Moderators';
                    break;
                case 'participant':
                    _group_name = 'Participants';
                    break;
                case 'visitor':
                    _group_name = 'Visitors';
                    break;
                default:
                    _group_name = role;
            }
            node = getGroupFromTree(_group_name);
            if(!node){
                addGroupsToTree([_group_name]);
                node = getGroupFromTree(_group_name);
            }
            node.appendChild(_participant);
            Tine.Messenger.Groupie.participants.push(label);
        }   
    }
    
    
    var removeParticipantFromTree = function(_name){
         var _node = getParticipantFromTree(_name);
         rootNode.removeChild(_node);
    }
    
    var participantColor = function(_name, _flag){
        var vp = Tine.Messenger.Groupie.participants,
            name = '';
            
        for(var i=0; i<vp.length; i++){
            if(_name == vp[i]){
                name = COLOR_CLS + (i+1);
                Tine.Messenger.Groupie.part_colors[name] = true;
                return name;
            }
        }

        for(var j=1; j < MAX_COLORS; j++){
            name = COLOR_CLS + j;
            if(!Tine.Messenger.Groupie.part_colors[name] && _flag){
                Tine.Messenger.Groupie.part_colors[name] = true;
                return name;
            }
        }
            
        name = COLOR_CLS + MAX_COLORS;
        
        return name;
    }
    
    var fillColorTable = function(){
        for(var i=1; i < MAX_COLORS; i++){
            var name = COLOR_CLS + i;
            Tine.Messenger.Groupie.part_colors[name] = false;
        }
    }
    
    var liberateColor = function(_name){
        var vp = Tine.Messenger.Groupie.participants;
        for(var i=0; i<vp.length;i++){
            if(_name == vp[i]){
                var name = COLOR_CLS + (i+1);
                Tine.Messenger.Groupie.part_colors[name] = false;
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
    
    return {
        
        init: function(){
            addGroupsToTree(default_groups);
            fillColorTable();
        },
        
        addParticipant: function(xml){
            addParticipantToTree(xml);
        },
        
        removeParticipant: function(_name){
            removeParticipantFromTree(_name);
            liberateColor(_name);
        },
        
        getParticipant: function(_name){
            return getParticipantFromTree(_name);
        },
        
        getParticipantById: function(_id){
            return getParticipantFromTree(null, _id);
        },
        
       /**
        * 
        * @param _name
        * @param _flag (true if online and false if offline)
        * @description _flag indicate if is the participant online or offline
        */
        getParticipantColor: function(_name, _flag){
            return participantColor(_name, _flag);
        },
        
        updateParticipantNick: function(_jid, _new_nick){
            var _nick = Strophe.getResourceFromJid(_jid),
                _new_jid = Strophe.getBareJidFromJid(_jid)+'/'+_new_nick,
                _participant = Tine.Messenger.Groupie.Roster().getParticipant(_nick),
                chat_id = Tine.Messenger.ChatHandler.formatChatId(_jid),
                chat = Ext.getCmp(chat_id);
                
            _participant.setText(_new_nick);
            _participant.attributes.jid = _new_jid;
            
            var vp = Tine.Messenger.Groupie.participants;
            for(var i=0; i<vp.length; i++){
                if(_nick == vp[i]){
                    vp[i] = _new_nick;
                }
            }
            
            if(chat){
                chat.id = Tine.Messenger.ChatHandler.formatChatId(_new_jid);
                chat.setTitle(
                        Tine.Messenger.ChatHandler.formatChatTitle(_new_jid, _new_nick, 'chat')
                    );
            }
        },
        
        updateParticipant: function(jid, role, status, status_text, message){
            var _participant,
                _name = Strophe.getResourceFromJid(jid);

            if (typeof jid == 'string')
                _participant = Tine.Messenger.Groupie.Roster().getParticipant(_name);
            else
                _participant = jid;
            
            if (typeof status == 'string')
                status = Tine.Messenger.Util.getStatusObject(status);
            
            var status_cls = Tine.Messenger.Util.getStatusClass(status);
            
            if(_participant && status_cls != ''){
                
                removeBuddyClasses(_participant);
                
                _participant.ui.addClass(status_cls);
                
                status_text = status_text ? status_text : '';
                message = message ? message : '';
                _participant.ui.textNode.setAttribute('status', status.id);
                _participant.ui.textNode.setAttribute('status_text', status_text);
                
                _participant.attributes.status = status.id;
                _participant.attributes.status_text = status_text;
                
                _participant.ui.textNode.setAttribute('qtip', "JID : "+jid+"<br>"+
                                                _('Status')+" : "+ _(status.text) +"<br>"+
                                                _('Role')+" : "+ _(role) +
                                                (status_text.trim() ? '<br>'+status_text : '') +
                                                (message.trim() ? '<br>'+message : ''));
                
            } else {
                Tine.Messenger.Log.error('Error while updating '+jid+". Jid not found or class not found can be the cause.");
            }
        }
    }
};
