Ext.ns('Tine.Messenger');

Tine.Messenger.FileTransfer = {
    
    resource: null,
    
    sendRequest: function (item) {
        var to = item.node.attributes.jid,
            iFrame = $('#iframe-upload'),
            inputFile = iFrame.contents().find('#sendfile');

        inputFile.click();
        inputFile.one('change', function () {
            var form = $(this).parent('form');
            form.submit();
        });

        iFrame.one('load', function () {
            var location = $(this).contents().get(0).location.href,
                src = location.substring(location.lastIndexOf('/'));

            if (src != '/upload.html') {
                var uploadResponse = JSON.parse($(this).contents().find('body').text());
                if (!uploadResponse.error) {
                    Tine.Messenger.FileTransfer.chooseResourceAndSend(to, function () {
                        if (Tine.Messenger.FileTransfer.resource == null) {
                            Ext.Msg.show({
                                title: Tine.Tinebase.appMgr.get('Messenger').i18n._('File Transfer'),
                                msg: Tine.Tinebase.appMgr.get('Messenger').i18n._('You must choose a resource') + '!',
                                buttons: Ext.Msg.OK,
                                icon: Ext.MessageBox.INFO
                            });
                        } else {
                            var info = $msg({'to': to + '/' + Tine.Messenger.FileTransfer.resource});
                            if (Tine.Messenger.FileTransfer.resource == Tine.Tinebase.registry.get('messenger').messenger.resource) {
                                info.attrs({'type': 'filetransfer'})
                                    .c("file", {
                                        'name': uploadResponse.fileName,
                                        'path': uploadResponse.path,
                                        'size': uploadResponse.fileSize
                                    });
                            } else {
                                info.attrs({'type': 'chat'})
                                    .c("body")
                                    .t(_('File sent') + ' :  ' +
                                       Tine.Messenger.FileTransfer.downloadURL(uploadResponse.fileName)
                                    );
                            }
                            Tine.Messenger.Application.connection.send(info);
                        }

                        Ext.Msg.show({
                            title: Tine.Tinebase.appMgr.get('Messenger').i18n._('File Transfer'),
                            msg: Tine.Tinebase.appMgr.get('Messenger').i18n._('File sent') +
                                 '!<h6 style="padding: 5px 0; width: 300px;">' +
                                 uploadResponse.fileName +
                                 ' (' + uploadResponse.fileSize + ' bytes)</h6>',
                            buttons: Ext.Msg.OK,
                            icon: Ext.MessageBox.INFO
                        });
                    });
                } else {
                    Ext.Msg.show({
                        title: Tine.Tinebase.appMgr.get('Messenger').i18n._('File Transfer Error'),
                        msg: Tine.Tinebase.appMgr.get('Messenger').i18n._(uploadResponse.status) + '!',
                        buttons: Ext.Msg.OK,
                        icon: Ext.MessageBox.ERROR,
                        width: 300
                    });
                }
                $(this).attr('src', '/upload.html');
            }
        });
    },
    
    onRequest: function (msg) {
        var from = $(msg).attr('from'),
            jid = Strophe.getBareJidFromJid(from),
            file = $(msg).find('file'),
            fileName = file.attr('name'),
            fileSize = file.attr('size'),
            ext = Tine.Messenger.FileTransfer.getExtension(fileName),
            contact = Tine.Messenger.RosterHandler.getContactElement(jid);

        var confirm = new Ext.Window({
            title: Tine.Tinebase.appMgr.get('Messenger').i18n._('File Transfer'),
            border: false,
            iconCls: 'filetransfer-icon-title',
            html: contact.text + ' ' +
                  Tine.Tinebase.appMgr.get('Messenger').i18n._('wants to send you a file:') +
                  '<img style="display: block; width: 64px; margin: 0 auto;"' +
                  ' src="/images/files/' + ext + '-small.png"/>' +
                  '<h6 style="padding: 5px 0; width: 300px; text-align: center;">' + fileName + 
                  ' (' + fileSize + ' bytes)</h6>' +
                  '<div>' + Tine.Tinebase.appMgr.get('Messenger').i18n._('Do you allow') + '?</div>',
            closeAction: 'close',
            buttons: [
                {
                    text: Tine.Tinebase.appMgr.get('Messenger').i18n._('Yes'),
                    handler: function() {
                        Tine.Messenger.FileTransfer.downloadHandler(file, 'yes', confirm)
                    }
                },
                {
                    text: Tine.Tinebase.appMgr.get('Messenger').i18n._('No'),
                    handler: function() {
                        Tine.Messenger.FileTransfer.downloadHandler(file, 'no', confirm)
                    }
                }
            ],
            width: 300
        });
        confirm.show();
        
        return true;
    },
    
    chooseResourceAndSend: function (jid, callbackSend) {
        var contact = Tine.Messenger.RosterHandler.getContactElement(jid);

        if (contact.attributes.resources.length > 1) {
            var resourceValues = [];
            for (var i = 0; i < contact.attributes.resources.length; i++) {
                resourceValues.push({
                    xtype: 'button',
                    text: contact.attributes.resources[i],
                    style: {
                        margin: '3px'
                    },
                    handler: function (button) {
                        Ext.getCmp('filetransfer-resources').close();
                        Tine.Messenger.FileTransfer.resource = button.getText();
                        callbackSend();
                    }
                });
            }

            var resources = new Ext.Window({
                id: 'filetransfer-resources',
                title: Tine.Tinebase.appMgr.get('Messenger').i18n._('File Transfer'),
                border: false,
                iconCls: 'filetransfer-icon-title',
                closeAction: 'close',
                width: 300,
                items: resourceValues,
                html: '<h4 style="margin: 5px;">' +
                      contact.attributes.text +
                      Tine.Tinebase.appMgr.get('Messenger').i18n._(' has more than one resource. Choose one!') +
                      '</h4>',
                layout: 'column'
            });
            resources.show();
        } else {
            Tine.Messenger.FileTransfer.resource = contact.attributes.resources[0];
            callbackSend();
        }
    },
    
    downloadURL: function (fileName) {
        var protocol = window.location.protocol,
            host = window.location.hostname,
            port = window.location.port != 80 ? ':' + window.location.port : '',
            filePath = '/download/' + fileName;
            
        return protocol + '//' + host + port + filePath;
    },
    
    downloadHandler: function(file, download, window) {
        window.close()
        var filePath = file.attr('path') + file.attr('name');
        $('#iframe-download').attr('src', '/download.php?file=' + filePath + '&download=' + download);
    },
    
    getExtension: function(fileName) {
        var ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        
        switch(ext) {
            case 'asp':
            case 'as':
            case 'avi':
            case 'bat':
            case 'bin':
            case 'bmp':
            case 'bz2':
            case 'cab':
            case 'cal':
            case 'cat':
            case 'css':
            case 'dat':
            case 'deb':
            case 'div':
            case 'divx':
            case 'dll':
            case 'doc':
            case 'docx':
            case 'dvd':
            case 'exe':
            case 'fla':
            case 'flv':
            case 'gif':
            case 'gz':
            case 'htm':
            case 'html':
            case 'ico':
            case 'ini':
            case 'iso':
            case 'jar':
            case 'java':
            case 'javac':
            case 'jpeg':
            case 'jpg':
            case 'js':
            case 'log':
            case 'm4a':
            case 'mid':
            case 'mov':
            case 'mp3':
            case 'mp4':
            case 'mpeg':
            case 'mpg':
            case 'odg':
            case 'odp':
            case 'ods':
            case 'odt':
            case 'pdf':
            case 'php':
            case 'png':
            case 'pps':
            case 'ppt':
            case 'pptx':
            case 'py':
            case 'rar':
            case 'rb':
            case 'rtf':
            case 'swf':
            case 'tgz':
            case 'tiff':
            case 'torrent':
            case 'txt':
            case 'vob':
            case 'wav':
            case 'wma':
            case 'wmv':
            case 'xls':
            case 'xlsx':
            case 'xml':
            case 'xsl':
            case 'zip':
                return ext;
            default:
                return 'generic';
        }
    }
    
};