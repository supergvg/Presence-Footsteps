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
                quotas = {};
                features = {};
                angular.forEach(data.usedPolicies, function(quota){
                    if (!quotas[quota.feature])
                        quotas[quota.feature] = [];
                    quotas[quota.feature].push(quota);
                });
                angular.forEach(data.subscription.policies, function(feature){
                    features[feature.feature] = {
                        type: feature.type,
                        value: feature.value
                    };
                });
            },
            subscriptionsService = this,
            payed = $q.defer();
            
        this.isPayed = function() {
            return payed.promise;
        };    
            
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
            $http.delete('user/promo', {api: 'subscriptions_api', data: {code: code, subscriptionId: subscriptionId}, headers: {'Content-Type': 'application/json'}}).then(
                function(answer){
                    response(d, answer);
                },
                function(response) {
                    responseError(d, response);
                }
            );
            return d.promise;                
        };
        
        this.buyFeature = function(data) {
            var d = $q.defer();
            $http.post('user/features/buy', data, {api: 'subscriptions_api'}).then(
                function(answer) {
                    response(d, answer);
                },
                function(response) {
                    responseError(d, response);
                }
            );
            return d.promise;                         
        };
        
        this.verifyFeature = function(featureName, featureValue, event, featureIntId) {
            if (!$rootScope.currentUser || !$rootScope.currentUser.subscription)
                return;
            
            var hasPolicyOfType = function (type) {
                return features[featureName] && features[featureName].type === type;
            };
            var findUsedPolicyByType = function (type, feature) {
                var usedPolicies = quotas[feature ? feature : featureName];
                if (usedPolicies) {
                    for (var i = 0, c = usedPolicies.length; i < c; i++) {
                        var up = usedPolicies[i];
                        if (up.policy.type === type && (!up.featureInternalId || up.featureInternalId == featureIntId))
                            return up;
                    }
                }
                return null;
            };
            
            var featureStatus = { 
                unknown: 0,
                allowed: 1,
                notAllowed: 2,
                notEnoughQuota: 3,
                shouldBePurchased: 4,
                hasQuota: 5,
                subscriptionNotActive: 6,
                subscriptionShouldBeUpgraded: 7,
                hasParameter: 8
            };
            var vResult = function (s, maxv) {
                return {status: s, maxValue: maxv};
            };
            var policyValidators = [ //returns: { status: featureStatus, value: number }
                function () { //ActiveSubscriptionPolicyValidator 0
                    if (!$rootScope.currentUser.subscription || $rootScope.currentUser.subscription.status === 'Unpaid')
                        return vResult(featureStatus.notAllowed);
                    return null;
                },
                function () { //ParameterPolicyValidator 1
                    var usedPolicy = findUsedPolicyByType('Parameter');
                    if (usedPolicy)
                        return vResult(featureValue <= usedPolicy.value ? featureStatus.hasParameter : featureStatus.notAllowed, usedPolicy.value);
                    
                    if (hasPolicyOfType('Parameter')) {
                        if (featureValue <= features[featureName].value) //if allowed by subscription policy
                            return vResult(featureStatus.hasParameter, features[featureName].value);
                        
                        var maxValue = features[featureName].value;
                        var pp = $rootScope.currentUser.subscription.pricePolicy; //if not, find out can subscription be upgraded
                        if (pp.type === 'PerFeature') {
                            for (var i = 0, pc = pp.prices.length; i < pc; i++) {
                                if (pp.prices[i].feature === featureName && pp.prices[i].additionalPolicy.type === 'Parameter') {
                                    maxValue = pp.prices[i].additionalPolicy.value;
                                    if (featureValue <= pp.prices[i].additionalPolicy.value)
                                        return vResult(featureStatus.shouldBePurchased, features[featureName].value); //provide max value from current subscription
                                }
                            }
                        }
                        
                        return vResult(featureStatus.notAllowed, maxValue);
                    }
                    
                    return null;
                },
                function () { //AllowPolicyValidator 2
                    if (findUsedPolicyByType('Allow') || hasPolicyOfType('Allow'))
                        return vResult(featureStatus.allowed);
                    return null;
                },
                function () { //UnlimitedQuotaPolicyValidator 3
                    if (findUsedPolicyByType('UnlimitedQuota') || hasPolicyOfType('UnlimitedQuota'))
                        return vResult(featureStatus.allowed);
                    return null;
                },
                function () { //LimitedQuotaPolicyValidator 4
                    var usedPolicy = findUsedPolicyByType('LimitedQuota');
                    if (usedPolicy)
                        return vResult((usedPolicy.value - featureValue) >= 0 ? featureStatus.hasQuota : featureStatus.notEnoughQuota, usedPolicy.value);
                    
                    return null;
                },
                function () { //LimitedPerInstanceQuotaPolicyValidator 5
                    var usedPolicy = findUsedPolicyByType('LimitedPerInstanceQuota');
                    if (usedPolicy)
                        return vResult((usedPolicy.value - featureValue) >= 0 ? featureStatus.hasQuota : featureStatus.notAllowed, usedPolicy.policy.value);
                    
                    if (hasPolicyOfType('LimitedPerInstanceQuota'))
                        return vResult((features[featureName].value - featureValue) >= 0 ? featureStatus.hasQuota : featureStatus.notAllowed, features[featureName].value);
                    
                    return null;
                },
                function () { //AcquiredQuotaPolicyValidator 6
                    var pp = $rootScope.currentUser.subscription.pricePolicy;
                    if (pp.type === 'PerFeature') {
                        for (var j = 0, pc = pp.prices.length; j < pc; j++) {
                            if (pp.prices[j].feature === featureName) {
                                var usedPolicy = findUsedPolicyByType('LimitedQuota');
                                if (usedPolicy)
                                    return vResult(usedPolicy.value > 0 ? featureStatus.hasQuota : featureStatus.shouldBePurchased);
                                else
                                    return vResult(featureStatus.shouldBePurchased);
                            }
                        }
                    }
                    
                    return null;
                },
                function () { //RestrictPolicyValidator 7
                    if (findUsedPolicyByType('Restrict') || hasPolicyOfType('Restrict'))
                        return vResult(featureStatus.notAllowed);
                    return null;
                },
                function () { //AllFeaturesPolicyValidator 8
                    if (findUsedPolicyByType('Allow', 'All') || (features['All'] && features['All'].type === 'Allow'))
                        return vResult(featureStatus.allowed);
                    return null;
                }
            ];
            
            var validationStatus = featureStatus.unknown;
            var validationMaxValue;
            for (var i = 0, c = policyValidators.length; i < c; i++) {
                var vr = policyValidators[i]();
                if (vr) {
                    validationStatus = vr.status;
                    validationMaxValue = vr.maxValue;
                }
                
                if ((validationStatus === featureStatus.notAllowed || validationStatus === featureStatus.notEnoughQuota) && $rootScope.currentUser.subscription.subscription.isDefault) {
                    validationStatus = featureStatus.subscriptionShouldBeUpgraded;
                    break;
                }
                
                if (validationStatus !== featureStatus.unknown)
                    break;
            }
            if (validationStatus === featureStatus.unknown)
                    validationStatus = featureStatus.notAllowed;
            
            if (validationStatus === featureStatus.allowed || validationStatus === featureStatus.hasParameter || validationStatus === featureStatus.hasQuota)
                return true;
            if (!event) //if not triggered by user
                return false;

            var message;
            if (featureName === 'Guests' || featureName === 'Checkins') {
                message = 'You are only allowed ' + validationMaxValue + ' guests. Would you like to upgrade to unlimited?';
            } else if (featureName === 'EventDurationDays') {
                if (validationStatus === featureStatus.shouldBePurchased)
                    message = 'You are not allowed to create events longer than ' + validationMaxValue + ' days. Would you like to upgrade?';
                else
                    message = 'You are not allowed to create events longer than ' + validationMaxValue + ' days.';
            } else if (featureName === 'EventStartRangeDays') {
                message = 'You can only create event up to ' + validationMaxValue + ' days in advance.';
            } else if (featureName === 'GLM') {
                message = 'This is a feature for monthly subscription plans. Do you want to upgrade?';
            } else
                message = 'This is a paid feature. Would you like to upgrade your plan to unlock this feature?';
            
            if (validationStatus === featureStatus.notAllowed && (featureName === 'EventStartRangeDays' || featureName === 'EventDurationDays')) {
                dialogService.confirm(event, message, 'Ok');
            } else {
                payed = $q.defer();
                dialogService.confirm(event, message, 'Upgrade', 'Close').then(
                    function() {
                        if ($rootScope.currentUser.subscription.subscription.name !== 'Pay as you go') {
                            $state.go('main.user', {view: 2});
                        } else {
                            subscriptionsService.paymentPopup($rootScope.currentUser.subscription.subscription, 0, null, featureName, featureValue, featureIntId);
                        }
                    }
                );
            }
            
            return false;
        };
        
        this.paymentPopup = function(selectedPlan, pricePolicyKey, callback, featureName, featureValue, featureIntId) {
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
                code: scope.selectedPlan.usedPromoCode || '',
                applied: scope.selectedPlan.usedPromoCode ? true : false,
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
                            scope.pricePolicy = scope.selectedPlan.pricePolicies[0];
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
                                scope.promo.code = '';
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
                            exp_year: 'Please Enter Card Expiration Year',
                            address_zip: 'Payment zip code is missing'
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
                if (featureName) {
                    var buyFeature = {
                        featureName: featureName,
                        featureValue: featureValue ? featureValue : 0
                    };
                    if (featureIntId) {
                        buyFeature.featureIntId = String(featureIntId);
                    }
                    if (!scope.cardDataLoaded || newCard) {
                        buyFeature.card = scope.cardData;
                    }
                    subscriptionsService.buyFeature(buyFeature).then(
                        function(){
                            subscriptionsService.getUserSubscription().then(
                                function(data){
                                    if (data.data && data.dataTotalCount > 0) {
                                        $rootScope.currentUser.subscription = data.data;
                                        payed.resolve();
                                        scope.close();
                                    }
                                }
                            );                            
                        },
                        function(rejection){
                            dialogService.confirm(null, rejection.data.message, 'OK', '');
                        }
                    ).finally(function(){
                        scope.waiting = false;
                    });
                } else {
                    subscriptionsService.setUserSubscription(subscribe).then(
                        function(response){
                            $rootScope.currentUser.subscription = response.data;
                            scope.close();
                            if ($state.current.name === 'choose_plan') {
                                $state.go('main.welcome');
                            } else if (callback) {
                                callback();
                            }
                        },
                        function(rejection){
                            dialogService.confirm(null, rejection.data.message, 'OK', '');
                        }
                    ).finally(function(){
                        scope.waiting = false;
                    });
                }
            };
            $mdDialog.show({
                scope: scope,
                templateUrl: 'app/user/templates/payment-popup.html'
            });
        };
        
        this.process403Status = function(response, featureIntId) {
            if (response.status === 403) {
                var headers = response.headers();        
                if (headers['feature-name']) {
                    subscriptionsService.getUserSubscription().then(
                        function(data){
                            if (data.data && data.dataTotalCount > 0) {
                                $rootScope.currentUser.subscription = data.data;
                                var feature_value = headers['feature-value'];
                                if (headers['feature-status'] === 'SubscriptionShouldBeUpgraded') {
                                    feature_value = subscriptionsService.getFeatureValue(headers['feature-name']) + 1;
                                }
                                subscriptionsService.verifyFeature(headers['feature-name'], feature_value, {}, featureIntId);
                            }
                        }
                    );
                }
                return true;
            }
            return false;
        };
    }]);