Ext.ns('Tine.Messenger');

Tine.Messenger.FileTransfer = {
    
    sendRequest: function (item) {
        var to = item.node.attributes.jid,
            iFrame = $('#iframe-upload'),
            inputFile = iFrame.contents().find('#sendfile');

        inputFile.click();
        inputFile.bind('change', function (event) {
            var path = event.target.value,
                form = $(this).parent('form'),
                fileName = (path.indexOf('\\') >= 0) ?
                    path.substring(path.lastIndexOf('\\')+1) : path;

            form.submit();
        });
        
        iFrame.bind('load', function () {
            var uploadResponse = JSON.parse($(this).contents().find('body').text());
            if (!uploadResponse.error) {
                Ext.Msg.show({
                    title: _('File Transfer'),
                    msg: _('File sent') + '!<h6 style="padding: 5px 0 0 0; width: 300px;">' +
                         uploadResponse.fileName +
                         ' (' + uploadResponse.fileSize + ' bytes)</h6>',
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.INFO
                })
                var info = $msg({
                        'to': to,
                        'type': 'expresso:filetransfer:request'})
                    .c("body").c('file', {
                        'name': uploadResponse.fileName,
                        'path': uploadResponse.path,
                        'size': uploadResponse.fileSize,
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
            $(this).attr('src', 'upload.html');
        });
    },
    
    onRequest: function (msg) {
        var from = $(msg).attr('from'),
            jid = Strophe.getBareJidFromJid(from),
            to = $(msg).attr('to'),
            file = $(msg).find('file');
        
        Ext.MessageBox.buttonText.yes = _('Allow');
        Ext.MessageBox.buttonText.no = _('Deny');
        Ext.MessageBox.minWidth = 450;
        Ext.MessageBox.confirm(_('File Transfer'),
            jid + ' ' + _('wants to send you a file:') +
                '<h6 style="padding: 5px 0 0 0;">' + file.attr('name') + 
                ' (' + file.attr('size') + ' bytes)</h6>',
            function (id) {
                var filePath = file.attr('path') + file.attr('name');
                $('#iframe-download').attr('src', '/download.php?file=' + filePath + '&download=' + id);
            }
        );
        
        return true;
    }
    
};