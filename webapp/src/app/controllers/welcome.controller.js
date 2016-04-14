'use strict';

angular.module('gliist')
    .controller('WelcomeController', ['$scope', '$mdDialog', '$mdMedia', '$rootScope',
        function($scope, $mdDialog, $mdMedia, $rootScope) {
            $scope.options = {
                limit: 3,
                readyOnly: true
            };
            if ($rootScope.firstLogin) {
                var scope = $scope.$new();
                scope.close = function() {
                    $mdDialog.hide();
                };
                scope.showArrow = function() {
                    return $mdMedia('gt-lg');
                };
                $mdDialog.show({
                    scope: scope,
                    templateUrl: 'app/templates/welcome-popup.html'
                }); 
            }
        }
    ]);
