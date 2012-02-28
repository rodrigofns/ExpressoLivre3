Ext.ns('Tine.Messenger');

var tree = new Ext.tree.TreePanel({
     id: 'roster',
     loader:new Ext.tree.TreeLoader(),
     border: false,
     cls: 'messenger-treeview',
     rootVisible: false,
     renderTo:Ext.getBody(),
     root:new Ext.tree.AsyncTreeNode({
         expanded:true,
         leaf:false
    })
});



Tine.Messenger.Window = new Ext.Window({
    title:       'Expresso Messenger',
    iconCls:     'messenger-icon',
    width:       250,
    height:      450,
    closeAction: 'hide', //'close' - destroy the component
    plain:       true,
    layout: 'fit',
    items: tree,
    buttons: [{
        text: 'Close',
        handler: function(){
            Tine.Messenger.Window.hide();
        }
    }]
});


