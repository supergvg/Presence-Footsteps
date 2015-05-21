angular.module('starter').controller('menuController', ['$scope', '$ionicSideMenuDelegate', 'userService', '$state', '$rootScope',

    function ($scope, $ionicSideMenuDelegate, userService, $state, $rootScope) {

        $rootScope.$watch('title', function (newValue) {
            $scope.title = newValue;
        });

        $rootScope.$watch('currentUser', function (newVal) {
            $scope.userProfilePic = userService.getUserPhoto('250px', $rootScope.currentUser);
        });

        $scope.getUserPhoto = function (height) {
            $scope.userProfilePic = userService.getUserPhoto('250px', $rootScope.currentUser);
        };

        $scope.userProfilePic_watch = function () {
            return $scope.userProfilePic;
        }

        $scope.logout = function () {
            userService.logout();
            $state.go('login');
        };

        $scope.menuItems = [
            {
                text: 'Current Events',
                href: '#/app/home',
                icon: 'icon ion-ios-download-outline'
            },
            /*{
             text: 'Stats',
             href: '#/app/stats',
             icon: 'ion-pie-graph'
             },
             {
             text: 'Alerts',
             href: '#/app/alerts',
             icon: 'ion-ios-bell'
             },*/
            {
                text: 'Profile',
                href: '#/app/profile',
                icon: 'icon ion-person'
            }
        ];

    }]);
