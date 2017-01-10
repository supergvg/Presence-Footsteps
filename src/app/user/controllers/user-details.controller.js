'use strict';

angular.module('gliist')
  .controller('UserDetailsCtrl', ['$scope', '$rootScope', 'userService', 'dialogService', 'uploaderService',
    function ($scope, $rootScope, userService, dialogService, uploaderService) {
      var originalUser = $rootScope.currentUser;

      $scope.user = angular.copy(originalUser);

      $scope.getUserPhoto = function(height) {
        return userService.getUserPhoto(height, $scope.user);
      };

      $scope.displayErrorMessage = function (field) {
        return ($scope.showValidation) || (field && field.$touched && field.$error.required);
      };

      $scope.onFileSelect = function (files) {
        if (!files || files.length === 0) {
          return;
        }

        if (!uploaderService.isImgTypeSupported(files[0])) {
          return dialogService.error('Sorry. We do no support this format. Please use a different format.');
        }

        $scope.upload(files[0]);
      };


      $scope.upload = function (files) {
        $scope.fetchingData = true;

        uploaderService
          .upload(files)
          .then(function () {
            userService.resetCacheKey();
            $rootScope.$broadcast('userUpdated');
          }, function() {
            dialogService.error('There was a problem saving your image please try again');
          })
          .finally(function () {
            $scope.fetchingData = false;
          });
      };

      $scope.updatePassword = function(form) {
        if (form && form.$invalid) {
          $scope.showValidation = true;

          return;
        }

        userService
          .changePassword({
            OldPassword: $scope.user.password,
            NewPassword: $scope.user.new_password,
            ConfirmPassword: $scope.user.re_password
          })
          .then(function() {
            dialogService.success('User password updated');
            $scope.editMode = false;
          }, function(error) {
            var message = error.Message || 'Oops there was an error, please try again';

            if (error && error.ModelState && error.ModelState[''] && error.ModelState[''][0]) {
              message = error.ModelState[''][0];
            }

            dialogService.error(message);
          });
      };

      $scope.cancel = function () {
        $scope.editMode = false;
        $scope.user = angular.copy(originalUser);
      };

      $scope.saveChanges = function(form) {
        if (form && form.$invalid) {
          $scope.showValidation = true;

          return;
        }

        userService
          .updateUserProfile($scope.user)
          .then(function() {
            dialogService.success('Changes saved');
            angular.extend(originalUser, $scope.user);
            $scope.editMode = false;
          }, function(err) {
            dialogService.error(err);
          });
      };
    }]);
