'use strict';

angular.module('gliist').factory('subscriptionsService', ['$http', '$q', 'dialogService', '$rootScope', '$state',
    function ($http, $q, dialogService, $rootScope, $state) {
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
            };
        return {
            getFeatureValue: function(featureName) {
                if (!features[featureName]) {
                    return false;
                }
                return features[featureName].value;
            },
            getUserSubscription: function() {
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
            },
            setUserSubscription: function(data) {
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
            },
            getSubscriptions: function() {
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
            },
            applyPromo: function(code) {
                var d = $q.defer();
                $http.post('user/promo', {code: code}, {api: 'subscriptions_api'}).then(
                    function(answer) {
                        response(d, answer);
                    },
                    function(response) {
                        responseError(d, response);
                    }
                );
                return d.promise;                
            },
            undoPromo: function(code) {
                var d = $q.defer();
                $http({
                    method: 'DELETE',
                    url: 'user/promo',
                    params: {
                        code: code
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
            },
            verifyFeature: function(featureName, featureValue, event, message) {
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
                
                if (angular.isDefined(event) && !allow) {
                    dialogService.confirm(event, message || 'This is a paid feature. Would you like to upgrade your plan to unlock this feature?', 'Upgrade', 'Close').then(
                        function() {
                            $state.go('main.user', {view: 2});
                        }
                    );
                }
                
                return allow;
            }
        };
    }]);