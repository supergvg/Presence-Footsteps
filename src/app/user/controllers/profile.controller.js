'use strict';

angular.module('gliist')
    .controller('ProfileCtrl', ['$scope', '$rootScope', 'userService', 'dialogService',
        function ($scope, $rootScope, userService, dialogService) {
            $rootScope.$watch('currentUser', function(newValue) {
                $scope.currentUser = angular.copy(newValue);
            });
            $scope.selectedIndex = 0;
            $scope.getSelected = function(idx) {
                return ($scope.selectedIndex === idx ? 'active' : '');
            };

            $scope.next = function() {
                $scope.selectedIndex = Math.min($scope.selectedIndex + 1, 1);
            };
            $scope.previous = function() {
                $scope.selectedIndex = Math.max($scope.selectedIndex - 1, 0);
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
