'use strict';

angular.module('gliist')
    .controller('SignupCtrl', ['$scope', '$mdDialog', 'userService', 'dialogService', '$state',
        function ($scope, $mdDialog, userService, dialogService, $state) {

            $scope.createUser = {};


            $scope.hide = function () {
                $scope.createUser.username = null;
                $scope.createUser.password = null;
                $scope.createUser.confirmPassword = null;
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.register = function () {
                $scope.fetchingData = true;
                userService.registerEmail($scope.createUser).then(function () {
                    $scope.hide();
                    $state.go('main');
                }, function (err) {
                    dialogService.error(JSON.stringify(err));
                    dialogService.error('There was a problem signing up, please try again');
                }).
                    finally(
                    function () {
                        $scope.fetchingData = false;
                    }
                );
            };

        }]);
