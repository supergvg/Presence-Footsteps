angular.module('gliist').
    filter('ignoreTimeZone', function () {
        return function (val) {
            if (!val) {
                return;
            }
            var newDate = new Date(val.replace('T', ' ').slice(0, -6));
            return newDate;
        };
    });