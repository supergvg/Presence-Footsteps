'use strict';

angular.module('gliist')
  .controller('WelcomeController', ['$scope', '$mdDialog', '$mdMedia', '$rootScope', '$anchorScroll', '$location', '$timeout', '$window', 'userService', 'dialogService', 'permissionsService',
    function($scope, $mdDialog, $mdMedia, $rootScope, $anchorScroll, $location, $timeout, $window, userService, dialogService, permissionsService) {
      $scope.options = {
        limit: 3,
        readyOnly: true,
        showInactive: true
      };
      $scope.hideArrow = false;
      var init = $scope.$watch('currentUser', function(newVal) {
        if (newVal && angular.isDefined(newVal)) {
          init(); //destroy $watch

          var permissions = $rootScope.currentUser.permissions;
          $scope.permissionTitle = ' - ' + permissionsService.roles[permissions].label;
          $scope.permissionTitle += permissions === 'admin' ? ' Account' : ' Access';
          $timeout(function(){
            if ($rootScope.currentUser.IsFirstLogin && permissionsService.isRole('admin')) {
              var scope = $scope.$new();
              scope.close = function() {
                $scope.hideArrow = true;
                $mdDialog.hide();
                userService.markCurrentUserAsLoggedInAtLeastOnce().then(
                  function(){
                    $rootScope.currentUser.IsFirstLogin = false;
                  }, function(error){
                    if (error && error.message) {
                      dialogService.error(error.message);
                    }
                  }
                );
              };
              scope.getStyles = function() {
                var top = 549;
                return {
                  top: (top - $window.scrollY) +'px',
                  display: $mdMedia('gt-lg') && !$scope.hideArrow ? 'block' : 'none'
                };
              };
              if ($mdMedia('gt-lg')) {
                $location.hash('bottom');
                $anchorScroll();
              }
              $mdDialog.show({
                scope: scope,
                templateUrl: 'app/templates/welcome-popup.html'
              });
            }
          }, 500);
        }
      });
    }
  ]);
