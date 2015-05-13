'use strict';

angular.module('gliist')
    .controller('EditGLEventCtrl', ['$scope', '$stateParams', 'dialogService', '$state',
        function ($scope, $stateParams, dialogService, $state) {

            $scope.init = function () {
                $scope.gliId = $stateParams.gli;
            };

            $scope.init();

        }]);
