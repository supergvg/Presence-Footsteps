'use strict';

angular.module('gliist').factory('subscriptionsService', ['$http', '$q', 'dialogService',
    function ($http, $q, dialogService) {
        var responseError = function(d, rejection) {
                dialogService.error('Endpoint '+rejection.config.url+' '+rejection.statusText.toLowerCase());
                d.reject();
            },
            response = function(d, response) {
                if (response.success) {
                    d.resolve({data: response.data, dataTotalCount: response.dataTotalCount});
                } else {
                    dialogService.error(response.message);
                    d.reject();
                }
            };
        return {
            getUserSubscription: function() {
                var d = $q.defer();
                $http.get('user/subscription', {api: 'subscriptions_api'}).then(
                    function(response) {
                        response(d, response);
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
                    function(response) {
                        response(d, response);
                    },
                    function(response) {
                        responseError(d, response);
                    }
                );
                return d.promise;                
            }
        };
    }]);