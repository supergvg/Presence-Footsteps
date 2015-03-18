angular.module('agora').
    controller('progressCtrl', ['$scope', '$timeout',
        function ($scope, $timeout) {
            'use strict';

            $scope.tick = function () {

                if (!$scope.fetchingData) {
                    return;
                }

                $scope.dynamicObject.value += 1;
                $timeout($scope.tick, 500);
            };

            $scope.dynamicObject = {
                value: 0,
                type: 'success'
            };


            $scope.$watch('fetchingData', function () {
                if ($scope.fetchingData) {
                    $scope.tick();
                }
            });

        }]);

