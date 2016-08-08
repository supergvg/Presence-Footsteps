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
                    $scope.permissionTitle = ' - ' + $rootScope.currentUser.permissions.charAt(0).toUpperCase() + $rootScope.currentUser.permissions.slice(1).toLowerCase();
                    if ($rootScope.currentUser.permissions === 'admin') {
                        $scope.permissionTitle += ' Account';
                    } else {
                        $scope.permissionTitle += ' Access';
                    }
                    $timeout(function(){
                        if ($rootScope.currentUser.IsFirstLogin && !permissionsService.isRole('promoter')) {
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
                                if (permissionsService.isRole('staff')) {
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
            });
        }
    ]);
