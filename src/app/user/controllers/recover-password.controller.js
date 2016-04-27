'use strict';

angular.module('gliist')
    .controller('RecoverPasswordCtrl', ['$scope', 'userService', 'dialogService',
        function ($scope, userService, dialogService) {
            $scope.recoverSent = false;
            $scope.user = {};
            
            $scope.onRecoverClicked = function() {
                if (!$scope.user.email) {
                    return;
                }
                $scope.fetchingData = true;
                userService.sendPasswordRecover($scope.user.email).then(
                    function() {
                        $scope.recoverSent = true;
                        dialogService.success('An email has been sent to your inbox, please check it for further instructions');
                    }, function() {
                        dialogService.error('Oops there was a problem please try again');
                    }
                ).finally(function() {
                    $scope.fetchingData = false;
                });
            };
        }]);