Ext.ux.form.HtmlEditor.UploadImage = Ext.extend(Ext.util.Observable, {

url : 'index.php',
base_params : { method : 'Felamimail.uploadImage' },
    permitted_extensions: ['jpg', 'jpeg', 'png', 'bmp', 'gif'],
fsa : null,
form : null,
upload_frame : null,
image_file: null,

    init : function(cmp) {
var win;

        this.cmp = cmp;
        this.cmp.on('render', this.onRender, this);
this.on('uploadsuccess', this.onUploadSuccess, this);
this.on('uploaderror', this.onUploadError, this);
this.on('uploadfailed', this.onUploadFailed, this);

var css = '.x-edit-image {background: url(ux/icons/picture.png) 0 0 no-repeat !important;}';
Ext.util.CSS.createStyleSheet(css, 'editor-css');

// Setting automata protocol
var tt = {
// --------------
'created' : {
// --------------
'window-render' : [
{
action: this.createForm,
state: 'ready'
}
]
},
// --------------
'ready' : {
// --------------
'file-selected' : [
{
predicate: [ this.fireFileTestEvent, this.isPermittedFile ],
action: this.addFileToUploadQueue,
state: 'adding-file'
},
{
// If file is not permitted then do nothing.
}
],
'start-upload' : [
{
predicate: this.hasUnuploadedFiles,
action: [ this.prepareNextUploadTask, this.fireUploadStartEvent ],
state: 'uploading'
}
],
'stop-upload' : [
{
// We are not uploading, do nothing. Can be posted by user only at this state.
}
]
},
// --------------
'adding-file' : {
// --------------
'file-added' : [
{
action: [ this.startUpload, this.fireFileAddEvent ],
state: 'ready'
}
]
},
// --------------
'uploading' : {
// --------------
'file-selected' : [
{
predicate: [ this.fireFileTestEvent, this.isPermittedFile ],
action: this.addFileToUploadQueue,
state: 'adding-file'
},
{
// If file is not permitted then do nothing.
}
],
'start-upload' : [
{
// Can be posted only by user in this state.
}
],
'stop-upload' : [
{
predicate: this.hasUnuploadedFiles,
action: [ this.abortUpload, this.fireUploadStopEvent ],
state: 'ready'
},
{
action: [ this.abortUpload, this.fireUploadStopEvent, this.fireUploadCompleteEvent ],
state: 'ready'
}
],
'file-upload-start' : [
{
action: [ this.uploadFile, this.findUploadFrame, this.fireFileUploadStartEvent ]
}
],
'file-upload-success' : [
{
predicate: this.hasUnuploadedFiles,
action: [ this.resetUploadFrame, this.updateRecordState, this.prepareNextUploadTask, this.fireUploadSuccessEvent ]
},
{
action: [ this.resetUploadFrame, this.updateRecordState, this.fireUploadSuccessEvent, this.fireUploadCompleteEvent ],
state: 'ready'
}
],
'file-upload-error' : [
{
predicate: this.hasUnuploadedFiles,
action: [ this.resetUploadFrame, this.updateRecordState, this.prepareNextUploadTask, this.fireUploadErrorEvent ]
},
{
action: [ this.resetUploadFrame, this.updateRecordState, this.fireUploadErrorEvent, this.fireUploadCompleteEvent ],
state: 'ready'
}
],
'file-upload-failed' : [
{
predicate: this.hasUnuploadedFiles,
action: [ this.resetUploadFrame, this.updateRecordState, this.prepareNextUploadTask, this.fireUploadFailedEvent ]
},
{
action: [ this.resetUploadFrame, this.updateRecordState, this.fireUploadFailedEvent, this.fireUploadCompleteEvent ],
state: 'ready'
}
],
'hide' : [
{
predicate: this.getResetOnHide,
action: [ this.stopUpload, this.repostHide ],
state: 'created'
},
{
// Do nothing.
}
]
}
};
this.fsa = new Ext.ux.Utils.FSA('created', tt, this);

// Registering dialog events.
this.addEvents({
'filetest': true,
'fileadd' : true,
'fileremove' : true,
'uploadsuccess' : true,
'uploaderror' : true,
'uploadfailed' : true,
'uploadstart' : true,
'uploadstop' : true,
'uploadcomplete' : true,
'fileuploadstart' : true
});
    
    },

createForm : function()	{
if (!this.body) {
this.body = Ext.getBody();
}

this.form = Ext.DomHelper.append(this.body, {
tag: 'form',
method: 'post',
action: this.url,
style: 'position: absolute; left: -100px; top: -100px; width: 100px; height: 100px'
});
},

getFileExtension : function(filename) {
var result = null;
var parts = filename.split('.');
if (parts.length > 1) {
result = parts.pop();
}
return result;
},

isPermittedFileType : function(filename) {
var result = true;
if (this.permitted_extensions.length > 0) {
result = this.permitted_extensions.indexOf(this.getFileExtension(filename)) != -1;
}
return result;
},

isPermittedFile : function(browse_btn) {
var result = false;
var filename = browse_btn.getInputFile().dom.value;

if (this.isPermittedFileType(filename)) {
result = true;
}
else {
Ext.Msg.alert(
this.i18n.error_msgbox_title,
String.format(
this.i18n.err_file_type_not_permitted,
filename,
this.permitted_extensions.join(', ')
)
);
result = false;
}

return result;
},

fireFileTestEvent : function(browse_btn) {
return this.fireEvent('filetest', this, browse_btn.getInputFile().dom.value) !== false;
},

fireFileAddEvent : function(filename) {
this.fireEvent('fileadd', this, filename);
},

prepareNextUploadTask : function() {
var record = this.image_file;

record.get('input_element').dom.disabled = false;
record.commit();

this.fsa.postEvent('file-upload-start', record);
},

fireUploadStartEvent : function() {
this.fireEvent('uploadstart', this);
},

uploadFile : function(record) {
Ext.Ajax.request({
url : this.url,
params : this.base_params || this.baseParams || this.params,
method : 'POST',
form : this.form,
isUpload : true,
success : this.onAjaxSuccess,
failure : this.onAjaxFailure,
scope : this,
record: record
});
this.image_file = null;
},

fireFileUploadStartEvent : function(record) {
this.fireEvent('fileuploadstart', this, record.get('filename'));
},

updateRecordState : function(data) {
data.record.commit();
},

fireUploadSuccessEvent : function(data) {
this.fireEvent('uploadsuccess', this, data.record.get('filename'), data.response);
},

fireUploadErrorEvent : function(data) {
this.fireEvent('uploaderror', this, data.record.get('filename'), data.response);
},

fireUploadFailedEvent : function(data) {
this.fireEvent('uploadfailed', this, data.record.get('filename'));
},

fireUploadCompleteEvent : function() {
this.fireEvent('uploadcomplete', this);
},

findUploadFrame : function() {
this.upload_frame = Ext.getBody().child('iframe.x-hidden:last');
},

resetUploadFrame : function() {
this.upload_frame = null;
},

removeUploadFrame : function() {
if (this.upload_frame) {
this.upload_frame.removeAllListeners();
this.upload_frame.dom.src = 'about:blank';
this.upload_frame.remove();
};
this.upload_frame = null;
},

abortUpload : function() {
this.removeUploadFrame();

var record = this.image_file;

record.commit();
},

fireUploadStopEvent : function() {
this.fireEvent('uploadstop', this);
},

repostHide : function() {
this.fsa.postEvent('hide');
},

onAddButtonFileSelected : function(btn) {
this.fsa.postEvent('file-selected', btn);
},

onAjaxSuccess : function(response, options) {
var json_response = {
'success' : false,
'error' : this.i18n.note_upload_error
}
try {
var rt = response.responseText;
var filter = rt.match(/^<pre>((?:.|\n)*)<\/pre>$/i);
if (filter) {
rt = filter[1];
}
json_response = Ext.util.JSON.decode(rt);
}
catch (e) {}

var data = {
record: options.record,
response: json_response
}

if ('success' in json_response && json_response.success) {
this.fsa.postEvent('file-upload-success', data);
}
else {
this.fsa.postEvent('file-upload-error', data);
}
},

onAjaxFailure : function(response, options) {
var data = {
record : options.record,
response : {
'success' : false,
'error' : this.i18n.note_upload_failed
}
}

this.fsa.postEvent('file-upload-failed', data);
},

startUpload : function() {
this.fsa.postEvent('start-upload');
},

stopUpload : function() {
this.fsa.postEvent('stop-upload');
},

hasUnuploadedFiles : function() {
return this.image_file;
},

    onRender: function(ct, position) {
this.cmp.getToolbar().addButton([new Ext.Toolbar.Separator()]);

        var cmp = this.cmp;
        this.btn = this.cmp.getToolbar().addButton(new Ext.ux.UploadImage.TBBrowseButton({
            iconCls : 'x-edit-image',
handler	: this.onAddButtonFileSelected,
            scope : this,
            tooltip : {title: this.i18n.title},
            overflowText : this.i18n.title
        }));

this.onWindowRender();
    },

onUploadSuccess : function(dialog, filename, resp_data, record) {
var img = Ext.getCmp('message_editor_body');
                var fileName = filename.replace(/[a-zA-Z]:[\\\/]fakepath[\\\/]/, '');
img.append('<img alt="'+fileName+'" src="index.php?method=Felamimail.showTempImage&tempImageId='+resp_data.id+'"/>');
},

onUploadError : function(dialog, filename, resp_data, record) {
     var fileName = filename.replace(/[a-zA-Z]:[\\\/]fakepath[\\\/]/, '');
Ext.Msg.alert(
this.i18n.error_msgbox_title,
String.format(
this.i18n.note_upload_error,
filename
)
);
},

onUploadFailed : function(dialog, filename, resp_data, record) {
     var fileName = filename.replace(/[a-zA-Z]:[\\\/]fakepath[\\\/]/, '');
Ext.Msg.alert(
this.i18n.error_msgbox_title,
String.format(
this.i18n.note_upload_failed,
filename
)
);
},

addFileToUploadQueue : function(browse_btn) {
var input_file = browse_btn.detachInputFile();

input_file.appendTo(this.form);
input_file.setStyle('width', '100px');
input_file.dom.disabled = true;

this.image_file = new Ext.ux.UploadImage.FileRecord({
state: Ext.ux.UploadImage.FileRecord.STATE_QUEUE,
filename: input_file.dom.value,
input_element: input_file
});

this.fsa.postEvent('file-added', input_file.dom.value);
},
  
  /**
* @access private
*/
  // -------------------------------------------------------------------------------------------- //
  onWindowRender : function() {
    this.fsa.postEvent('window-render');
  },
  


});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* This namespace should be in another file but I dicided to put it here for consistancy.
*/
Ext.namespace('Ext.ux.Utils');

/**
* This class implements event queue behaviour.
*
* @class Ext.ux.Utils.EventQueue
* @param function handler Event handler.
* @param object scope Handler scope.
*/
Ext.ux.Utils.EventQueue = function(handler, scope) {
  if (!handler) {
    throw 'Handler is required.';
  }
  this.handler = handler;
  this.scope = scope || window;
  this.queue = [];
  this.is_processing = false;
  
  /**
* Posts event into the queue.
*
* @access public
* @param mixed event Event identificator.
* @param mixed data Event data.
*/
  this.postEvent = function(event, data) {
    data = data || null;
    this.queue.push({event: event, data: data});
    if (!this.is_processing) {
      this.process();
    }
  },
  
  this.flushEventQueue = function() {
    this.queue = [];
  },
  
  /**
* @access private
*/
  this.process = function() {
    while (this.queue.length > 0) {
      this.is_processing = true;
      var event_data = this.queue.shift();
      this.handler.call(this.scope, event_data.event, event_data.data);
    }
    this.is_processing = false;
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* This class implements Mili's finite state automata behaviour.
*
* Transition / output table format:
* {
* 'state_1' : {
* 'event_1' : [
* {
* p|predicate: function, // Transition predicate, optional, default to true.
* // If array then conjunction will be applyed to the operands.
* // Predicate signature is (data, event, this).
* a|action: function|array, // Transition action, optional, default to Ext.emptyFn.
* // If array then methods will be called sequentially.
* // Action signature is (data, event, this).
* s|state: 'state_x', // New state - transition destination, optional, default to
* // current state.
* scope: object // Predicate and action scope, optional, default to
* // trans_table_scope or window.
* }
* ]
* },
*
* 'state_2' : {
* ...
* }
* ...
* }
*
* @param mixed initial_state Initial state.
* @param object trans_table Transition / output table.
* @param trans_table_scope Transition / output table's methods scope.
*/
Ext.ux.Utils.FSA = function(initial_state, trans_table, trans_table_scope) {
  this.current_state = initial_state;
  this.trans_table = trans_table || {};
  this.trans_table_scope = trans_table_scope || window;
  Ext.ux.Utils.FSA.superclass.constructor.call(this, this.processEvent, this);
};

Ext.extend(Ext.ux.Utils.FSA, Ext.ux.Utils.EventQueue, {

  current_state : null,
  trans_table : null,
  trans_table_scope : null,
  
  /**
* Returns current state
*
* @access public
* @return mixed Current state.
*/
  state : function() {
    return this.current_state;
  },
  
  /**
* @access public
*/
  processEvent : function(event, data) {
    var transitions = this.currentStateEventTransitions(event);
    if (!transitions) {
      throw "State '" + this.current_state + "' has no transition for event '" + event + "'.";
    }
    for (var i = 0, len = transitions.length; i < len; i++) {
      var transition = transitions[i];

      var predicate = transition.predicate || transition.p || true;
      var action = transition.action || transition.a || Ext.emptyFn;
      var new_state = transition.state || transition.s || this.current_state;
      var scope = transition.scope || this.trans_table_scope;
      
      if (this.computePredicate(predicate, scope, data, event)) {
        this.callAction(action, scope, data, event);
        this.current_state = new_state;
        return;
      }
    }
    
    throw "State '" + this.current_state + "' has no transition for event '" + event + "' in current context";
  },
  
  /**
* @access private
*/
  currentStateEventTransitions : function(event) {
    return this.trans_table[this.current_state] ?
      this.trans_table[this.current_state][event] || false
      :
      false;
  },
  
  /**
* @access private
*/
  computePredicate : function(predicate, scope, data, event) {
    var result = false;
    
    switch (Ext.type(predicate)) {
     case 'function':
       result = predicate.call(scope, data, event, this);
       break;
     case 'array':
       result = true;
       for (var i = 0, len = predicate.length; result && (i < len); i++) {
         if (Ext.type(predicate[i]) == 'function') {
           result = predicate[i].call(scope, data, event, this);
         }
         else {
           throw [
             'Predicate: ',
             predicate[i],
             ' is not callable in "',
             this.current_state,
             '" state for event "',
             event
           ].join('');
         }
       }
       break;
     case 'boolean':
       result = predicate;
       break;
     default:
       throw [
         'Predicate: ',
         predicate,
         ' is not callable in "',
         this.current_state,
         '" state for event "',
         event
       ].join('');
    }
    return result;
  },
  
  /**
* @access private
*/
  callAction : function(action, scope, data, event) {
    switch (Ext.type(action)) {
       case 'array':
       for (var i = 0, len = action.length; i < len; i++) {
         if (Ext.type(action[i]) == 'function') {
           action[i].call(scope, data, event, this);
         }
         else {
           throw [
             'Action: ',
             action[i],
             ' is not callable in "',
             this.current_state,
             '" state for event "',
             event
           ].join('');
         }
       }
         break;
     case 'function':
       action.call(scope, data, event, this);
       break;
     default:
       throw [
         'Action: ',
         action,
         ' is not callable in "',
         this.current_state,
         '" state for event "',
         event
       ].join('');
    }
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* Ext.ux.UploadImage namespace.
*/
Ext.namespace('Ext.ux.UploadImage');

/**
* File upload browse button.
*
* @class Ext.ux.UploadImage.BrowseButton
*/
Ext.ux.UploadImage.BrowseButton = Ext.extend(Ext.Button, {
  input_name : 'file',
  
  input_file : null,
  
  original_handler : null,
  
  original_scope : null,
  
  /**
* @access private
*/
  initComponent : function() {
    Ext.ux.UploadImage.BrowseButton.superclass.initComponent.call(this);
    this.original_handler = this.handler || null;
    this.original_scope = this.scope || window;
    this.handler = null;
    this.scope = null;
  },
  
  /**
* @access private
*/
  onRender : function(ct, position) {
    Ext.ux.UploadImage.BrowseButton.superclass.onRender.call(this, ct, position);
    this.createInputFile();
  },
  
  /**
* @access private
*/
  createInputFile : function() {
    var button_container = this.el.child('tbody' /* JYJ '.x-btn-center'*/);
        button_container.position('relative');
       this.wrap = this.el.wrap({cls:'tbody'});
       this.input_file = this.wrap.createChild({
           tag: 'input',
            type: 'file',
            size: 1,
            name: this.input_name || Ext.id(this.el),
            style: "position: absolute; display: block; border: none; cursor: pointer"
        });
        this.input_file.setOpacity(0.0);
    
    var button_box = button_container.getBox();
    this.input_file.setStyle('font-size', (button_box.width * 0.5) + 'px');

    var input_box = this.input_file.getBox();
    var adj = {x: 3, y: 3}
    if (Ext.isIE) {
      adj = {x: 0, y: 3}
    }
    
    this.input_file.setLeft(button_box.width - input_box.width + adj.x + 'px');
    this.input_file.setTop(button_box.height - input_box.height + adj.y + 'px');
    this.input_file.setOpacity(0.0);
        
    if (this.handleMouseEvents) {
      this.input_file.on('mouseover', this.onMouseOver, this);
        this.input_file.on('mousedown', this.onMouseDown, this);
    }
    
    if(this.tooltip){
      if(typeof this.tooltip == 'object'){
        Ext.QuickTips.register(Ext.apply({target: this.input_file}, this.tooltip));
      }
      else {
        this.input_file.dom[this.tooltipType] = this.tooltip;
        }
      }
    
    this.input_file.on('change', this.onInputFileChange, this);
    this.input_file.on('click', function(e) {
e.stopPropagation();
});
  },
  
  /**
* @access public
*/
  detachInputFile : function(no_create) {
    var result = this.input_file;
    
    no_create = no_create || false;
    
    if (typeof this.tooltip == 'object') {
      Ext.QuickTips.unregister(this.input_file);
    }
    else {
      this.input_file.dom[this.tooltipType] = null;
    }
    this.input_file.removeAllListeners();
    this.input_file = null;
    
    if (!no_create) {
      this.createInputFile();
    }
    return result;
  },
  
  /**
* @access public
*/
  getInputFile : function() {
    return this.input_file;
  },
  
  /**
* @access public
*/
  disable : function() {
    Ext.ux.UploadImage.BrowseButton.superclass.disable.call(this);
    this.input_file.dom.disabled = true;
  },
  
  /**
* @access public
*/
  enable : function() {
    Ext.ux.UploadImage.BrowseButton.superclass.enable.call(this);
    this.input_file.dom.disabled = false;
  },
  
  /**
* @access public
*/
  destroy : function() {
    var input_file = this.detachInputFile(true);
    input_file.remove();
    input_file = null;
    Ext.ux.UploadImage.BrowseButton.superclass.destroy.call(this);
  },
  
  /**
* @access private
*/
  onInputFileChange : function() {
    if (this.original_handler) {
      this.original_handler.call(this.original_scope, this);
    }
  }
});

/**
* Toolbar file upload browse button.
*
* @class Ext.ux.UploadImage.TBBrowseButton
*/
Ext.ux.UploadImage.TBBrowseButton = Ext.extend(Ext.ux.UploadImage.BrowseButton, {
  hideParent : true,

  onDestroy : function() {
    Ext.ux.UploadImage.TBBrowseButton.superclass.onDestroy.call(this);
    if(this.container) {
      this.container.remove();
      }
  },

  onClick : function() {
this.input_file.dom.click();
  }
});

/**
* Record type for dialogs grid.
*
* @class Ext.ux.UploadImage.FileRecord
*/
Ext.ux.UploadImage.FileRecord = Ext.data.Record.create([
  {name: 'filename'},
  {name: 'input_element'}
]);

Ext.ux.UploadImage.FileRecord.STATE_QUEUE = 0;
Ext.ux.UploadImage.FileRecord.STATE_FINISHED = 1;
Ext.ux.UploadImage.FileRecord.STATE_FAILED = 2;
Ext.ux.UploadImage.FileRecord.STATE_PROCESSING = 3;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var p = Ext.ux.form.HtmlEditor.UploadImage.prototype;
p.i18n = {
  title: 'Insert Image',
  error_msgbox_title: 'Error',
  err_file_type_not_permitted: 'This file type is not allowed.<br/>Please, select a file of the following extensions: {1}',
  note_upload_failed: 'Server internal error or unavailable service.',
  note_upload_success: 'Completed.',
  note_upload_error: 'Upload Error.'
};
