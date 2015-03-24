angular.module('starter').controller('menuController', ['$scope', '$ionicSideMenuDelegate',

    function ($scope, $ionicSideMenuDelegate) {


        $scope.menuItems = [
            {
                text: 'Upcoming Events',
                href: '#/app/search'
            },
            {
                text: 'Past Events',
                href: '#/app/search'
            },
            {
                text: 'Add Guests',
                href: '#/app/search'
            },
            {
                text: 'Profile',
                href: '#/app/search'
            },
            {
                text: 'Stats',
                href: '#/app/search'
            },
            {
                text: 'Cancel Event',
                href: '#/app/search'
            }
        ];

    }]);
