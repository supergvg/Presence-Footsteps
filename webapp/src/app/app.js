angular.module('gliist')
    .controller('AppController', ['$scope', '$rootScope', 'userService', '$state', 'dialogService',
        function ($scope, $rootScope, userService, $state, dialogService) {
            'use strict';

            $rootScope.$watch('currentUser', function (newValue) {
                $scope.currentUser = newValue;
            });

            $scope.credentials = {

            };

            $scope.login = function () {
                if (!$scope.credentials.username || !$scope.credentials.password) {
                    $scope.errorMessage = 'Invalid User or Password';
                    return;
                }

                userService.login($scope.credentials).then(function (res) {
                    $state.go('main');
                }, function (err) {
                    $scope.errorMessage = 'Invalid User or Password';
                    dialogService.error(err);
                });
            };

            $scope.menuItems = [
                {
                    title: 'Create Event',
                    ui_sref: 'main.create_event',
                    icon: {name: 'add_circle', style: "fill: #abcdef", size: 24 }
                },
                {
                    title: 'Current Events',
                    ui_sref: 'main.current_events',
                    icon: {name: 'today', style: "fill: #abcdef", size: 24}
                },
                {
                    title: 'Past Event',
                    ui_sref: 'main.past_events',
                    icon: {name: 'history', style: "fill: #abcdef", size: 24 }
                },
                {
                    title: 'Guest List Management',
                    ui_sref: 'main.list_management',
                    icon: {name: 'content_paste', style: "fill: #abcdef", size: 24}
                },
                {
                    title: 'Profile',
                    ui_sref: 'main.user',
                    icon: {name: 'assignment_ind', style: "fill: #abcdef", size: 24}
                }
            ];
        }]);
