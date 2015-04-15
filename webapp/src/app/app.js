angular.module('gliist')
    .controller('AppController', ['$scope', '$rootScope', 'userService', '$state', 'dialogService', '$mdDialog',
        function ($scope, $rootScope, userService, $state, dialogService, $mdDialog) {
            'use strict';

            $rootScope.$watch('currentUser', function (newValue) {
                $scope.currentUser = newValue;

                angular.element('#loading').remove();

                if (!newValue) {
                    return;
                }
            });

            $rootScope.$on('userUpdated', function () {
            });

            $scope.getUserPhoto = function (height) {
                var bgImg;
                if ($scope.currentUser) {
                    bgImg = window.redirectUrl + "/api/account/ProfilePicture/?userId=" + $scope.currentUser.userId;
                    bgImg = "url(" + bgImg + ")";
                } else {
                    bgImg = "url('assets/images/blank_user_icon.png')";
                }

                return {
                    'background-image': bgImg,
                    'background-position': 'center center',
                    'height': height || '250px',
                    'background-size': 'cover'
                };
            };

            $scope.credentials = {

            };

            $scope.signUp = function (ev) {
                $mdDialog.show({
                    controller: 'SignupCtrl',
                    templateUrl: 'app/templates/dialogs/signup-dialog.tmpl.html',
                    targetEvent: ev
                })
                    .then(function (answer) {
                        $scope.alert = 'You said the information was "' + answer + '".';
                    }, function () {
                        $scope.alert = 'You cancelled the dialog.';
                    });
            };


            $scope.logout = function () {
                userService.logout();
                $state.go('home');
            };

            $scope.login = function () {
                if (!$scope.credentials.username || !$scope.credentials.password) {
                    $scope.errorMessage = 'Invalid User or Password';
                    return;
                }

                $scope.fetchingData = true;

                userService.login($scope.credentials).then(function (res) {
                    $state.go('main');
                }, function (err) {
                    $scope.errorMessage = 'Invalid User or Password';
                    dialogService.error(err);
                }).finally(function () {
                        $scope.fetchingData = false
                    }
                );
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
                    title: 'Event Statistics',
                    ui_sref: 'main.stats',
                    icon: {name: 'account_balance', style: "fill: #abcdef", size: 24}
                },
                {
                    title: 'User Profile',
                    ui_sref: 'main.user',
                    icon: {name: 'assignment_ind', style: "fill: #abcdef", size: 24}
                }
            ];
        }]);
