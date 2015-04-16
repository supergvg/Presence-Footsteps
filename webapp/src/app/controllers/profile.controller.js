'use strict';

angular.module('gliist')
    .controller('ProfileCtrl', ['$scope', '$rootScope', 'userService', 'dialogService', 'uploaderService', '$mdDialog',
        function ($scope, $rootScope, userService, dialogService, uploaderService, $mdDialog) {


            $rootScope.$watch('currentUser', function (newValue) {
                $scope.currentUser = angular.copy(newValue);
            });

            $scope.data = {
                selectedIndex: 1
            };

            $scope.linkNewAccount = function (ev) {
                var scope = $scope.$new();
                scope.currentEvent = event;
                scope.cancel = $scope.cancel;
                scope.save = $scope.save;

                $mdDialog.show({
                    controller: 'InviteUserCtrl',
                    scope: scope,
                    templateUrl: 'app/templates/user-profile/link-account-dialog.html',
                    targetEvent: ev
                });
            };

            $scope.displayErrorMessage = function (field) {
                return ($scope.showValidation) || (field.$touched && field.$error.required);
            };

            $scope.upload = function (files) {
                $scope.fetchingData = true;
                uploaderService.upload(files).then(function () {
                        $rootScope.$broadcast('userUpdated');
                    },
                    function (err) {
                        dialogService.error("There was a problem saving your image please try again");
                    }
                ).finally(
                    function () {
                        $scope.fetchingData = false;
                    }
                )
            };

            $scope.saveChanges = function (form) {
                if (form && form.$invalid) {
                    $scope.showValidation = true;
                    return;
                }

                userService.updateUserProfile($scope.currentUser).then(
                    function () {
                        dialogService.success('Changes saved');
                    },
                    function (err) {
                        dialogService.error(err);
                    }
                )
            };


            $scope.next = function () {
                $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2);
            };
            $scope.previous = function () {
                $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
            };
        }]);
