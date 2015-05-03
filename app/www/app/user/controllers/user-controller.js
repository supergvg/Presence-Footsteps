angular.module('starter').controller('userController', ['$scope', 'userService', '$rootScope' , 'dialogService',

    function ($scope, userService, $rootScope, dialogService) {

        $rootScope.$watch('currentUser', function (newValue) {
            $scope.currentUser = newValue;

        });

        $scope.onSaveChangesClicked = function () {
            alert('not implement!');
        };

        $scope.getUserPhoto = function (height) {
            return userService.getUserPhoto('250px', $rootScope.currentUser);
        };

        $scope.init = function () {


        };
    }
]);
