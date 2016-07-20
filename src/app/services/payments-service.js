'use strict';

angular.module('gliist').factory('paymentsService', ['$http', '$q', 'dialogService', '$rootScope',
    function ($http, $q, dialogService, $rootScope) {
        var responseError = function(d, rejection) {
                var message = rejection.data && rejection.data.message || 'Endpoint '+rejection.config.url+' '+rejection.statusText.toLowerCase();
                dialogService.error(message);
                if (rejection.data && rejection.data.success === false) {
                    d.reject(rejection);
                } else {
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
            },
            getCard: function() {
                var d = $q.defer();
                $http.get('user/card', {api: 'payments_api'}).then(
                    function(answer) {
                        response(d, answer);
                    },
                    function(response) {
                        responseError(d, response);
                    }
                );
                return d.promise;                
            },
            updateCard: function(data) {
                var d = $q.defer();
                $http.put('user/cards', data, {api: 'payments_api'}).then(
                    function(answer) {
                        response(d, answer);
                    },
                    function(response) {
                        responseError(d, response);
                    }
                );
                return d.promise;                
            },
            addCard: function(data) {
                var d = $q.defer();
                data.name = $rootScope.currentUser.firstName+' '+$rootScope.currentUser.lastName;
                $http.post('user/cards', data, {api: 'payments_api'}).then(
                    function(answer) {
                        response(d, answer);
                    },
                    function(response) {
                        responseError(d, response);
                    }
                );
                return d.promise;                
            },
            deleteCard: function(cardId) {
                var d = $q.defer();
                $http.delete('user/cards', {api: 'payments_api', data: {cardId: cardId}, headers: {'Content-Type': 'application/json'}}).then(
                    function(answer){
                        response(d, answer);
                    },
                    function(response) {
                        responseError(d, response);
                    }
                );
                return d.promise;                
            },
            getCards: function() {
                var d = $q.defer();
                $http.get('user/cards', {api: 'payments_api'}).then(
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