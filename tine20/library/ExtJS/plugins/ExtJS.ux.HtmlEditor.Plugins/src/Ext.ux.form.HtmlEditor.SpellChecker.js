/**
 * @author Fernando Lages
 * @class Ext.ux.form.HtmlEditor.SpellChecker
 * @extends Ext.util.Observable
 * <p>A plugin that creates a button on the HtmlEditor for GoogieSpell spell checker.</p>
 */
Ext.ux.form.HtmlEditor.SpellChecker = Ext.extend(Ext.util.Observable, {
    // Spell Checker language text
    langTitle   		: 'Spell Checker',
    langCheck   		: 'Check It!',
    langCancel 		  : 'Cancel',
		spellchecker		: null,
    // private
    init: function(cmp){
        this.cmp = cmp;
        this.cmp.on('render', this.onRender, this);
    },
    // private
    onRender: function(){
        var cmp = this.cmp;
        this.btn = this.cmp.getToolbar().addButton({
						xtype: 'tbsplit',
						id: 'spellchecker_button',
            itemId: 'spellchecker',
            cls: 'x-btn-icon',
            iconCls: 'x-edit-spellchecker',
		        enableToggle: true,
						menu: [{
								text: 'Portugues',
								iconCls: 'email-icon',
								group: 'language',
								lang: 'pt',
								checked: true,
								handler: this.setLang,
								scope: this
						},{
								text: 'English',
								iconCls: 'email-icon',
								group: 'language',
								lang: 'en',
								checked: false,
								handler: this.setLang,
								scope: this
						},{
								text: 'Deutsch',
								iconCls: 'email-icon',
								group: 'language',
								lang: 'de',
								checked: false,
								handler: this.setLang,
								scope: this
						}],
						handler: function(){
								if (this.btn.pressed)
										this.spellchecker.spellCheck();
								else
										this.spellchecker.resumeEditing();
						},
            scope: this,
            tooltip: {
                title: this.langTitle
            },
            overflowText: this.langTitle
        });
        this.spellchecker = new Ext.GoogieSpell("library/ExtJS/plugins/googiespell/", "sendReq.php?lang=");

				this.spellchecker.custom_no_spelling_error = function(){
					Ext.getCmp('spellchecker_button').toggle();
					Ext.MessageBox.alert(_('Errors'), _('No spelling errors found.'));
				};
        this.spellchecker.show_change_lang_pic = false;
        this.spellchecker.lang_chck_spell = "";
				this.spellchecker.setCurrentLanguage("pt");
				this.spellchecker.setIsHTML(this.cmp.getEditorBody());
        this.spellchecker.setEditor(this.cmp);
        this.spellchecker.setTextarea(this.cmp.getEditorBody());
    },
		setLang: function(btnObj,evtObj){
				this.spellchecker.setCurrentLanguage(btnObj.lang);
		}
});

// extends GoogieSpell
Ext.GoogieSpell = Ext.extend(GoogieSpell, {
editor: null,
setEditor: function(ed){
		this.editor = ed;
},
setTextarea: function(id){
    if(typeof(id) == "string")
        this.text_area = AJS.$(id);
    else
        this.text_area = id;

    var r_width, r_height;

    if(this.text_area != null) {
        if(!AJS.isDefined(this.spell_container) && this.decoration) {
            var spell_container = AJS.TD();
            this.spell_container = spell_container;
        }

        this.checkSpellingState();
    }
    else 
        if(this.report_ta_not_found)
            alert("Text area not found");
},
getEditAreaValue: function(ta){
		return (ta.value ? ta.value : this.editor.getValue());
},
getValue: function(ta) {
    return this.getEditAreaValue(ta);
},
setValue: function(ta, value) {
	if (this.getIsHTML()) {
		this.editor.setValue(value);
	} else {
		ta.value = value;
	}
},
spellCheck: function(ignore) {
    var me = this;

    this.cnt_errors_fixed = 0;
    this.cnt_errors = 0;
    this.setStateChanged("checking_spell");

    if(this.main_controller)
        this.appendIndicator(this.spell_span);

    this.error_links = [];
    this.ta_scroll_top = this.text_area.scrollTop;

    try { this.hideLangWindow(); }
    catch(e) {}

    this.ignore = ignore;

    if(this.getValue(this.text_area) == '' || ignore) {
        if(!me.custom_no_spelling_error)
            me.flashNoSpellingErrorState();
        else
            me.custom_no_spelling_error(me);
        me.removeIndicator();
        return ;
    }
    
		this.createEditLayer(this.editor.getContainer().clientWidth,this.editor.getContainer().offsetHeight);

    this.createErrorWindow();
    AJS.getBody().appendChild(this.error_window);

    try { netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead"); } 
    catch (e) { }

    if(this.main_controller)
        this.spell_span.onclick = null;

    this.orginal_text = this.getValue(this.text_area);

    //Create request
    var d = AJS.getRequest(this.getGoogleUrl());
    var reqdone = function(res_txt) {
        var r_text = res_txt;
        me.results = me.parseResult(r_text);

        if(r_text.match(/<c.*>/) != null) {
            //Before parsing be sure that errors were found
            me.showErrorsInIframe();
            me.resumeEditingState();
        }
        else {
            if(!me.custom_no_spelling_error)
                me.flashNoSpellingErrorState();
            else
                me.custom_no_spelling_error(me);
        }
        me.removeIndicator();
    };

    d.addCallback(reqdone);
    reqdone = null;

    var reqfailed = function(res_txt, req) {
        if(me.custom_ajax_error)
            me.custom_ajax_error(req);
        else
            alert("An error was encountered on the server. Please try again later.");

        if(me.main_controller) {
            AJS.removeElement(me.spell_span);
            me.removeIndicator();
        }
        me.checkSpellingState();
    };
    d.addErrback(reqfailed);
    reqfailed = null;

    var req_text = GoogieSpell.escapeSepcial(this.orginal_text);
    d.sendReq(GoogieSpell.createXMLReq(req_text));
},
/*
	GoogieSpell HTML support / switch between modes
*/
isHTML: false,
setIsHTML: function(el) {
	var origSupport = new RegExp('input|textarea', 'i');
	this.isHTML = origSupport.test(el.nodeName) ? false : true;
},
getIsHTML: function() {
	return this.isHTML;
},
insertErrLinks: function(output, err_links) {
    var all_vars = output.getElementsByTagName('var');
    var all_vars_len = all_vars.length;
    var err_count = 0;
	var err_len = err_links.length;
    for (var i = 0; i < all_vars_len; i++) {
        if (all_vars[i].className == 'err_hook') {
			//	Replace &nbsp; with span.    is needed for IE implementation of innerHTML
			all_vars[i].replaceChild(err_links[err_count], all_vars[i].firstChild);
            err_count++;
			if (err_count == err_len) break;
        }
    }
}
});

