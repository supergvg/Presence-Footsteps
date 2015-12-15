angular.module('gliist')
    .filter('spaceless', function() {
        return function(text) {
            return text.replace(/\s/g, '_');
        }
    });
