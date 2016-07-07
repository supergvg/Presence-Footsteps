'use strict';

angular.module('gliist')
    .controller('SubscriptionsCtrl', ['$scope', 'subscriptionsService', 'dialogService', '$rootScope', '$state',
        function($scope, subscriptionsService, dialogService, $rootScope, $state) {
            $scope.loading = true;
            $scope.plans = [];
            $scope.pricePolicyKeys = [];
            $scope.options = $scope.options || {};
            
            subscriptionsService.getSubscriptions().then(
                function(data) {
                    $scope.plans = data.data;
                }
            ).finally(function(){
                $scope.loading = false; 
            });
            
            $scope.allowToSelect = function(index) {
                return $scope.plans[index].pricePolicies.length > 0;
            };
            
            $scope.buttonLabel = function() {
                if ($scope.isSubscribed() && $rootScope.currentUser.subscription.subscription && $rootScope.currentUser.subscription.subscription.name === 'Basic') {
                    return 'UPGRADE';
                }
                return 'SELECT';
            };
            
            $scope.isSubscribed = function() {
              return $rootScope.currentUser && $rootScope.currentUser.subscription && $rootScope.currentUser.subscription !== 'undefined';
            };
            
            $scope.selectPlan = function(index) {
                var selectedPlan = $scope.plans[index],
                    pricePolicyKey = $scope.pricePolicyKeys[index],
                    pricePolicy = selectedPlan.pricePolicies[pricePolicyKey];
                
                if (pricePolicy.prices[0].amount > 0 && selectedPlan.name !== 'Pay as you go') {
                    subscriptionsService.paymentPopup(selectedPlan, pricePolicyKey);
                } else {
                    $scope.waiting = true;
                    subscriptionsService.setUserSubscription({
                        subscriptionId: selectedPlan.id,
                        pricePolicyId: pricePolicy.id
                    }).then(
                        function(response){
                            $rootScope.currentUser.subscription = response.data.subscription;
                            $state.go('main.welcome');
                        },
                        function(rejection){
                            dialogService.confirm(null, rejection.data.message, 'OK', '');
                        }
                    ).finally(function(){
                        $scope.waiting = false;
                    });
                }
            };
        }
    ]);