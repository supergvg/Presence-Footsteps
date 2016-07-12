'use strict';

angular.module('gliist')
    .controller('SubscriptionsCtrl', ['$scope', 'subscriptionsService', 'dialogService', '$rootScope', '$state',
        function($scope, subscriptionsService, dialogService, $rootScope, $state) {
            $scope.plans = [];
            $scope.pricePolicyKeys = [];
            $scope.options = $scope.options || {};
            $scope.planLabels = [];
            
            $rootScope.$watch('currentUser.subscription', function(newValue) {
                if (!newValue) {
                    return;
                }
                $scope.getSubscriptions();
            });
            
            $scope.allowToSelect = function(index) {
                return $scope.plans[index].pricePolicies.length > 0;
            };
            
            $scope.isSubscribed = function() {
              return $rootScope.currentUser && $rootScope.currentUser.subscription && $rootScope.currentUser.subscription !== 'undefined';
            };

            $scope.beforeSelectPlan = function(index, event) {
                if ($scope.planLabels[index] === 'UPGRADE') {
                    dialogService.confirm(event, 'You are about to upgrade.<br>We will prorate your payment separately', 'UPGRADE', 'CANCEL').then(function(){
                        $scope.selectPlan(index);
                    });
                } else if ($scope.planLabels[index] === 'DOWNGRADE') {
                    dialogService.confirm(event, 'Are you sure you want to downgrade?<br>You plan will be downgraded on the next billing period', 'YES', 'NO').then(function(){
                        $scope.selectPlan(index);
                    });
                } else {
                    $scope.selectPlan(index);
                }
            };
            
            $scope.selectPlan = function(index) {
                var selectedPlan = $scope.plans[index],
                    pricePolicyKey = $scope.pricePolicyKeys[index],
                    pricePolicy = selectedPlan.pricePolicies[pricePolicyKey];
                
                if ((pricePolicy.prices[0].amount > 0 || selectedPlan.usedPromoCode) && selectedPlan.name !== 'Pay as you go') {
                    subscriptionsService.paymentPopup(selectedPlan, pricePolicyKey);
                } else {
                    $scope.waiting = true;
                    subscriptionsService.setUserSubscription({
                        subscriptionId: selectedPlan.id,
                        pricePolicyId: pricePolicy.id
                    }).then(
                        function(response){
                            $rootScope.currentUser.subscription = response.data.subscription;
                            if ($state.current.name === 'choose_plan') {
                                $state.go('main.welcome');
                            }
                        },
                        function(rejection){
                            dialogService.confirm(null, rejection.data.message, 'OK', '');
                        }
                    ).finally(function(){
                        $scope.waiting = false;
                    });
                }
            };
            
            $scope.getSubscriptions = function() {
                $scope.loading = true;
                subscriptionsService.getSubscriptions().then(
                    function(data) {
                        $scope.plans = data.data;
                        var label = 'DOWNGRADE';
                        if (!$scope.isSubscribed()) {
                            label = 'SELECT';
                        }
                        angular.forEach($scope.plans, function(plan){
                            if (plan.isCurrentlyUsed) {
                                label = 'UPGRADE';
                            }
                            $scope.planLabels.push(label);
                        });
                    }
                ).finally(function(){
                    $scope.loading = false; 
                });
            };
            $scope.getSubscriptions();
        }
    ]);