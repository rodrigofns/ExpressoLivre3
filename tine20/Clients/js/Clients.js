Ext.namespace('Tine', 'Tine.Clients');

// default mainscreen
Tine.Clients.MainScreen = Tine.Tinebase.widgets.app.MainScreen;

Tine.Clients.TreePanel = function(config) {
   Ext.apply(this, config);
   
   this.id = 'ClientsTreePanel',
   this.recordClass = Tine.Clients.Model.Client;
   Tine.Clients.TreePanel.superclass.constructor.call(this);
}
Ext.extend(Tine.Clients.TreePanel , Tine.widgets.container.TreePanel);

Tine.Clients.ClientBackend = new Tine.Tinebase.widgets.app.JsonBackend({
   appName: 'Clients',
   modelName: 'Client',
   recordClass: Tine.Clients.Model.Client
});
