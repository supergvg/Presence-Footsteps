'use strict';

angular.module('gliist')
    .controller('AppController', ['$scope', '$rootScope', 'userService', '$state', 'dialogService', '$mdSidenav', '$mdMedia',
        function ($scope, $rootScope, userService, $state, dialogService, $mdSidenav, $mdMedia) {
            $scope.credentials = {};
            $scope.hidePhoto = false;
            $scope.menuItems = [
                {
                    title: 'Create Event',
                    ui_sref: 'main.create_event',
                    icon: {src: 'assets/images/icons/create_event.png'}
                },
                {
                    title: 'Upcoming Events',
                    ui_sref: 'main.current_events',
                    icon: {src: 'assets/images/icons/upcoming_events.png'}
                },
                {
                    title: 'Guest List Management',
                    ui_sref: 'main.list_management',
                    icon: {src: 'assets/images/icons/guest_list_management.png'}
                },
                {
                    title: 'Events Stats',
                    ui_sref: 'main.stats',
                    icon: {src: 'assets/images/icons/event_stats.png'}
                },
                {
                    title: 'User Profile',
                    ui_sref: 'main.user',
                    icon: {src: 'assets/images/icons/user_profile.png'}
                }
            ];
            $rootScope.permissions = {
                manager: {
                    label: 'Manager',
                    desc: 'Same access as Admin but cant add contributor',
                    denyAccess: []
                },
                staff: {
                    label: 'Staff',
                    desc: 'Allow to check guests in and check on event stats',
                    denyAccess: ['main.create_event', 'main.list_management', 'main.edit_glist', 'main.create_list_management']
                },
                promoter: {
                    label: 'Promoter',
                    desc: 'Allow to add guests to the list he is assigned to',
                    denyAccess: ['main.create_event', 'main.user']
                }
            };

            $rootScope.$watch('currentUser', function(newValue) {
                $scope.currentUser = newValue;
                $scope.getUserPhoto();
            });

            $rootScope.$on('userUpdated', function () {
                $scope.suffix = (new Date()).getTime();

                $scope.userProfilePic = userService.getUserPhoto(null, $scope.currentUser, $scope.suffix);
            });

            $scope.getMenuItems = function() {
                if ($rootScope.isPromoter()) {
                    return [$scope.menuItems[1], $scope.menuItems[2], $scope.menuItems[3]];
                } else if ($rootScope.isStaff()) {
                    return [$scope.menuItems[1], $scope.menuItems[3], $scope.menuItems[4]];
                }
                return $scope.menuItems;
            };
            
            $rootScope.isPromoter = function() {
                if (!$rootScope.currentUser || !$rootScope.currentUser.permissions) {
                    return;
                }
                return $rootScope.currentUser.permissions.indexOf('promoter') > -1;
            };

            $rootScope.isAdmin = function() {
                if (!$rootScope.currentUser || !$rootScope.currentUser.permissions) {
                    return;
                }
                return $rootScope.currentUser.permissions.indexOf('admin') > -1;
            };

            $rootScope.isStaff = function() {
                if (!$rootScope.currentUser || !$rootScope.currentUser.permissions) {
                    return;
                }
                return $rootScope.currentUser.permissions.indexOf('staff') > -1;
            };
            
            $scope.getUserPhoto = function(height) {
                $scope.userProfilePic = userService.getUserPhoto(height, $scope.currentUser, $scope.suffix);
            };
            
            $scope.toggleSidebar = function() {
                $mdSidenav('left').toggle();
            };

            $scope.setSelected = function (item) {
                $scope.selectedMenuItem = item;
                if (!$mdMedia('gt-lg')) {
                    $mdSidenav('left').close();
                }
            };

            $scope.getItemClass = function(item) {
                if (item === $scope.selectedMenuItem) {
                    return 'item-selected';
                }
            };

            $scope.showUserBars = function(){
                if ($state.current.name.match(/^landing_.+/)) {
                    return false;
                }
                return $rootScope.currentUser;
            };

            $scope.getBg = function () {
                if ($state.current.abstract || $state.includes('home') ||
                    $state.includes('signup') || $state.includes('signup_invite') ||
                    $state.includes('recover_password') || $state.includes('reset_password')) {
                    return 'logo-bg ' + $state.current.name;
                }
                if ($state.current.name.match(/^landing_.+/)) {
                    return $state.current.name.split('_');
                }
            };

            $scope.login = function() {
                if (!$scope.credentials.username || !$scope.credentials.password) {
                    return;
                }
                $scope.fetchingData = true;
                userService.login($scope.credentials).then(
                    function() {
                        $state.go('main.welcome');
                    }, function(error) {
                        var message = (error && error.status !== 500 && error.error_description) || 'Something went wrong. Try again later please.';
                        dialogService.error(message);
                    }
                ).finally(function() {
                    $scope.fetchingData = false;
                });
            };

            $rootScope.logout = function() {
                userService.logout();
                $state.go('home');
            };

            $scope.onEnterPress = function(event) {
                if (event.which === 13 && $scope.credentials.username && $scope.credentials.password) {
                    $scope.login();
                }
            };
        }]);