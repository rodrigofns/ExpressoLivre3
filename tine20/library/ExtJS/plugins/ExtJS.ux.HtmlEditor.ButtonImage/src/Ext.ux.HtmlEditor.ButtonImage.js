Ext.ns('Ext.ux.HtmlEditor.ButtonImage');

Ext.ux.HtmlEditor.ButtonImage = Ext.extend(Ext.util.Observable, {

    init: function(cmp){
		var win, bnt;
		
        this.cmp = cmp;
        this.cmp.on('render', this.onRender, this);

		var css = '.x-edit-image {background: url(ux/icons/picture.png) 0 0 no-repeat !important;}';
		Ext.util.CSS.createStyleSheet(css, 'editor-css');
    }

    ,onRender: function(){
		this.cmp.getToolbar().addButton([new Ext.Toolbar.Separator()]);
		
        var cmp = this.cmp;
        this.btn = this.cmp.getToolbar().addButton({
            iconCls       : 'x-edit-image'
            ,handler      : this.show
            ,scope        : this
            ,tooltip      : {title: 'Inserir imagem'}
            ,overflowText : 'Inserir imagem'
        });
		this.btn.disable();
    }
	
	,lookup : {}

	,show : function(el, callback){
                    this.initTemplates();
                    this.view=null;
                    this.store=null;
                    this.store = new Ext.data.ArrayStore({
                    storeId: 'imgStore',
                        fields: [
                            'name', 'url',
                            {name:'size', type: 'float'},
                        ]
                    });

                    var formatSize = function(data){
                        if(data.size < 1024) {
                            return data.size + " bytes";
                        } else {
                            return (Math.round(((data.size*10) / 1024))/10) + " KB";
                        }
		    };

			var formatData = function(data){
		    	data.shortName = data.name.ellipse(15);
		    	data.sizeString = formatSize(data);
		    	data.dateString = new Date(data.lastmod).format("d/m/Y H:i:s");
		    	this.lookup[data.name] = data;
		    	return data;
		    };

		    this.view = new Ext.DataView({
				tpl: this.thumbTemplate,
				singleSelect: true,
				overClass:'x-view-over',
				itemSelector: 'div.thumb-wrap',
				emptyText : '<div style="padding:10px;">Nenhuma imagem encontrada</div>',
				store: this.store,
				
				plugins: [
					new Ext.DataView.LabelEditor({dataIndex: 'name'})
				],
			
				listeners: {
					'selectionchange': {fn:this.showDetails, scope:this, buffer:100},
					'dblclick'       : {fn:this.doCallback, scope:this},
					'loadexception'  : {fn:this.onLoadException, scope:this},
					'beforeselect'   : {fn:function(view){
				        return view.store.getRange().length > 0;
				    }}
				},
				prepareData: formatData.createDelegate(this)
			});

			var cfg = {
		    	title: 'Selecione uma imagem',
		    	id: 'img-chooser-dlg',
		    	layout: 'border',
				width: 600,
				height: 300,				
				modal: true,
				resizable   : false,				
				closeAction: 'hide',
				border: false,
				items:[{
					id: 'img-chooser-view',
					region: 'center',
					autoScroll: true,
					items: this.view,
                    tbar:[
					
					{
						iconCls: 'add-image',
						text: 'Upload',
						handler: function(){
						
							var dialog;						
							if (!dialog) {
							  dialog = new Ext.ux.UploadDialog.Dialog({
								url: 'index.php',
								base_params: { method : 'Felamimail.uploadImage'},
								reset_on_hide: true,
								allow_close_on_upload: true,
								upload_autostart: false,
								post_var_name: 'upload'								
							  });

								dialog.on('uploadsuccess', this.onUploadSuccess, this);
							}
							dialog.show();
	
						},
						scope: this}]
				},{
					id: 'img-detail-panel',
					region: 'east',
					split: true,
					width: 150,
					minWidth: 150,
					maxWidth: 250
				}],
				buttons: [{
					id: 'ok-btn',
					text: 'OK',
					handler: this.doCallback,
					scope: this
				},{
					text: 'Cancelar',
					handler: function(){ this.win.destroy(); },
					scope: this
				}],
				keys: {
					key: 27, // Esc key
					handler: function(){ this.win.destroy(); },
					scope: this
				}
			};
			Ext.apply(cfg, this.config);
		this.win = new Ext.Window(cfg);
		//}

		this.reset();
                this.win.show();
		this.callback = callback;
		this.animateTarget = el;
	}

	,deleteFile : function(ed, value){
		
		Ext.Msg.confirm('Confirmação', 'Deseja realmente excluir a imagem selecionada?', function(opt){
			if(opt === 'yes'){							
				var selNode = this.view.getSelectedNodes();	 
				if(selNode && selNode.length > 0){
					selNode     = selNode[0];
					var data    = this.lookup[selNode.id];
				
					var imagem = data.name;
									
					Ext.Ajax.request({
						url: 'index.php',
						callback: function(){				
							this.view.store.reload();
							this.view.refresh();
						},
						scope: this,
						params: {
							method: 'Felamimail.deleteImage',
							imageName: imagem									
						}
					});
				}	
			}
		}, this);	
	}
	
	,onUploadSuccess : function(dialog, filename, resp_data, record){
                var imageRecord = Ext.data.Record.create([ // creates a subclass of Ext.data.Record
                    'name',
                    'url',
                    'size'
                ]);
                
                var myNewRecord = new imageRecord(
                {
                  name: filename.replace(/[a-zA-Z]:[\\\/]fakepath[\\\/]/, ''),
                  url: resp_data.id,
                  size: resp_data.size
                }
              
            )
             
              this.view.store.add(myNewRecord);
                this.view.store.reload();
		this.view.refresh();
	}
	  
	,initTemplates : function(){
		this.thumbTemplate = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="thumb-wrap" id="{name}">',
				'<div class="thumb"><img src="index.php?method=Felamimail.showTempImage&tempImageId={url}" title="{name}" /></div>',
				'<span class="x-editable">{shortName}</span></div>',
			'</tpl>'
		);
		this.thumbTemplate.compile();

		this.detailsTemplate = new Ext.XTemplate(
			'<div class="details">',
				'<tpl for=".">',
					'<img src="index.php?method=Felamimail.showTempImage&tempImageId={url}" style="width: 100px; height: 80px;" /><div class="details-info">',
					'<b>Nome da Imagem:</b>',
					'<span>{name}</span>',
					'<b>Tamanho:</b>',
					'<span>{sizeString}</span>',
				'</tpl>',
			'</div>'
		);
		this.detailsTemplate.compile();
	}

	,showDetails : function(){
	    var selNode = this.view.getSelectedNodes();
	    var detailEl = Ext.getCmp('img-detail-panel').body;
		if(selNode && selNode.length > 0){
			selNode = selNode[0];
			Ext.getCmp('ok-btn').enable();
		    var data = this.lookup[selNode.id];
            detailEl.hide();
            this.detailsTemplate.overwrite(detailEl, data);
            detailEl.slideIn('l', {stopFx:true,duration:.2});
		}else{
		    Ext.getCmp('ok-btn').disable();
		    detailEl.update('');
		}
	}

//	,filter : function(){
//		var filter = Ext.getCmp('filter');
//		this.view.store.filter('name', filter.getValue());
//		this.view.select(0);
//	}

	,reset : function(){
		//if(this.win.rendered){
		//	Ext.getCmp('filter').reset();
		//	this.view.getEl().dom.scrollTop = 0;
	//	}
	    //this.view.store.clearFilter();		
		this.view.store.sort('name','asc');
		this.view.select(0);
	}

	,doCallback : function(){
        var selNode = this.view.getSelectedNodes()[0];
		var lookup = this.lookup;
		
		var data = lookup[selNode.id];
		var img = Ext.getCmp('message_editor_body');
                var fileName = data.name.replace(/[a-zA-Z]:[\\\/]fakepath[\\\/]/, '');
		img.append('<img alt="'+fileName+'" src="index.php?method=Felamimail.showTempImage&tempImageId='+data.url+'"/>');   			

		this.win.destroy();	
    }

	,onLoadException : function(v,o){
	    this.view.getEl().update('<div style="padding:10px;">Error loading images.</div>');
	}	
});

String.prototype.ellipse = function(maxLength){
    if(this.length > maxLength){
        return this.substr(0, maxLength-3) + '...';
    }
    return this;
};
