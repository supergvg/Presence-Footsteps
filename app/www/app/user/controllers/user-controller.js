angular.module('starter').controller('userController', ['$scope', 'userService', '$rootScope' , 'dialogService',

    function ($scope, userService, $rootScope, dialogService) {

        $rootScope.$watch('currentUser', function (newValue) {
            $scope.currentUser = newValue;

        });

        $scope.onSaveChangesClicked = function () {

            userService.updateUserProfile($scope.currentUser).then(
                function () {
                    dialogService.success('Changes saved');
                    $scope.editMode = false;
                },
                function (err) {
                    dialogService.error(err);
                }
            )

        };

        $scope.getUserPhoto = function (height) {
            return userService.getUserPhoto('250px', $rootScope.currentUser);
        };

        $scope.init = function () {


        };
    }
]);
