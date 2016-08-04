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
            
            $scope.showButton = function(index) {
                var subscriptionStatus = '',
                    pricePolicyType = '';
                if ($scope.isSubscribed()) {
                    subscriptionStatus = $rootScope.currentUser.subscription.status;
                    pricePolicyType = $rootScope.currentUser.subscription.pricePolicy.prices[0].type;
                }
                return $scope.allowToSelect(index) && (!$scope.plans[index].isCurrentlyUsed || ($scope.plans[index].isCurrentlyUsed && $scope.plans[index].pricePolicies.length > 1 && pricePolicyType !== 'Year')) && (subscriptionStatus === 'Active' || (subscriptionStatus !== 'Active' && $scope.planLabels[index] !== 'DOWNGRADE'));
            };
            
            $scope.getEndDate = function() {
                if ($scope.isSubscribed()) {
                    return $rootScope.currentUser.subscription.endDate;
                }
                return false;
            };
            
            $scope.isSubscribed = function() {
                return $rootScope.currentUser && $rootScope.currentUser.subscription && $rootScope.currentUser.subscription !== 'undefined';
            };

            $scope.beforeSelectPlan = function(index, event) {
                if ($scope.planLabels[index] === 'UPGRADE' && $scope.plans[index].name !== 'Pay as you go') {
                    dialogService.confirm(event, 'You are about to upgrade.<br>We will prorate your payment separately', 'UPGRADE', 'CANCEL').then(function(){
                        $scope.selectPlan(index);
                    });
                } else if ($scope.planLabels[index] === 'DOWNGRADE') {
                    var message = 'Are you sure you want to downgrade?<br>Your new plan will be in effect the next billing cycle';
                    if ($scope.isSubscribed() && $rootScope.currentUser.subscription.subscription.name === 'Monthly' && $scope.plans[index].name === 'Guest List Only') {
                        message = 'Are you sure you want to downgrade?<br>Your premium features will not be accessible after';
                    }
                    dialogService.confirm(event, message, 'YES', 'NO').then(function(){
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
                    $scope.loading = true;
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
                        $scope.loading = false;
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
                        $scope.pricePolicyKeys = [];
                        angular.forEach($scope.plans, function(plan, key){
                            $scope.pricePolicyKeys[key] = 0;
                            if (plan.isCurrentlyUsed) {
                                if ($scope.isSubscribed()) {
                                    angular.forEach(plan.pricePolicies, function(pricePolicy, index){
                                        if (pricePolicy.id !== $rootScope.currentUser.subscription.pricePolicy.id) {
                                            $scope.pricePolicyKeys[key] = index;
                                        }
                                    });
                                }
                                if (plan.pricePolicies.length === 1) {
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