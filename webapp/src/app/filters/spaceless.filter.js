angular.module('gliist')
    .filter('spaceless', function() {
        return function(text) {
            if (text)
                return text.replace(/\s/g, '_');
        };
    });
