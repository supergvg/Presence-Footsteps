'use strict';

angular.module('gliist')
    .controller('ProfileCtrl', ['$scope', '$rootScope', 'userService', 'dialogService', '$stateParams',
        function ($scope, $rootScope, userService, dialogService, $stateParams) {


            $rootScope.$watch('currentUser', function (newValue) {
                $scope.currentUser = angular.copy(newValue);
            });
            $scope.data = {
                selectedIndex: 0
            };
            if ($stateParams.view) {
                $scope.data.selectedIndex = parseInt($stateParams.view);
            }

            $scope.displayErrorMessage = function (field) {
                return ($scope.showValidation) || (field.$touched && field.$error.required);
            };

            $scope.getSelected = function (idx) {
                if ($scope.data.selectedIndex === idx) {
                    return 'logo-bg';
                }

            };


            $scope.saveChanges = function (form) {
                if (form && form.$invalid) {
                    $scope.showValidation = true;
                    return;
                }

                userService.updateUserProfile($scope.currentUser).then(
                        function () {
                            dialogService.success('Changes Saved');
                        },
                        function (err) {
                            dialogService.error(err);
                        }
                );
            };

            $scope.next = function () {
                $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 1);
            };
            $scope.previous = function () {
                $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
            };

            $scope.link = function () {
                userService.updateCompanySocialLinks($scope.currentUser).then(function(){
                    dialogService.success('Social links saved');
                }, function(data) {
                    dialogService.error(data.Message);
                });
            };
        }
    ]);
