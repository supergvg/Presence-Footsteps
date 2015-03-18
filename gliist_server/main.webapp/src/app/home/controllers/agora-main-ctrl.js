

angular.module('agora').
    controller('agoraMainCtrl', ['$scope', '$rootScope', '$state', '$location', 'appStateService', 'authenticationService',
        function ($scope, $rootScope, $state, $location, appStateService, authenticationService) {
            'use strict';
            $scope.youlike = [{ name: 'Rihanna', source: ['instagram'] },
            { name: 'Assi Azar', source: ['fb', 'instagram'] }];


            $scope.recommended = [{ name: 'Justin Biber', source: ['instagram'] },
          { name: 'Eyal Golan', source: ['fb', 'instagram'] }];

            $scope.closeAlert = function (index) {
                $rootScope.alerts.splice(index, 1);
            };

            $scope.post = function () {
                prompt('post1');
            };

            $scope.globalQueryString = '';


            //http://www.grobmeier.de/angular-js-autocomplete-and-enabling-a-form-with-watch-and-blur-19112012.html#.UuZO2hD8KUk
            $scope.globalSearch = function () {
                $state.go('interests-result', { searchQuery: $scope.globalQueryString });
            };

            $scope.queryString = '';

            $scope.$on('$stateChangeSuccess', function () {
                $scope.isCollapsed = true;
            });

            $scope.search = function () {
                appStateService.getSearchParams().queryString = $scope.queryString;
                $location.path('/interests-result');
            };
        }]);

