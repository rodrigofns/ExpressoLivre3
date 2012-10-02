/*
 * Tine 2.0
 * 
 * @package     Felamimail
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Mário César Kolling <mario.kolling@serpro.gov.br>
 * @copyright   Copyright (c) 2009-2013 Serpro (http://www.serpro.gov.br)
 */

Ext.namespace('Tine.Felamimail');

/**
 * @namespace   Tine.Felamimail
 * @class       Tine.Felamimail.SignatureAppletPanel
 * @extends     Ext.widgets.Panel
 * 
 * @author      Mário César Kolling <mario.kolling@serpro.gov.br>
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * 
 * @param       {Object} config
 * @constructor
 * Create a new AppletPanel
 */

 Tine.Felamimail.SignatureAppletPanel = Ext.extend(Ext.Panel, {
    
    id: 'signatureApplet',
    
    messageModel: null,
    
    signedMessageModel: null, // todo: create this model.
    
    /**
     * @cfg {object} bodyCfg
     */
    bodyCfg: {
        tag: 'applet',
        codebase: '/Felamimail/java/',
        archive: 'mail.jar, bcprov-jdk15-142.jar, bcmail-jdk15-142.jar, activation.jar, ExpressoCert.jar, ExpressoCertMail.jar',
        code: 'ExpressoSmimeApplet',
        mayscript: true
        
        // Other params, probably we'll get those from a properties file.
//        cn: [
//            {tag: 'param', name: 'backcolor', value: '234,234,234'},
//        ]
    },
    
    initComponent: function()
    {
        Tine.Felamimail.SignatureAppletPanel.superclass.initComponent.call(this);
    },
    
    // methods
    toApplet: function()
    {
        // call Applet passing => this.messageModel.toString();
    },
    
    fromApplet: function(response)
    {
        // get response and send the signed message
    }
    
});