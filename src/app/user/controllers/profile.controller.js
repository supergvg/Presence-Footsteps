'use strict';

angular.module('gliist')
    .controller('ProfileCtrl', ['$scope', '$rootScope', 'userService', 'dialogService', '$stateParams',
        function ($scope, $rootScope, userService, dialogService, $stateParams) {
            $rootScope.$watch('currentUser', function(newValue) {
                $scope.currentUser = angular.copy(newValue);
            });
            $scope.selectedIndex = 0;
            if ($stateParams.view) {
                $scope.selectedIndex = parseInt($stateParams.view);
            }

            $scope.getSelected = function(idx) {
                return $scope.selectedIndex === idx ? 'active' : '';
            };

            $scope.next = function(ev) {
                if (ev.pointer.type === 't') {
                    $scope.selectedIndex = Math.min($scope.selectedIndex + 1, 1);
                }
            };
            $scope.previous = function(ev) {
                if (ev.pointer.type === 't') {
                    $scope.selectedIndex = Math.max($scope.selectedIndex - 1, 0);
                }
            };

            $scope.link = function() {
                userService.updateCompanySocialLinks($scope.currentUser).then(function(){
                    dialogService.success('Social links saved');
                }, function(data) {
                    dialogService.error(data.Message);
                });
            };
        }
    ]);
