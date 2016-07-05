'use strict';

angular.module('gliist').service('guestListParserService',

    function () {
        this.parse = function (t) { //returns: null - no guests, string - error, array - valid result
            var lines = t.split('\n');
            var guestCount = lines.length;
            
            if (!guestCount) {
                return null;
            }
            
            var result = [];
            for (var i = 0; i < guestCount; i++) {
                var l = lines[i];
                
                if (l === '') {
                    continue;
                }
                
                var name = null;
                var note = null;
                var plus = 0;
                var values = [];
                
                if (l.indexOf(',') !== -1) { //Name, Note, Pluses
                    values = l.split(',');
                    if (values.length !== 3) {
                        return 'Invalid format on line ' + (i + 1) + '. Valid format is: Name, Note, Pluses.';
                    }
                    
                    name = values[0].trim();
                    if (name === '') {
                        continue;
                    }
                    
                    note = values[1].trim();
                    plus = parseInt(values[2].trim(), 10);
                        
                    if (isNaN(plus)) {
                        return 'Invalid "Plus" value on line ' + (i + 1);
                    }
                } else if (l.indexOf('+') !== -1) { //Name +1
                    values = l.split('+');
                    
                    name = values[0].trim();
                    if (name === '') {
                        continue;
                    }
                    
                    note = '';
                    plus = parseInt(values[1].trim(), 10);
                        
                    if (isNaN(plus)) {
                        return 'Invalid "Plus" value on line ' + (i + 1);
                    }
                } else { //Name
                    name = l.trim();
                    note = '';
                }
                
                var g = {
                    firstName: null,
                    lastName: null,
                    email: '',
                    notes: note,
                    plus: plus
                };
                
                var nameSpace = name.indexOf(' ');
                if (nameSpace !== -1) {
                    g.firstName = name.substr(0, nameSpace).trim();
                    g.lastName = name.substr(nameSpace + 1).trim();
                } else {
                    g.firstName = name;
                    g.lastName = '';
                }
                
                result.push(g);
            }
            
            return result;
        };
    }
);
