angular.module('gliist')
    .controller('AppController', ['$scope', '$rootScope', 'userService', '$state', 'dialogService', '$mdDialog', '$mdSidenav',
        function ($scope, $rootScope, userService, $state, dialogService, $mdDialog, $mdSidenav) {
            'use strict';

            function buildToggler(navID) {
                $mdSidenav(navID).toggle();
            }

            $rootScope.$watch('currentUser', function (newValue) {
                $scope.currentUser = newValue;

                $scope.getUserPhoto();

                if (!newValue) {
                    return;
                }
            });

            $scope.hidePhoto = false;

            $rootScope.$on('userUpdated', function () {
                $scope.suffix = (new Date()).getTime();

                $scope.userProfilePic = userService.getUserPhoto(null, $scope.currentUser, $scope.suffix);
            });

            $scope.getUserPhoto = function (height) {
                $scope.userProfilePic = userService.getUserPhoto(height, $scope.currentUser, $scope.suffix);
            };

            $scope.userProfilePic_watch = function () {
                return $scope.userProfilePic;
            }


            $scope.init = function () {
                $scope.credentials = {

                };
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

            $scope.toggleSidebar = function () {
                buildToggler('left');
            };


            $scope.onKeyPress = function (keyEvent) {
                if ($scope.credentials.username && keyEvent.which === 13) {
                    $scope.login();
                }
            };

            $scope.forgotPassword = function () {
                alert('not implement!');
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
                }).finally(function () {
                        $scope.fetchingData = false
                    }
                );
            };

            $scope.setSelected = function (item) {
                $scope.selectedMenuItem = item;
            };

            $scope.getItemClass = function (item) {

                if (item === $scope.selectedMenuItem) {
                    return 'item-selected';
                }
            };

            $scope.menuItems = [
                {
                    title: 'Guest List Management',
                    ui_sref: 'main.list_management',
                    icon: {name: 'content_paste', style: "fill: white", size: 24}
                },
                {
                    title: 'Create Event',
                    ui_sref: 'main.create_event',
                    icon: {name: 'add_circle', style: "fill: white", size: 24 }
                },
                {
                    title: 'Upcoming Events',
                    ui_sref: 'main.current_events',
                    icon: {name: 'today', style: "fill: white", size: 24}
                },
                {
                    title: 'Events Statistics',
                    ui_sref: 'main.stats',
                    icon: {name: 'insert_chart', style: "fill: white", size: 24 }
                },
                {
                    title: 'User Profile',
                    ui_sref: 'main.user',
                    icon: {name: 'assignment_ind', style: "fill: white", size: 24}
                }
            ];
        }]);
