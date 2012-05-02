Ext.namespace('Tine.Clients');

Tine.Clients.ClientEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
   
   /**
    * @private
    */
   windowNamePrefix: 'ClientEditWindow_',
   appName: 'Clients',
   recordClass: Tine.Clients.Model.Client,
   recordProxy: Tine.Clients.ClientBackend,
   loadRecord: false,
   tbarItems: [{xtype: 'widget-activitiesaddbutton'}],
   
   /**
    * overwrite update toolbars function (we don't have record grants yet)
    */
   updateToolbars: function() {
   },
   
   /**
    * returns dialog
    * 
    * NOTE: when this method gets called, all initalisation is done.
    */
   getFormItems: function() {
       return {
           xtype: 'tabpanel',
           border: false,
           plain:true,
           activeTab: 0,
           border: false,
           items:[{               
               title: this.app.i18n._('Client'),
               autoScroll: true,
               border: false,
               frame: true,
               layout: 'border',
               items: [{
                   region: 'center',
                   xtype: 'columnform',
                   labelAlign: 'top',
                   formDefaults: {
                       xtype:'textfield',
                       anchor: '100%',
                       labelSeparator: ' ',
                       columnWidth: .333
                   },
                   items: [[
                       /*** define your form fields here, like this ***/
                       {
                           fieldLabel: this.app.i18n._('Name'),
                           name: 'name',
                           allowBlank: false
                       }, 
                       {
                           fieldLabel: this.app.i18n._('Company'),
                           name: 'company',
                           allowBlank: false
                       },
                       {
                           fieldLabel: this.app.i18n._('Phone'),
                           name: 'phone',
                           allowBlank: false
                       }
                       ]] 
               }]
           }]
       };
   }
});

Tine.Clients.ClientEditDialog.openWindow = function (config) {
   var id = (config.record && config.record.id) ? config.record.id : 0;
   var window = Tine.WindowFactory.getWindow({
       width: 600,
       height: 400,
       name: Tine.Clients.ClientEditDialog.prototype.windowNamePrefix + id,
       contentPanelConstructor: 'Tine.Clients.ClientEditDialog',
       contentPanelConstructorConfig: config
   });
   return window;
};