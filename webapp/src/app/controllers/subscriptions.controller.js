'use strict';

angular.module('gliist')
    .controller('SubscriptionsCtrl', ['$scope', 'subscriptionsService',
        function($scope, subscriptionsService) {
            $scope.loading = true;
            $scope.plans = [];
            subscriptionsService.getAllSubscriptions().then(
                function(data){
                    $scope.plans = data;
                    $scope.plans = [];
                }
            ).finally(function(){
               $scope.loading = false; 
            });
        }]);
