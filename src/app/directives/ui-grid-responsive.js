'use strict';

angular.module('gliist')
    .directive('uiGridResponsive', [function() {
        return {
            restrict: 'EA',
            scope: {
                options: '=?'
            },
            controller: 'UIGridResponsiveCtrl',
            replace: true,
            templateUrl: 'app/templates/ui-grid-responsive.tmpl.html'
        };
    }]);