
//http://www.directiv.es/angular-round-progress-directive
angular.module('agora').
    controller('newsCtrl', ['$scope',
        function ($scope) {
            'use strict';

            $scope.person = "me";

            $scope.click = function () {
                $scope.isCollapsed = !$scope.isCollapsed;
            };
        }]);

