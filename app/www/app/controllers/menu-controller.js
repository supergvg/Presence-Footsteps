angular.module('starter').controller('menuController', ['$scope', '$ionicSideMenuDelegate',

    function ($scope, $ionicSideMenuDelegate) {

        $scope.getUserPhoto = function (height) {
            return {
                'background-image': 'url(../img/blank_user_icon.png)',
                'background-position': 'center center',
                'height': height || '250px',
                'background-size': 'cover'
            };
        };

        $scope.menuItems = [
            {
                text: 'Current Events',
                href: '#/app/search'
            },
            {
                text: 'Past Events',
                href: '#/app/search'
            },
            {
                text: 'Stats',
                href: '#/app/search'
            },
            {
                text: 'Alerts',
                href: '#/app/search'
            },
            {
                text: 'Profile',
                href: '#/app/search'
            },
            {
                text: 'Logout',
                href: '#/app/search'
            }
        ];

    }]);
