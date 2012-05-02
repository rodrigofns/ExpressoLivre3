Ext.namespace('Tine.Clients');

Tine.Clients.ClientGridPanel = Ext.extend(Tine.Tinebase.widgets.app.GridPanel, {
   // model generics
   recordClass: Tine.Clients.Model.Client,
   
   // grid specific
   defaultSortInfo: {field: 'creation_time', direction: 'DESC'},
   gridConfig: {
       loadMask: true,
       autoExpandColumn: 'title'
   },
   
   initComponent: function() {
       this.recordProxy = Tine.Clients.ClientBackend;
       
       this.gridConfig.columns = this.getColumns();
       this.filterToolbar = this.filterToolbar || this.getFilterToolbar();
       
       this.plugins = this.plugins || [];
       this.plugins.push(this.filterToolbar);        
       
       Tine.Clients.ClientGridPanel.superclass.initComponent.call(this);
   },
    
   getColumns: function(){
       return [
       /*** define your columns here, like this: ***/
       {
           id: 'name',
           header: this.app.i18n._("Name"),
           width: 100,
           sortable: true,
           dataIndex: 'name'
       }, {
           id: 'company',
           header: this.app.i18n._("Company"),
           width: 100,
           sortable: true,
           dataIndex: 'company'
       }, {
           id: 'phone',
           header: this.app.i18n._("Phone"),
           width: 100,
           sortable: true,
           dataIndex: 'phone'
       }];
   }
}
)