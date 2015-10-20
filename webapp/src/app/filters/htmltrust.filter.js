angular.module('gliist')
    .filter('html', ['$sce', function($sce) {
        return function(text) {
            return $sce.trustAsHtml(text);
        };                    
    }]);
