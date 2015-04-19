angular.module('starter').factory('eventsService', [ '$rootScope', '$http', '$q',
    function ($rootScope, $http, $q) {
        return  {

            createEvent: function (event) {
                var d = $q.defer();

                $http({
                    method: "POST",
                    url: "api/event",
                    data: event,
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error trying to get events, please try again');
                });

                return d.promise;
            },

            getEvents: function (id) {
                var d = $q.defer();

                $http({
                    method: "GET",
                    url: "api/event/" + (id || '')
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error trying to get events, please try again');
                });

                return d.promise;
            },

            deleteEvent: function (id) {
                var d = $q.defer();

                $http({
                    method: "DELETE",
                    url: "api/event",
                    params: {
                        id: id
                    }
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error trying to get events, please try again');
                });

                return d.promise;
            },

            getGuests: function (eventId) {
                return [
                    {
                        id: '1',
                        name: 'John Doe',
                        photo: 'img/company-logo.png'
                    },
                    {
                        id: '2',
                        name: 'Paris Hilton',
                        photo: 'img/company-logo.png'
                    },
                    {
                        id: '1',
                        name: 'Kim Kardashian',
                        photo: 'img/company-logo.png'
                    },
                    {
                        id: '1',
                        name: 'John Doe',
                        photo: 'img/company-logo.png'
                    }

                ];
            }
        }
    }]);
