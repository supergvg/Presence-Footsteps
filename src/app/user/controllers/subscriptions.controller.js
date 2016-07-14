'use strict';

angular.module('gliist')
    .controller('SubscriptionsCtrl', ['$scope', 'subscriptionsService', 'dialogService', '$rootScope', '$state',
        function($scope, subscriptionsService, dialogService, $rootScope, $state) {
            $scope.plans = [];
            $scope.pricePolicyKeys = [];
            $scope.options = $scope.options || {};
            $scope.planLabels = [];
            
            $scope.allowToSelect = function(index) {
                return $scope.plans[index].pricePolicies.length > 0;
            };
            
            $scope.getCurrenPricePolicyId = function() {
                if ($rootScope.currentUser && $rootScope.currentUser.subscription) {
                    return $rootScope.currentUser.subscription.pricePolicy.id;
                }
                return false;
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
                    subscriptionsService.paymentPopup(selectedPlan, pricePolicyKey, $scope.getSubscriptions);
                } else {
                    $scope.waiting = true;
                    subscriptionsService.setUserSubscription({
                        subscriptionId: selectedPlan.id,
                        pricePolicyId: pricePolicy.id
                    }).then(
                        function(response){
                            $rootScope.currentUser.subscription = response.data;
                            if ($state.current.name === 'choose_plan') {
                                if ($rootScope.currentUser.subscription.subscription.name === 'Pay as you go') {
                                    dialogService.confirm(null, 'Payment is not required now until you create an event.', 'Ok').then(function(){
                                        $state.go('main.welcome');
                                    });
                                } else {
                                    $state.go('main.welcome');
                                }
                            } else {
                                $scope.getSubscriptions();
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
                        $scope.planLabels = [];
                        angular.forEach($scope.plans, function(plan){
                            if (plan.isCurrentlyUsed) {
                                if (plan.pricePolicies.length > 1) {
                                    $scope.planLabels.push('UPDATE');
                                } else {
                                    $scope.planLabels.push('ACTIVE');
                                }
                                label = 'UPGRADE';
                            } else {
                                $scope.planLabels.push(label);
                            }
                        });
                    }
                ).finally(function(){
                    $scope.loading = false; 
                });
            };
            $scope.getSubscriptions();
        }
    ]);