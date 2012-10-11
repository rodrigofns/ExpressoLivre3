/* 
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2009-2010 Metaways Infosystems GmbH (http://www.metaways.de)
 */

/*global Ext, Tine*/

Ext.ns('Tine.Tinebase');

/**
 * @namespace   Tine.Tinebase
 * @class       Tine.Tinebase.LoginPanel
 * @extends     Ext.Panel
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 */
Tine.Tinebase.LoginPanel = Ext.extend(Ext.Panel, {

    /**
     * @cfg {String} defaultUsername prefilled username
     */
    defaultUsername: '',
    
    /**
     * @cfg {String} defaultPassword prefilled password
     */
    defaultPassword: '',
    
    /**
     * @cfg {String} defaulSecuritCode prefilled Security Code
     */
    defaulSecuritCode: 'Security Code',  
    
    /**
     * @cfg {String} defaulSecuritCode prefilled Security Code
     */
    loginPanelheight: 250,      
    /**
     * @cfg {String} loginMethod server side login method
     */
    loginMethod: 'Tinebase.login',
    
    /**
     * @cfg {String} loginLogo logo to show
     */
    loginLogo: 'images/tine_logo.png',
    
    /**
     * @cfg {String} onLogin callback after successfull login
     */
    onLogin: Ext.emptyFn,
    
    /**
     * @cfg {Boolean} show infobox (survey, links, text)
     */
    showInfoBox: true,
    
    /**
     * @cfg {String} scope scope of login callback
     */
    scope: null,
    
    layout: 'fit',
    border: false,
    
    /**
     * return loginPanel
     * 
     * @return {Ext.FromPanel}
     */
    getLoginPanel: function () {
        if (! this.loginPanel) {
            this.loginPanel = new Ext.FormPanel({
                width: 460,
                //height: this.loginPanelheight,
                frame: true,
                labelWidth: 90,
                cls: 'tb-login-panel',
                items: [{
                    xtype: 'container',
                    cls: 'tb-login-lobobox',
                    border: false,
                    html: '<a target="_blank" href="' + Tine.weburl + '" border="0"><img src="' + this.loginLogo + '" /></a>'
                }, {
                    xtype: 'label',
                    cls: 'tb-login-big-label',
                    text: _('Login')
                }, {
                    xtype: 'tinelangchooser',
                    name: 'locale',
                    editable: false,
                    width: 170,
                    tabindex: 1
                }, {
                    xtype: 'textfield',
                    tabindex: 2,
                    width: 170,
                    fieldLabel: _('Username'),
                    id: 'username',
                    name: 'username',
                    allowBlank: false,
                    validateOnBlur: false,
                    selectOnFocus: true,
                    value: this.defaultUsername ? this.defaultUsername : undefined,
                    listeners: {
                    	render: function (field) {
                    		field.focus(false, 250);
                    	}
                    }
                }, {
                    xtype: 'textfield',
                    tabindex: 3,
                    width: 170,
                    inputType: 'password',
                    fieldLabel: _('Password'),
                    id: 'password',
                    name: 'password',
                    //allowBlank: false,
                    selectOnFocus: true,
                    value: this.defaultPassword
                }, {fieldLabel:(' '),
                    labelSeparator: '',
                    html: '<span id="contImgCaptcha" style="display:none"><input type="text" id="security_code" name="securitycode" value="" style="width:168px"/><br/><img id="imgCaptcha" src="" alt="Security Code" /></span>',
                    handler: this.onRefreshCaptcha
                }],            
                buttonAlign: 'right',
                buttons: [{
                    xtype: 'button',
                    width: 120,
                    text: _('Login'),
                    scope: this,
                    handler: this.onLoginPress
                }]
            });
        }
        
        return this.loginPanel;
    },
    
    getTinePanel: function () {
        if (! this.tinePanel) {
            this.tinePanel = new Ext.Container({
                layout: 'fit',
                cls: 'tb-login-tinepanel',
                border: false,
                defaults: {xtype: 'label'},
                items: [{
                    cls: 'tb-login-big-label',
                    html: _('Tine 2.0 is made for you')
                }, {
                    html: '<p>' + _('Tine 2.0 wants to make business collaboration easier and more enjoyable - for your needs! So you are warmly welcome to discuss with us, bring in ideas and get help.') + '</p>'
                }, {
                    cls: 'tb-login-big-label-spacer',
                    html: '&nbsp;'
                }, {
                    html: '<ul>' + 
                        '<li><a target="_blank" href="' + Tine.weburl + '" border="0">' + _('Tine 2.0 Homepage') + '</a></li>' +
                        '<li><a target="_blank" href="' + Tine.weburl + 'forum/" border="0">' + _('Tine 2.0 Forum') + '</a></li>' +
                    '</ul>'
                }]
            });
        }
        
        return this.tinePanel;
    },
    
    getAboutPanel: function () {
        if (! this.aboutPanel) {
            this.aboutPanel = new Ext.Container({
                layout: 'fit',
                cls: 'tb-about-panel',
                border: false,
                items: [{
                    xtype: 'button',
                    id: 'about_button',
                    width: 30,
                    tooltip: String.format(_('About {0}'),('Expresso 3')),
                    scope: this,
                    handler: this.onAboutTine20
                }]
            });
        }
        
        return this.aboutPanel;
    },
    
    getPoweredByPanel: function () {
        if (! this.poweredByPanel) {
            this.poweredByPanel = new Ext.Container({
                layout: 'fit',
                cls: 'tb-about-panel',
                border: false,
                defaults: {xtype: 'label'},
                items: [{
                    html: '<span>' + _('Powered by:') + ' <a target="_blank" href="' + Tine.weburl + '" border="0">Tine 2.0</a></span>'
                }]
            });
        }
        
        return this.poweredByPanel;
    },
    
    getSurveyData: function (cb) {
        var ds = new Ext.data.Store({
            proxy: new Ext.data.ScriptTagProxy({
                url: 'https://versioncheck.officespot20.com/surveyCheck/surveyCheck.php'
            }),
            reader: new Ext.data.JsonReader({
                root: 'survey'
            }, ['title', 'subtitle', 'duration', 'langs', 'link', 'enddate', 'htmlmessage', 'version'])
        });
        
        ds.on('load', function (store, records) {
            var survey = records[0];
            
            cb.call(this, survey);
        }, this);
        ds.load({params: {lang: Tine.Tinebase.registry.get('locale').locale}});
    },
    
    getSurveyPanel: function () {
        if (! this.surveyPanel) {
            this.surveyPanel = new Ext.Container({
                layout: 'fit',
                cls: 'tb-login-surveypanel',
                border: false,
                defaults: {xtype: 'label'},
                items: []
            });
            
            if (! Tine.Tinebase.registry.get('denySurveys')) {
                this.getSurveyData(function (survey) {
                    if (typeof survey.get === 'function') {
                        var enddate = Date.parseDate(survey.get('enddate'), Date.patterns.ISO8601Long);
                        var version = survey.get('version');
                        
                        if (Ext.isDate(enddate) && enddate.getTime() > new Date().getTime() && 
                            Tine.clientVersion.packageString.indexOf(version) === 0) {
                            survey.data.lang_duration = String.format(_('about {0} minutes'), survey.data.duration);
                            survey.data.link = 'https://versioncheck.officespot20.com/surveyCheck/surveyCheck.php?participate';
                            
                            this.surveyPanel.add([{
                                cls: 'tb-login-big-label',
                                html: _('Tine 2.0 needs your help')
                            }, {
                                html: '<p>' + _('We regularly need your feedback to make the next Tine 2.0 releases fit your needs even better. Help us and yourself by participating:') + '</p>'
                            }, {
                                html: this.getSurveyTemplate().apply(survey.data)
                            }, {
                                xtype: 'button',
                                width: 120,
                                text: _('participate!'),
                                handler: function () {
                                    window.open(survey.data.link);
                                }
                            }]);
                            this.surveyPanel.doLayout();
                        }
                    }
                });
            }
        }
        
        return this.surveyPanel;
    },
    
    getSurveyTemplate: function () {
        if (! this.surveyTemplate) {
            this.surveyTemplate = new Ext.XTemplate(
                '<br/ >',
                '<p><b>{title}</b></p>',
                '<p><a target="_blank" href="{link}" border="0">{subtitle}</a></p>',
                '<br/>',
                '<p>', _('Languages'), ': {langs}</p>',
                '<p>', _('Duration'), ': {lang_duration}</p>',
                '<br/>').compile();
        }
        
        return this.surveyTemplate;
    },
    
    /**
     * checks browser compatibility and show messages if unknown/incompatible
     * 
     * ie6, gecko2 -> bad
     * unknown browser -> may not work
     * 
     * @return {Ext.Container}
     * 
     * TODO find icons with the correct license
     */
    getBrowserIncompatiblePanel: function() {
        if (! this.browserIncompatiblePanel) {
            this.browserIncompatiblePanel = new Ext.Container({
                layout: 'fit',
                cls: 'tb-login-surveypanel',
                border: false,
                defaults: {xtype: 'label'},
                items: []
            });
            
            var browserSupport = 'compatible';
            if (Ext.isIE6 || Ext.isGecko2) {
                browserSupport = 'incompatible';
            } else if (
                ! (Ext.isWebKit || Ext.isGecko || Ext.isIE)
            ) {
                // yepp we also mean -> Ext.isOpera
                browserSupport = 'unknown';
            }
            
            var items = [];
            if (browserSupport == 'incompatible') {
                items = [{
                    cls: 'tb-login-big-label',
                    html: _('Browser incompatible')
                }, {
                    html: '<p>' + _('Your browser is not supported by Tine 2.0.') + '<br/><br/></p>'
                }];
            } else if (browserSupport == 'unknown') {
                items = [{
                    cls: 'tb-login-big-label',
                    html: _('Browser incompatible?')
                }, {
                    html: '<p>' + _('You are using an unrecognized browser. This could result in unexpected behaviour.') + '<br/><br/></p>'
                }];
            }
            
            if (browserSupport != 'compatible') {
                this.browserIncompatiblePanel.add(items.concat([{
                    html: '<p>' + _('You might try one of these browsers:') + '<br/>'
                        + '<a href="http://www.google.com/chrome" target="_blank">Google Chrome</a><br/>'
                        + '<a href="http://www.mozilla.com/firefox/" target="_blank">Mozilla Firefox</a><br/>'
                        + '<a href="http://www.apple.com/safari/download/" target="_blank">Apple Safari</a><br/>'    
                        + '<a href="http://www.microsoft.com/windows/internet-explorer/default.aspx" target="_blank">Microsoft Internet Explorer</a>'
                        + '<br/></p>'
                }]));
                this.browserIncompatiblePanel.doLayout();
            }
        }
        
        return this.browserIncompatiblePanel;
    },
    
    initComponent: function () {
        this.initLayout();
        
        this.supr().initComponent.call(this);
    },
    
    initLayout: function () {
        var infoPanelItems = (this.showInfoBox) ? [
            this.getBrowserIncompatiblePanel(),
            this.getTinePanel(),
            this.getSurveyPanel()
        ] : [];
        
        this.infoPanel = new Ext.Container({
            cls: 'tb-login-infosection',
            border: false,
            width: 300,
            height: 460,
            layout: 'vbox',
            layoutConfig: {
                align: 'stretch'
            },
            items: infoPanelItems
        });
        
        this.items = [{
        	xtype: 'container',
            layout: 'absolute',
            border: false,
            items: [
                this.getLoginPanel(),
                this.infoPanel,
                this.getAboutPanel(),
                this.getPoweredByPanel()
            ]
        }];
    },
    
    /**
     * @private
     */
    onAboutTine20: function() {
        var aboutDialog = new Tine.Tinebase.AboutDialog();
        aboutDialog.show();
    },
    
    /**
     * do the actual login
     */
    onLoginPress: function () {
        var form = this.getLoginPanel().getForm(),
        	values = form.getValues();
        	
        if (form.isValid()) {
            Ext.MessageBox.wait(_('Logging you in...'), _('Please wait'));
            
            Ext.Ajax.request({
                scope: this,
                params : {
                    method: this.loginMethod,
                    username: values.username,
                    password: values.password,
                    securitycode: values.securitycode 
                },
                timeout: 60000, // 1 minute
                callback: function (request, httpStatus, response) {
                    var responseData = Ext.util.JSON.decode(response.responseText);
                    if (responseData.success === true) {
                        Ext.MessageBox.wait(String.format(_('Login successful. Loading {0}...'), Tine.title), _('Please wait!'));
                        window.document.title = this.originalTitle;
                        this.onLogin.call(this.scope);
                    } else {
                        if (responseData.data && responseData.data.code === 510) {
                            // NOTE: when communication is lost, we can't create a nice ext window.
                            (function() {
                                Ext.MessageBox.hide();
                                alert(_('Connection lost, please check your network!'));
                            }).defer(1000);
                        } else {
                            Ext.MessageBox.show({
                                title: _('Login failure'),
                                msg: _('Your username and/or your password are wrong!!!'),
                                buttons: Ext.MessageBox.OK,
                                icon: Ext.MessageBox.ERROR,
                                fn: function () {
                                    this.getLoginPanel().getForm().findField('password').focus(true);
                                    if(document.getElementById('useCaptcha')) {
                                    this.loginPanelheight = 290;
                                    document.getElementById('imgCaptcha').src = 'index.php?method=Tinebase.RequestImage&i=' + Math.floor(Math.random()*1000000001);
                                    document.getElementById('contImgCaptcha').style.display = ''; 
                                    document.getElementById('security_code').value = _('Security Code');
                                    }
                                }.createDelegate(this)
                            });
                        }
                    }
                }
            });
        } else {
        	Ext.MessageBox.alert(_('Errors'), _('Please fix the errors noted.'));
        }
    },
    
    onRender: function (ct, position) {
        this.supr().onRender.apply(this, arguments);
        
        this.map = new Ext.KeyMap(this.el, [{
            key : [10, 13],
            scope : this,
            fn : this.onLoginPress
        }]);
        
        this.originalTitle = window.document.title;
        var postfix = (Tine.Tinebase.registry.get('titlePostfix')) ? Tine.Tinebase.registry.get('titlePostfix') : '';
        window.document.title = Tine.title + postfix + ' - ' + _('Please enter your login data');
    },
    
    onResize: function () {
        this.supr().onResize.apply(this, arguments);

        var box 	 = this.getBox(),
        	loginBox = {width : this.getLoginPanel().width, height: this.loginPanelheight},
        	infoBox  = this.infoPanel.rendered ? this.infoPanel.getBox() : {width : this.infoPanel.width, height: this.infoPanel.height};

        var top = (box.height - loginBox.height) / 2;
        if (box.height - top < infoBox.height) {
            top = box.height - infoBox.height;
        }
        
        var loginLeft = (box.width - loginBox.width) / 2;
        if (loginLeft + loginBox.width + infoBox.width > box.width) {
            loginLeft = box.width - loginBox.width - infoBox.width;
        }
                
        this.getLoginPanel().setPosition(loginLeft, top);
        this.infoPanel.setPosition(loginLeft + loginBox.width, top);
        
        this.getPoweredByPanel().setPosition(650, 463);
        this.getAboutPanel().setPosition(760, 455);
    },
    
    renderSurveyPanel: function (survey) {
        var items = [{
            cls: 'tb-login-big-label',
            html: _('Tine 2.0 needs your help')
        }, {
            html: '<p>' + _('We regularly need your feedback to make the next Tine 2.0 releases fit your needs even better. Help us and yourself by participating:') + '</p>'
        }];      
    }
});
