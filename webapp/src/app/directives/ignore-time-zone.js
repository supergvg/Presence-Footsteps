angular.module('gliist').
    filter('ignoreTimeZone', function () {
        return function (val) {
            var newDate = new Date(val.replace('T', ' ').slice(0, -6));
            return newDate;
        };
    });