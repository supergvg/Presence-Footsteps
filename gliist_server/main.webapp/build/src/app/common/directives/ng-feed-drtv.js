angular.module('agora').directive('ngFeed', ['$parse', function ($parse) {
    'use strict';

    return {

        restrict: 'EA',

        controller: 'feedCtrl',

        replace: true,

        templateUrl: 'common/templates/ng-feed.tpl.html'
    };

}]);