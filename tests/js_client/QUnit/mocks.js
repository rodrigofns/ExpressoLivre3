Util = {
    extractNameFromEmail: function (email) {
        return (email.indexOf('@') >= 0) ? email.substring(0, email.indexOf('@')) : email;
    },
    
    createJabberIDFromName: function (first_name, last_name) {
        first_name = Util.sanitizeName(first_name);
        last_name = Util.sanitizeSurname(last_name);
            
        return first_name.toLowerCase() + '.' + last_name.toLowerCase();
    },
    
    sanitizeName: function (name) {
        name = $.trim(name);
    
        if (name.indexOf(' ') >= 0)
            name = name.replace(/ /g, '-');
            
        return name;
    },
    
    sanitizeSurname: function (surname) {
        surname = surname.replace(/( )+(das|dos|de|da|do)( )+/gi, ' ');
        surname = $.trim(surname);
    
        if (surname.indexOf(' ') >= 0)
            surname = surname.replace(/ /g, '-');
            
        return surname;
    }
}
