angular.module('starter').controller('loginController', ['$scope', '$state', '$rootScope', '$ionicModal', 'userService', 'dialogService',
    function ($scope, $state, $rootScope, $ionicModal, userService, dialogService) {
        $scope.title = 'Login';


        $scope.credentials = {

        };

        $scope.onKeyPress = function (keyEvent) {
            if ($scope.credentials.username && keyEvent.which === 13) {
                $scope.onLoginClicked();
            }
        };

        $scope.onLoginClicked = function () {
            if (!$scope.credentials.username || !$scope.credentials.password) {
                $scope.errorMessage = 'Invalid User or Password';
                return;
            }

            userService.login($scope.credentials).then(function (res) {
                $state.go('app.home');
            }, function (err) {
                //dialogService.error(err);
            });
        };


        $scope.onForgotPasswordClick = function () {

            $ionicModal.fromTemplateUrl('app/templates/forgot-password-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.passwordModal = modal;
                $scope.passwordModal.show();
            });
        };


        $scope.closeModal = function () {
            $scope.passwordModal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.passwordModal.remove();
        });
        // Execute action on hide modal
        $scope.$on('modal.hidden', function () {
            // Execute action
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function () {
            // Execute action
        });


        $scope.init = function () {
            if (userService.getLogged()) {
                $state.go('app.home');
            }
        };
    }

]);
