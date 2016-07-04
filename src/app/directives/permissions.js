'use strict';

angular.module('gliist')
    .directive('removeByRoles', ['$rootScope', function($rootScope) {
        return {
            link: function(scope, element, attrs) {
                var roles = attrs.removeByRoles.split(',');
                if (roles.indexOf($rootScope.currentUser.permissions) > -1) {
                    element.remove();
                }
            }
        };            
    }]);