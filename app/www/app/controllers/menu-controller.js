angular.module('starter').controller('menuController', ['$scope', '$ionicSideMenuDelegate', 'userService', '$state', '$rootScope',

    function ($scope, $ionicSideMenuDelegate, userService, $state, $rootScope) {

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
                href: '#/app/home'
            },
            {
                text: 'Past Events',
                href: '#/app/past_events'
            },
            {
                text: 'Stats',
                href: '#/app/stats'
            },
            /*{
             text: 'Alerts',
             href: '#/app/search'
             },*/
            {
                text: 'Profile',
                href: '#/app/profile'
            }
        ];

    }]);
