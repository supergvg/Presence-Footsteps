'use strict';

angular.module('gliist').service('subscriptionsService', ['$http', '$q', 'dialogService', '$rootScope', '$state', '$mdDialog', 'paymentsService',
    function ($http, $q, dialogService, $rootScope, $state, $mdDialog, paymentsService) {
        var responseError = function(d, rejection) {
                var message = rejection.data && rejection.data.message || 'Endpoint '+rejection.config.url+' '+rejection.statusText.toLowerCase();
                dialogService.error(message);
                d.reject(rejection);
            },
            response = function(d, response) {
                if (response.data.success) {
                    d.resolve({data: response.data.data, dataTotalCount: response.data.dataTotalCount});
                } else {
                    dialogService.error(response.data.message);
                    d.reject();
                }
            }, 
            quotas = {}, features = {},
            parseSubscription = function(data) {
                angular.forEach(data.usedPolicies, function(quota){
                    quotas[quota.feature] = quota.value;
                });
                angular.forEach(data.subscription.policies, function(feature){
                    features[feature.feature] = {
                        type: feature.type,
                        value: feature.value
                    };
                });
            },
            subscriptionsService = this;
            
        this.getFeatureValue = function(featureName) {
            if (!features[featureName]) {
                return false;
            }
            return features[featureName].value;
        };
        
        this.getUserSubscription = function() {
            var d = $q.defer();
            $http.get('user/subscription', {api: 'subscriptions_api'}).then(
                function(answer) {
                    if (answer.data.data && answer.data.data.status === 'Unpaid') {
                        answer.data.data = null;
                    }
                    if (answer.data.data) {
                        parseSubscription(answer.data.data);
                    }
                    response(d, answer);
                },
                function(response) {
                    responseError(d, response);
                }
            );
            return d.promise;                
        };
        
        this.setUserSubscription = function(data) {
            var d = $q.defer();
            if (data.card) {
                data.card.name = $rootScope.currentUser.firstName+' '+$rootScope.currentUser.lastName;
            }
            $http.post('user/subscription', data, {api: 'subscriptions_api'}).then(
                function(answer) {
                    if (answer.data.data && answer.data.data.status === 'Unpaid') {
                        responseError(d, response);
                    } else {
                        if (answer.data.data) {
                            parseSubscription(answer.data.data);
                        }
                        response(d, answer);
                    }
                },
                function(response) {
                    responseError(d, response);
                }
            );
            return d.promise;                
        };
        
        this.getSubscriptions = function() {
            var d = $q.defer(),
                uri = 'subscriptions';
            if ($rootScope.currentUser) {
                uri = 'user/subscriptions';
            }
            $http.get(uri, {api: 'subscriptions_api'}).then(
                function(answer) {
                    response(d, answer);
                },
                function(response) {
                    responseError(d, response);
                }
            );
            return d.promise;                
        };
        
        this.applyPromo = function(code, subscriptionId) {
            var d = $q.defer();
            $http.post('user/promo', {code: code, subscriptionId: subscriptionId}, {api: 'subscriptions_api'}).then(
                function(answer) {
                    response(d, answer);
                },
                function(response) {
                    responseError(d, response);
                }
            );
            return d.promise;                
        };
        
        this.undoPromo = function(code, subscriptionId) {
            var d = $q.defer();
            $http({
                method: 'DELETE',
                url: 'user/promo',
                params: {
                    code: code,
                    subscriptionId: subscriptionId
                }
            }).then(
                function(answer){
                    response(d, answer);
                },
                function(response) {
                    responseError(d, response);
                }
            );
            return d.promise;                
        };
        
        this.verifyFeature = function(featureName, featureValue, event, message) {
            if (!$rootScope.currentUser) {
                return;
            }
            var allow = true;
            if (features[featureName]) {
                switch (features[featureName].type) {
                    case 'Restrict':
                        allow = false;
                        break;
                    case 'LimitedPerInstanceQuota':
                        if (featureValue > features[featureName].value) {
                            allow = false;
                        }
                        if (message) {
                            message = message.replace(/{value}/, features[featureName].value);
                        }
                        break;
                    case 'LimitedQuota':
                        if (!quotas[featureName] || (quotas[featureName] && featureValue > quotas[featureName])) {
                            allow = false;
                        }
                        if (quotas[featureName] && message) {
                            message = message.replace(/{value}/, quotas[featureName]);
                        }
                        break;
                    case 'Parameter': 
                        if (featureValue > features[featureName].value) {
                            allow = false;
                        }
                        if (message) {
                            message = message.replace(/{value}/, features[featureName].value);
                        }
                        break;
                }
            }

            if (event && !allow) {
                dialogService.confirm(event, message || 'This is a paid feature. Would you like to upgrade your plan to unlock this feature?', 'Upgrade', 'Close').then(
                    function() {
                        if ($rootScope.currentUser.subscription.subscription.name !== 'Pay as you go') {
                            $state.go('main.user', {view: 2});
                        } else {
                            subscriptionsService.paymentPopup($rootScope.currentUser.subscription.subscription, 0);
                        }
                    }
                );
            }

            return allow;
        };
        
        this.paymentPopup = function(selectedPlan, pricePolicyKey) {
            var scope = $rootScope.$new();
            scope.selectedPlan = selectedPlan;
            scope.pricePolicyKey = pricePolicyKey;
            scope.pricePolicy = scope.selectedPlan.pricePolicies[scope.pricePolicyKey];
            scope.pricePolicyBeforePromo = null;
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
                    scope.waiting = true;
                    subscriptionsService.applyPromo(code, scope.selectedPlan.id).then(
                        function(response) {
                            scope.promo.code = code;
                            scope.promo.applied = true;
                            scope.pricePolicyBeforePromo = scope.pricePolicy;
                            scope.selectedPlan = response.data;
                            scope.pricePolicy = scope.selectedPlan.pricePolicies[scope.pricePolicyKey];
                        },
                        function() {
                            scope.promo.invalid = true;
                        }
                    ).finally(function(){
                        scope.waiting = false;
                    });
                }
            };
            scope.undoPromo = function() {
                var code = scope.promo.code ? scope.promo.code.trim() : '';
                if (code !== '') {
                    scope.waiting = true;
                    subscriptionsService.undoPromo(code, scope.selectedPlan.id).then(
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
                        scope.waiting = false;
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
                scope.waiting = true;
                subscriptionsService.setUserSubscription(subscribe).then(
                    function(response){
                        $rootScope.currentUser.subscription = response.data.subscription;
                        scope.close();
                        $state.go('main.welcome');
                    },
                    function(rejection){
                        dialogService.confirm(null, rejection.data.message, 'OK', '');
                    }
                ).finally(function(){
                    scope.waiting = false;
                });
            };
            $mdDialog.show({
                scope: scope,
                templateUrl: 'app/user/templates/payment-popup.html'
            });
        };
    }]);