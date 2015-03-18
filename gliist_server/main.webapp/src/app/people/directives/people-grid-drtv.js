angular.module('agora').directive('peopleGrid', ['$parse', function ($parse) {
    'use strict';

    return {

        restrict: 'EA',

        controller: 'peopleGridCtrl',

        scope: {
            data: '=data',
            title: '@title'
        },

        replace: true,

        templateUrl: 'people/templates/people-grid.tpl.html'
    };

}]);