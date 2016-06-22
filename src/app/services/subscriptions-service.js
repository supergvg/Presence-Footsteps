'use strict';

angular.module('gliist').factory('subscriptionsService', ['$http', '$q', 'dialogService', '$rootScope',
    function ($http, $q, dialogService, $rootScope) {
        var responseError = function(d, rejection) {
                var message = rejection.data && rejection.data.message || 'Endpoint '+rejection.config.url+' '+rejection.statusText.toLowerCase();
                if (rejection.data && rejection.data.success === false) {
                    d.reject(rejection);
                } else {
                    dialogService.error(message);
                    d.reject();
                }
            },
            response = function(d, response) {
                if (response.data.success) {
                    d.resolve({data: response.data.data, dataTotalCount: response.data.dataTotalCount});
                } else {
                    dialogService.error(response.data.message);
                    d.reject();
                }
            }, 
            quotas = {}, features = {};
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
                        response(d, answer);
                        angular.forEach(answer.data.data.quotas, function(quota){
                            quotas[quota.feature] = quota.value;
                        });
                        angular.forEach(answer.data.data.subscription.policies, function(feature){
                            features[feature.feature] = {
                                type: feature.type,
                                value: feature.value
                            };
                        });
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
                        response(d, answer);
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
                    dialogService.upgrade(event, message);
                }
                
                return allow;
            }
        };
    }]);