angular.module('agora').directive('ngProgress', ['$parse', function ($parse) {
    'use strict';

    return {

        restrict: 'EA',

        controller: 'progressCtrl',

        scope:{
            fetchingData: "=fetchingData"
        },

        replace: true,

        templateUrl: 'common/templates/ng-progress.tpl.html'
    };

}]);