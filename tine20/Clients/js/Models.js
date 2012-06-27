Ext.namespace('Tine', 'Tine.Clients.Model');

Tine.Clients.Model.ClientArray = Tine.Tinebase.Model.genericFields.concat([
   { name: 'id' },
   { name: 'container_id' },
   { name: 'name' },
   { name: 'company' },
   { name: 'phone' },
   { name: 'created_by' },
   { name: 'creation_time' },
   { name: 'is_deleted' },
]);

Tine.Clients.Model.Client = Tine.Tinebase.Record.create(Tine.Clients.Model.ClientArray, {
   appName: 'Clients',
   modelName: 'Client',
   idProperty: 'id',
   recordName: 'Client',
   recordsName: 'Clients',
   containerProperty: 'container_id',
   containerName: 'Client list',
   containersName: 'Client lists'
});

Tine.Clients.Model.Client.getFilterModel = function() {
   var app = Tine.Tinebase.appMgr.get('ExampleClients');
      
   return [ 	
       {label : _('Quick search'), field : 'query', operators : [ 'contains' ]}, 
       {filtertype : 'tine.widget.container.filtermodel', app : app
           , recordClass : Tine.Clients.Model.Client}, 
       {filtertype : 'tinebase.tag', app : app} 
   ];
};