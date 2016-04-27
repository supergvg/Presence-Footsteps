'use strict';

angular.module('gliist').
    filter('ignoreTimeZone', function () {
        return function (val) {
            if (!val) {
                return;
            }

            var a = val.split(/[^0-9]/);

            var d = new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
            return d;

/*            var newDate = new Date(val.replace('T', ' ').slice(0, -6));
            return newDate;*/
        };
    });