'use strict';

angular.module('gliist')
    .controller('UserDetailsCtrl', ['$scope', '$rootScope', 'userService', 'dialogService', 'uploaderService', '$mdDialog',
        function ($scope, $rootScope, userService, dialogService, uploaderService, $mdDialog) {


            $rootScope.$watch('currentUser', function (newValue) {
                $scope.currentUser = angular.copy(newValue);
            });

            $scope.data = {
                selectedIndex: 0
            };

            $scope.getUserPhoto = function (height) {
                return userService.getUserPhoto(height, $scope.currentUser);
            };

            $scope.displayErrorMessage = function (field) {
                return ($scope.showValidation) || (field.$touched && field.$error.required);
            };

            $scope.onFileSelect = function (files) {
                if (!files || files.length === 0) {
                    return;
                }
                $scope.upload(files[0]);
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
        }]);
