Ext.ns('Tine.Messenger');

Tine.Messenger.FileTransfer = {
    
    sendRequest: function (item) {
        var to = item.node.attributes.jid,
            iFrame = $('#iframe-upload'),
            inputFile = iFrame.contents().find('#sendfile');
        
        inputFile.click();
        inputFile.bind('change', function () {
            var form = $(this).parent('form');
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
                var json = {
                    "path": uploadResponse.path,
                    "fileName": uploadResponse.fileName,
                    "fileSize": uploadResponse.fileSize
                };
                console.log(to);
                var info = $msg({
                        'to': to,
                        'type': 'chat'})
                    .c("body")
                    .t(JSON.stringify(json))
                    .up()
                    .c("active", {xmlns: "http://jabber.org/protocol/chatstates"});

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
            json = $(msg).find('body').text().replace(/\&amp;/gi, '&').replace(/\&quot;/gi, '"'),
            file = JSON.parse(json);

        Ext.MessageBox.buttonText.yes = _('Allow');
        Ext.MessageBox.buttonText.no = _('Deny');
        Ext.MessageBox.minWidth = 450;
        Ext.MessageBox.confirm(_('File Transfer'),
            jid + ' ' + _('wants to send you a file:') +
                '<h6 style="padding: 5px 0 0 0;">' + file.fileName + 
                ' (' + file.fileSize + ' bytes)</h6>',
            function (id) {
                var filePath = file.path + file.fileName;
                $('#iframe-download').attr('src', '/download.php?file=' + filePath + '&download=' + id);
            }
        );
        
        return true;
    }
    
};