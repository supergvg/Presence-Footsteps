'use strict';

angular.module('gliist')
    .controller('SignupCtrl', ['$scope', '$mdDialog', 'userService', 'dialogService', '$state',
        function ($scope, $mdDialog, userService, dialogService, $state) {

            $scope.user = {};


            $scope.hide = function () {
                $scope.user.username = null;
                $scope.user.password = null;
                $scope.user.confirmPassword = null;
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.register = function () {
                $scope.fetchingData = true;
                userService.registerEmail($scope.user).then(function () {
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
