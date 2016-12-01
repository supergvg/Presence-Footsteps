'use strict';

angular.module('gliist').service('guestListParserService',

  function () {
    this.parse = function (t, isRSVP) { //returns: null - no guests, string - error, array - valid result
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

        var name = '';
        var note = '';
        var plus = 0;
        var email = '';
        var values = [];

        if (l.indexOf(',') !== -1) { //Either "Name, Note, Pluses" or "Name, Email"
          values = l.split(',');
          if (!isRSVP && values.length !== 3) {
            return 'Invalid format on line ' + (i + 1) + '. Valid format is: Name, Note, Pluses.';
          } else if (isRSVP && values.length !== 2) {
            return 'Invalid format on line ' + (i + 1) + '. Valid format is: Name, Email.';
          }

          name = values[0].trim();
          if (name === '') {
            continue;
          }

          if (isRSVP) {
            email = values[1].trim();
          } else {
            note = values[1].trim();
            plus = parseInt(values[2].trim(), 10);

            if (isNaN(plus)) {
              return 'Invalid "Plus" value on line ' + (i + 1);
            }
          }
        } else if (l.indexOf('+') !== -1) { //Name +1
          values = l.split('+');

          name = values[0].trim();
          if (name === '') {
            continue;
          }

          plus = parseInt(values[1].trim(), 10);

          if (isNaN(plus)) {
            return 'Invalid "Plus" value on line ' + (i + 1);
          }
        } else { //Name or Email
          if (isRSVP) {
            email = l.trim();
          } else {
            name = l.trim();
          }
        }

        name = name.match(/(.+?)\s+(.+)/) || [];
        var g = {
          firstName: name[1] || '',
          lastName: name[2] || '',
          email: email,
          notes: note,
          plus: plus
        };

        result.push(g);
      }

      return result;
    };
  }
);
