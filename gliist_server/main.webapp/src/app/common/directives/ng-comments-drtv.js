angular.module('agora').directive('ngComments', ['$parse', function ($parse) {
    'use strict';

    return {

        restrict: 'EA',

        replace: true,

        templateUrl: 'common/templates/comments.tpl.html',
    };

}]);