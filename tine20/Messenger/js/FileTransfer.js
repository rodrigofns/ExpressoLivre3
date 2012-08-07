Ext.ns('Tine.Messenger');

Tine.Messenger.FileTransfer = {
    
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
                    Ext.Msg.show({
                        title: _('File Transfer'),
                        msg: _('File sent') + '!<h6 style="padding: 5px 0; width: 300px;">' +
                             uploadResponse.fileName +
                             ' (' + uploadResponse.fileSize + ' bytes)</h6>',
                        buttons: Ext.Msg.OK,
                        icon: Ext.MessageBox.INFO
                    })

                    var info = $msg({
                            'to': to,
                            'type': 'filetransfer'})
                        .c("file", {
                            'name': uploadResponse.fileName,
                            'path': uploadResponse.path,
                            'size': uploadResponse.fileSize
                        });

                    Tine.Messenger.Application.connection.send(info);
                } else {
                    Ext.Msg.show({
                        title: _('File Transfer Error'),
                        msg: _(uploadResponse.status) + '!',
                        buttons: Ext.Msg.OK,
                        icon: Ext.MessageBox.ERROR
                    })
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
            ext = Tine.Messenger.FileTransfer.getExtension(fileName);
            
        var confirm = new Ext.Window({
            title: _('File Transfer'),
            border: false,
            iconCls: 'filetransfer-icon-title',
            html: jid + ' ' + _('wants to send you a file:') +
                  '<img style="display: block; width: 64px; margin: 0 auto;"' +
                  ' src="/images/files/' + ext + '-small.png"/>' +
                  '<h6 style="padding: 5px 0; width: 300px; text-align: center;">' + fileName + 
                  ' (' + fileSize + ' bytes)</h6>' +
                  '<div>' + _('Do you allow') + '?</div>',
            closeAction: 'close',
            buttons: [
                {
                    text: _('Yes'),
                    handler: function() {
                        Tine.Messenger.FileTransfer.downloadHandler(file, 'yes', confirm)
                    }
                },
                {
                    text: _('No'),
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