'use strict';

angular.module('gliist')
    .controller('UserDetailsCtrl', ['$scope', '$rootScope', 'userService', 'dialogService', 'uploaderService',
        function ($scope, $rootScope, userService, dialogService, uploaderService) {


            $scope.data = {
                selectedIndex: 0
            };

            $scope.getUserPhoto = function (height) {
                return userService.getUserPhoto(height, $scope.user, $scope.suffix);
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
                        $scope.suffix = (new Date()).getTime();
                        $rootScope.$broadcast('userUpdated');
                    },
                    function (err) {
                        dialogService.error("There was a problem saving your image please try again");
                    }
                ).finally(
                    function () {
                        $scope.fetchingData = false;
                    }
                );
            };

            $scope.updatePassword = function (form) {
                if (form && form.$invalid) {
                    $scope.showValidation = true;
                    return;
                }
                userService.changePassword({OldPassword: $scope.user.password,
                    NewPassword: $scope.user.new_password,
                    ConfirmPassword: $scope.user.re_password}).then(
                    function () {
                        dialogService.success('User password updated');
                        $scope.editMode = false;
                    },
                    function (err) {
                        dialogService.error(err);
                    }
                );
            };

            $scope.saveChanges = function (form) {
                if (form && form.$invalid) {
                    $scope.showValidation = true;
                    return;
                }

                userService.updateUserProfile($scope.user).then(
                    function () {
                        dialogService.success('Changes saved');
                        $scope.editMode = false;
                    },
                    function (err) {
                        dialogService.error(err);
                    }
                )
            };
        }]);
