Ext.ns('Tine.Messenger');

Tine.Messenger.FileTransfer = {
    
    sendRequest: function (treenode) {
        var to = treenode.node.attributes.jid;
        console.log(treenode);
        console.log('SEND File Transfer\n\tTO: ' + to);

        var iFrame = $('#iframe-upload'),
            inputFile = iFrame.contents().find('#sendfile');

        inputFile.click();
        inputFile.bind('change', function (event) {
            var path = event.target.value,
                form = $(this).parent('form'),
                fileName = (path.indexOf('\\') >= 0) ?
                    path.substring(path.lastIndexOf('\\')+1) : path;

            form.submit();
            
            var info = $msg({
                 'to': to,
                 'type': 'expresso:filetransfer:request'})
               .c("body").c('file', {'name': fileName});
               
            Tine.Messenger.Application.connection.send(info);
        });
    },
    
    onRequest: function (msg) {
        var from = $(msg).attr('from'),
            jid = Strophe.getBareJidFromJid(from),
            to = $(msg).attr('to'),
            file = $(msg).find('file');
        
        console.log('RECV File Transfer\nFROM: '+from+'\nTO: '+to);
        
        Ext.Msg.buttonText.yes = _('Allow');
        Ext.Msg.buttonText.no = _('Deny');
        Ext.Msg.confirm(_('File Transfer'),
            jid + ' ' + _('wants to send you a file:') +
                '<h6 style="padding: 5px 0 0 0;">' + file.attr('name') + '</h6>',
            function (id) {
                if (id == 'yes')
                    $('#iframe-download').attr('src', '/download.php?file=' + file.attr('name'));
            }
        );
        
        return true;
    }
    
};