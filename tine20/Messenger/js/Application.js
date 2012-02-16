Ext.ns('Tine.Messenger');

console.log("=========");
console.log(Tine.Tinebase.MainMenu);
console.log("=========");

Tine.Messenger.Application = Ext.extend(Tine.Tinebase.Application, {
    hasMainScreen: false,
    
    showAlertDelayedTask: null,
    
    getTitle: function () {
        return "Expresso Messenger";
    },
    
    init: function () {
        this.showAlertDelayedTask = new Ext.util.DelayedTask(this.showAlert, this);
        this.showAlertDelayedTask.delay(500);
    },
    
    showAlert: function () {
        var el = $('<span id="messenger">MESSENGER</span>'),
            insertEl = $("#ext-gen52").parent("em");
        
        insertEl.prepend(el);
            
        el.click(function () {
            Tine.Messenger.Window.show();
        });
    }
});