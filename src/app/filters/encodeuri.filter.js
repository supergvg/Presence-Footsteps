'use strict';

angular.module('gliist')
    .filter('encodeURIComponent', ['$window', function($window) {
        return $window.encodeURIComponent;
    }]);
