'use strict';

angular.module('gliist').factory('subscriptionsService', ['$http', '$q', 'dialogService', '$rootScope',
    function ($http, $q, dialogService, $rootScope) {
        var responseError = function(d, rejection) {
                dialogService.error('Endpoint '+rejection.config.url+' '+rejection.statusText.toLowerCase());
                d.reject();
            },
            response = function(d, response) {
                if (response.data.success) {
                    d.resolve({data: response.data.data, dataTotalCount: response.data.dataTotalCount});
                } else {
                    dialogService.error(response.data.message);
                    d.reject();
                }
            };
        return {
            getUserSubscription: function() {
                var d = $q.defer();
                $http.get('user/subscription', {api: 'subscriptions_api'}).then(
                    function(answer) {
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
                data.card.name = $rootScope.currentUser.firstName+' '+$rootScope.currentUser.lastName;
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
                var d = $q.defer();
                $http.get('subscriptions', {api: 'subscriptions_api'}).then(
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
            }
        };
    }]);