'use strict';

angular.module('gliist')
    .controller('SubscriptionsCtrl', ['$scope', 'subscriptionsService',
        function($scope, subscriptionsService) {
            $scope.loading = true;
            $scope.plans = [];
            $scope.combinedPlanWith = {};
            
            subscriptionsService.getAllSubscriptions().then(
                function(data){
                    $scope.plans = data.plans;
                    $scope.combinedPlanWith = data.combinedPlanWith;
                }
            ).finally(function(){
               $scope.loading = false; 
            });
        }]);
