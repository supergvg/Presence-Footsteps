'use strict';

angular.module('gliist')
    .controller('SubscriptionsCtrl', ['$scope', 'subscriptionsService', '$mdDialog', 'dialogService', '$rootScope', '$state', 'paymentsService',
        function($scope, subscriptionsService, $mdDialog, dialogService, $rootScope, $state, paymentsService) {
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
                if ($rootScope.currentUser.subscription.subscription.name === 'Basic') {
                    return 'UPGRADE';
                }
                return 'SELECT';
            };
            
            $scope.isSubscribed = function() {
              return $rootScope.currentUser.subscription !== 'undefined';
            };
            
            $scope.selectPlan = function(index) {
                var scope = $scope.$new(),
                    setSubscriptionError = function(rejection) {
                        dialogService.confirm(null, rejection.data.message, 'OK', '');
                    };
                
                scope.selectedPlan = $scope.plans[index];
                scope.pricePolicyKey = $scope.pricePolicyKeys[index];
                scope.pricePolicy = scope.selectedPlan.pricePolicies[scope.pricePolicyKey];
                scope.pricePolicyBeforePromo = null;
                if (scope.pricePolicy.prices[0].amount > 0) {
                    scope.cardDataLoaded = false;
                    scope.cardDataSaved = {};
                    scope.loadingCard = true;
                    paymentsService.getCard().then(
                        function(data) {
                            if (data.data) {
                                scope.cardData = data.data;
                                scope.cardDataSaved.number = scope.cardData.number;
                                scope.cardData.number = '';
                                scope.cardData.cvc = '';
                                scope.cardDataLoaded = true;
                            }
                        }
                    ).finally(function(){
                        scope.loadingCard = false;
                    });
                    scope.close = function() {
                        $mdDialog.hide();
                    };
                    scope.promo = {
                        applied: false,
                        invalid: false
                    };
                    scope.applyPromo = function() {
                        var code = scope.promo.code ? scope.promo.code.trim() : '';
                        if (code !== '') {
                            scope.promo.invalid = false;
                            $scope.waiting = true;
                            subscriptionsService.applyPromo(code).then(
                                function(response) {
                                    if (response.dataTotalCount === 0) {
                                        scope.promo.invalid = true;
                                    } else {
                                        scope.promo.code = code;
                                        scope.promo.applied = true;
                                        scope.pricePolicyBeforePromo = scope.pricePolicy;
                                        scope.selectedPlan = response.data;
                                        scope.pricePolicy = scope.selectedPlan.pricePolicies[scope.pricePolicyKey];
                                    }
                                }
                            ).finally(function(){
                                $scope.waiting = false;
                            });
                        }
                    };
                    scope.undoPromo = function() {
                        var code = scope.promo.code ? scope.promo.code.trim() : '';
                        if (code !== '') {
                            $scope.waiting = true;
                            subscriptionsService.applyPromo(code).then(
                                function(response) {
                                    if (response.dataTotalCount === 0) {
                                        scope.promo.invalid = true;
                                    } else {
                                        scope.promo.applied = false;
                                        scope.pricePolicyBeforePromo = null;
                                        scope.selectedPlan = response.data;
                                        scope.pricePolicy = scope.selectedPlan.pricePolicies[scope.pricePolicyKey];
                                    }
                                }
                            ).finally(function(){
                                $scope.waiting = false;
                            });
                        }
                    };
                    scope.process = function(form){
                        var errorMessage = [],
                            newCard = scope.cardDataLoaded && form.number.$viewValue !== '';
                        if (form && form.$invalid && (!scope.cardDataLoaded || newCard)) {
                            var errors = {
                                required: {
                                    number: 'Please Enter Card Number',
                                    cvc: 'Please Enter Card CVC Code',
                                    exp_month: 'Please Enter Card Expiration Month',
                                    exp_year: 'Please Enter Card Expiration Year'
                                },
                                pattern: {
                                    number: 'Please Enter Correct Card Number',
                                    cvc: 'Please Enter Correct Card CVC Code',
                                    exp_month: 'Please Enter Correct Card Expiration Month',
                                    exp_year: 'Please Enter Correct Card Expiration Year'
                                },
                                max: {
                                    exp_month: 'Please Enter Correct Card Expiration Month'
                                },
                                min: {
                                    exp_year: 'Please Enter Correct Card Expiration Year'
                                }
                            };
                            angular.forEach(form.$error, function(value, key){
                                if (errors[key]) {
                                    angular.forEach(value, function(value1){
                                        if (errors[key][value1.$name]) {
                                            errorMessage.push(errors[key][value1.$name]);
                                        }
                                    });
                                }
                            });
                        }
                        if (!scope.terms) {
                            errorMessage.push('You must accept terms and conditions');
                        }
                        if (errorMessage.length > 0) {
                            dialogService.error(errorMessage.join(', '));
                            return;
                        }
                        var subscribe = {
                            subscriptionId: scope.selectedPlan.id,
                            pricePolicyId: scope.pricePolicy.id
                        };
                        if (!scope.cardDataLoaded || newCard) {
                            subscribe.card = scope.cardData;
                        }
                        $scope.waiting = true;
                        subscriptionsService.setUserSubscription(subscribe).then(
                            function(response){
                                $rootScope.currentUser.subscription = response.data.subscription;
                                scope.close();
                                $state.go('main.welcome');
                            },
                            function(rejection){
                                setSubscriptionError(rejection);
                            }
                        ).finally(function(){
                            $scope.waiting = false;
                        });
                    };
                    $mdDialog.show({
                        scope: scope,
                        templateUrl: 'app/user/templates/payment-popup.html'
                    });
                } else {
                    $scope.waiting = true;
                    subscriptionsService.setUserSubscription({
                        subscriptionId: scope.selectedPlan.id,
                        pricePolicyId: scope.pricePolicy.id
                    }).then(
                        function(response){
                            $rootScope.currentUser.subscription = response.data.subscription;
                            $state.go('main.welcome');
                        },
                        function(rejection){
                            setSubscriptionError(rejection);
                        }
                    ).finally(function(){
                        $scope.waiting = false;
                    });
                }
            };
        }
    ]);