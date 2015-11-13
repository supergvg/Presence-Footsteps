angular.module('gliist')
    .filter('encodeURIComponent', function() {
        return window.encodeURIComponent;
    });
