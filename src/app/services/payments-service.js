'use strict';

angular.module('gliist').factory('paymentsService', ['$http', '$q', 'dialogService',
    function ($http, $q, dialogService) {
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
            };
        return {
            getCharges: function() {
                var d = $q.defer();
                $http.get('user/charges', {api: 'payments_api'}).then(
                    function(answer) {
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