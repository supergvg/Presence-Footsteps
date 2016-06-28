'use strict';

angular.module('gliist')
    .controller('WelcomeController', ['$scope', '$mdDialog', '$mdMedia', '$rootScope', '$anchorScroll', '$location', '$timeout', '$window', 'userService', 'dialogService',
        function($scope, $mdDialog, $mdMedia, $rootScope, $anchorScroll, $location, $timeout, $window, userService, dialogService) {
            $scope.options = {
                limit: 3,
                readyOnly: true
            };
            $scope.hideArrow = false;
            $timeout(function(){
                if ($rootScope.currentUser && $rootScope.currentUser.IsFirstLogin && !$rootScope.isPromoter()) {
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
                        if ($rootScope.isStaff()) {
                            top = 389;
                        }
                        return {
                            top: (top - $window.scrollY) +'px',
                            display: $mdMedia('gt-lg') && !$scope.hideArrow ? 'block' : 'none'
                        };
                    };
                    $location.hash('bottom');
                    $anchorScroll();
                    $mdDialog.show({
                        scope: scope,
                        templateUrl: 'app/templates/welcome-popup.html'
                    });
                }
            }, 500);
        }
    ]);
