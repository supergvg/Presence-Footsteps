'use strict';

angular.module('gliist').
    filter('ignoreTimeZone', function() {
        return function(val) {
            if (!val) {
                return;
            }
            var parse = val.split(/[^0-9]/);
            return new Date(parse[0], parse[1] - 1, parse[2], parse[3], parse[4], parse[5]);
        };
    });